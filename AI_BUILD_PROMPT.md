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
- Enforce 50 MB on client, application, edge proxy, and the complete request path.
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

## Mandatory repository and server reconciliation

Before building on, copying to, pulling into, or deploying inside `/root/CV App`, inspect both the GitHub repository and the existing server directory in read-only mode and reconcile them.

The server contents must not be assumed to be empty, current, disposable, or identical to GitHub.

Read-only inspection must include:

- `pwd` and a safe directory listing of `/root/CV App`, including hidden files.
- File tree, file sizes, ownership, permissions, and modification times.
- Whether `/root/CV App` is already a Git repository.
- Current Git remote, branch, commit, status, tracked changes, untracked files, and ignored files when Git exists.
- Existing `Dockerfile`, Compose files, `.dockerignore`, `.gitignore`, package files, lockfiles, application source, proxy-related files, deployment scripts, and README files.
- Existing `.env` presence, path, owner, and permissions without printing secret values.
- Existing containers, images, Compose project labels, container names, mounted paths, networks, and volumes related to this directory or proposed project name.
- Differences between the current GitHub repository and `/root/CV App` using filenames and checksums or Git diff where possible.

Then produce a reconciliation report containing:

1. Files that exist only in GitHub.
2. Files that exist only on the server.
3. Files present in both but different.
4. Existing server files that must be preserved.
5. Existing server files that appear obsolete, without deleting them.
6. Whether the GitHub project can be safely deployed as-is.
7. The exact proposed synchronization method.
8. The exact files that would be created, replaced, preserved, moved, or backed up.
9. The exact rollback procedure.

Reconciliation rules:

- Never overwrite the existing server directory blindly.
- Never run `git reset --hard`, `git clean`, `rm -rf`, destructive `rsync --delete`, or any command that removes unknown server content.
- Never replace or delete `/root/CV App/.env`.
- Never print, commit, upload, or expose secret values.
- Preserve server-only operational files unless their removal is explicitly approved.
- Preserve any valid server changes that are not yet in GitHub and report them clearly.
- When equivalent files differ, determine why before choosing either version.
- Treat the server architecture and active runtime configuration as the deployment source of truth, while treating GitHub as the application source of truth.
- Adapt the project files to the verified server architecture rather than forcing assumed networking, paths, container settings, or proxy behavior.
- Create a timestamped backup of every existing file that would be changed before changing it.
- Stop and wait for explicit approval after the reconciliation report. Do not synchronize, build, deploy, restart, reload, or modify anything before approval.

## Existing server architecture

The application will be deployed on the existing Contabo VPS using the current EL RACE publishing architecture.

Use these exact values only after confirming them against the server inspection:

- Server project directory: `/root/CV App`
- Docker Compose project name: `elrace-cv`
- Application container name: `elrace-cv-app`
- Application internal port: `3000`
- Public hostname: `cv.elrace.com`
- Existing Cloudflare Tunnel: `elrace-web`
- Existing published application origin: `http://edge-proxy:80`

The path contains a space. Quote it in shell commands, for example:

```bash
cd "/root/CV App"
```

Keep production secrets only in:

`/root/CV App/.env`

Set the file permission to `600`. Never commit production secrets.

## Required routing architecture

Do not point the Cloudflare Tunnel directly to the CV application container.

Use this flow only after confirming that it matches the active server architecture:

```text
cv.elrace.com
    -> Cloudflare Tunnel: elrace-web
    -> http://edge-proxy:80
    -> host-based edge-proxy route for cv.elrace.com
    -> http://elrace-cv-app:3000
```

Cloudflare configuration:

- Add only the public hostname `cv.elrace.com` to the existing tunnel `elrace-web`.
- Service type: `HTTP`.
- Service URL: `http://edge-proxy:80`.
- Do not create another tunnel.
- Do not replace or recreate `elrace-web`.
- Do not alter or delete any existing public hostname.

Edge proxy configuration:

