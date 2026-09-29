const { chromium } = require('playwright');

(async () => {
  console.log('Testing live https://www.kamakhyayatra.com/book?slug=kamakhya-darshan...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.kamakhyayatra.com/book?slug=kamakhya-darshan', { waitUntil: 'networkidle' });

  // Fill Step 1
  await page.fill('input[placeholder*="Rahul Sharma"]', 'Live Verifier');
  await page.fill('input[placeholder*="rahul@example.com"]', 'verifier@example.com');
  await page.fill('input[placeholder*="mobile number"]', '9876543210');
  await page.click('button:has-text("3AC Standard")');
  const d = new Date(); d.setDate(d.getDate() + 30);
  await page.fill('input[type="date"]', d.toISOString().split('T')[0]);
  const tnc = page.locator('input[type="checkbox"]').first();
  if (await tnc.count() > 0) await tnc.check();

  console.log('Submitting Step 1 on production...');
  await page.click('button:has-text("Proceed to Step 2")');
  await page.waitForTimeout(4000);

  const bodyText = await page.textContent('body');
  const manualUpi = bodyText.includes('Manual UPI');
  const merchantUpi = bodyText.includes('7079044000-3@ybl');
  const secureOnline = bodyText.includes('Secure Online Payment');
  const payOnlineBtnCount = await page.locator('button:has-text("Securely Online")').count();
  const manualSubmitBtnCount = await page.locator('button:has-text("Submit Payment for Verification")').count();

  console.log('--- PRODUCTION LIVE STATUS ---');
  console.log('Manual UPI text present:', manualUpi);
  console.log('Merchant UPI ID present:', merchantUpi);
  console.log('Secure Online Payment present:', secureOnline);
  console.log('Pay Online button count:', payOnlineBtnCount);
  console.log('Manual Submit button count:', manualSubmitBtnCount);

  await page.screenshot({ path: 'scripts/live_prod_step2.png', fullPage: true });
  await browser.close();
})();
