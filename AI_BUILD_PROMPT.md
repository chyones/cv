# EL RACE Temporary CV Upload Page — Final Build and Deployment Prompt

Build the complete project in this repository. This is a temporary HR page for employees to submit updated CVs. Keep the user experience extremely simple. The page must still look modern, polished, professional, and clearly branded for EL RACE.

## 1. Exact scope

Create one public English-only page at:

`https://cv.elrace.com`

Do not create:

- Login or authentication
- Employee accounts
- Dashboard
- Admin panel
- HR interface
- Database
- File browser
- Navigation menu
- Extra pages
- Email workflow
- Approval workflow
- Analytics

The employee must only:

1. Enter their full name.
2. Enter their employee file number.
3. Select or drag and drop their CV.
4. Submit it.
5. See a success confirmation.

The backend uploads the CV directly to the HR Google Drive folder. HR will manage the uploaded files directly in Google Drive.

## 2. Branding and design

Use the supplied logo:

`public/assets/elrace-logo.svg`

Preserve the logo proportions and quality.

Brand colors:

- EL RACE navy: `#29357E`
- EL RACE red: `#CE363A`
- White: `#FFFFFF`
- Soft background: `#F5F7FB`
- Dark text: `#171A24`

The page must look professionally designed and production-ready, not like a basic generated form.

Use:

- One refined page composition
- One clear upload form
- Strong spacing and visual hierarchy
- Modern corporate typography
- Soft shadows and precise borders
- Balanced white space
- A strong drag-and-drop upload area
- Subtle architectural or construction-inspired background details
- Small icons only when they improve clarity
- Subtle hover, focus, upload, and success transitions
- Excellent mobile responsiveness

Do not use:

- Excessive gradients
- Glassmorphism
- Stock images
- Large illustrations
- Animated backgrounds
- Decorative clutter
- Multiple unnecessary cards
- Long text
- Generic marketing content

The design must feel premium while the task remains immediately obvious.

## 3. Page copy

Keep all writing short and directly related to the CV update request.

Eyebrow:

`Employee Records Update`

Heading:

`Update Your CV`

Introductory text:

`Please submit your latest CV so your employee record reflects your current position, responsibilities, qualifications, certifications, and recent professional achievements.`

Deadline notice:

`Submission deadline: Sunday, 26 July 2026`

File naming note:

`Please rename your CV using your employee file number before uploading.`

Form fields:

- `Full Name`
- `Employee File Number`
- `Upload CV`

Placeholders:

- `Enter your full name`
- `Enter your file number`

Upload area:

- `Drag and drop your CV here`
- `or choose a file from your device`
- `PDF, DOC, or DOCX — maximum 50 MB`

Show the selected filename, file size, and a simple remove or replace action.

Submit button:

`Submit Updated CV`

Uploading state:

`Uploading your CV...`

Disable duplicate submissions while uploading.

Success state:

- `Your CV has been submitted successfully.`
- `Thank you for keeping your employee information up to date.`
- `Submit Another CV`

Safe error messages:

- `Please enter your full name.`
- `Please enter your employee file number.`
- `Please select a PDF, DOC, or DOCX file.`
- `The file must not exceed 50 MB.`
- `The upload could not be completed. Please try again.`

Never expose technical or Google Drive error details.

## 4. Google Drive upload

Use a server-side API route. The browser must never receive Google credentials and must never upload directly to Google Drive.

Target Google Drive folder ID:

`1bDjbuIAjneyY-y0D1o5EGtOvkc_TaKIn`

Read it from the server environment variable `GOOGLE_DRIVE_FOLDER_ID`.

