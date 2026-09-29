const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

async function testE2EInvoice() {
  console.log("=== E2E BOOKING INVOICE TEST (v3 - longer waits) ===\n");

  const consoleErrors = [];
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push("[UNCAUGHT] " + err.message));

  try {
    console.log("STEP 1: Navigate to /book");
    await page.goto("http://localhost:3000/book", { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(3000);

    console.log("STEP 2: Fill form");
    await page.fill('input[placeholder="Enter traveler\'s name"]', "Invoice Test User");
    await page.fill('input[placeholder="Enter mobile number"]', "8765432109");
    await page.fill('input[placeholder="Enter email for booking updates"]', "invoicetest@example.com");
    await page.fill('input[type="date"]', "2026-12-20");
    await page.fill('input[type="number"]', "2");
    console.log("  ✅ Fields filled");

    await page.waitForTimeout(3000); // Wait for fare rules

    // Click 3AC card
    await page.evaluate(() => {
      const cards = document.querySelectorAll('div.cursor-pointer');
      for (const card of cards) {
        const h4 = card.querySelector('h4');
        if (h4 && h4.textContent.trim() === '3AC') { card.click(); return; }
      }
    });
    console.log("  ✅ 3AC selected");
    await page.waitForTimeout(1000);

    await page.check('#terms');
    console.log("  ✅ Terms accepted");

    // Read fare summary before submit
    const preSummary = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        cost: (text.match(/Base Package Cost.*?₹([\d,]+)/) || [])[1],
        advance: (text.match(/Advance Token Deposit.*?₹([\d,]+)/) || [])[1],
        balance: (text.match(/Balance Due.*?₹([\d,]+)/) || [])[1]
      };
    });
    console.log(`  Pre-submit: Cost=₹${preSummary.cost}, Advance=₹${preSummary.advance}, Balance=₹${preSummary.balance}`);

    console.log("\nSTEP 3: Submit booking (will wait up to 20s)");
    await page.click('button:has-text("Confirm & Proceed to Payment")');
    
    // Wait for step transition — poll for Step 2 content
    let transitioned = false;
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(1000);
      const text = await page.textContent('body');
      if (text.includes("UPI Payment") || text.includes("Submit Payment")) {
        transitioned = true;
        console.log(`  ✅ Reached Payment step after ${i+1}s`);
        break;
      }
      if (text.includes("Booking Request Submitted") || text.includes("Booking Confirmed")) {
        transitioned = true;
        console.log(`  ✅ Reached Success step after ${i+1}s (skipped payment?)`);
        break;
      }
    }
    if (!transitioned) {
      console.log("  ⚠️ Timed out waiting for step transition");
      await page.screenshot({ path: path.join(__dirname, "v3_timeout.png"), fullPage: true });
    }

    await page.screenshot({ path: path.join(__dirname, "v3_after_step1.png"), fullPage: true });

    // Step 2: Payment
    const bodyText = await page.textContent('body');
    if (bodyText.includes("Submit Payment")) {
      console.log("\nSTEP 4: Fill payment");
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) await fileInput.setInputFiles(path.join(__dirname, "../public/logo.png"));
      
      const utrInput = await page.$('input[placeholder="Enter 12-digit UTR/Txn Number"]');
      if (utrInput) await utrInput.fill("TESTINV2026002");
      
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(__dirname, "v3_payment_filled.png"), fullPage: true });
      
      await page.click('button:has-text("Submit Payment for Verification")');
      console.log("  ✅ Payment submitted");
      
      // Wait for success
      for (let i = 0; i < 15; i++) {
        await page.waitForTimeout(1000);
        const t = await page.textContent('body');
        if (t.includes("Download Invoice") || t.includes("Booking Request Submitted")) {
          console.log(`  ✅ Success screen after ${i+1}s`);
          break;
        }
      }
    }

    await page.screenshot({ path: path.join(__dirname, "v3_success.png"), fullPage: true });

    // Extract final results
    const finalText = await page.textContent('body');
    const bkgRef = (finalText.match(/KY-BKG-\d+-\d+/) || [])[0] || "NOT FOUND";
    const costMatch = (finalText.match(/Total Package Cost[:\s]*₹([\d,]+)/) || [])[1] || "NOT FOUND";
    const advMatch = (finalText.match(/Advance Booking Amount Paid[:\s]*₹([\d,]+)/) || [])[1] || "NOT FOUND";
    const balMatch = (finalText.match(/Balance Due[:\s]*₹([\d,]+)/) || [])[1] || "NOT FOUND";

    console.log("\n======== BOOKING RESULTS ========");
    console.log(`  Booking Ref: ${bkgRef}`);
    console.log(`  Total Cost:  ₹${costMatch}`);
    console.log(`  Advance Paid: ₹${advMatch}`);
    console.log(`  Balance Due: ₹${balMatch}`);

    // Invoice DOM check
    const inv = await page.evaluate(() => {
      const el = document.getElementById("kamakhya-booking-invoice");
      if (!el) return { found: false };
      const html = el.innerHTML;
      const text = el.innerText;
      // Extract invoice number from text
      const invNoMatch = text.match(/INVOICE NO:\s*(KY-INV-\S+)/i);
      const bkgRefMatch = text.match(/BOOKING REF:\s*(KY-BKG-\S+)/i);
      return {
        found: true,
        invoiceNo: invNoMatch ? invNoMatch[1] : null,
        bookingRef: bkgRefMatch ? bkgRefMatch[1] : null,
        hasLogo: html.includes("logo.png"),
        hasWatermark: html.includes("Watermark"),
        hasStamp: text.includes("Authorized Signatory"),
        hasAdvPaid: text.includes("ADVANCE AMOUNT PAID"),
        hasRateChart: text.includes("Package Rate Chart"),
        hasServices: text.includes("Services Included"),
        hasBilling: text.includes("Billing Breakdown"),
        snippet: text.substring(0, 800)
      };
    });

    console.log("\n======== INVOICE DOM ========");
    if (inv.found) {
      console.log(`  ✅ Element found`);
      console.log(`  Invoice No: ${inv.invoiceNo || "NOT EXTRACTED"}`);
      console.log(`  Booking Ref: ${inv.bookingRef || "NOT EXTRACTED"}`);
      console.log(`  Logo:           ${inv.hasLogo ? "✅" : "❌"}`);
      console.log(`  Watermark:      ${inv.hasWatermark ? "✅" : "❌"}`);
      console.log(`  Auth Stamp:     ${inv.hasStamp ? "✅" : "❌"}`);
      console.log(`  Amount Paid:    ${inv.hasAdvPaid ? "✅" : "❌"}`);
      console.log(`  Rate Chart:     ${inv.hasRateChart ? "✅" : "❌"}`);
      console.log(`  Services:       ${inv.hasServices ? "✅" : "❌"}`);
      console.log(`  Billing:        ${inv.hasBilling ? "✅" : "❌"}`);
      console.log(`\n  Text:\n${inv.snippet}`);
    } else {
      console.log("  ❌ NOT found");
    }

    // PDF Download
    console.log("\n======== PDF DOWNLOAD ========");
    const dlBtn = await page.$('button:has-text("Download Invoice")');
    if (dlBtn) {
      const dlPromise = page.waitForEvent("download", { timeout: 30000 }).catch(() => null);
      await dlBtn.click();
      console.log("  Clicked Download...");
      const dl = await dlPromise;
      if (dl) {
        const dlPath = path.join(__dirname, "test_invoice_v3.pdf");
        await dl.saveAs(dlPath);
        const stats = fs.statSync(dlPath);
        console.log(`  ✅ PDF: ${stats.size} bytes → ${dlPath}`);
      } else {
        console.log("  ❌ No download event fired");
      }
    } else {
      console.log("  ❌ Button not found");
    }

    // Wait a moment for any console errors from PDF generation
    await page.waitForTimeout(3000);

    // Console errors
    console.log("\n======== CONSOLE ERRORS ========");
    const labErrs = consoleErrors.filter(e => e.includes("lab") || e.includes("oklch") || e.includes("oklab"));
    console.log(`  Total: ${consoleErrors.length}`);
    console.log(`  lab/oklch: ${labErrs.length} ${labErrs.length === 0 ? "✅ ZERO" : "❌"}`);
    consoleErrors.forEach(e => console.log(`  - ${e.substring(0, 300)}`));

    console.log("\n======== DONE ========");
  } catch (err) {
    console.error("FATAL:", err.message);
    await page.screenshot({ path: path.join(__dirname, "v3_error.png"), fullPage: true }).catch(() => {});
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
}

testE2EInvoice();
