/**
 * KAMAKHYA YATRA — GOOGLE APPS SCRIPT LEAD CAPTURE WEBHOOK
 * 
 * Account Owner: kamakhyayatra19@gmail.com
 * Sheet Name: Kamakhya Yatra – Website Leads
 * 
 * Existing Columns in Row 1:
 * A: Date & Time
 * B: Name
 * C: Mobile
 * D: Email
 * E: Page URL
 * F: Page Title
 * G: Tour/Package
 * H: Source
 * I: Status
 */

// Configuration
var DUPLICATE_WINDOW_MINUTES = 30;

/**
 * Health check handler (GET)
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    service: "Kamakhya Yatra Google Sheets Lead Capture Webhook",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Main Webhook receiver for Lead Capture (POST)
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  // Wait up to 10 seconds for concurrent requests to avoid race conditions
  try {
    lock.waitLock(10000);
  } catch (lockErr) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Server busy, please retry shortly"
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Missing request body"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var payload = {};
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      payload = e.parameter || {};
    }

    // 1. Anti-spam Honeypot Protection
    if (payload.honeypot || payload.b_address || payload.ky_hp_token) {
      // Return success silently so bot exits without writing to sheet
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Thank you! Your enquiry has been received."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Extract and Sanitize Fields (Spreadsheet Formula Injection Protection)
    var name = sanitizeField(payload.name || "");
    var mobile = sanitizeMobile(payload.mobile || payload.phone || "");
    var email = sanitizeField(payload.email || "");
    var pageUrl = sanitizeField(payload.pageUrl || payload.page_url || "");
    var pageTitle = sanitizeField(payload.pageTitle || payload.page_title || "");
    var tourPackage = sanitizeField(payload.tourPackage || payload.package || "General Inquiry");
    var source = sanitizeField(payload.source || "Website Popup");
    var status = "New";

    // 3. Validation
    if (!name || !mobile || !email) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Name, Mobile and Email are required"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 4. Access Google Sheet (uses active sheet or sheet containing lead headers)
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getTargetSheet(ss);

    // 5. Initialize Sheet Headers only if completely empty
    if (sheet.getLastRow() === 0) {
      var headers = [
        "Date & Time",
        "Name",
        "Mobile",
        "Email",
        "Page URL",
        "Page Title",
        "Tour/Package",
        "Source",
        "Status"
      ];
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0b1c3e");
      headerRange.setFontColor("#d4af37");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    // 6. Server-side Timestamp in Indian Standard Time (IST)
    var timestampStr = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm");
    var nowMs = new Date().getTime();

    // 7. Duplicate Check: Same mobile or email within 30 minutes
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var checkRowCount = Math.min(60, lastRow - 1);
      var startRow = lastRow - checkRowCount + 1;
      var recentData = sheet.getRange(startRow, 1, checkRowCount, 9).getValues();

      var leadMobileClean = mobile.replace(/\D/g, "");
      var leadEmailClean = email.trim().toLowerCase();

      for (var i = recentData.length - 1; i >= 0; i--) {
        var row = recentData[i];
        var rowTime = row[0];
        var rowMobile = String(row[2]).replace(/\D/g, "");
        var rowEmail = String(row[3]).trim().toLowerCase();

        var isSameContact = (rowMobile && rowMobile === leadMobileClean) || (rowEmail && rowEmail === leadEmailClean);

        if (isSameContact) {
          var rowDate = new Date(rowTime);
          if (!isNaN(rowDate.getTime())) {
            var diffMinutes = (nowMs - rowDate.getTime()) / (1000 * 60);
            if (diffMinutes <= DUPLICATE_WINDOW_MINUTES) {
              return ContentService.createTextOutput(JSON.stringify({
                status: "success",
                isDuplicate: true,
                message: "We already received your enquiry. Our team will contact you shortly."
              })).setMimeType(ContentService.MimeType.JSON);
            }
          }
        }
      }
    }

    // 8. Append New Lead Row
    // Prefix mobile with apostrophe so leading zeros and formatting are preserved as text
    var formattedMobile = "'" + mobile;
    sheet.appendRow([
      timestampStr,
      name,
      formattedMobile,
      email,
      pageUrl,
      pageTitle,
      tourPackage,
      source,
      status
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Thank you! Your enquiry has been received. Our team will contact you shortly."
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "An internal processing error occurred."
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Finds the sheet tab with existing headers or uses active sheet
 */
function getTargetSheet(ss) {
  var sheets = ss.getSheets();
  // Check if any sheet already has the "Mobile" or "Name" header in row 1
  for (var i = 0; i < sheets.length; i++) {
    var s = sheets[i];
    if (s.getLastRow() >= 1) {
      var headerValues = s.getRange(1, 1, 1, Math.min(s.getLastColumn(), 10)).getValues()[0];
      var joined = headerValues.join(" ").toLowerCase();
      if (joined.indexOf("name") !== -1 && joined.indexOf("mobile") !== -1) {
        return s;
      }
    }
  }
  // Otherwise default to active sheet
  return ss.getActiveSheet();
}

/**
 * Sanitizes input to prevent spreadsheet formula injection (=, +, -, @)
 */
function sanitizeField(value) {
  if (value === null || value === undefined) return "";
  var str = String(value).trim();
  str = str.replace(/[\r\n\t]/g, " ");
  // If string starts with =, +, -, @, prepend with apostrophe to force text treatment
  if (/^[=+\-@]/.test(str)) {
    return "'" + str;
  }
  return str;
}

/**
 * Sanitizes mobile numbers and formats safely
 */
function sanitizeMobile(phone) {
  if (!phone) return "";
  var cleaned = String(phone).trim();
  cleaned = cleaned.replace(/[^\d+]/g, "");
  if (/^[=+\-@]/.test(cleaned) && !cleaned.startsWith("+91")) {
    return "'" + cleaned;
  }
  return cleaned;
}
