import { afterEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

vi.mock("@/lib/drive", () => ({
  uploadToDrive: vi.fn(async ({ stream }: { stream: NodeJS.ReadableStream }) => {
    // Simulate Google's client reading (and discarding) the upload stream so
    // the PassThrough never backs up regardless of file size.
    for await (const _chunk of stream) {
      // drain
    }
  }),
}));

import { uploadToDrive } from "@/lib/drive";
import { POST } from "@/app/api/upload/route";

// TS's DOM lib types Blob/File parts as ArrayBufferView<ArrayBuffer>, which is
// stricter than the Uint8Array<ArrayBufferLike> that Node's Buffer/typed-array
// helpers produce. The cast is safe: these are always plain, non-shared buffers.
function toBlobPart(bytes: Uint8Array): BlobPart {
  return bytes as unknown as BlobPart;
}

function pdfBytes(size = 256): BlobPart {
  const bytes = new Uint8Array(size).fill(0x20);
  bytes.set(Buffer.from("%PDF-1.7"), 0);
  return toBlobPart(bytes);
}

function buildRequest(fields: { fullName?: string; fileNumber?: string }, file: File | null) {
  const formData = new FormData();
  if (fields.fullName !== undefined) formData.set("fullName", fields.fullName);
  if (fields.fileNumber !== undefined) formData.set("fileNumber", fields.fileNumber);
  if (file) formData.set("file", file);

  return new Request("http://localhost/api/upload", {
    method: "POST",
    body: formData,
  }) as unknown as NextRequest;
}

describe("POST /api/upload", () => {
  afterEach(() => {
    vi.mocked(uploadToDrive).mockClear();
  });

  it("accepts a valid PDF and reports success without leaking Drive details", async () => {
    const file = new File([pdfBytes()], "cv.pdf", { type: "application/pdf" });
    const response = await POST(buildRequest({ fullName: "John Smith", fileNumber: "EMP-1029" }, file));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(uploadToDrive).toHaveBeenCalledWith(
      expect.objectContaining({ filename: "EMP-1029 - John Smith.pdf", mimeType: "application/pdf" }),
    );
  });

  it("rejects an unsupported file extension", async () => {
    const file = new File([toBlobPart(new Uint8Array([1, 2, 3]))], "cv.exe", {
      type: "application/x-msdownload",
    });
    const response = await POST(buildRequest({ fullName: "John Smith", fileNumber: "EMP-1029" }, file));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.message).toMatch(/PDF, DOC, or DOCX/);
    expect(uploadToDrive).not.toHaveBeenCalled();
  });

  it("rejects a file whose content does not match its claimed type", async () => {
    const fakePdf = new Uint8Array(64).fill(0x41); // "AAAA..." -- not a real %PDF header
    const file = new File([toBlobPart(fakePdf)], "cv.pdf", { type: "application/pdf" });
    const response = await POST(buildRequest({ fullName: "John Smith", fileNumber: "EMP-1029" }, file));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/PDF, DOC, or DOCX/);
  });

  it("rejects a missing full name / file number", async () => {
    const file = new File([pdfBytes()], "cv.pdf", { type: "application/pdf" });
    const response = await POST(buildRequest({ fullName: "", fileNumber: "EMP-1029" }, file));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
  });

  it("returns a generic error and no Drive detail when the Drive upload fails", async () => {
    vi.mocked(uploadToDrive).mockImplementationOnce(async ({ stream }) => {
      for await (const _chunk of stream) {
        // drain
      }
      throw new Error("Google says: insufficient permissions on folder XYZ");
    });

    const file = new File([pdfBytes()], "cv.pdf", { type: "application/pdf" });
    const response = await POST(buildRequest({ fullName: "John Smith", fileNumber: "EMP-1029" }, file));
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.ok).toBe(false);
    expect(body.message).not.toMatch(/Google|permission|XYZ/i);
  });

  it("rejects a file over the size limit", async () => {
    const oversized = pdfBytes(51 * 1024 * 1024); // default limit is 50 MB
    const file = new File([oversized], "cv.pdf", { type: "application/pdf" });
    const response = await POST(buildRequest({ fullName: "John Smith", fileNumber: "EMP-1029" }, file));
    const body = await response.json();

    expect(response.status).toBe(413);
    expect(body.ok).toBe(false);
    expect(body.message).toMatch(/50 MB/);
  }, 20000);

  // Regression test: a real Drive misconfiguration (e.g. missing credentials)
  // rejects *before* it ever reads the upload stream. Nothing else drains
  // that stream, so a large-enough file used to stall forever on backpressure
  // instead of ever reaching a response. See lib/drive.ts / route.ts comments
  // on why the forwarding side is aborted as soon as the Drive side gives up.
  it("responds promptly for a large file even when Drive rejects without reading the stream", async () => {
    vi.mocked(uploadToDrive).mockImplementationOnce(async () => {
      throw new Error("Google Drive is not configured.");
    });

    // Comfortably larger than a PassThrough's default internal buffer, so a
    // stalled forward would reliably hang rather than coincidentally fit.
    const largeFile = pdfBytes(5 * 1024 * 1024);
    const file = new File([largeFile], "cv.pdf", { type: "application/pdf" });
    const response = await POST(buildRequest({ fullName: "John Smith", fileNumber: "EMP-1029" }, file));
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body.ok).toBe(false);
  }, 5000);
});
