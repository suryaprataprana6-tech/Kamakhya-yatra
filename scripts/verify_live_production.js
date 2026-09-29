const { chromium } = require('playwright');

(async () => {
  console.log('Testing live https://www.kamakhyayatra.com/book?slug=kamakhya-darshan ...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`[Browser ${msg.type()}] ${msg.text()}`);
    }
  });

  page.on('dialog', async dialog => {
    console.log(`[Dialog ${dialog.type()}] ${dialog.message()}`);
    await dialog.accept();
  });

  try {
    await page.goto('https://www.kamakhyayatra.com/book?slug=kamakhya-darshan', { waitUntil: 'networkidle', timeout: 30000 });

    console.log('1. Filling Step 1 Traveler Details...');
    await page.fill('input[placeholder="Enter traveler\'s name"]', 'Live Verified Traveler');
    await page.fill('input[placeholder="Enter mobile number"]', '9876543210');
    await page.fill('input[placeholder="Enter email for booking updates"]', 'traveler@kamakhyayatra.com');

    const dateInput = await page.$('input[type="date"]');
    if (dateInput) {
      await dateInput.fill('2026-12-10');
    }

    const tnc = await page.$('input[type="checkbox"]');
    if (tnc) {
      await tnc.check();
      console.log('  Checked Terms & Conditions checkbox.');
    }

    console.log('2. Submitting Step 1 form...');
    await page.click('button[type="submit"]');

    console.log('3. Waiting for Step 2 Payment Portal...');
    await page.waitForSelector('text=Secure Online Payment', { timeout: 15000 });

    const bodyText = await page.textContent('body');

    console.log('\n--- Production Manual Payment Checks ---');
    console.log('- "Manual UPI" text in page:', bodyText.includes('Manual UPI') ? 'FOUND ❌' : 'NONE ✅');
    console.log('- "UPI Payment Instructions":', bodyText.includes('UPI Payment Instructions') ? 'FOUND ❌' : 'NONE ✅');
    console.log('- Merchant UPI ID (7079044000-3@ybl):', bodyText.includes('7079044000-3@ybl') ? 'FOUND ❌' : 'NONE ✅');
    console.log('- Copy UPI button:', (await page.$('button:has-text("Copy UPI ID")')) ? 'FOUND ❌' : 'NONE ✅');
    console.log('- Screenshot file upload input:', (await page.$('input[type="file"]')) ? 'FOUND ❌' : 'NONE ✅');
    console.log('- Transaction ID / UTR input:', (await page.$('input[placeholder*="UTR"]')) ? 'FOUND ❌' : 'NONE ✅');
    console.log('- Manual payment submit button:', (await page.$('button:has-text("Submit Payment for Verification")')) ? 'FOUND ❌' : 'NONE ✅');

    console.log('\n--- Production Pay Online Razorpay Checks ---');
    console.log('- "Secure Online Payment" card:', (await page.$('text=Secure Online Payment')) ? 'YES ✅' : 'NO ❌');
    console.log('- "Powered by Razorpay" badge:', bodyText.includes('Powered by Razorpay') ? 'YES ✅' : 'NO ❌');

    const payOnlineBtn = await page.$('button:has-text("Securely Online")');
    console.log('- "Pay ₹... Securely Online" button:', payOnlineBtn ? 'VISIBLE ✅' : 'MISSING ❌');

    await page.screenshot({ path: 'scripts/prod_step2_verified.png', fullPage: true });
    console.log('- Production Step 2 screenshot saved to scripts/prod_step2_verified.png');

    console.log('\n4. Clicking "Pay Securely Online" button...');
    await payOnlineBtn.click();

    console.log('5. Waiting for Razorpay Checkout iframe to load on production...');
    await page.waitForSelector('iframe.razorpay-checkout-frame', { timeout: 15000 });
    console.log('  ✅ Razorpay Checkout modal iframe detected and opened successfully on production!');

    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'scripts/prod_razorpay_modal_verified.png', fullPage: true });
    console.log('- Production Razorpay modal screenshot saved to scripts/prod_razorpay_modal_verified.png');

    console.log('\n==================================================');
    console.log('FINAL PRODUCTION VERIFICATION RESULT:');
    console.log('Manual Payment removed:', !bodyText.includes('Manual UPI') ? 'YES' : 'NO');
    console.log('Razorpay Pay Online working: YES');
    console.log('==================================================');
  } catch (err) {
    console.error('Error during production verification:', err);
  } finally {
    await browser.close();
  }
})();
