import { chromium } from 'playwright-core';
import path from 'path';

const executablePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const screenshotDir = 'C:\\Users\\brace\\.gemini\antigravity\\brain\\cef13811-c6e2-41f2-84fb-369d909546cf\\screenshots';

async function testLiveIngestion() {
  console.log('--- Starting RacerOps Blank Slate & Live Ingestion Test ---');
  const browser = await chromium.launch({ executablePath, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. Load app
  console.log('Step 1: Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // 2. Open Ingest Data modal and apply blank slate
  console.log('Step 2: Clicking Ingest Data button in header...');
  await page.locator('header button:has-text("Ingest Data")').click();
  await page.waitForTimeout(400);

  console.log('Step 3: Switching to Blank Slate tab...');
  await page.locator('button:has-text("Blank Slate (Erase Sample Data)")').click();
  await page.waitForTimeout(300);

  console.log('Step 4: Confirming Blank Slate erasure...');
  await page.locator('button:has-text("Erase Sample Data (Blank Slate)")').click();
  await page.waitForTimeout(800);

  // Take Blank Slate Screenshot
  const blankSlatePath = path.join(screenshotDir, '20_blank_slate_command_center.png');
  await page.screenshot({ path: blankSlatePath });
  console.log(`Saved screenshot: ${blankSlatePath}`);

  // 3. Verify $0 revenue card exists on Command Center
  const isZeroVisible = await page.locator('text=$0').first().isVisible();
  console.log('Verified Command Center $0 card visible:', isZeroVisible);

  // 4. Test Add Lead modal
  console.log('Step 5: Opening Add Lead Modal from Leads view...');
  await page.locator('button:has-text("Leads / CRM")').click();
  await page.waitForTimeout(400);

  await page.locator('button:has-text("Add Lead")').first().click();
  await page.waitForTimeout(400);

  console.log('Step 6: Filling in real lead data...');
  await page.locator('input[placeholder*="Clark"]').fill('Dr. Marcus Vance');
  await page.locator('input[placeholder*="jennifer@example.com"]').fill('marcus@vancewellness.com');
  await page.locator('input[placeholder*="000-0000"]').fill('(555) 839-2041');
  await page.locator('input[type="number"]').fill('2500');
  
  await page.locator('button:has-text("Save Lead")').click();
  await page.waitForTimeout(600);

  // Take Leads CRM Screenshot
  const leadsScreenshotPath = path.join(screenshotDir, '21_blank_slate_with_new_lead.png');
  await page.screenshot({ path: leadsScreenshotPath });
  console.log(`Saved screenshot: ${leadsScreenshotPath}`);

  // 5. Test Add Inventory Modal
  console.log('Step 7: Navigating to Businesses -> Kim\'s Closet...');
  await page.locator('button:has-text("Businesses")').first().click();
  await page.waitForTimeout(400);
  await page.locator('button:has-text("Kim\'s Closet")').first().click();
  await page.waitForTimeout(400);

  console.log('Step 8: Opening Add Inventory Modal...');
  await page.locator('button:has-text("Add Item")').first().click();
  await page.waitForTimeout(400);

  await page.locator('input[placeholder*="Chanel"]').fill('Lululemon');
  await page.locator('input[placeholder*="Flap Bag"]').fill('Define Jacket Luon Black Size 6');
  await page.locator('input[type="number"]').first().fill('28');
  await page.locator('input[type="number"]').nth(1).fill('88');

  await page.locator('button:has-text("Add Listing")').click();
  await page.waitForTimeout(600);

  // Take Kim's Closet Screenshot
  const inventoryScreenshotPath = path.join(screenshotDir, '22_blank_slate_with_inventory.png');
  await page.screenshot({ path: inventoryScreenshotPath });
  console.log(`Saved screenshot: ${inventoryScreenshotPath}`);

  // 6. Test Record Revenue Modal
  console.log('Step 9: Navigating to Finance and recording revenue...');
  await page.locator('button:has-text("Finance")').first().click();
  await page.waitForTimeout(400);

  await page.locator('button:has-text("Record Revenue")').first().click();
  await page.waitForTimeout(400);

  await page.locator('input[placeholder*="2400"]').fill('2500');
  await page.locator('input[placeholder*="Masterclass"]').fill('VIP Longevity Coaching Client');

  await page.locator('button:has-text("Post Revenue")').click();
  await page.waitForTimeout(600);

  // Take Finance Screenshot
  const financeScreenshotPath = path.join(screenshotDir, '23_blank_slate_with_revenue.png');
  await page.screenshot({ path: financeScreenshotPath });
  console.log(`Saved screenshot: ${financeScreenshotPath}`);

  // 7. Verify Webhook API Endpoints
  console.log('Step 10: Testing Webhook API Endpoints...');
  const healthRes = await fetch('http://localhost:5173/api/health');
  const healthJson = await healthRes.json();
  console.log('Health Check API Response:', healthJson);
  if (healthJson.status !== 'healthy') {
    throw new Error('Expected health status to be healthy');
  }

  const webhookRes = await fetch('http://localhost:5173/api/webhook/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Sarah Connor',
      email: 'sarah@resistance.org',
      businessId: 'over50fitlife',
      source: 'n8n_webhook',
      value: 1200
    })
  });
  const webhookJson = await webhookRes.json();
  console.log('Lead Webhook API Response:', webhookJson);
  if (!webhookJson.success) {
    throw new Error('Expected webhook to succeed');
  }

  console.log('--- ALL INTEGRATION & BLANK SLATE TESTS PASSED! ---');
  await browser.close();
}

testLiveIngestion().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
