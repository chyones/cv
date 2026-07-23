import { describe, expect, it } from "vitest";
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

describe("sanitizeFullName", () => {
  it("trims and collapses internal whitespace", () => {
    expect(sanitizeFullName("  John   Smith  ")).toBe("John Smith");
  });

  it("allows hyphens, apostrophes, and accented letters", () => {
    expect(sanitizeFullName("Jean-Luc O'Connor")).toBe("Jean-Luc O'Connor");
    expect(sanitizeFullName("José Álvarez")).toBe("José Álvarez");
  });

  it("rejects an empty name", () => {
    expect(() => sanitizeFullName("   ")).toThrow(ValidationError);
  });

  it("rejects names with digits or symbols", () => {
    expect(() => sanitizeFullName("John123")).toThrow(ValidationError);
    expect(() => sanitizeFullName("<script>")).toThrow(ValidationError);
  });

  it("rejects an overly long name", () => {
    expect(() => sanitizeFullName("A".repeat(81))).toThrow(ValidationError);
  });
});

describe("sanitizeFileNumber", () => {
  it("accepts alphanumeric, dash, and slash formats", () => {
    expect(sanitizeFileNumber(" EMP-1029 ")).toBe("EMP-1029");
    expect(sanitizeFileNumber("2026/044")).toBe("2026/044");
  });

  it("rejects empty values", () => {
    expect(() => sanitizeFileNumber("")).toThrow(ValidationError);
  });

  it("rejects spaces and unsafe characters", () => {
    expect(() => sanitizeFileNumber("12 34")).toThrow(ValidationError);
    expect(() => sanitizeFileNumber("12*34")).toThrow(ValidationError);
  });

  it("rejects an overly long value", () => {
    expect(() => sanitizeFileNumber("1".repeat(31))).toThrow(ValidationError);
  });
});

describe("extensionFromFilename", () => {
  it("extracts a lowercase extension", () => {
    expect(extensionFromFilename("Report.PDF")).toBe("pdf");
    expect(extensionFromFilename("my.cv.docx")).toBe("docx");
  });

  it("returns an empty string when there is no extension", () => {
    expect(extensionFromFilename("noextension")).toBe("");
  });
});

describe("isAcceptedExtension / isAcceptedMimeType", () => {
  it("accepts only pdf, doc, docx", () => {
    expect(isAcceptedExtension("pdf")).toBe(true);
    expect(isAcceptedExtension("DOCX")).toBe(true);
    expect(isAcceptedExtension("exe")).toBe(false);
  });

  it("accepts only the three known MIME types", () => {
    expect(isAcceptedMimeType("application/pdf")).toBe(true);
    expect(isAcceptedMimeType("application/x-msdownload")).toBe(false);
  });
});

describe("sniffMatchesExtension", () => {
  it("matches a PDF signature", () => {
    expect(sniffMatchesExtension(Buffer.from("%PDF-1.7 rest"), "pdf")).toBe(true);
    expect(sniffMatchesExtension(Buffer.from("not a pdf"), "pdf")).toBe(false);
  });

  it("matches a DOCX (zip) signature", () => {
    const head = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0, 0, 0, 0]);
    expect(sniffMatchesExtension(head, "docx")).toBe(true);
    expect(sniffMatchesExtension(Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]), "docx")).toBe(false);
  });

  it("matches a legacy DOC (OLE2) signature", () => {
    const head = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
    expect(sniffMatchesExtension(head, "doc")).toBe(true);
    expect(sniffMatchesExtension(Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]), "doc")).toBe(false);
  });
});

describe("buildDriveFilename", () => {
  it("joins as '<file-number> - <full-name>.<extension>'", () => {
    expect(buildDriveFilename("EMP-1029", "John Smith", "pdf")).toBe("EMP-1029 - John Smith.pdf");
  });

  it("strips characters that are unsafe in filenames while keeping spaces and hyphens", () => {
    expect(buildDriveFilename('EMP/1029', 'John "Jack" Smith', "docx")).toBe(
      "EMP1029 - John Jack Smith.docx",
    );
  });
});
