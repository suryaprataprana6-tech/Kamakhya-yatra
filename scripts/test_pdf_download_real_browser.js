const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

async function testBrowserPDFDownload() {
  console.log("=== PLAYWRIGHT REAL BROWSER PDF DOWNLOAD TEST ===\n");

  const consoleErrors = [];
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  // Listen for browser console errors
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log(`[Browser Console Error] ${msg.text()}`);
      consoleErrors.push(msg.text());
    }
  });

  page.on("pageerror", (err) => {
    console.log(`[Browser Uncaught Exception] ${err.message}`);
    consoleErrors.push(err.message);
  });

  try {
    console.log("1. Navigating to http://localhost:3000/book?slug=bhutan-tour...");
    await page.goto("http://localhost:3000/book?slug=bhutan-tour", { waitUntil: "networkidle", timeout: 30000 });

    console.log("2. Filling booking form details...");
    await page.fill('input[placeholder="Enter your full name"]', "PDF Real Browser Test User");
    await page.fill('input[placeholder="10-digit mobile number"]', "9876543210");
    await page.fill('input[placeholder="your.email@example.com"]', "pdf_browser_test@example.com");

    console.log("3. Submitting booking form...");
    await page.click('button:has-text("Proceed to Payment"), button:has-text("Book Now"), button[type="submit"]');

    // Wait for step 2 payment screen or success screen
    await page.waitForTimeout(3000);

    // If step 2 payment screen, click submit payment/confirm
    const confirmBtn = await page.$('button:has-text("Confirm Booking"), button:has-text("Submit Payment"), button:has-text("Complete Booking")');
    if (confirmBtn) {
      await confirmBtn.click();
      await page.waitForTimeout(2000);
    }

    console.log("4. Checking #kamakhya-booking-invoice presence...");
    const invoiceEl = await page.$("#kamakhya-booking-invoice");
    console.log(`  #kamakhya-booking-invoice exists: ${invoiceEl ? "YES ✅" : "NO ❌"}`);

    console.log("5. Testing Download Invoice (PDF) click & capture download event...");
    const downloadPromise = page.waitForEvent("download", { timeout: 15000 });
    const downloadBtn = await page.$('button:has-text("Download Invoice (PDF)")');

    if (!downloadBtn) {
      console.error("❌ Download Invoice (PDF) button not found on page!");
    } else {
      await downloadBtn.click();
      const download = await downloadPromise;
      const downloadPath = path.join(__dirname, "test_downloaded_invoice.pdf");
      await download.saveAs(downloadPath);

      console.log(`  ✅ PDF Downloaded successfully to: ${downloadPath}`);
      const stats = fs.statSync(downloadPath);
      console.log(`  ✅ File Size: ${stats.size} bytes`);
    }

    console.log("\n6. Checking for unsupported 'lab' / 'oklch' color console errors:");
    const labErrors = consoleErrors.filter((e) => e.includes("lab") || e.includes("oklch") || e.includes("oklab"));
    console.log(`  'lab' / 'oklch' console errors found: ${labErrors.length}`);

    if (labErrors.length === 0) {
      console.log("  ✅ ZERO 'lab' color errors detected in browser console!");
    } else {
      console.error("  ❌ DETECTED COLOR ERRORS:", labErrors);
    }

    const testPassed = labErrors.length === 0 && fs.existsSync(path.join(__dirname, "test_downloaded_invoice.pdf"));
    console.log("\n====================================================");
    console.log(`REAL BROWSER TEST RESULT: ${testPassed ? "ALL BROWSER PDF DOWNLOAD TESTS PASSED 🎉" : "TEST FAILED ❌"}`);
    console.log("====================================================");
  } catch (err) {
    console.error("❌ Browser test error:", err.message);
  } finally {
    await browser.close();
  }
}

testBrowserPDFDownload();
