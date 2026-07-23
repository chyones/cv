# EL RACE Temporary CV Upload Page — Final Prompt

Build the complete project in this repository. This is a temporary English-only HR page at `https://cv.elrace.com`. Keep the workflow extremely simple while making the design modern, polished, professional, responsive, and clearly branded for EL RACE.

## Exact scope

Create one public page only. Do not create login, accounts, dashboard, admin panel, HR interface, database, file browser, navigation, email workflow, analytics, or extra pages.

The employee must only:

1. Enter `Full Name`.
2. Enter `Employee File Number`.
3. Select or drag and drop a CV.
4. Click `Submit Updated CV`.
5. See a success confirmation after Google Drive confirms the upload.

HR will manage all files directly in Google Drive.

## Design

Use `public/assets/elrace-logo.svg` and preserve its proportions.

Brand colors:

- Navy: `#29357E`
- Red: `#CE363A`
- White: `#FFFFFF`
- Background: `#F5F7FB`
- Text: `#171A24`

Use one refined page and one clear form. Apply modern corporate typography, strong spacing, soft shadows, precise borders, balanced white space, a professional drag-and-drop area, subtle construction-inspired background geometry, clear focus states, and excellent mobile layout.

Do not use stock images, large illustrations, animated backgrounds, glassmorphism, excessive gradients, decorative clutter, multiple unnecessary cards, long text, or generic marketing content.

## Exact page copy

Eyebrow:

`Employee Records Update`

Heading:

`Update Your CV`

Intro:

`Please submit your latest CV so your employee record reflects your current position, responsibilities, qualifications, certifications, and recent professional achievements.`

Deadline:

`Submission deadline: Sunday, 26 July 2026`

File note:

`Please rename your CV using your employee file number before uploading.`

Fields:

- `Full Name` — placeholder: `Enter your full name`
- `Employee File Number` — placeholder: `Enter your file number`
- `Upload CV`

Upload area:

- `Drag and drop your CV here`
- `or choose a file from your device`
- `PDF, DOC, or DOCX — maximum 50 MB`

Show selected filename, file size, and remove or replace action.

Uploading state:

`Uploading your CV...`

Success state:

- `Your CV has been submitted successfully.`
- `Thank you for keeping your employee information up to date.`
- `Submit Another CV`

Use short safe validation messages. Never expose technical or Google Drive errors.

## Google Drive

Use a server-side API. The browser must never receive Google credentials, Drive IDs, folder links, or uploaded-file links.

Target folder ID:

`1bDjbuIAjneyY-y0D1o5EGtOvkc_TaKIn`

Server-only environment variables:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_DRIVE_FOLDER_ID=1bDjbuIAjneyY-y0D1o5EGtOvkc_TaKIn
MAX_CV_SIZE_MB=50
```

Share the target folder with the service-account email as Editor.

Upload rules:

- Validate full name and employee file number on the server.
- Accept only PDF, DOC, and DOCX.
- Enforce 50 MB on client, application, and complete request path.
- Stream the upload or use a temporary file and delete it immediately.
- Sanitize full name and file number.
- Save as `<employee-file-number> - <full-name>.<extension>`.
- Never create list, preview, search, download, edit, or delete endpoints.
- Never display existing Drive files.

## Implementation

Use Next.js App Router, TypeScript, Tailwind CSS, Node.js runtime for upload, Google Drive API, minimal maintained dependencies, and simple client/server validation.

Create:

- Frontend page
- Upload API route
- Google Drive integration
- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- `.env.example`
- `.gitignore`
- `README.md`
- Basic validation and upload tests

Run lint, type checking, tests, and production build. Fix every failure.

## Contabo deployment

Deploy only after a read-only inspection and explicit approval of the deployment plan.

Use:

- Directory: `/opt/elrace-cv`
- Compose project: `elrace-cv`
- Container: `elrace-cv-app`
- Internal port: `3000`
- Hostname: `cv.elrace.com`
- Existing tunnel: `elrace-web`

The CV application must be isolated. Do not stop, restart, rebuild, reconfigure, delete, or modify any existing application, container, Compose project, database, volume, network, proxy, firewall rule, DNS record, Nginx site, Apache site, or tunnel hostname.

Never run `docker system prune`, a global `docker compose down`, or commands targeting unrelated services. All Docker commands must target only the `elrace-cv` project. Keep production secrets in `/opt/elrace-cv/.env` with permission `600` and never commit them.

Preferred connection:

1. Inspect whether `elrace-web` runs in Docker or on the host.
2. If cloudflared runs in Docker, identify its existing network without changing or recreating it.
3. Attach only `elrace-cv-app` to that network as an external network.
4. Do not publish a host port.
5. Set the tunnel origin to `http://elrace-cv-app:3000`.

Fallback only when cloudflared runs directly on the host:

- Confirm port `3015` is free.
- Bind only `127.0.0.1:3015:3000`.
- Set the tunnel origin to `http://127.0.0.1:3015`.

Never bind the app to a public `0.0.0.0` host port.

## Cloudflare Tunnel

Use the existing tunnel `elrace-web`. Add only:

- Hostname: `cv.elrace.com`
- Service type: `HTTP`
- Service URL: `http://elrace-cv-app:3000` when using the shared Docker network

Do not create a second tunnel. Do not replace the tunnel. Do not delete, overwrite, or alter existing public hostnames. If using an ingress YAML file, back it up, preserve every existing rule exactly, and add the CV rule before the final catch-all rule.

## Mandatory plan before server changes

Before changing the VPS or Cloudflare, report:

- Whether cloudflared runs on the host or in Docker
- Existing tunnel network name
- Proposed CV network connection
- Proposed origin URL
- Whether loopback port `3015` is required
- Exact files and services that would change
- Exact rollback commands

Stop and wait for explicit approval before deployment.

## Verification

Verify that:

- `https://cv.elrace.com` loads.
- The page is English-only and responsive.
- Only full name, file number, and CV are requested.
- PDF, DOC, and DOCX work up to 50 MB.
- The CV reaches the correct Drive folder with the required filename.
- Success appears only after confirmed upload.
- No Google credentials or Drive identifiers reach the browser.
- Existing tunnel hostnames and applications still work unchanged.
- No public VPS port was opened.

Rollback must remove only the `cv.elrace.com` route and stop only the `elrace-cv` Compose project. Leave every existing program and configuration untouched.

Do not use GitHub Pages or Vercel. Build for the Contabo VPS and the existing `elrace-web` Cloudflare Tunnel.