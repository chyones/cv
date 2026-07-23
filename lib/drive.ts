import { google } from "googleapis";
import type { Readable } from "node:stream";

/**
 * Uploads a single file stream into the configured Drive folder.
 * Never returns or logs the resulting file id/link -- callers only get success/failure.
 *
 * Requires the full "drive" scope (not the narrower "drive.file" scope): the
 * target folder is shared with the service account by the folder owner, it is
 * not created by this app, and "drive.file" cannot see folders it didn't create.
 */
export async function uploadToDrive(params: {
  filename: string;
  mimeType: string;
  stream: Readable;
}): Promise<void> {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!clientEmail || !privateKeyRaw || !folderId) {
    throw new Error("Google Drive is not configured.");
  }

  const privateKey = privateKeyRaw.includes("\\n")
    ? privateKeyRaw.replace(/\\n/g, "\n")
    : privateKeyRaw;

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  const drive = google.drive({ version: "v3", auth });

  await drive.files.create({
    requestBody: {
      name: params.filename,
      parents: [folderId],
    },
    media: {
      mimeType: params.mimeType,
      body: params.stream,
    },
    fields: "id",
  });
}
