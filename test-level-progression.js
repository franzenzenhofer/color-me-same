import { chromium } from 'playwright';

async function testLevelProgression() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }
  });
  const page = await context.newPage();
  
  console.log('🎮 Testing level progression system...\n');
  
  // Go to site
  await page.goto('http://localhost:4173');
  await page.waitForTimeout(2000);
  
  // Start easy mode
  console.log('📱 Starting Easy mode (Level 1)...');
  await page.click('button:has-text("easy")');
  await page.waitForTimeout(300);
  await page.click('button:has-text("Start Game")');
  await page.waitForTimeout(2000);
  
  // Take screenshot of Level 1
  await page.screenshot({ path: 'level-1-hints.png' });
  console.log('✅ Level 1 screenshot saved');
  
  // Check if hints are visible
  const hintText = await page.$('text=💡 Hint:');
  if (hintText) {
    console.log('✅ Hints are automatically shown on Level 1!');
  } else {
    console.log('❌ Hints NOT showing on Level 1');
  }
  
  // Check level display
  const levelDisplay = await page.$('text=L1');
  if (levelDisplay) {
    console.log('✅ Level 1 displayed in dashboard');
  } else {
    console.log('❌ Level not displayed');
  }
  
  // Solve the puzzle quickly (click all hints)
  console.log('\n🎯 Solving Level 1...');
  for (let i = 0; i < 10; i++) {
    const highlightedTile = await page.$('.ring-2.ring-yellow-400');
    if (highlightedTile) {
      await highlightedTile.click();
      await page.waitForTimeout(500);
    } else {
      break;
    }
  }
  
  // Wait for victory modal
  await page.waitForTimeout(2000);
  
  // Check for Continue button
  const continueButton = await page.$('button:has-text("Continue")');
  if (continueButton) {
    console.log('✅ Continue button found in victory modal');
    await page.screenshot({ path: 'victory-modal-continue.png' });
    
    // Click Continue
    await continueButton.click();
    await page.waitForTimeout(2000);
    
    // Check Level 2
    const level2Display = await page.$('text=L2');
    if (level2Display) {
      console.log('✅ Advanced to Level 2!');
      
      // Check if hints are NOT shown on Level 2
      const hintText2 = await page.$('text=💡 Hint:');
      if (!hintText2) {
        console.log('✅ Hints NOT automatically shown on Level 2');
      } else {
        console.log('❌ Hints still showing on Level 2');
      }
      
      await page.screenshot({ path: 'level-2-no-hints.png' });
    } else {
      console.log('❌ Level 2 not displayed');
    }
  } else {
    console.log('❌ Continue button NOT found');
  }
  
  console.log('\n📊 Test Summary:');
  console.log('- Level 1 should show hints automatically');
  console.log('- Continue button should appear after winning');
  console.log('- Level 2+ should NOT show hints automatically');
  console.log('- Difficulty should increase with each level');
  
  await browser.close();
}

testLevelProgression().catch(console.error);