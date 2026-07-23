import {
  ACCEPTED_EXTENSIONS,
  ACCEPTED_MIME_TYPES,
  FILE_NUMBER_MAX_LENGTH,
  FULL_NAME_MAX_LENGTH,
  type AcceptedExtension,
} from "./constants";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/** Letters (incl. accented/unicode), spaces, hyphens, apostrophes, periods only. */
const FULL_NAME_PATTERN = /^[\p{L}][\p{L}\p{M}'.\- ]*$/u;

/** Letters, digits, hyphens, and slashes -- typical HR file-number formats. */
const FILE_NUMBER_PATTERN = /^[A-Za-z0-9/-]+$/;

/** Classic filename-unsafe characters (space and hyphen are intentionally kept). */
const UNSAFE_FILENAME_CHARS = new RegExp('[/\\\\:*?"<>|]', "g");

export function sanitizeFullName(raw: string): string {
  const value = raw.trim().replace(/\s+/g, " ");
  if (!value) throw new ValidationError("Full name is required.");
  if (value.length > FULL_NAME_MAX_LENGTH) {
    throw new ValidationError("Full name is too long.");
  }
  if (!FULL_NAME_PATTERN.test(value)) {
    throw new ValidationError("Full name contains characters that are not allowed.");
  }
  return value;
}

export function sanitizeFileNumber(raw: string): string {
  const value = raw.trim();
  if (!value) throw new ValidationError("Employee file number is required.");
  if (value.length > FILE_NUMBER_MAX_LENGTH) {
    throw new ValidationError("Employee file number is too long.");
  }
  if (!FILE_NUMBER_PATTERN.test(value)) {
    throw new ValidationError("Employee file number contains characters that are not allowed.");
  }
  return value;
}

export function extensionFromFilename(filename: string): string {
  const match = /\.([a-zA-Z0-9]+)$/.exec(filename);
  return match?.[1]?.toLowerCase() ?? "";
}

export function isAcceptedExtension(ext: string): ext is AcceptedExtension {
  return (ACCEPTED_EXTENSIONS as readonly string[]).includes(ext.toLowerCase());
}

export function isAcceptedMimeType(mime: string): boolean {
  return (ACCEPTED_MIME_TYPES as readonly string[]).includes(mime.toLowerCase());
}

/**
 * Sniff the first bytes of a file to confirm they match the claimed type,
 * independent of the (client-supplied, spoofable) filename and MIME type.
 *   PDF  -> "%PDF"
 *   DOC  -> OLE2 compound file signature D0 CF 11 E0 A1 B1 1A E1
 *   DOCX -> ZIP local file header "PK 03 04"
 */
export function sniffMatchesExtension(head: Buffer, ext: string): boolean {
  const e = ext.toLowerCase();
  if (head.length < 4) return false;
  if (e === "pdf") {
    return head.subarray(0, 4).toString("ascii") === "%PDF";
  }
  if (e === "docx") {
    return head[0] === 0x50 && head[1] === 0x4b && head[2] === 0x03 && head[3] === 0x04;
  }
  if (e === "doc") {
    const sig = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
    return head.length >= 8 && head.subarray(0, 8).equals(sig);
  }
  return false;
}

/** Build the exact "<file-number> - <full-name>.<extension>" Drive filename. */
export function buildDriveFilename(fileNumber: string, fullName: string, extension: string): string {
  const safeNumber = fileNumber.replace(UNSAFE_FILENAME_CHARS, "").trim();
  const safeName = fullName.replace(UNSAFE_FILENAME_CHARS, "").trim();
  return `${safeNumber} - ${safeName}.${extension.toLowerCase()}`;
}
