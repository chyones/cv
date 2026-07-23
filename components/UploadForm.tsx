"use client";

import { useCallback, useId, useRef, useState } from "react";
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

export function UploadForm() {
  const [fullName, setFullName] = useState("");
  const [fileNumber, setFileNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();

  const busy = status === "uploading";

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
      <div className="rounded-2xl border border-navy/10 bg-white p-8 text-center shadow-card sm:p-10">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-navy/10">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-navy" fill="none" aria-hidden="true">
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-lg font-semibold text-ink">Your CV has been submitted successfully.</p>
        <p className="mt-2 text-sm text-ink/70">
          Thank you for keeping your employee information up to date.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-7 inline-flex items-center justify-center rounded-lg border border-navy/20 px-5 py-2.5 text-sm font-medium text-navy transition-colors hover:bg-navy/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
        >
          Submit Another CV
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-2xl border border-navy/10 bg-white p-6 shadow-card sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
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
            className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:bg-surface disabled:text-ink/50"
          />
        </div>
        <div>
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
            className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:bg-surface disabled:text-ink/50"
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
          className={`relative rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
            dragActive ? "border-navy bg-navy/5" : "border-ink/20 bg-surface/60"
          } ${busy ? "opacity-60" : ""}`}
        >
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
            <div className="flex flex-col items-center gap-1">
              <p className="text-sm font-medium text-ink">{file.name}</p>
              <p className="text-xs text-ink/55">{formatFileSize(file.size)}</p>
              <button
                type="button"
                disabled={busy}
                onClick={(e) => {
                  e.stopPropagation();
                  validateAndSetFile(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="relative z-10 mt-2 text-xs font-medium text-red underline-offset-2 hover:underline disabled:text-ink/40"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-ink">Drag and drop your CV here</p>
              <p className="mt-1 text-sm text-ink/55">or choose a file from your device</p>
              <p id={`${fileInputId}-hint`} className="mt-3 text-xs text-ink/45">
                {ACCEPTED_FILE_TYPES_LABEL} — Maximum {MAX_CV_SIZE_MB} MB
              </p>
            </div>
          )}
        </div>
      </div>

      {message && (
        <p role="alert" className="mt-4 text-sm font-medium text-red">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {busy ? "Uploading your CV..." : "Submit Updated CV"}
      </button>
    </form>
  );
}
