# SheetSync Inventory

This is a Next.js application for inventory management that uses a Google Sheet as its database.

To get started, take a look at src/app/page.tsx.

## Connecting to Google Sheets

This application is designed to use a Google Sheet as its database for inventory management. To connect your app, you'll need to:

1.  **Create a Google Sheet:**
    *   Create a new Google Sheet in your Google Drive.
    *   Get the **Spreadsheet ID** from the URL. The URL looks like `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit#gid=0`.
    *   Create four tabs (sheets) at the bottom named exactly `Stock Master`, `Ledger`, `Sales`, and `Purchases`.

2.  **Set up the `Stock Master` sheet:**
    *   The first row must be a header row with the following column names (in this exact order):
    *   `id`, `book_name`, `language`, `purchase_qty`, `purchase_amt`, `sales_qty`, `sales_amt`, `closing_qty`, `closing_price`, `profit`
    *   You can leave this sheet empty. The "Add Book" feature will populate it.

3.  **Set up the `Ledger` sheet:**
    *   The first row must be a header row with the following column names (in this exact order):
    *   `id`, `date`, `book_id`, `book_name`, `transaction_type`, `qty`, `amount`, `bill_no`, `balance`, `remarks`
    *   This sheet will be populated automatically.

4.  **Set up the `Sales` sheet:**
    *   The first row must be a header row with the following column names (in this exact order):
    *   `id`, `date`, `book_id`, `book_name`, `qty`, `amount`, `bill_no`, `remarks`
    *   This sheet will be populated automatically when you record sales.

5.  **Set up the `Purchases` sheet:**
    *   The first row must be a header row with the following column names (in this exact order):
    *   `id`, `date`, `book_id`, `book_name`, `qty`, `amount`, `bill_no`, `remarks`
    *   This sheet will be populated automatically when you record purchases.

6.  **Set up Google Cloud Service Account:**
    *   Go to the [Google Cloud Console](https://console.cloud.google.com/).
    *   Make sure you have a project selected.
    *   Enable the **Google Sheets API** for your project.
    *   Go to "Credentials", click "Create Credentials", and choose "Service account".
    *   Give it a name (e.g., "sheets-editor"), grant it the "Editor" role, and finish.
    *   Find your newly created service account, go to the "Keys" tab, click "Add Key" -> "Create new key", and choose **JSON**. A `.json` file will be downloaded.

7.  **Share the Google Sheet:**
    *   Open the `.json` file you downloaded. Find the `client_email` value (e.g., `sheets-editor@<your-project-id>.iam.gserviceaccount.com`).
    *   Go back to your Google Sheet, click "Share", and paste this email address, giving it "Editor" permissions.

8.  **Update `.env` file:**
    *   Open the `.env` file in the project.
    *   Copy the values from your downloaded `.json` file and the sheet ID into the `.env` file:
        ```
        GOOGLE_SHEETS_CLIENT_EMAIL="<the client_email from the json file>"
        GOOGLE_SHEETS_PRIVATE_KEY="<the private_key from the json file>"
        GOOGLE_SHEETS_SHEET_ID="<your spreadsheet id>"
        ```
    *   **Important:** For the `GOOGLE_SHEETS_PRIVATE_KEY`, you must copy the entire key, including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` parts. The value in the `.json` file will contain `\n` for newlines; you should keep those as they are.

Once these steps are complete, restart the application, and it will be connected to your Google Sheet.
