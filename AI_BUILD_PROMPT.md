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

HR will manage all uploaded files directly in Google Drive.

## Official logo asset

Use the exact uploaded company logo located at:

`public/assets/elrace-logo.png`

Requirements:

- This PNG file is the official EL RACE logo supplied by the project owner.
- Use this file directly; do not redraw, recreate, replace, trace, recolor, crop, distort, or generate a substitute logo.
- Preserve the transparent background, original aspect ratio, proportions, and visual quality.
- Display it prominently near the top of the page without making it excessively large.
- Use responsive dimensions and prevent layout shift by defining width and height.
- Use descriptive alt text: `EL RACE Contracting`
- Do not use the previous SVG logo path.

## Design

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
- `PDF, DOC, or DOCX — Maximum 50 MB`

Show selected filename, file size, and a remove or replace action.

Uploading state:

`Uploading your CV...`

Disable duplicate submissions while uploading.

Success state:

- `Your CV has been submitted successfully.`
- `Thank you for keeping your employee information up to date.`
- `Submit Another CV`

Use short safe validation messages. Never expose technical or Google Drive errors.

## Google Drive

Use a server-side API. The browser must never receive Google credentials, Drive IDs, folder links, or uploaded-file links.

Target Google Drive folder ID:

`1bDjbuIAjneyY-y0D1o5EGtOvkc_TaKIn`

Server-only environment variables:

```denv
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_DRIVE_FOLDER_ID=1bDjbuIAjneyY-y0D1o5EGtOvkc_TaKIn
MAX_CV_SIZE_MB=50
```

Share the target folder with the service-account email as Editor.

Upload rules:

- Validate full name and employee file number on the server.
- Accept only PDF, DOC, and DOCX.
- Enforce 50 MB on client, application, edge proxy, and the complete request path.
- Stream the upload or use a temporary file and delete it immediately.
- Sanitize full name and file number.
- Save as `<employee-file-number> - <full-name>.<extension>`.
- Never create list, preview, search, download, edit, or delete endpoints.
- Never display existing Drive files.

## Implementation

Use Next.js App Router, TypeScript, Tailwing CSS, Node.js runtime for upload, Google Drive API, minimal maintained dependencies, and simple client/server validation.

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

## Mandatory repository and server reconciliation

Before building on, copying to, pulling into, or deploying inside `/root/CV App`, inspect both the GitHub repository and the existing server directory in read-only mode and reconcile them.

The server contents must not be assumed to be empty, current, disposable, or identical to GitHub.

Read-only inspection must include:

- `pwd` and a safe listing of `/root/CV App`, including hidden files.
- File tree, sizes, ownership, permissions, and modification times.
- Whether `/root/CV App` is already a Git repository.
- Current Git remote, branch, commit, status, tracked changes, untracked files, and ignored files when Git exists.
- Existing Docker, Compose, ignore, package, lock, source, proxy, deployment, and README files.
- Existing `.env` presence, path, owner, and permissions without printing secret values.
- Existing containers, images, Compose project labels, mounted paths, networks, and volumes related to this directory or proposed project name.
- Differences between GitHub and `/root/CV App` using filenames and checksums or Git diff where possible.

Produce a reconciliation report containing:

1. Files only in GitHub.
2. Files only on the server.
3. Files present in both but different.
4. Server files that must be preserved.
5. Files that appear obsolete, without deleting them.
6. Whether deployment is safe as-is.
7. Exact synchronization method.
8. Exact files to create, replace, preserve, move, or back up.
9. Exact rollback procedure.

Reconciliation rules:

- Never overwrite the existing server directory blindly.
- Never run `git reset --hard`, `git clean`, `rm -rf`, destructive `rsync --delete`, or any command that removes unknown server content.
- Never replace or delete `/root/CV App/.env`.
- Never print, commit, upload, or expose secret values.
- Preserve server-only operational files unless explicitly approved otherwise.
- Preserve valid server changes that are not yet in GitHub and report them.
- Determine why equivalent files differ before choosing a version.
- Treat active server architecture as deployment source of truth and GitHub as application source of truth.
- Adapt project files to the verified server architecture rather than forcing assumptions.
- Create a timestamped backup of every existing file that would be changed.
- Stop and wait for explicit approval after the reconciliation report. Do not synchronize, build, deploy, restart, reload, or modify anything before approval.

## Existing server architecture

Confirm these values against the server inspection before using them:

