import { chromium } from 'playwright';

async function testVictoryCelebration() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }
  });
  const page = await context.newPage();
  
  console.log('🎉 Testing victory celebration...\n');
  
  // Go to preview
  await page.goto('http://localhost:4173');
  await page.waitForTimeout(2000);
  
  // Start easy mode
  console.log('📱 Starting Easy mode...');
  await page.click('button:has-text("easy")');
  await page.waitForTimeout(300);
  await page.click('button:has-text("Start Game")');
  await page.waitForTimeout(2000);
  
  // Manually solve to see celebration
  console.log('\n🎮 MANUAL TEST:');
  console.log('1. Solve the puzzle by following the hints');
  console.log('2. When you win, you should see:');
  console.log('   - All tiles pulse/scale animation');
  console.log('   - 🎉 emoji celebration in center');
  console.log('   - 2 second delay before victory modal');
  console.log('3. Victory modal should appear AFTER the celebration');
  
  console.log('\n⏱️ Keeping browser open for manual testing...');
  console.log('Press Ctrl+C when done.\n');
  
  // Keep browser open
  await new Promise(() => {});
}

testVictoryCelebration().catch(console.error);