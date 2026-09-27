# Google Sheets Lead Capture Setup for Existing Sheet

Target Sheet: **Kamakhya Yatra – Website Leads**  
Owner Account: **kamakhyayatra19@gmail.com**

The existing sheet already contains:
`Date & Time` | `Name` | `Mobile` | `Email` | `Page URL` | `Page Title` | `Tour/Package` | `Source` | `Status`

---

## Step 1: Open the Existing Sheet

1. Log into Google with **kamakhyayatra19@gmail.com**.
2. Open your existing Google Sheet: **Kamakhya Yatra – Website Leads**.

---

## Step 2: Open Apps Script

1. In the top Google Sheets menu, click **Extensions** → **Apps Script**.
2. A new tab will open with the script editor.
3. Name the script project: `Kamakhya Yatra Leads Webhook`.

---

## Step 3: Paste the Apps Script Code

1. Clear any default placeholder text in `Code.gs`.
2. Copy the entire contents of [`google-apps-script.js`](./google-apps-script.js) from this repository.
3. Paste it directly into `Code.gs`.
4. Click the **Save** icon (Ctrl + S / Cmd + S).

---

## Step 4: Deploy as Web App

1. In the upper-right corner of Apps Script, click the blue **Deploy** button → **New deployment**.
2. Next to "Select type", click the gear icon ⚙️ and choose **Web app**.
3. Set the deployment fields:
   - **Description**: `Kamakhya Yatra Leads Webhook v1`
   - **Execute as**: `Me (kamakhyayatra19@gmail.com)`
   - **Who has access**: `Anyone`
     *(This allows the website server to post leads without exposing private Google account credentials).*
4. Click **Deploy**.
5. Click **Authorize access**, choose `kamakhyayatra19@gmail.com`.
6. Click **Advanced** → **Go to Kamakhya Yatra Leads Webhook (unsafe)** → **Allow**.

---

## Step 5: Copy Your Web App URL

1. After deployment completes, copy the **Web app URL**.
   Format:
   `https://script.google.com/macros/s/AKfycb.../exec`
2. **Provide this URL** so it can be added to your website environment variable `GOOGLE_SHEETS_WEBHOOK_URL`.

---

## Security & Architecture Guarantee

- **No Passwords or Secrets:** You never share your Gmail password, Google private keys, or OAuth secrets.
- **Private Sheet:** Your Google Sheet remains completely private and owned by `kamakhyayatra19@gmail.com`.
- **Preserved Existing Data:** Existing rows and existing headers are never overwritten or deleted.
- **Formula Injection Safe:** Any field beginning with `=`, `+`, `-`, or `@` is automatically sanitized to protect spreadsheet security.
- **Unified Lead System:** Leads continue to be recorded in Supabase first, then automatically synchronized to your Google Sheet.
