import { google } from "googleapis";
import type { Readable } from "node:stream";

/**
 * Uploads a single file stream into the configured Drive folder.
 * Never returns or logs the resulting file id/link -- callers only get success/failure.
 *
 * Authenticates as the Google account that authorized OAuth (not a service
 * account): that account owns the target folder ("My Drive"), so uploaded
 * files are owned by it directly. The refresh token was minted once via
 * scripts/get-refresh-token.mjs; googleapis exchanges it for a fresh access
 * token automatically on every call, no re-authorization needed.
 */
export async function uploadToDrive(params: {
  filename: string;
  mimeType: string;
  stream: Readable;
}): Promise<void> {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!clientId || !clientSecret || !refreshToken || !folderId) {
    throw new Error("Google Drive is not configured.");
  }

  const auth = new google.auth.OAuth2(clientId, clientSecret);
  auth.setCredentials({ refresh_token: refreshToken });

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
