# EL RACE Temporary CV Upload Page — Build Prompt

Build the complete working project in this repository. The page is a temporary HR tool and must remain simple, fast, professional, and English-only.

## Purpose

Create one public page that any EL RACE employee can open without signing in. The employee enters their full name, employee file number, selects their CV, and submits it. The backend uploads the CV directly to the HR Google Drive folder. HR will manage the files directly in Google Drive, so do not build an admin panel, employee account, login page, file browser, dashboard, database, or HR interface.

## Required page

Use the supplied EL RACE logo at:

`public/assets/elrace-logo.svg`

Create a clean responsive page using EL RACE navy, red, white, and a light neutral background.

Display this content:

### Heading

`Update Your CV`

### Instruction text

`Kindly update your CV to reflect your current job position, latest responsibilities, qualifications, certifications, and any other recent professional achievements.`

`Please rename your CV using your employee file number before uploading it.`

`Submit your updated CV no later than Sunday, 26 July 2026.`

### Form fields

Only include:

1. `Full Name` — required
2. `Employee File Number` — required
3. `Upload CV` — required

Accepted file types:

- PDF
- DOC
- DOCX

Maximum file size: 10 MB.

Show the selected filename and a simple remove or replace option.

Use one primary button:

`Submit Updated CV`

While uploading, disable the form and show:

`Uploading your CV...`

After the Google Drive upload is confirmed, replace the form with:

`Your CV has been submitted successfully.`

Also show:

`Thank you for updating your information.`

Provide a small `Submit Another CV` button.

For errors, show short clear messages such as:

- `Please enter your full name.`
- `Please enter your employee file number.`
- `Please select a PDF, DOC, or DOCX file.`
- `The file must not exceed 10 MB.`
- `The upload could not be completed. Please try again.`

## Google Drive upload

Use a server-side API route. The browser must never upload directly to Google Drive and must never receive Google credentials.

Target Google Drive folder ID:

`1bDjbuIAjneyY-y0D1o5EGtOvkc_TaKIn`

Read the folder ID from the server environment variable `GOOGLE_DRIVE_FOLDER_ID`. Do not hardcode credentials or private keys.

Use a Google service account and these server-only environment variables:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
GOOGLE_DRIVE_FOLDER_ID=1bDjbuIAjneyY-y0D1o5EGtOvkc_TaKIn
MAX_CV_SIZE_MB=10
```

The Google Drive folder must be shared with the service-account email as Editor.

When saving the file to Google Drive:

- Sanitize the employee file number.
- Preserve the valid original extension.
- Rename the stored file to `<employee-file-number> - <full-name>.<extension>`.
- Never expose the Drive file ID, folder link, or uploaded-file link to the employee.
- Do not create any API route for listing, viewing, searching, downloading, or deleting files.
- Do not allow the public page to display existing uploads.

## Technical implementation

Use:

- Next.js App Router
- TypeScript
- Tailwind CSS
- A server-side Google Drive API integration
- Simple server-side validation

Do not add unnecessary packages or features.

The design must be:

- English-only
- Mobile-first and fully responsive
- One centered professional form card
- Clear and easy for non-technical employees
- Accessible by keyboard
- Free from excessive animation, gradients, illustrations, multiple steps, language selectors, menus, dashboards, and unnecessary text

## Required files and documentation

Create the complete application, including:

- Frontend page
- Upload API route
- Google Drive integration
- `.env.example`
- `.gitignore`
- `README.md`
- Basic validation tests

The README must explain only the necessary setup:

1. Install and run locally.
2. Enable Google Drive API.
3. Create a Google service account.
4. Share the target folder with the service-account email as Editor.
5. Configure environment variables.
6. Deploy the project to Vercel.
7. Test one CV upload.

Do not use GitHub Pages because the Google Drive credentials require a secure server-side environment.

Implement the project completely, run lint, type checking, tests, and production build, fix all failures, then provide a concise report of the files created, checks passed, and the remaining Google/Vercel configuration steps.