- Inspect the current edge-proxy implementation and configuration in read-only mode first.
- Determine whether it uses Nginx, Caddy, Traefik, or another router.
- Back up the exact configuration file before changing it.
- Preserve every existing route exactly.
- Add only one host rule for `cv.elrace.com` that proxies to `http://elrace-cv-app:3000`.
- Preserve the original `Host` header and standard forwarded headers.
- Configure the upload/body limit so a 50 MB CV can pass safely; use a small margin above 50 MB when the proxy requires it.
- Validate the proxy configuration before applying it.
- Prefer a graceful configuration reload rather than restarting the edge proxy.
- If a full edge-proxy restart would be required, stop and request explicit approval before doing it.

Docker networking:

- Inspect the Docker network currently used by `edge-proxy`.
- Attach only `elrace-cv-app` to that existing network as an external network in the CV project's Compose file.
- Do not recreate, rename, or remove the existing network.
- Do not publish a host port for the CV application.
- Do not bind the CV application to `0.0.0.0` on the host.
- Confirm that `edge-proxy` can resolve `elrace-cv-app` and reach port `3000` before adding the public hostname.

## Isolation and safety

The CV application must remain isolated from all existing programs.

Do not:

- Stop, restart, rebuild, delete, or reconfigure unrelated containers.
- Run `docker system prune`.
- Run a global `docker compose down`.
- Modify unrelated Compose projects.
- Modify existing databases or volumes.
- Modify unrelated proxy routes.
- Modify unrelated Cloudflare hostnames.
- Modify firewall rules, public ports, Nginx sites, Apache sites, application files, or DNS records unrelated to `cv.elrace.com`.
- Recreate the existing edge proxy, Cloudflare Tunnel, or Docker network.

All Docker commands must target only the `elrace-cv` Compose project. The only permitted shared-infrastructure change is adding the single `cv.elrace.com` route to the existing edge proxy and adding the single public hostname to `elrace-web`.

## Mandatory plan before server changes

Before modifying the VPS, edge proxy, or Cloudflare, perform the repository/server reconciliation and read-only infrastructure inspection, then report:

- The exact state and differences between GitHub and `/root/CV App`.
- The exact synchronization method and backup plan.
- The exact edge-proxy container and technology.
- The exact edge-proxy configuration file that requires one added route.
- The existing Docker network name shared by `edge-proxy`.
- The proposed Compose network declaration for `elrace-cv-app`.
- Confirmation that no host port will be published.
- Confirmation that Cloudflare will use `http://edge-proxy:80`.
- The exact files and services that would change.
- Whether a graceful edge-proxy reload is available.
- Exact rollback commands.

Stop and wait for explicit approval before any synchronization, build, deployment, server, edge-proxy, or Cloudflare change.

## Verification

Verify that:

- The deployed server files match the approved reconciled project state.
- No server-only or secret file was lost or overwritten.
- `https://cv.elrace.com` loads through `http://edge-proxy:80`.
- The page is English-only and responsive.
- Only full name, file number, and CV are requested.
- PDF, DOC, and DOCX work up to 50 MB.
- The edge proxy accepts the upload size without affecting other routes.
- The CV reaches the correct Drive folder with the required filename.
- Success appears only after confirmed upload.
- No Google credentials or Drive identifiers reach the browser.
- All existing applications and tunnel hostnames still work unchanged.
- No public VPS port was opened.

Rollback must:

1. Restore only the backed-up CV project or proxy files changed during the approved deployment.
2. Remove only the `cv.elrace.com` rule from the edge proxy.
3. Remove only the `cv.elrace.com` public hostname from `elrace-web`.
4. Stop and remove only the `elrace-cv` Compose project.
5. Leave every existing program, proxy route, tunnel hostname, network, database, server-only file, secret, and configuration untouched.

Do not use GitHub Pages or Vercel. Build for the reconciled contents of `/root/CV App`, the existing Contabo VPS, the existing `edge-proxy`, and the existing `elrace-web` Cloudflare Tunnel.