"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  ACCEPTED_FILE_TYPES_LABEL,
  FILE_NUMBER_MAX_LENGTH,
  FULL_NAME_MAX_LENGTH,
  MAX_CV_SIZE_BYTES,
  MAX_CV_SIZE_MB,
} from "@/lib/constants";
import { extensionFromFilename, isAcceptedExtension } from "@/lib/validation";

type Status = "idle" | "uploading" | "success" | "error";

function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
  const kb = bytes / 1024;
  return `${Math.max(1, Math.round(kb))} KB`;
}

const GENERIC_ERROR = "We couldn't submit your CV. Please check the details and try again.";

/** Small monogram for the selected file's type — red for PDF, navy otherwise. */
function FileTypeBadge({ ext }: { ext: string }) {
  const label = ext.toUpperCase();
  const isPdf = ext.toLowerCase() === "pdf";
  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide ${
        isPdf ? "bg-red/10 text-red" : "bg-navy/10 text-navy"
      }`}
    >
      {label}
    </span>
  );
}

export function UploadForm() {
  const [fullName, setFullName] = useState("");
  const [fileNumber, setFileNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();

  const busy = status === "uploading";

  // Replay the shake micro-animation whenever a new error surfaces.
  useEffect(() => {
    if (status === "error" && message) setShakeKey((k) => k + 1);
  }, [status, message]);

  const validateAndSetFile = useCallback((candidate: File | null) => {
    setMessage(null);
    if (!candidate) {
      setFile(null);
      return;
    }
    const extension = extensionFromFilename(candidate.name);
    if (!isAcceptedExtension(extension)) {
      setStatus("error");
      setMessage(`Only ${ACCEPTED_FILE_TYPES_LABEL} files are accepted.`);
      setFile(null);
      return;
    }
    if (candidate.size > MAX_CV_SIZE_BYTES) {
      setStatus("error");
      setMessage(`Your file is larger than the ${MAX_CV_SIZE_MB} MB limit.`);
      setFile(null);
      return;
    }
    setStatus("idle");
    setFile(candidate);
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragActive(false);
      if (busy) return;
      const dropped = event.dataTransfer.files?.[0] ?? null;
      validateAndSetFile(dropped);
    },
    [busy, validateAndSetFile],
  );

  const reset = useCallback(() => {
    setFullName("");
    setFileNumber("");
    setFile(null);
    setStatus("idle");
    setMessage(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const onSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (busy) return;

      if (!fullName.trim() || !fileNumber.trim()) {
        setStatus("error");
        setMessage("Please complete your full name and employee file number.");
        return;
      }
      if (!file) {
        setStatus("error");
        setMessage("Please choose a CV file to upload.");
        return;
      }

      setStatus("uploading");
      setMessage(null);

      try {
        const formData = new FormData();
        formData.set("fullName", fullName.trim());
        formData.set("fileNumber", fileNumber.trim());
        formData.set("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        let payload: { ok?: boolean; message?: string } = {};
        try {
          payload = await response.json();
        } catch {
          payload = {};
        }

        if (response.ok && payload.ok) {
          setStatus("success");
          setMessage(null);
        } else {
          setStatus("error");
          setMessage(payload.message ?? GENERIC_ERROR);
        }
      } catch {
        setStatus("error");
        setMessage(GENERIC_ERROR);
      }
    },
    [busy, file, fileNumber, fullName],
  );

  if (status === "success") {
    return (
      <div className="anim-success overflow-hidden rounded-2xl border border-navy/10 bg-white p-9 text-center shadow-card-lg sm:p-11">
        <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center">
          <span className="anim-ring absolute inset-0 rounded-full bg-navy/15" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-navy to-navy-800 shadow-btn">
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-white" fill="none" aria-hidden="true">
              <path
                className="check-path"
                d="M5 12.5l4.2 4.2L19 7"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={42}
              />
            </svg>
          </span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-navy">CV submitted successfully</h2>
        <p className="mx-auto mt-2.5 max-w-sm text-sm leading-relaxed text-ink/65">
          Thank you for keeping your employee information up to date. Your CV has been received by
          HR — no further action is needed.
        </p>
        <button
          type="button"
          onClick={reset}
          className="group relative mt-8 inline-flex items-center justify-center gap-2 rounded-lg border border-navy/20 px-5 py-2.5 text-sm font-medium text-navy transition-all duration-200 hover:border-navy/40 hover:bg-navy/[0.04] motion-safe:hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
            <path
              d="M4 12a8 8 0 1 1 2.34 5.66M4 12v4m0-4h4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Submit another CV
        </button>
      </div>
    );
  }

  const fileExt = file ? extensionFromFilename(file.name) : "";

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="relative overflow-hidden rounded-2xl border border-navy/10 bg-white/95 p-6 shadow-card-lg backdrop-blur-sm sm:p-8"
    >
      {/* Slim brand accent along the card's top edge */}
      <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-navy via-navy to-red" />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="group">
          <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-ink">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            maxLength={FULL_NAME_MAX_LENGTH}
            disabled={busy}
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink shadow-sm outline-none transition-all duration-200 placeholder:text-ink/35 hover:border-ink/25 focus:border-navy focus:ring-4 focus:ring-navy/10 disabled:bg-surface disabled:text-ink/50"
          />
        </div>
        <div className="group">
          <label htmlFor="fileNumber" className="mb-1.5 block text-sm font-medium text-ink">
            Employee File Number
          </label>
          <input
            id="fileNumber"
            name="fileNumber"
            type="text"
            required
            maxLength={FILE_NUMBER_MAX_LENGTH}
            disabled={busy}
            placeholder="Enter your file number"
            value={fileNumber}
            onChange={(e) => setFileNumber(e.target.value)}
            className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink shadow-sm outline-none transition-all duration-200 placeholder:text-ink/35 hover:border-ink/25 focus:border-navy focus:ring-4 focus:ring-navy/10 disabled:bg-surface disabled:text-ink/50"
          />
        </div>
      </div>

      <div className="mt-6">
        <span className="mb-1.5 block text-sm font-medium text-ink">Upload CV</span>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!busy) setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          className={`group relative rounded-xl border-2 border-dashed px-6 py-8 text-center transition-all duration-200 focus-within:ring-4 focus-within:ring-navy/10 ${
            dragActive
              ? "border-navy bg-navy/[0.05] motion-safe:scale-[1.01]"
              : file
                ? "border-navy/30 bg-navy/[0.02]"
                : "border-ink/20 bg-surface/60 hover:border-navy/40 hover:bg-navy/[0.03]"
          } ${busy ? "pointer-events-none opacity-60" : ""}`}
        >
          {/* Pulsing ring while a file is dragged over the zone */}
          {dragActive && (
            <span className="anim-ring pointer-events-none absolute inset-2 rounded-lg border-2 border-navy/40" />
          )}

          <input
            ref={inputRef}
            id={fileInputId}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            disabled={busy}
            onChange={(e) => validateAndSetFile(e.target.files?.[0] ?? null)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            aria-describedby={`${fileInputId}-hint`}
          />

          {file ? (
            <div key={file.name + file.size} className="anim-pop flex flex-col items-center gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy/10 text-navy">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
                  <path
                    d="M14 3v4a1 1 0 0 0 1 1h4"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div className="flex max-w-full items-center gap-2">
                <FileTypeBadge ext={fileExt} />
                <p className="truncate text-sm font-medium text-ink">{file.name}</p>
              </div>
              <p className="text-xs text-ink/55">{formatFileSize(file.size)} · ready to submit</p>
              <button
                type="button"
                disabled={busy}
                onClick={(e) => {
                  e.stopPropagation();
                  validateAndSetFile(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="relative z-10 mt-1 inline-flex items-center gap-1 text-xs font-medium text-red underline-offset-2 transition-colors hover:underline disabled:text-ink/40"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Remove file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-navy/[0.06] text-navy transition-all duration-200 group-hover:bg-navy/10 motion-safe:group-hover:-translate-y-0.5">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
                  <path
                    d="M12 16V4m0 0L8 8m4-4l4 4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <p className="text-sm font-medium text-ink">
                Drag &amp; drop your CV, or{" "}
                <span className="text-navy underline decoration-navy/30 underline-offset-2">browse</span>
              </p>
              <p id={`${fileInputId}-hint`} className="mt-2 text-xs text-ink/45">
                {ACCEPTED_FILE_TYPES_LABEL} — up to {MAX_CV_SIZE_MB} MB
              </p>
            </div>
          )}
        </div>
      </div>

      {message && (
        <p
          key={shakeKey}
          role="alert"
          className="anim-shake mt-4 flex items-start gap-1.5 text-sm font-medium text-red"
        >
          <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
            <path d="M12 8v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="16" r="0.9" fill="currentColor" />
          </svg>
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="group relative mt-6 inline-flex w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-navy to-navy-800 px-5 py-3 text-sm font-semibold text-white shadow-btn transition-all duration-200 hover:shadow-lg motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none sm:w-auto"
      >
        {/* Sheen sweep on hover */}
        <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/20 opacity-0 transition-all duration-500 ease-out group-hover:left-[110%] group-hover:opacity-100 motion-reduce:hidden" />
        <span className="relative flex items-center gap-2">
          {busy && (
            <svg viewBox="0 0 24 24" className="anim-spin h-4 w-4" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          )}
          {busy ? "Uploading your CV…" : "Submit Updated CV"}
        </span>
      </button>

      {/* Indeterminate progress bar while the upload is in flight */}
      {busy && (
        <div className="anim-bar mt-4 h-1 w-full overflow-hidden rounded-full bg-navy/10" aria-hidden="true">
          <span className="block h-full w-1/3 rounded-full bg-gradient-to-r from-navy to-red" />
        </div>
      )}
    </form>
  );
}
