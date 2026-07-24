#!/usr/bin/env node
// One-time helper: exchanges a manual Google OAuth consent for a refresh
// token and writes it into .env. It never prints the token, listens on
// 127.0.0.1 only (never the public interface), and exits as soon as the
// exchange completes or after a 5-minute timeout -- nothing is left
// listening afterward.
//
// Prerequisites (fill into .env BEFORE running this script):
//   GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET
// from a Google Cloud OAuth client of type "Desktop app".
//
// Usage (run on the server itself):
//   1. From your OWN machine, tunnel this port to the server first:
//        ssh -L 8945:127.0.0.1:8945 <user>@<server>
//   2. In that same SSH session, on the server:
//        node scripts/get-refresh-token.mjs
//   3. Open the printed URL in a browser on YOUR machine, sign in as the
//      Google account that owns "My Drive > Staff Updated CVs", click Allow.
//   4. The script saves GOOGLE_OAUTH_REFRESH_TOKEN into .env and exits.

import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, chmodSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { google } from "googleapis";

const PORT = 8945;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/oauth2callback`;
const SCOPES = ["https://www.googleapis.com/auth/drive"];
const TIMEOUT_MS = 5 * 60 * 1000;

const projectRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(projectRoot, ".env");

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

if (!existsSync(envPath)) {
  console.error(`.env not found at ${envPath}`);
  process.exit(1);
}

const envText = readFileSync(envPath, "utf8");
const clientId = getEnvValue(envText, "GOOGLE_OAUTH_CLIENT_ID");
const clientSecret = getEnvValue(envText, "GOOGLE_OAUTH_CLIENT_SECRET");

if (!clientId || !clientSecret) {
  console.error(
    "GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET must be set in .env first.\n" +
      "Create a Google Cloud OAuth client (Application type: Desktop app) and paste its\n" +
      "Client ID / Client secret into .env, then run this script again.",
  );
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);
const state = randomBytes(16).toString("hex");

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: SCOPES,
  state,
});

let timeout;

function shutdown(server, code) {
  clearTimeout(timeout);
  server.close(() => process.exit(code));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);
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
    // Unsolicited hit on this port (e.g. a stray browser request) -- ignore
    // it rather than tearing down the listener the real callback still needs.
    res.writeHead(400, { "Content-Type": "text/plain" }).end("Invalid request.");
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens.refresh_token) {
      throw new Error(
        "Google did not return a refresh token. Revoke this app's access at " +
          "https://myaccount.google.com/permissions and run this script again.",
      );
    }

    const updated = upsertEnvValue(envText, "GOOGLE_OAUTH_REFRESH_TOKEN", tokens.refresh_token);
    writeFileSync(envPath, updated, { mode: 0o600 });
    chmodSync(envPath, 0o600);

    res.writeHead(200, { "Content-Type": "text/plain" }).end(
      "Authorization complete. You can close this tab and return to the terminal.",
    );
    console.log(`\nSaved GOOGLE_OAUTH_REFRESH_TOKEN to ${envPath} (value not shown).`);
    console.log("Restart the app container to pick it up: docker compose up -d --force-recreate app\n");
    shutdown(server, 0);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain" }).end("Something went wrong. Check the terminal.");
    console.error("Token exchange failed:", err instanceof Error ? err.message : err);
    shutdown(server, 1);
  }
});

timeout = setTimeout(() => {
  console.error("\nTimed out waiting for authorization (5 minutes). Run the script again.");
  shutdown(server, 1);
}, TIMEOUT_MS);

server.listen(PORT, "127.0.0.1", () => {
  console.log("\nOpen this URL in a browser signed in as the Google account that owns");
  console.log('"My Drive > Staff Updated CVs", then click Allow:\n');
  console.log(authUrl);
  console.log(`\nWaiting for the redirect to ${REDIRECT_URI} ...`);
  console.log("If you are running this on the server over SSH, tunnel the port from your");
  console.log(`own machine first: ssh -L ${PORT}:127.0.0.1:${PORT} <user>@<server>\n`);
});
