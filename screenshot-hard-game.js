import { chromium } from 'playwright';

async function screenshotHardGame() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }
  });
  const page = await context.newPage();
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1000);
  
  // Start a hard game
  await page.getByRole('button', { name: 'Hard' }).click();
  await page.getByRole('button', { name: /start game/i }).click();
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'hard-mode-current.png', fullPage: false });
  
  await browser.close();
}

screenshotHardGame().catch(console.error);