import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const executablePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const screenshotDir = path.resolve('screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function run() {
  console.log('Launching browser with executable:', executablePath);
  const browser = await chromium.launch({
    executablePath,
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Browser console error:', msg.text());
    }
  });

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Capture Command Center
  console.log('1. Capturing Command Center...');
  await page.screenshot({ path: path.join(screenshotDir, '01_command_center.png') });

  // 2. Open Business Health Score Inspector Modal
  console.log('2. Inspecting Business Health Modal...');
  await page.locator('button:has-text("Health:")').first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotDir, '02_health_breakdown_modal.png') });
  await page.locator('button:has-text("Close Inspector")').click();
  await page.waitForTimeout(400);

  // 3. Open Daily Brief
  console.log('3. Inspecting Daily Brief...');
  await page.locator('header button:has-text("Daily Brief")').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotDir, '03_daily_brief_modal.png') });
  await page.locator('button:has-text("Acknowledge & Close")').click();
  await page.waitForTimeout(400);

  // 4. Test Ask RacerOps Drawer
  console.log('4. Testing Ask RacerOps Drawer...');
  await page.locator('button:has-text("Ask AI")').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotDir, '04_ask_racerops_drawer.png') });
  await page.locator('button[aria-label="Close drawer"]').click();
  await page.waitForTimeout(400);

  // 5. Navigate to Businesses View (Over50FitLife)
  console.log('5. Testing Businesses View...');
  await page.locator('aside button:has-text("Businesses")').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotDir, '05_businesses_over50fitlife.png') });

  // Switch to NutriPlanPro
  await page.locator('button:has-text("NutriPlanPro")').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotDir, '06_businesses_nutriplanpro.png') });

  // Switch to Kim's Closet Boutique
  await page.locator('button:has-text("Kim\'s Closet Boutique")').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotDir, '07_businesses_kims_closet.png') });

  // Switch to Team Rhino
  await page.locator('button:has-text("Team Rhino")').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotDir, '08_businesses_team_rhino.png') });

  // 6. Navigate to Finance
  console.log('6. Testing Finance View...');
  await page.locator('aside button:has-text("Finance")').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotDir, '09_finance_view.png') });

  // 7. Navigate to Marketing
  console.log('7. Testing Marketing View...');
  await page.locator('aside button:has-text("Marketing")').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotDir, '10_marketing_view.png') });

  // 8. Navigate to Leads
  console.log('8. Testing Leads View...');
  await page.locator('aside button:has-text("Leads / CRM")').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotDir, '11_leads_crm_view.png') });

  // 9. Navigate to Content
  console.log('9. Testing Content View...');
  await page.locator('aside button:has-text("Content")').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotDir, '12_content_view.png') });

  // 10. Navigate to AI Agents
  console.log('10. Testing AI Agents View...');
  await page.locator('aside button:has-text("AI Agents")').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotDir, '13_ai_agents_view.png') });

  // 11. Navigate to Automations
  console.log('11. Testing Automations View...');
  await page.locator('aside button:has-text("Automations")').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotDir, '14_automations_view.png') });

  // 12. Navigate to Projects
  console.log('12. Testing Projects View...');
  await page.locator('aside button:has-text("Projects")').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotDir, '15_projects_view.png') });

  // 13. Navigate to Tasks
  console.log('13. Testing Tasks View...');
  await page.locator('aside button:has-text("Tasks")').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotDir, '16_tasks_view.png') });

  // 14. Navigate to Reports
  console.log('14. Testing Reports View...');
  await page.locator('aside button:has-text("Reports")').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotDir, '17_reports_view.png') });

  // 15. Navigate to Integrations
  console.log('15. Testing Integrations View...');
  await page.locator('aside button:has-text("Integrations")').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotDir, '18_integrations_view.png') });

  // 16. Navigate to Settings
  console.log('16. Testing Settings View...');
  await page.locator('aside button:has-text("Settings")').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotDir, '19_settings_view.png') });

  console.log('All 19 E2E screenshots captured successfully!');
  await browser.close();
}

run().catch(err => {
  console.error('E2E run failed:', err);
  process.exit(1);
});
