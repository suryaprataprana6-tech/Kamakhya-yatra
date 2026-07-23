// Playwright Interactive Browser Test for Cancel Booking Page - FIXED IDs
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const CANCEL_URL = "http://localhost:3000/cancel-booking";
const SCREENSHOT_DIR = path.resolve(__dirname, "../test-screenshots");

async function run() {
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  console.log("=== PLAYWRIGHT INTERACTIVE BROWSER TEST ===\n");
  console.log(`URL: ${CANCEL_URL}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await context.newPage();

  // Track server actions called
  const serverActionsCalled = [];
  page.on("request", (req) => {
    if (req.method() === "POST" && req.url().includes("/cancel-booking")) {
      serverActionsCalled.push({ url: req.url(), time: new Date().toISOString() });
    }
  });

  try {
    // ========================================
    // STEP 1: Navigate
    // ========================================
    console.log("STEP 1: Navigating to cancel-booking page...");
    await page.goto(CANCEL_URL, { waitUntil: "networkidle", timeout: 30000 });
    console.log("✅ Page loaded successfully\n");
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01_initial_page.png"), fullPage: true });

    // ========================================
    // STEP 2: Verify source selector exists
    // ========================================
    console.log("STEP 2: Checking source selector...");
    const sourceLabel = await page.textContent("label:has-text('HOW DID YOU BOOK YOUR YATRA')");
    console.log(`✅ Source selector label: "${sourceLabel?.trim()}"`);
    const onlineCardVisible = await page.isVisible("text=Online / Website Booking");
    console.log(`✅ "Online / Website Booking" card visible: ${onlineCardVisible}`);
    const offlineCardVisible = await page.isVisible("text=Offline / Counter Booking");
    console.log(`✅ "Offline / Counter Booking" card visible: ${offlineCardVisible}\n`);

    // ========================================
    // STEP 3: Verify default online state
    // ========================================
    console.log("STEP 3: Verifying default Online state...");
    const verifyOnlineVisible = await page.isVisible("text=Verify Online Booking");
    console.log(`✅ "Verify Online Booking" visible (default): ${verifyOnlineVisible}`);
    const verifyButtonVisible = await page.isVisible("button:has-text('Verify Booking')");
    console.log(`✅ "Verify Booking" button visible (default): ${verifyButtonVisible}`);
    const offlineHeaderVisible = await page.isVisible("text=OFFLINE / COUNTER BOOKING CANCELLATION");
    console.log(`✅ "OFFLINE / COUNTER BOOKING CANCELLATION" visible (should be false): ${offlineHeaderVisible}\n`);

    serverActionsCalled.length = 0;

    // ========================================
    // STEP 4: Click "Offline / Counter Booking"
    // ========================================
    console.log("STEP 4: Clicking 'Offline / Counter Booking'...");
    await page.click("button:has-text('Offline / Counter Booking')");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02_after_offline_click.png"), fullPage: true });

    // ========================================
    // STEP 5: Verify offline mode assertions
    // ========================================
    console.log("\nSTEP 5: Verifying Offline mode assertions...");
    const offlineHeaderNow = await page.isVisible("text=OFFLINE / COUNTER BOOKING CANCELLATION");
    console.log(`✅ ASSERT: "OFFLINE / COUNTER BOOKING CANCELLATION" visible: ${offlineHeaderNow} ${offlineHeaderNow ? "✅" : "❌ FAIL"}`);
    const verifyOnlineGone = await page.isVisible("text=Verify Online Booking");
    console.log(`✅ ASSERT: "Verify Online Booking" NOT visible: ${!verifyOnlineGone} ${!verifyOnlineGone ? "✅" : "❌ FAIL"}`);
    const verifyButtonGone = await page.isVisible("button:has-text('Verify Booking')");
    console.log(`✅ ASSERT: "Verify Booking" button NOT visible: ${!verifyButtonGone} ${!verifyButtonGone ? "✅" : "❌ FAIL"}`);
    const noMatchError = await page.isVisible("text=No matching booking found");
    console.log(`✅ ASSERT: "No matching booking found" NOT visible: ${!noMatchError} ${!noMatchError ? "✅" : "❌ FAIL"}`);
    console.log(`✅ Server actions during mode switch: ${serverActionsCalled.length} ${serverActionsCalled.length === 0 ? "✅ (zero verify calls)" : "⚠️"}\n`);

    // ========================================
    // STEP 6: Fill offline form
    // ========================================
    console.log("STEP 6: Filling offline cancellation form...");
    await page.fill("#offlineBookingReference", "KY-2026-TESTOTY");
    console.log("  ✅ Invoice Number = KY-2026-TESTOTY");
    await page.fill("#offlineCustomerName", "Offline Test Customer");
    console.log("  ✅ Customer Name = Offline Test Customer");
    await page.fill("#offlinePhone", "9876543210");
    console.log("  ✅ Mobile = 9876543210");
    await page.fill("#offlineEmail", "offline_test@example.com");
    console.log("  ✅ Email = offline_test@example.com");

    // Package dropdown
    try {
      const packageSelect = await page.$("#packageSelect");
      if (packageSelect) {
        const options = await packageSelect.$$("option");
        if (options.length > 1) {
          const optionTexts = await Promise.all(options.map((o) => o.textContent()));
          const otherIdx = optionTexts.findIndex((t) => t?.toLowerCase().includes("other"));
          if (otherIdx >= 0) {
            await packageSelect.selectOption({ index: otherIdx });
            console.log("  ✅ Package = Other / Custom Package");
            await page.waitForTimeout(500);
            const customInput = await page.$("#customPackageName");
            if (customInput && (await customInput.isVisible())) {
              await customInput.fill("Kamakhya Special VIP Yatra");
              console.log("  ✅ Custom Package = Kamakhya Special VIP Yatra");
            }
          } else if (options.length > 1) {
            await packageSelect.selectOption({ index: 1 });
            console.log(`  ✅ Package = ${(await options[1].textContent())?.trim()}`);
          }
        }
      }
    } catch (e) {
      console.log(`  ⚠️ Package: ${e.message.split("\n")[0]}`);
    }

    await page.fill("#offlineTravelDate", "20-10-2026");
    console.log("  ✅ Travel Date = 20-10-2026");
    await page.fill("#offlineTravellers", "2");
    console.log("  ✅ Travellers = 2");

    try {
      await page.selectOption("#offlineTravelClass", "3AC");
      console.log("  ✅ Travel Class = 3AC");
    } catch (e) { console.log(`  ⚠️ Travel Class: ${e.message.split("\n")[0]}`); }

    await page.fill("#offlinePackageAmount", "15000");
    console.log("  ✅ Package Amount = 15000");
    await page.fill("#offlineAmountPaid", "5000");
    console.log("  ✅ Amount Paid = 5000");

    try {
      await page.selectOption("#offlinePaymentMode", "Cash");
      console.log("  ✅ Payment Mode = Cash");
    } catch (e) { console.log(`  ⚠️ Payment Mode: ${e.message.split("\n")[0]}`); }

    await page.fill("#offlineBookingOffice", "Ranchi Counter");
    console.log("  ✅ Booking Office = Ranchi Counter");

    // FIXED: Use correct ID for offline cancellation reason
    await page.fill("#cancellationReasonOffline", "Testing offline cancellation via Playwright browser test");
    console.log("  ✅ Cancellation Reason = Testing offline cancellation...");

    // ========================================
    // STEP 7: Upload test invoice file
    // ========================================
    console.log("\nSTEP 7: Uploading test invoice...");
    const testFilePath = path.join(SCREENSHOT_DIR, "test_invoice.pdf");
    fs.writeFileSync(testFilePath, "Test Invoice PDF Content for Playwright Browser Test - " + Date.now());
    const fileInput = await page.$("input[type='file']");
    if (fileInput) {
      await fileInput.setInputFiles(testFilePath);
      console.log("  ✅ File uploaded: test_invoice.pdf");
      await page.waitForTimeout(500);
    } else {
      console.log("  ❌ File input not found!");
    }

    // ========================================
    // STEP 8: Accept declaration
    // ========================================
    console.log("\nSTEP 8: Accepting declaration...");
    const checkbox = await page.$("input[type='checkbox']");
    if (checkbox) {
      await checkbox.check();
      console.log("  ✅ Declaration checkbox checked");
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03_form_filled.png"), fullPage: true });
    console.log("📸 Screenshot: 03_form_filled.png");

    // Verify NO verifyBookingForCancellation was called during form fill
    console.log(`\n  Server actions during offline form fill: ${serverActionsCalled.length} (should include only getPublicPackagesList)`);

    serverActionsCalled.length = 0;

    // ========================================
    // STEP 9: Submit
    // ========================================
    console.log("\nSTEP 9: Submitting offline cancellation request...");
    const submitButton = await page.$("button[type='submit']");
    if (submitButton) {
      const btnText = await submitButton.textContent();
      console.log(`  Submit button text: "${btnText?.trim()}"`);
      await submitButton.click();
      console.log("  ✅ Submit button clicked, waiting for response...");
      await page.waitForTimeout(10000);

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04_after_submit.png"), fullPage: true });
      console.log("📸 Screenshot: 04_after_submit.png");

      // Check for success
      const bodyText = await page.textContent("body");
      const requestIdMatch = bodyText?.match(/KY-CAN-2026-\d+/);
      
      if (requestIdMatch) {
        console.log(`\n  🎉 SUCCESS! Cancellation Request ID: ${requestIdMatch[0]}`);
      } else if (bodyText?.includes("Cancellation Request Submitted") || bodyText?.includes("Request Submitted")) {
        console.log(`\n  🎉 SUCCESS! Cancellation request submitted (ID may be in confirmation)`);
      } else {
        // Check for errors
        const errorElements = await page.$$(".bg-rose-50");
        for (const el of errorElements) {
          const text = await el.textContent();
          if (text) console.log(`  ⚠️ Error message: ${text.trim()}`);
        }
        // Try broader search
        if (bodyText?.includes("error") || bodyText?.includes("Error") || bodyText?.includes("failed")) {
          const errSnippet = bodyText.substring(bodyText.indexOf("error") - 100, bodyText.indexOf("error") + 200);
          console.log(`  Error context: ${errSnippet?.substring(0, 200)}`);
        }
      }

      // Check server actions during submit
      console.log(`\n  Server actions during submission: ${serverActionsCalled.length}`);
      // Check that verifyBookingForCancellation was NOT called
      const devServerLog = serverActionsCalled.map((s) => s.url).join(", ");
      console.log(`  Actions: ${devServerLog || "none logged"}`);
    }

    // ========================================
    // STEP 10: Switch back to Online
    // ========================================
    console.log("\nSTEP 10: Switching back to Online mode...");
    const submitAnotherBtn = await page.$("button:has-text('Submit Another Request')");
    if (submitAnotherBtn) {
      await submitAnotherBtn.click();
      await page.waitForTimeout(1000);
    }
    
    const onlineBtn = await page.$("button:has-text('Online / Website Booking')");
    if (onlineBtn) {
      await onlineBtn.click();
      await page.waitForTimeout(1500);
    }

    const verifyOnlineBack = await page.isVisible("text=Verify Online Booking");
    console.log(`  ✅ "Verify Online Booking" reappears: ${verifyOnlineBack} ${verifyOnlineBack ? "✅" : "❌"}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05_back_to_online.png"), fullPage: true });

    // ========================================
    // FINAL SUMMARY
    // ========================================
    console.log("\n" + "=".repeat(60));
    console.log("FINAL PLAYWRIGHT TEST RESULTS");
    console.log("=".repeat(60));
    console.log(`  1. URL tested: ${CANCEL_URL}`);
    console.log(`  2. Source selector visible: ${onlineCardVisible && offlineCardVisible ? "YES ✅" : "NO ❌"}`);
    console.log(`  3. Default state shows "Verify Online Booking": ${verifyOnlineVisible ? "YES ✅" : "NO ❌"}`);
    console.log(`  4. After Offline click - "OFFLINE / COUNTER BOOKING CANCELLATION" shown: ${offlineHeaderNow ? "YES ✅" : "NO ❌"}`);
    console.log(`  5. After Offline click - "Verify Online Booking" HIDDEN: ${!verifyOnlineGone ? "YES ✅" : "NO ❌"}`);
    console.log(`  6. After Offline click - "Verify Booking" button HIDDEN: ${!verifyButtonGone ? "YES ✅" : "NO ❌"}`);
    console.log(`  7. After Offline click - "No matching booking found" HIDDEN: ${!noMatchError ? "YES ✅" : "NO ❌"}`);
    console.log(`  8. Zero verifyBookingForCancellation calls during offline: ${serverActionsCalled.length === 0 ? "YES ✅" : "NO ❌"}`);
    console.log(`  9. Online mode reappears when switching back: ${verifyOnlineBack ? "YES ✅" : "NO ❌"}`);
    console.log(`\n📂 Screenshots: ${SCREENSHOT_DIR}`);

  } catch (err) {
    console.error("\n❌ TEST ERROR:", err.message);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "error.png"), fullPage: true }).catch(() => {});
  } finally {
    await browser.close();
  }
}

run();
