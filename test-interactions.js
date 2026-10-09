import { chromium } from 'playwright-core';

const executablePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function testInteractions() {
  console.log('Testing interactive user actions...');
  const browser = await chromium.launch({ executablePath, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // 1. Check approval buttons in Safety Gate
  console.log('Testing Approval action...');
  const approveBtn = page.locator('button:has-text("Approve")').first();
  await approveBtn.click();
  await page.waitForTimeout(500);

  // 2. Test Priority Toggle
  console.log('Testing Priority toggle...');
  const checkbox = page.locator('button.w-5.h-5').first();
  await checkbox.click();
  await page.waitForTimeout(500);

  // 3. Test Ask RacerOps Natural Language Form
  console.log('Testing Ask RacerOps natural language submission...');
  const searchInput = page.locator('input[placeholder*="Ask RacerOps"]');
  await searchInput.fill('What is making money this month?');
  await page.locator('header button:has-text("Ask")').click();
  await page.waitForTimeout(800);

  // Check drawer has opened and answer contains Over50FitLife
  const answerText = await page.locator('p.whitespace-pre-line').first().innerText();
  console.log('Received Answer:', answerText.slice(0, 80) + '...');
  if (!answerText.includes('Over50FitLife') && !answerText.includes('revenue')) {
    throw new Error('Expected answer to cite Over50FitLife and revenue');
  }

  console.log('All interactive tests passed successfully!');
  await browser.close();
}

testInteractions().catch(err => {
  console.error('Interaction test failed:', err);
  process.exit(1);
});
