# Ortho Gold Inquiry Form — setup

The website form is intentionally not enabled on the live site until the Google Apps Script endpoint is configured and tested.

## What it does

- Adds a fixed **Inquiry Now** button near the existing floating WhatsApp button.
- Opens a modal form with optional name and a required Indian 10-digit mobile number.
- Validates the mobile number in the browser and again in Apps Script.
- Stores submissions in a private Google Sheet owned by the account that deploys the script.
- Records submission timestamp, name, mobile number and source page URL.
- Uses a honeypot field and protects spreadsheet cells from formula injection.

## Create the Sheet and endpoint in the intended Google account

Use a browser profile signed in as **aaroogyamayurveda@gmail.com**.

1. Open https://script.google.com/ and create a **New project**.
2. Open `google-apps-script/Code.gs` from this repository branch and copy its complete contents into the Apps Script editor, replacing the starter code. Save the project.
3. Select the function **`setupInquirySheet`** in the function dropdown and click **Run**. Review and grant the requested Google Sheets permission.
4. In the execution log, open the URL logged as **Inquiry spreadsheet**. Confirm the sheet is named **Ortho Gold Website Inquiries** and has the columns `Submitted At`, `Name`, `Mobile`, `Source URL`. The sheet is created in the Google account currently running the script; keep it private.
5. In Apps Script, click **Deploy → New deployment**. Choose type **Web app**.
6. Set **Execute as** to **Me** and **Who has access** to **Anyone**. This is required for public website visitors to submit without signing in. If the account's Google Workspace policy does not permit public web apps, stop and tell us; do not make the Sheet public.
7. Click **Deploy**, authorize if asked, and copy the Web app URL ending in `/exec`.

## Connect and verify

Send the Web app `/exec` URL back in this conversation. It is a public submission endpoint, not a Google password or private API key. We will put it into `inquiry-config.js`, test the form and deploy the website change.

Do not merge/deploy the website form before this endpoint is configured. Until then, the form shows a setup message and directs visitors to the existing WhatsApp contact option.

## Where to view/download leads

Open https://sheets.google.com/ while signed in as **aaroogyamayurveda@gmail.com**, then open **Ortho Gold Website Inquiries**. In Google Sheets choose **File → Download** and select Microsoft Excel (.xlsx) or Comma-separated values (.csv).

The spreadsheet stays private by default. Do not enable public sharing, because it contains customer phone numbers.
