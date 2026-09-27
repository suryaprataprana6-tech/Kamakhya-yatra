# KAMAKHYA YATRA — Small Inquiry Popup + Google Sheets Lead Capture Implementation Report

## Summary Checklist

- **Popup created:** YES
- **Popup size:** Desktop: 360px max width (`max-w-[360px]`), Mobile: `calc(100% - 24px)` responsive with safe margins
- **Auto-fill implemented:** YES (Prefills Name, Mobile, Email from legitimate previous bookings, enquiry form submissions, or sessionStorage/localStorage; remains blank if no prior legitimate data exists)
- **Existing lead system reused:** YES (Unified with Supabase `inquiries` table via server action `submitInquiry` / `submitPopupInquiry`)
- **Google Sheets integration:** READY (Configured to securely post lead payloads to Google Apps Script Webhook via `GOOGLE_SHEETS_WEBHOOK_URL` / `NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL` with formula injection sanitization)
- **Google Apps Script:** CREATED (Production-ready script in `google-apps-script.js` with formula injection prevention, duplicate filtering, anti-spam, and IST timestamping)
- **Production Sheet connected:** NO (As instructed, the production Google Sheet is NOT connected during local development; fully documented in `GOOGLE_SHEETS_SETUP.md` for `kamakhyayatra19@gmail.com`)
- **Duplicate protection:** YES (30-minute deduplication window for identical phone/email returning friendly message: *"We already received your enquiry. Our team will contact you shortly."*)
- **Spam protection:** YES (Hidden honeypot field + server-side validation + formula sanitization)
- **Mobile:** PASS (Tested on mobile viewports; responsive `calc(100% - 24px)` width, no horizontal overflow, easy tap targets)
- **Desktop:** PASS (Compact modal dialog, 360px wide, elegant navy/gold/white styling, accessible Escape key and backdrop dismissal)
- **Build:** PASS (`npm run build` completed with code 0 across all 34 static and dynamic routes)
- **UI other than popup changed:** NO (Header, hero, navigation, tour cards, footer, banners, colors, fonts, and existing tour layouts remain 100% untouched)
- **Database changed:** NO (Reused existing Supabase `inquiries` table schema without altering schema or breaking existing lead flows)
- **Production deployed:** NO (Stopped immediately after localhost implementation, local testing, and build verification; awaiting user approval)

---

## 1. Architecture Overview

### Frontend Inquiry Popup (`src/components/InquiryPopup.tsx`)
- **Design:** Compact, elegant modal card using Kamakhya Yatra's approved brand palette: Navy (`#0b1c3e`), Gold (`#d4af37`), White (`#ffffff`).
- **Dimensions:** Desktop width ~360px; Mobile width `calc(100% - 24px)`.
- **Trigger Strategy:** Non-aggressive trigger that activates after **18 seconds** of browsing OR after **meaningful scroll (>35%)** after at least 6 seconds on page.
- **Session Protection:** Dismissing via "×", Escape key, or backdrop click sets `sessionStorage.getItem("ky_inquiry_popup_dismissed") = "true"`, preventing the popup from reappearing during the session. Successful submission suppresses it across sessions.
- **Route Safety:** Automatically suppressed on `/admin`, `/dashboard`, `/book`, and `/cancel-booking`.
- **Accessibility:** Fully accessible `role="dialog"`, `aria-labelledby`, `aria-describedby`, auto-focus management, and Escape key listener.

### Legitimate Auto-Fill System (`src/utils/userProfile.ts`)
- Legitimate sources tracked:
  - Form submissions from `submitLeadAndRedirect` (enquiry forms, tour pages, contact page)
  - Booking interactions from `BookClient.tsx`
  - Active DOM input field values on the current page if already entered by the user
- Never invents mock data or scrapes unauthorized browser storage.
- Leaves fields blank if no legitimate prior user interaction exists.

### Backend Lead Storage & Deduplication (`src/app/admin/actions.ts`)
- Integrates directly with Supabase `inquiries` table via server action `submitPopupInquiry`.
- **Deduplication:** Queries Supabase for matching phone within the last 30 minutes. If duplicate, updates record and returns:
  `"We already received your enquiry. Our team will contact you shortly."`
- **Spreadsheet Formula Injection Prevention:** Prepends apostrophe `'` to any value starting with `=`, `+`, `-`, or `@`.
- **Anti-spam Honeypot:** Discards bot submissions silently without polluting the database.

### Google Sheets Lead Capture Webhook (`google-apps-script.js` & `GOOGLE_SHEETS_SETUP.md`)
- Prepared for account: `kamakhyayatra19@gmail.com`.
- Sheet columns:
  - **A**: `Date & Time` (IST formatted timestamp)
  - **B**: `Name`
  - **C**: `Mobile`
  - **D**: `Email`
  - **E**: `Page URL`
  - **F**: `Page Title`
  - **G**: `Tour/Package`
  - **H**: `Source` (`Website Popup`)
  - **I**: `Status` (`New`)
- Zero client-side credential exposure. Server executes independently on Google Apps Script infrastructure.

---

## 2. Test & Verification Results

1. **Automated Backend & Integration Test (`scripts/test_inquiry_popup.ts`):**
   - Empty name check: **PASS**
   - Short mobile number check: **PASS**
   - Invalid Indian phone prefix check: **PASS**
   - Malformed email check: **PASS**
   - Honeypot anti-spam check: **PASS** (Zero DB entries created)
   - Lead creation & Supabase storage: **PASS**
   - 30-minute duplicate check: **PASS** (Friendly notice returned)
   - Unconfigured webhook graceful fallback: **PASS**

2. **Next.js Production Build (`npm run build`):**
   - Compiled successfully in 21.5s
   - TypeScript checks completed in 11.5s without errors
   - All 34 static and dynamic routes generated cleanly

3. **Localhost Browser Testing (`http://localhost:3000`):**
   - Triggering: Appears smoothly without disrupting page navigation.
   - Validation: Highlights missing or malformed inputs with clear, red inline validation messages.
   - Submission: Submits lead, displays success feedback banner, and closes cleanly.
   - Visual integrity: Existing homepage, hero, tour pages, and contact page verified 100% intact.

---

## 3. Next Steps (Upon Approval)

When ready to connect the live Google Sheet:
1. Follow [`GOOGLE_SHEETS_SETUP.md`](./GOOGLE_SHEETS_SETUP.md) to deploy the Apps Script Web App on `kamakhyayatra19@gmail.com`.
2. Add the Web App deployment URL to your production environment configuration as `GOOGLE_SHEETS_WEBHOOK_URL`.
3. Proceed with production deployment when approved.