Use these server-only environment variables:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_DRIVE_FOLDER_ID=1bDjbuIAjneyY-y0D1o5EGtOvkc_TaKIn
MAX_CV_SIZE_MB=50
```

The Google Drive folder must be shared with the service-account email as Editor.

When processing the upload:

- Validate full name and employee file number on the server.
- Accept only PDF, DOC, and DOCX.
- Enforce the 50 MB limit on both client and server.
- Configure the complete request path to accept 50 MB files.
- Avoid loading the entire file into memory when possible; stream it or use a temporary file and delete it immediately after upload.
- Sanitize the employee file number and full name.
- Preserve only a valid extension.
- Rename the stored file to `<employee-file-number> - <full-name>.<extension>`.
- Never return the Drive file ID, folder URL, or uploaded-file URL.
- Never create list, search, preview, download, edit, or delete endpoints.
- Never display existing Google Drive files.

## 5. Technical implementation

Use:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Node.js runtime for the upload endpoint
- Server-side Google Drive API integration
- Minimal maintained dependencies
- Simple client-side and server-side validation

Do not add features outside the defined scope.

Required files:

- Complete frontend page
- Upload API route
- Google Drive integration
- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- `.env.example`
- `.gitignore`
- `README.md`
- Basic validation and upload tests

## 6. Contabo VPS deployment

The application will run on the existing Contabo VPS. It must be isolated and must not change, stop, restart, rebuild, reconfigure, or remove any existing application.

Use this deployment identity:

- Project directory: `/opt/elrace-cv`
- Docker Compose project name: `elrace-cv`
- Container name: `elrace-cv-app`
- Internal application port: `3000`
- Public hostname: `cv.elrace.com`
- Existing Cloudflare Tunnel: `elrace-web`

Deployment safety rules:

- Inspect the server and current Cloudflare setup in read-only mode before deployment.
- Do not run `docker system prune`.
- Do not run a global `docker compose down`.
- Do not stop or restart unrelated containers.
- Do not modify unrelated Docker Compose files.
- Do not modify existing databases, volumes, firewall rules, Nginx sites, Apache sites, ports, DNS records, or application files.
- Do not reuse an occupied host port.
- Do not expose the application directly to the public internet.
- Do not bind the application to `0.0.0.0` on a public host port.
- Keep secrets only in `/opt/elrace-cv/.env` with permission `600`.
- Do not commit production secrets to GitHub.
- All Docker commands must target only the `elrace-cv` project.

Preferred networking method:

1. Inspect how the existing `elrace-web` cloudflared container or service reaches internal applications.
2. Identify the existing Docker network used by the tunnel without changing it.
3. Attach only `elrace-cv-app` to that existing network as an external Docker network.
4. Do not recreate the network or the existing cloudflared container.
5. Do not publish a host port when the tunnel can reach the container directly.

The preferred Cloudflare Tunnel origin service is:

`http://elrace-cv-app:3000`

Use that service only when the CV container and the existing cloudflared container share the same Docker network.

Fallback method only when the tunnel runs directly on the host:

- Bind the application only to a free loopback address such as `127.0.0.1:3015:3000`.
- Set the tunnel origin to `http://127.0.0.1:3015`.
- Confirm port `3015` is unused before using it.

Do not use the fallback when cloudflared runs inside Docker and cannot reach host loopback.

## 7. Cloudflare Tunnel configuration

Use the existing tunnel named:

`elrace-web`

Add only this new public hostname:

- Subdomain: `cv`
- Domain: `elrace.com`
- Hostname: `cv.elrace.com`
- Service type: `HTTP`
- Service URL: `http://elrace-cv-app:3000` when using the shared Docker network

Cloudflare safety rules:

- Do not create a second tunnel.
- Do not replace the existing tunnel.
- Do not delete or edit existing public hostnames.
- Do not overwrite the complete ingress configuration.
- Add only the new `cv.elrace.com` route.
- If editing a YAML ingress file, preserve every existing rule exactly and insert the new rule before the final catch-all rule.
- Back up the tunnel configuration before editing it.
- Validate the configuration before reloading cloudflared.
- Reload or restart cloudflared only when required, and only after confirming the existing hostnames will remain unchanged.

## 8. Mandatory pre-deployment check

Before making any VPS or Cloudflare change, produce a short deployment plan containing only:

- Existing tunnel runtime: host service or Docker container
- Existing tunnel network name
- Proposed CV container network connection
- Proposed origin URL
- Whether a loopback port is required
- Exact files that will be created or changed
- Exact service or container that would need reloading
- Rollback commands

Do not perform deployment changes until this plan is explicitly approved.

## 9. Verification

After deployment, verify:

- `https://cv.elrace.com` loads successfully.
- The page is English-only and responsive.
- Full name and file number are required.
- PDF, DOC, and DOCX files are accepted.
- Files larger than 50 MB are rejected.
- A valid CV reaches the correct Google Drive folder.
- The stored filename follows `<employee-file-number> - <full-name>.<extension>`.
- The success message appears only after confirmed upload.
- The browser never receives Google credentials or Drive identifiers.
- Existing tunnel hostnames still work exactly as before.
- Existing containers and applications were not restarted or changed.
- No new public VPS port was opened.

## 10. Rollback

Rollback must affect only this project:

1. Remove only the `cv.elrace.com` public hostname from `elrace-web`.
2. Stop only the `elrace-cv` Docker Compose project.
3. Remove only the `elrace-cv-app` container and project-specific image if required.
4. Leave every existing application, tunnel hostname, container, network, volume, proxy, and configuration untouched.

## 11. Documentation and completion

The README must explain only:

1. Local installation and testing.
2. Google Drive API and service-account setup.
3. Environment variables.
4. Building and running the isolated Docker project on Contabo.
5. Connecting the app to the existing `elrace-web` tunnel.
6. Adding only `cv.elrace.com`.
7. Testing a successful upload.
8. Safe rollback.

Do not use GitHub Pages or Vercel. The application must run on the Contabo VPS through the existing Cloudflare Tunnel.

Implement the project completely. Run lint, type checking, tests, and a production build. Fix every failure. Do not deploy or alter the VPS until the mandatory pre-deployment plan is reviewed and explicitly approved.