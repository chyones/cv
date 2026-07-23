# EL RACE Temporary CV Upload Page — Final Build Prompt

Build the complete working project in this repository. This is a temporary HR page for employees to submit updated CVs. Keep the experience extremely simple, but make the visual design polished, modern, premium, and clearly associated with EL RACE.

## Scope

Create one public English-only page. No login, employee account, dashboard, admin panel, database, file browser, HR interface, navigation menu, or extra pages.

The employee must only:

1. Enter their full name.
2. Enter their employee file number.
3. Select or drag and drop their CV.
4. Submit it.
5. See a clear success confirmation.

The backend uploads the file directly to the HR Google Drive folder. HR will manage all files directly in Google Drive.

## Branding

Use the supplied logo:

`public/assets/elrace-logo.svg`

Use the logo naturally and preserve its proportions.

Primary visual colors:

- EL RACE navy: `#29357E`
- EL RACE red: `#CE363A`
- White: `#FFFFFF`
- Soft cool background: `#F5F7FB`
- Dark text: `#171A24`

## Design direction

The page must look professionally designed, current, and production quality rather than like a basic generated form.

Use:

- A refined full-page composition with strong spacing and hierarchy.
- A premium centered upload card or an elegant two-column desktop layout that becomes one column on mobile.
- A restrained branded background using very subtle architectural lines, grid geometry, or construction-inspired details.
- Clean typography with a modern corporate character.
- Soft shadows, precise borders, balanced white space, and consistent corner radii.
- A visually strong drag-and-drop upload area.
- Small relevant icons only where they improve clarity.
- Subtle hover, focus, upload, and success transitions.
- Excellent mobile layout and touch targets.

Do not use excessive gradients, glassmorphism, illustrations, stock images, animated backgrounds, decorative clutter, multiple cards, unnecessary sections, or generic template content.

The design should feel advanced and premium while the actual user flow remains immediate and obvious.

## Page copy

Keep all writing short and directly related to the CV update request.

### Eyebrow

`Employee Records Update`

### Main heading

`Update Your CV`

### Introductory text

`Please submit your latest CV so your employee record reflects your current position, responsibilities, qualifications, certifications, and recent professional achievements.`

### Deadline notice

`Submission deadline: Sunday, 26 July 2026`

Present the deadline as a compact, clearly visible notice without making the page look alarming.

### File naming note

`Please rename your CV using your employee file number before uploading.`

### Form labels

- `Full Name`
- `Employee File Number`
- `Upload CV`

Use short placeholders only:

- `Enter your full name`
- `Enter your file number`

### Upload area copy

Primary:

`Drag and drop your CV here`

Secondary:

`or choose a file from your device`

Helper text:

`PDF, DOC, or DOCX — maximum 50 MB`

Show the selected filename, file size, and a simple replace or remove action.

### Submit button

`Submit Updated CV`

### Uploading state

`Uploading your CV...`

Disable all duplicate submissions while uploading.

### Success state

Replace the form with a polished success panel only after Google Drive confirms the upload.

Heading:

`Your CV has been submitted successfully.`

Supporting text:

`Thank you for keeping your employee information up to date.`

Secondary action:

`Submit Another CV`

### Error messages

Use short safe messages:

- `Please enter your full name.`
- `Please enter your employee file number.`
- `Please select a PDF, DOC, or DOCX file.`
- `The file must not exceed 50 MB.`
- `The upload could not be completed. Please try again.`

Do not expose technical or Google Drive error details.

## Google Drive integration

Use a server-side API route. The browser must never receive Google credentials and must never upload directly to Google Drive.

Target folder ID:

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

When saving the file:

- Validate the full name and employee file number on the server.
- Accept only PDF, DOC, and DOCX.
- Enforce the 50 MB limit on both client and server.
- Configure the hosting/server request limit so files up to 50 MB are actually accepted.
- Sanitize the employee file number and full name.
- Preserve only a valid extension.
- Rename the stored file to `<employee-file-number> - <full-name>.<extension>`.
- Never return the Drive file ID, folder URL, or uploaded-file URL to the employee.
- Never create list, search, preview, download, edit, or delete endpoints.
- Never display existing files on the public page.

## Technical implementation

Use:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Server-side Google Drive API integration
- Minimal maintained dependencies
- Simple client-side and server-side validation

Do not add features outside this scope.

## Quality requirements

- English-only.
- Fully responsive from small phones to large desktop screens.
- Accessible labels, keyboard navigation, visible focus states, and status announcements.
- No horizontal overflow or layout shift.
- Fast initial load.
- Clear disabled and loading states.
- Success must appear only after a confirmed Google Drive upload.
- Test a real or mocked upload close to 50 MB so the full request path is verified.

## Required project files

Create the complete application, including:

- Frontend page
- Upload API route
- Google Drive integration
- `.env.example`
- `.gitignore`
- `README.md`
- Basic validation and upload tests

The README should explain only:

1. Installation and local run commands.
2. Enabling the Google Drive API.
3. Creating a Google service account.
4. Sharing the target folder with the service-account email as Editor.
5. Configuring environment variables.
6. Configuring the deployment platform for 50 MB uploads.
7. Deploying the project.
8. Testing one successful upload.

Do not use GitHub Pages because secure Google Drive credentials and file uploads require a server-side runtime.

Implement the project completely. Run lint, type checking, tests, and a production build. Fix every failure. Finish with a concise report listing files created, checks passed, and only the remaining Google Drive and hosting configuration steps.