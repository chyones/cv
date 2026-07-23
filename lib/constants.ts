/**
 * Shared limits and copy used by both the client form and the server route,
 * so the two can never disagree about what is accepted.
 */

export const MAX_CV_SIZE_MB = Number(process.env.MAX_CV_SIZE_MB ?? 50);
export const MAX_CV_SIZE_BYTES = MAX_CV_SIZE_MB * 1024 * 1024;

export const ACCEPTED_EXTENSIONS = ["pdf", "doc", "docx"] as const;
export type AcceptedExtension = (typeof ACCEPTED_EXTENSIONS)[number];

export const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const ACCEPTED_FILE_TYPES_LABEL = "PDF, DOC, or DOCX";

export const FULL_NAME_MAX_LENGTH = 80;
export const FILE_NUMBER_MAX_LENGTH = 30;
