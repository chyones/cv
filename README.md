# EL RACE CV Update Portal

A single public page for EL RACE employees to submit an updated CV. No login,
no dashboard, no database -- the CV is streamed straight to a Google Drive
folder that HR manages directly.

## Scope

- One page: Full Name, Employee File Number, CV upload (PDF/DOC/DOCX, up to
  `MAX_CV_SIZE_MB`).
- One API route (`/api/upload`) that validates the request and streams the
  file to Google Drive via a service account. The browser never sees Google
  credentials, folder IDs, or Drive links.
- Files are saved on Drive as `<employee-file-number> - <full-name>.<ext>`.

## Local development

```bash
npm install
cp .env.example .env   # fill in the Google service account values
npm run dev
```

## Google Drive setup

1. In Google Cloud Console, create (or reuse) a project and a **service
   account**. Create a JSON key for it.
2. Open the target Drive folder (`GOOGLE_DRIVE_FOLDER_ID` below) and share it
   with the service account's email address as **Editor**.
3. Set in `.env`:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` -- the service account's `client_email`.
   - `GOOGLE_PRIVATE_KEY` -- the service account's `private_key` (keep the
     `\n` sequences; the app converts them to real newlines at runtime).
   - `GOOGLE_DRIVE_FOLDER_ID` -- already set to the EL RACE folder.

The service account needs the broad `https://www.googleapis.com/auth/drive`
scope (not the narrower `drive.file` scope), because the folder is shared
with it rather than created by it.

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