- Server project directory: `/root/CV App`
- Docker Compose project name: `elrace-cv`
- Application container name: `elrace-cv-app`
- Application internal port: `3000`
- Public hostname: `cv.elrace.com`
- Existing Cloudflare Tunnel: `elrace-web`
- Existing published origin: `http://edge-proxy:80`

The path contains a space. Quote it in shell commands:

```bash
cd "/root/CV App"
```

Keep production secrets only in `/root/CV App/.env`, set permission `600`, and never commit them.

## Required routing architecture

Do not point Cloudflare Tunnel directly to the CV application container.

Use this flow only after confirming it matches the active server architecture:

```text
cv.elrace.com
    -> Cloudflare Tunnel: elrace-web
    -> http://edge-proxy:80
    -> host-based edge-proxy route for cv.elrace.com
    -> http://elrace-cv-app:3000
```

Cloudflare configuration:

- Add only `cv.elrace.com` to the existing `elrace-web` tunnel.
- Service type: `HTTP`.
- Service URL: `http://edge-proxy:80`.
- Do not create, replace, or recreate a tunnel.
- Do not alter or delete existing public hostnames.

Edge proxy configuration:

- Inspect the current implementation and configuration read-only first.
- Determine whether it uses Nginx, Caddy, Traefik, or another router.
- Back up the exact configuration file before changing it.
- Preserve every existing route exactly.
- Add only one host rule for `cv.elrace.com` pointing to `http://elrace-cv-app:3000`.
- Preserve the original Host header and standard forwarded headers.
- Configure the upload/body limit with a safe margin above 50 MB.
- Validate proxy configuration before applying it.
- Prefer a graceful reload.
- If a full proxy restart is required, stop and request explicit approval.

Docker networking:

- Inspect the network currently used by `edge-proxy`.
- Attach only `elrace-cv-app` to that existing network as an external network.
- Do not recreate, rename, or remove that network.
- Do not publish a host port.
- Do not bind the application publicly to `0.0.0.0`.
- Confirm `edge-proxy` resolves `elrace-cv-app` and reaches port `3000` before adding the hostname.

## Isolation and safety

Do not:

- Stop, restart, rebuild, delete, or reconfigure unrelated containers.
- Run `docker system prune`.
- Run a global `docker compose down`.
- Modify unrelated Compose projects, databases, volumes, proxy routes, Cloudflare hostnames, firewall rules, public ports, Nginx sites, Apache sites, application files, DNS records, tunnels, or networks.

All Docker commands must target only the `elrace-cv` Compose project. The only permitted shared-infrastructure changes are adding the single `cv.elrace.com` route to the existing edge proxy and adding the single public hostname to `elrace-web`.

## Mandatory plan before server changes

Before modifying the VPS, edge proxy, or Cloudflare, report:

- Exact differences between GitHub and `/root/CV App`.
- Exact synchronization method and backup plan.
- Exact edge-proxy container and technology.
- Exact edge-proxy configuration file requiring one route.
- Existing Docker network name shared by `edge-proxy`.
- Proposed Compose external-network declaration.
- Confirmation that no host port will be published.
- Confirmation that Cloudflare will use `http://edge-proxy:80`.
- Exact files and services that would change.
- Whether graceful proxy reload is available.
- Exact rollback commands.

Stop and wait for explicit approval before synchronization, build, deployment, server, edge-proxy, or Cloudflare changes.

## Verification

Verify that:

- Deployed files match the approved reconciled state.
- No server-only or secret file was lost or overwritten.
- `https://cv.elrace.com` loads through `http://edge-proxy:80`.
- The official logo loads from `/assets/elrace-logo.png` without distortion or replacement.
- The page is English-only and responsive.
- Only full name, file number, and CV are requested.
- PDF, DOC, and DOCX work up to 50 MB.
- The edge proxy accepts the upload size without affecting other routes.
- The CV reaches the correct Drive folder with the required filename.
- Success appears only after confirmed upload.
- No Google credentials or Drive identifiers reach the browser.
- Existing applications and tunnel hostnames remain unchanged.
- No public VPS port was opened.

Rollback must:

1. Restore only backed-up CV project or proxy files changed during the approved deployment.
2. Remove only the `cv.elrace.com` rule from the edge proxy.
3. Remove only the `cv.elrace.com` public hostname from `elrace-web`.
4. Stop and remove only the `elrace-cv` Compose project.
5. Leave every other program, route, hostname, network, database, server-only file, secret, and configuration untouched.

Do not use GitHub Pages or Vercel. Build for the reconciled contents of `/root/CV App`, the existing Contabo VPS, the existing `edge-proxy`, and the existing `elrace-web` Cloudflare Tunnel.
