const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

async function verifyBookingPaymentUI() {
  console.log("=== PLAYWRIGHT BOOKING PAYMENT UI VERIFICATION ===");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  page.on("console", (msg) => console.log(`[Browser Console ${msg.type()}] ${msg.text()}`));
  page.on("pageerror", (err) => console.log("[Browser Page Error]", err.message));
  page.on("dialog", async (dialog) => {
    console.log(`[Browser Alert/Dialog] ${dialog.message()}`);
    await dialog.accept();
  });

  try {
    console.log("1. Navigating to http://localhost:3000/book?slug=kamakhya-darshan...");
    await page.goto("http://localhost:3000/book?slug=kamakhya-darshan", { waitUntil: "networkidle", timeout: 30000 });

    console.log("2. Filling Step 1 Traveler Details...");
    await page.fill('input[placeholder="Enter traveler\'s name"]', "Test User");
    await page.fill('input[placeholder="Enter mobile number"]', "9876543210");
    await page.fill('input[placeholder="Enter email for booking updates"]', "test@example.com");

    const dateInput = await page.$('input[type="date"]');
    if (dateInput) {
      await dateInput.fill("2026-12-10");
    }

    const guestsInput = await page.$('input[type="number"]');
    if (guestsInput) {
      await guestsInput.fill("2");
    }

    // Select travel category (e.g. 3AC or SL)
    const ac3Btn = await page.$('label:has-text("3AC")');
    if (ac3Btn) {
      await ac3Btn.click();
    } else {
      const slBtn = await page.$('label:has-text("Sleeper")');
      if (slBtn) await slBtn.click();
    }

    // Check Terms & Conditions checkbox
    const termsCheck = await page.$('input[type="checkbox"]');
    if (termsCheck) {
      await termsCheck.check();
      console.log("  Checked Terms & Conditions checkbox.");
    }

    console.log("3. Submitting Step 1 form...");
    await page.click('button[type="submit"]:has-text("Confirm & Proceed to Payment")');

    console.log("4. Waiting for Step 2 Payment Portal...");
    await page.waitForSelector('text=Secure Online Payment', { timeout: 20000 });
    await page.waitForTimeout(1000);

    const bodyText = await page.innerText("body");

    // Verification 1: Manual UPI checks
    const hasManualUPI = bodyText.includes("Manual UPI");
    const hasUPIInstructions = bodyText.includes("UPI Payment Instructions");
    const hasUPIId = bodyText.includes("7079044000-3@ybl");
    const hasCopyBtn = (await page.$('button:has-text("Copy UPI ID")')) !== null;
    const hasScreenshotInput = (await page.$('input[type="file"]')) !== null;
    const hasUTRInput = (await page.$('input[placeholder*="UTR"]')) !== null;
    const hasManualSubmitBtn = (await page.$('button:has-text("Submit Payment for Verification")')) !== null;

    console.log("\n--- Manual Payment Checks ---");
    console.log(`- 'Manual UPI' text in page: ${hasManualUPI ? "DETECTED ❌" : "NONE ✅"}`);
    console.log(`- 'UPI Payment Instructions': ${hasUPIInstructions ? "DETECTED ❌" : "NONE ✅"}`);
    console.log(`- Merchant UPI ID (7079044000-3@ybl): ${hasUPIId ? "DETECTED ❌" : "NONE ✅"}`);
    console.log(`- Copy UPI button: ${hasCopyBtn ? "DETECTED ❌" : "NONE ✅"}`);
    console.log(`- Screenshot file upload input: ${hasScreenshotInput ? "DETECTED ❌" : "NONE ✅"}`);
    console.log(`- Transaction ID / UTR input: ${hasUTRInput ? "DETECTED ❌" : "NONE ✅"}`);
    console.log(`- Manual payment submit button: ${hasManualSubmitBtn ? "DETECTED ❌" : "NONE ✅"}`);

    // Verification 2: Razorpay Pay Online checks
    const payOnlineBtn = await page.$('button:has-text("Pay ₹")');
    const isPayOnlineVisible = payOnlineBtn ? await payOnlineBtn.isVisible() : false;
    const hasSecureCard = bodyText.includes("Secure Online Payment");
    const hasRazorpayBadge = bodyText.includes("Powered by Razorpay");

    console.log("\n--- Pay Online Razorpay Checks ---");
    console.log(`- 'Secure Online Payment' card: ${hasSecureCard ? "YES ✅" : "NO ❌"}`);
    console.log(`- 'Powered by Razorpay' badge: ${hasRazorpayBadge ? "YES ✅" : "NO ❌"}`);
    console.log(`- 'Pay ₹... Securely Online' button: ${isPayOnlineVisible ? "VISIBLE ✅" : "NOT VISIBLE ❌"}`);

    const step2ScreenshotPath = path.join(__dirname, "step2_pay_online_only.png");
    await page.screenshot({ path: step2ScreenshotPath, fullPage: true });
    console.log(`- Step 2 screenshot saved to: ${step2ScreenshotPath}`);

    // Verification 3: Click Pay Online button and check Razorpay Checkout modal
    console.log("\n5. Clicking 'Pay ₹... Securely Online' button...");
    await payOnlineBtn.click();

    console.log("6. Waiting for Razorpay Checkout iframe to load...");
    let razorpayOpened = false;
    try {
      await page.waitForSelector("iframe.razorpay-checkout-frame, iframe[src*='razorpay']", { timeout: 15000 });
      razorpayOpened = true;
      console.log("  ✅ Razorpay Checkout modal iframe detected and opened successfully!");
    } catch (e) {
      console.log("  ⚠️ Checking if Razorpay modal exists in DOM...");
      const iframes = await page.$$("iframe");
      for (const f of iframes) {
        const src = await f.getAttribute("src");
        if (src && src.includes("razorpay")) razorpayOpened = true;
      }
    }

    await page.waitForTimeout(3000);
    const modalScreenshotPath = path.join(__dirname, "step2_razorpay_modal_opened.png");
    await page.screenshot({ path: modalScreenshotPath });
    console.log(`- Modal screenshot saved to: ${modalScreenshotPath}`);

    const manualRemoved = !hasManualUPI && !hasUPIInstructions && !hasUPIId && !hasCopyBtn && !hasScreenshotInput && !hasUTRInput && !hasManualSubmitBtn;
    const razorpayWorking = isPayOnlineVisible && razorpayOpened;

    console.log("\n==================================================");
    console.log(`FINAL RESULT:`);
    console.log(`Manual Payment removed: ${manualRemoved ? "YES" : "NO"}`);
    console.log(`Razorpay Pay Online working: ${razorpayWorking ? "YES" : "NO"}`);
    console.log("==================================================");
  } catch (err) {
    console.error("Verification error:", err);
  } finally {
    await browser.close();
  }
}

verifyBookingPaymentUI();
