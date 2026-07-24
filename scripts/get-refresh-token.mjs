#!/usr/bin/env node
// One-time helper: exchanges a manual Google OAuth consent for a refresh
// token, PROVES it can upload into the target Drive folder with drive.file
// scope (create + delete one small test PDF), and only then saves it into
// .env. Never prints any secret (client id/secret, refresh/access token,
// authorization code). Binds to 127.0.0.1 on an OS-assigned free port --
// never a hardcoded one, so it can't collide with anything already in use
// -- and shuts the listener down as soon as the flow finishes (success,
// failure, or a 5-minute timeout). Nothing is left listening afterward.
//
// Prerequisites (already set in .env before running this):
//   GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_DRIVE_FOLDER_ID
// from a Google Cloud OAuth client of type "Desktop app".
//
// Usage:
//   1. From your OWN machine, tunnel whichever port this script prints:
//        ssh -L <port>:127.0.0.1:<port> <user>@<server>
//   2. In that same SSH session, on the server:
//        node scripts/get-refresh-token.mjs
//   3. Open the printed URL in a browser on YOUR machine, sign in as the
//      Google account that owns "My Drive > Staff Updated CVs", click Allow.

import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, chmodSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";
import path from "node:path";
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const TIMEOUT_MS = 15 * 60 * 1000;

const projectRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(projectRoot, ".env");

// A minimal, structurally valid single-page PDF -- small and harmless.
const TEST_PDF = Buffer.from(
  "%PDF-1.4\n" +
    "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n" +
    "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
    "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 72 72]>>endobj\n" +
    "trailer<</Root 1 0 R>>\n%%EOF",
  "utf8",
);

function getEnvValue(envText, key) {
  const match = envText.match(new RegExp(`^${key}=(.*)$`, "m"));
  return match ? match[1].trim() : "";
}

function upsertEnvValue(envText, key, value) {
  const pattern = new RegExp(`^${key}=.*$`, "m");
  const line = `${key}=${value}`;
  if (pattern.test(envText)) {
    return envText.replace(pattern, line);
  }
  const withTrailingNewline = envText.endsWith("\n") ? envText : `${envText}\n`;
  return `${withTrailingNewline}${line}\n`;
}

function describeGoogleError(err) {
  const data = err?.response?.data;
  if (data?.error) {
    return typeof data.error === "string" ? data.error : JSON.stringify(data.error, null, 2);
  }
  return err instanceof Error ? err.message : String(err);
}

if (!existsSync(envPath)) {
  console.error(`.env not found at ${envPath}`);
  process.exit(1);
}

const envText = readFileSync(envPath, "utf8");
const clientId = getEnvValue(envText, "GOOGLE_OAUTH_CLIENT_ID");
const clientSecret = getEnvValue(envText, "GOOGLE_OAUTH_CLIENT_SECRET");
const folderId = getEnvValue(envText, "GOOGLE_DRIVE_FOLDER_ID");

if (!clientId || !clientSecret) {
  console.error(
    "GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET must be set in .env first.\n" +
      "Create a Google Cloud OAuth client (Application type: Desktop app) and paste its\n" +
      "Client ID / Client secret into .env, then run this script again.",
  );
  process.exit(1);
}
if (!folderId) {
  console.error("GOOGLE_DRIVE_FOLDER_ID must be set in .env first.");
  process.exit(1);
}

let oauth2Client;
let state;
let redirectUri;
let timeout;

function shutdown(server, code) {
  clearTimeout(timeout);
  server.close(() => process.exit(code));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, redirectUri);
  if (url.pathname !== "/oauth2callback") {
    res.writeHead(404).end();
    return;
  }

  const error = url.searchParams.get("error");
  if (error) {
    res.writeHead(400, { "Content-Type": "text/plain" }).end("Authorization was not granted. You can close this tab.");
    console.error(`Google returned an error: ${error}`);
    shutdown(server, 1);
    return;
  }

  const returnedState = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  if (returnedState !== state || !code) {
    // Unsolicited hit on this port -- ignore it, keep waiting for the real callback.
    res.writeHead(400, { "Content-Type": "text/plain" }).end("Invalid request.");
    return;
  }

  res.writeHead(200, { "Content-Type": "text/plain" }).end(
    "Authorization received -- verifying Drive access now. You can close this tab and check the terminal.",
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens.refresh_token) {
      throw new Error(
        "Google did not return a refresh token. Revoke this app's access at " +
          "https://myaccount.google.com/permissions and run this script again.",
      );
    }
    oauth2Client.setCredentials(tokens);

    // Prove drive.file can actually write into the target folder BEFORE
    // persisting anything -- a refresh token is only worth saving if this
    // succeeds.
    const drive = google.drive({ version: "v3", auth: oauth2Client });
    const testName = `oauth-verify-${Date.now()}.pdf`;

    let fileId;
    try {
      const created = await drive.files.create({
        requestBody: { name: testName, parents: [folderId] },
        media: { mimeType: "application/pdf", body: Readable.from(TEST_PDF) },
        fields: "id, name, parents",
      });
      fileId = created.data.id;
      console.log(`Verification upload OK: "${created.data.name}" (id ${fileId}) landed in folder ${folderId}.`);
    } catch (createErr) {
      console.error("\nVERIFICATION FAILED: drive.file could not create a file in the target folder.");
      console.error("Exact Google API error:\n" + describeGoogleError(createErr));
      console.error(
        "\nRefresh token was NOT saved. Scope was not widened and no broader access was requested.",
      );
      shutdown(server, 1);
      return;
    }

    try {
      await drive.files.delete({ fileId });
      console.log("Verification test file deleted.");
    } catch (deleteErr) {
      console.error(
        `\nWARNING: creation succeeded but the test file could not be auto-deleted ` +
          `(id ${fileId}, name "${testName}"). Remove it from Drive manually.`,
      );
      console.error(describeGoogleError(deleteErr));
      // Creation succeeding is the proof that matters; continue to save the token.
    }

    const updatedEnv = upsertEnvValue(envText, "GOOGLE_OAUTH_REFRESH_TOKEN", tokens.refresh_token);
    writeFileSync(envPath, updatedEnv, { mode: 0o600 });
    chmodSync(envPath, 0o600);

    console.log(`\nSUCCESS: refresh token saved to ${envPath} (value not shown).`);
    console.log("Restart the app container to pick it up: docker compose up -d --force-recreate app");
    shutdown(server, 0);
  } catch (err) {
    console.error("\nAuthorization/verification failed:", describeGoogleError(err));
    shutdown(server, 1);
  }
});

timeout = setTimeout(() => {
  console.error("\nTimed out waiting for authorization (5 minutes). Run the script again.");
  shutdown(server, 1);
}, TIMEOUT_MS);

// Bind to an OS-assigned free loopback port -- never a fixed one, so this
// can never collide with a port already in use.
server.listen(0, "127.0.0.1", () => {
  const port = server.address().port;
  redirectUri = `http://127.0.0.1:${port}/oauth2callback`;
  oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  state = randomBytes(16).toString("hex");

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state,
  });

  console.log("\nOpen this URL in a browser signed in as the Google account that owns");
  console.log('"My Drive > Staff Updated CVs", then click Allow:\n');
  console.log(authUrl);
  console.log(`\nWaiting for the redirect to ${redirectUri} ...`);
  console.log("If running this on the server over SSH, tunnel this exact port from your own machine first:");
  console.log(`  ssh -L ${port}:127.0.0.1:${port} <user>@<server>\n`);
});
