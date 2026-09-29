const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

async function testE2EBooking() {
  console.log("=== PLAYWRIGHT E2E BOOKING INVOICE TEST ===\n");

  const consoleErrors = [];
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  page.on("pageerror", (err) => {
    consoleErrors.push(err.message);
  });

  try {
    console.log("1. Navigating to http://localhost:3000/book?slug=kamakhya-darshan...");
    await page.goto("http://localhost:3000/book?slug=kamakhya-darshan", { waitUntil: "networkidle", timeout: 30000 });

    console.log("2. Filling booking form details (3AC, Guests: 2)...");
    await page.fill('input[placeholder="Enter traveler\'s name"]', "Test User");
    await page.fill('input[placeholder="Enter mobile number"]', "9876543210");
    await page.fill('input[placeholder="Enter email for booking updates"]', "test@example.com");
    await page.fill('input[type="date"]', "2026-12-10");
    await page.fill('input[type="number"]', "2");
    
    // Select 3AC radio button instead of select menu? Let me check the HTML.
    // In BookClient.tsx line 93 subagent did: Selected the 3AC travel category option.
    // I'll try to find radio buttons or just click text 3AC.
    const ac3Btn = await page.$('label:has-text("3AC")');
    if (ac3Btn) await ac3Btn.click();
    else await page.click('text="3AC"');

    console.log("3. Proceeding to Payment step...");
    await page.click('button:has-text("Confirm & Proceed to Payment")');
    await page.waitForTimeout(3000);

    console.log("4. Uploading dummy screenshot and entering UTR...");
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
        await page.setInputFiles('input[type="file"]', path.join(__dirname, "../public/logo.png"));
    }
    
    const utrInput = await page.$('input[placeholder="Enter 12-digit UTR/Txn Number"]');
    if (utrInput) {
        await page.fill('input[placeholder="Enter 12-digit UTR/Txn Number"]', "TEST-UTR-123");
    }

    console.log("5. Submitting booking...");
    await page.click('button:has-text("Submit Payment for Verification")');
    await page.waitForTimeout(4000);

    // Wait for success screen
    console.log("6. Extracting details from Success Screen...");
    const invoiceEl = await page.waitForSelector("#kamakhya-booking-invoice", { timeout: 15000 }).catch(() => null);
    if (!invoiceEl) {
       console.error("❌ #kamakhya-booking-invoice not found in DOM!");
       return;
    }
    
    // Evaluate inside DOM
    const invoiceData = await page.evaluate(() => {
       const el = document.getElementById("kamakhya-booking-invoice");
       const html = el.innerHTML;
       return {
           hasLogo: html.includes("logo.png") || html.includes("kamakhya"),
           hasWatermark: html.includes("watermark"),
           htmlLength: html.length,
           innerText: el.innerText
       };
    });

    console.log(`  Logo/Watermark Present: ${invoiceData.hasLogo ? 'YES' : 'NO'} / ${invoiceData.hasWatermark ? 'YES' : 'NO'}`);
    
    // Find booking ID and Invoice Number
    const innerText = invoiceData.innerText;
    const bkgMatch = innerText.match(/Booking Ref:\s*(KY-BKG-\d+-\d+)/);
    const invMatch = innerText.match(/Invoice No:\s*(KY-INV-\d+-\d+)/);
    
    console.log(`  Booking ID: ${bkgMatch ? bkgMatch[1] : "NOT FOUND"}`);
    console.log(`  Invoice No: ${invMatch ? invMatch[1] : "NOT FOUND"}`);

    console.log("7. Testing Download PDF...");
    const downloadPromise = page.waitForEvent("download", { timeout: 15000 }).catch(() => null);
    const downloadBtn = await page.$('button:has-text("Download Invoice")');
    if (downloadBtn) {
       await downloadBtn.click();
       const download = await downloadPromise;
       if (download) {
           const downloadPath = path.join(__dirname, "test_downloaded_invoice.pdf");
           await download.saveAs(downloadPath);
           const stats = fs.statSync(downloadPath);
           console.log(`  ✅ PDF Downloaded: ${stats.size} bytes`);
       } else {
           console.log("  ❌ Download event not fired");
       }
    } else {
       console.log("  ❌ Download button not found");
    }

    const labErrors = consoleErrors.filter((e) => e.includes("lab") || e.includes("oklch") || e.includes("oklab"));
    console.log(`  'lab' / 'oklch' errors in console: ${labErrors.length}`);

    console.log("8. Checking Database Record via API (simulated/extracted from UI for now)...");
    const rateMatch = innerText.match(/₹([\d,]+)/g);
    console.log(`  Amounts found in invoice: ${rateMatch ? rateMatch.join(", ") : "None"}`);

    console.log("\n====================================================");
    console.log("TEST COMPLETED");
    console.log("====================================================");

  } catch (err) {
    console.error("❌ Browser test error:", err.message);
  } finally {
    await browser.close();
  }
}

testE2EBooking();
