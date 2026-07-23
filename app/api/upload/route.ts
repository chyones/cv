import { NextRequest, NextResponse } from "next/server";
import Busboy from "busboy";
import { PassThrough, Readable } from "node:stream";
import { ACCEPTED_FILE_TYPES_LABEL, MAX_CV_SIZE_BYTES, MAX_CV_SIZE_MB } from "@/lib/constants";
import {
  ValidationError,
  buildDriveFilename,
  extensionFromFilename,
  isAcceptedExtension,
  isAcceptedMimeType,
  sanitizeFileNumber,
  sanitizeFullName,
  sniffMatchesExtension,
} from "@/lib/validation";
import { uploadToDrive } from "@/lib/drive";

export const runtime = "nodejs";

const GENERIC_ERROR = "We couldn't submit your CV. Please check the details and try again.";
const BAD_TYPE_MESSAGE = `Only ${ACCEPTED_FILE_TYPES_LABEL} files are accepted.`;
const TOO_LARGE_MESSAGE = `Your file is larger than the ${MAX_CV_SIZE_MB} MB limit.`;
const HEAD_SNIFF_BYTES = 8;

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ ok: false, message: GENERIC_ERROR }, { status: 400 });
  }

  // Reasonable early rejection using the declared Content-Length; the real
  // enforcement happens byte-by-byte below via busboy's fileSize limit.
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  const MULTIPART_OVERHEAD_ALLOWANCE = 2 * 1024 * 1024;
  if (declaredLength > MAX_CV_SIZE_BYTES + MULTIPART_OVERHEAD_ALLOWANCE) {
    return NextResponse.json({ ok: false, message: TOO_LARGE_MESSAGE }, { status: 413 });
  }

  if (!request.body) {
    return NextResponse.json({ ok: false, message: GENERIC_ERROR }, { status: 400 });
  }

  // Bridge the Web ReadableStream (Next.js Request) to a Node Readable for busboy.
  const nodeStream = Readable.fromWeb(
    request.body as unknown as Parameters<typeof Readable.fromWeb>[0],
  );

  return new Promise<NextResponse>((resolve) => {
    let settled = false;
    let fileSeen = false;
    let sizeExceeded = false;
    let uploadTask: Promise<void> | null = null;

    const finishOnce = (response: NextResponse) => {
      if (settled) return;
      settled = true;
      resolve(response);
    };

    const bb = Busboy({
      headers: { "content-type": contentType },
      limits: {
        files: 1,
        fields: 2,
        fieldNameSize: 32,
        fieldSize: 256,
        fileSize: MAX_CV_SIZE_BYTES,
      },
    });

    let fullNameRaw = "";
    let fileNumberRaw = "";

    bb.on("field", (name, value) => {
      if (name === "fullName") fullNameRaw = value;
      if (name === "fileNumber") fileNumberRaw = value;
    });

    bb.on("file", (_name, fileStream, info) => {
      fileSeen = true;
      const { filename, mimeType } = info;

      // IMPORTANT: busboy's own per-file stream must only ever be *drained*
      // (resume()), never destroy()'d. Busboy has no "abandon this part"
      // signal -- if its stream is destroyed instead of drained, busboy's
      // internal parser can stall permanently and "finish" never fires,
      // hanging the whole request. Our own PassThrough (`pass`, created once
      // the type sniff passes) is ours to destroy freely; it is always kept
      // decoupled from `fileStream` via plain pipe()/unpipe() rather than
      // stream.pipeline(), which would otherwise destroy both ends together.
      let pass: PassThrough | null = null;
      const abortForwarding = () => {
        if (pass) {
          fileStream.unpipe(pass);
          if (!pass.destroyed) pass.destroy();
        }
        fileStream.resume();
      };

      fileStream.on("limit", () => {
        sizeExceeded = true;
        // Stop immediately so an oversized file is never fully (even if
        // truncated) written to Drive before we reject it.
        abortForwarding();
      });
      fileStream.on("error", abortForwarding);

      let name: string;
      let number: string;
      try {
        name = sanitizeFullName(fullNameRaw);
        number = sanitizeFileNumber(fileNumberRaw);
      } catch (err) {
        fileStream.resume(); // drain so busboy can reach "finish"
        finishOnce(
          NextResponse.json(
            { ok: false, message: err instanceof ValidationError ? err.message : GENERIC_ERROR },
            { status: 400 },
          ),
        );
        return;
      }

      const extension = extensionFromFilename(filename);
      if (!isAcceptedExtension(extension) || !isAcceptedMimeType(mimeType)) {
        fileStream.resume();
        finishOnce(NextResponse.json({ ok: false, message: BAD_TYPE_MESSAGE }, { status: 400 }));
        return;
      }

      // Peek the first bytes (independent of the client-claimed extension/MIME
      // type) *before* a single byte is forwarded to Google Drive. We only
      // start the Drive upload once the magic bytes are confirmed to match.
      const headChunks: Buffer[] = [];
      let headLength = 0;

      const onHeadData = (chunk: Buffer) => {
        headChunks.push(chunk);
        headLength += chunk.length;
        if (headLength >= HEAD_SNIFF_BYTES) {
          fileStream.pause();
          fileStream.off("data", onHeadData);
          fileStream.off("end", onHeadEnd);
          proceed(false);
        }
      };
      const onHeadEnd = () => {
        fileStream.off("data", onHeadData);
        proceed(true);
      };
      fileStream.on("data", onHeadData);
      fileStream.on("end", onHeadEnd);
      fileStream.resume();

      const proceed = (endedAlready: boolean) => {
        const head = Buffer.concat(headChunks, headLength);

        if (!sniffMatchesExtension(head, extension)) {
          if (!endedAlready) fileStream.resume(); // drain remainder so busboy can finish
          finishOnce(NextResponse.json({ ok: false, message: BAD_TYPE_MESSAGE }, { status: 400 }));
          return;
        }

        pass = new PassThrough();
        const filenameOnDrive = buildDriveFilename(number, name, extension);
        uploadTask = uploadToDrive({ filename: filenameOnDrive, mimeType, stream: pass });

        // If Drive gives up (or somehow finishes) before we're done
        // forwarding -- e.g. missing/invalid credentials reject before a
        // single byte of `pass` is ever read -- nothing else would drain the
        // PassThrough, and writing the rest of a large file into it would
        // stall on backpressure forever. Abort forwarding as soon as Drive
        // is no longer listening; `fileStream` itself is only ever drained.
        uploadTask.catch(() => {}).finally(() => {
          if (pass && !pass.writableEnded) abortForwarding();
        });

        if (endedAlready) {
          pass.end(head);
        } else {
          pass.write(head);
          fileStream.pipe(pass);
        }
      };
    });

    bb.on("finish", async () => {
      if (settled) return;
      if (!fileSeen) {
        finishOnce(
          NextResponse.json({ ok: false, message: "Please choose a CV file to upload." }, { status: 400 }),
        );
        return;
      }
      if (!uploadTask) {
        // A synchronous rejection already resolved the response above.
        return;
      }
      try {
        await uploadTask;
        if (sizeExceeded) {
          finishOnce(NextResponse.json({ ok: false, message: TOO_LARGE_MESSAGE }, { status: 413 }));
          return;
        }
        finishOnce(NextResponse.json({ ok: true }, { status: 200 }));
      } catch (err) {
        if (sizeExceeded) {
          finishOnce(NextResponse.json({ ok: false, message: TOO_LARGE_MESSAGE }, { status: 413 }));
        } else if (err instanceof ValidationError) {
          finishOnce(NextResponse.json({ ok: false, message: err.message }, { status: 400 }));
        } else {
          // Server-side only (container logs) -- never returned to the client.
          console.error("CV upload: Drive request failed:", err);
          finishOnce(NextResponse.json({ ok: false, message: GENERIC_ERROR }, { status: 502 }));
        }
      }
    });

    bb.on("error", () => {
      finishOnce(NextResponse.json({ ok: false, message: GENERIC_ERROR }, { status: 400 }));
    });

    nodeStream.pipe(bb);
  });
}
