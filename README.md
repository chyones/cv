# EL RACE CV Update Portal

A single public page for EL RACE employees to submit an updated CV. No login,
no dashboard, no database -- the CV is streamed straight to a Google Drive
folder that HR manages directly.

## Scope

- One page: Full Name, Employee File Number, CV upload (PDF/DOC/DOCX, up to
  `MAX_CV_SIZE_MB`).
- One API route (`/api/upload`) that validates the request and streams the
  file to Google Drive using OAuth 2.0 user credentials. The browser never
  sees Google credentials, folder IDs, or Drive links.
- Files are saved on Drive as `<employee-file-number> - <full-name>.<ext>`.

## Local development

```bash
npm install
cp .env.example .env   # fill in the Google service account values
npm run dev
```

## Google Drive setup

The target folder (`GOOGLE_DRIVE_FOLDER_ID` below) lives in a personal
account's **My Drive** ("My Drive > Staff Updated CVs"). Service accounts
have no storage quota of their own in a personal My Drive, so this app
authenticates as that Google account via OAuth 2.0 instead -- uploaded files
end up owned directly by the account that authorized it.

1. In Google Cloud Console, create (or reuse) a project, then go to
   **APIs & Services > Credentials > Create Credentials > OAuth client ID**.
   - **Application type: Desktop app.** (Desktop-app clients get an implicit
     loopback redirect allowance -- there is no redirect URI field to fill
     in on this screen.)
2. Set in `.env`:
   - `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET` -- from the
     OAuth client created above.
   - `GOOGLE_DRIVE_FOLDER_ID` -- already set to the EL RACE folder.
3. Run the one-time authorization helper to obtain
   `GOOGLE_OAUTH_REFRESH_TOKEN`:
   ```bash
   npm run auth:google
   ```
   See `scripts/get-refresh-token.mjs` for exact usage (it walks you through
   an SSH tunnel + a single browser consent as the folder-owning account).
   The script writes the refresh token straight into `.env` -- it is never
   printed or displayed.
4. On the OAuth consent screen (Google Cloud Console > APIs & Services >
   OAuth consent screen), set **Publishing status** to **In production**.
   This is what makes the refresh token non-expiring; if left in "Testing"
   status, Google expires it after 7 days. Because the `drive.file` scope is
   sensitive, the one-time consent screen will show an "unverified app"
   warning -- click through it (Advanced > Go to \[app name]) since you are
   the account owner authorizing your own app.

   The app requests the narrower `drive.file` scope, not the broad `drive`
   scope: `drive.file` grants access only to files the app itself creates
   (plus the one Drive folder ID it's told to write into), not the whole
   Drive. Google Drive's API allows creating a new file with an arbitrary
   `parents` folder ID under this scope even though the folder itself was
   never explicitly shared with or opened by the app.

Restart the container after the refresh token is saved so it picks up the
new value: `docker compose up -d --force-recreate app`.

## Scripts

```bash
npm run lint        # ESLint
npm run typecheck    # tsc --noEmit
npm run test         # Vitest unit tests
npm run build         # Production build (standalone output)
```

## Deployment

Runs as its own Docker Compose project (`elrace-cv`, container
`elrace-cv-app`) on the shared `edge` Docker network, with no published host
port. Public traffic reaches it as:

```
cv.elrace.com -> Cloudflare Tunnel (elrace-web) -> edge-proxy -> elrace-cv-app:3000
```

```bash
cd "/root/CV App"
docker compose build
docker compose up -d
```

`.env` must exist with mode `600` before starting the container; it is never
committed to Git.

## Security notes

- Upload size is enforced end-to-end: client pre-check, server streaming
  limit (`busboy` `fileSize`), and the edge-proxy request body limit.
- File type is checked three ways: extension, declared MIME type, and a
  magic-byte sniff of the first bytes -- independent of what the browser
  claims.
- The uploaded file is never written to local disk; it is streamed directly
  into the Drive API call and discarded on completion or failure.
- API responses only ever say whether the submission succeeded -- no Google
  error detail, file ID, or link is ever returned to the client.
