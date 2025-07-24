import { chromium } from 'playwright';

async function testLiveSite() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }
  });
  const page = await context.newPage();
  
  console.log('🌐 Testing LIVE site level progression...\n');
  
  // Go to LIVE site
  await page.goto('https://color-me-same.franzai.com');
  await page.waitForTimeout(2000);
  
  // Start easy mode
  console.log('📱 Starting Easy mode (Level 1)...');
  await page.click('button:has-text("easy")');
  await page.waitForTimeout(300);
  await page.click('button:has-text("Start Game")');
  await page.waitForTimeout(2000);
  
  // Take screenshot
  await page.screenshot({ path: 'live-level-1.png' });
  
  // Manual instructions
  console.log('\n📋 MANUAL TEST INSTRUCTIONS:');
  console.log('1. ✅ Check that "L1" appears in the dashboard');
  console.log('2. ✅ Check that hints are showing (yellow highlighted tiles)');
  console.log('3. 🎮 Follow the hints to solve the puzzle');
  console.log('4. 🏆 When you win, check for "Continue" button');
  console.log('5. ➡️ Click Continue to go to Level 2');
  console.log('6. ✅ Verify "L2" appears and hints are NOT automatic');
  console.log('\n⏸️ Browser will stay open for manual testing...');
  console.log('Press Ctrl+C when done.\n');
  
  // Keep browser open
  await new Promise(() => {});
}

testLiveSite().catch(console.error);