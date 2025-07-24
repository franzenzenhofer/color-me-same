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
  
  // Check level display - look for "L1" in the dashboard
  const levelText = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('.grid.grid-cols-5 span'));
    return elements.find(el => el.textContent === 'L1');
  });
  
  if (levelText) {
    console.log('✅ Level 1 displayed in dashboard');
  } else {
    console.log('❌ Level not displayed - checking dashboard content...');
    const dashboardContent = await page.$eval('.grid.grid-cols-5', el => el.textContent);
    console.log('Dashboard content:', dashboardContent);
  }
  
  // Solve the puzzle by clicking hints in sequence
  console.log('\n🎯 Solving Level 1 by following hints...');
  let solved = false;
  
  for (let i = 0; i < 20; i++) {
    // Check if victory modal is visible
    const victoryModal = await page.$('h2:has-text("Puzzle Solved!")');
    if (victoryModal) {
      console.log('✅ Puzzle solved!');
      solved = true;
      break;
    }
    
    // Look for highlighted tile - use ring-4 not ring-2
    const highlightedTile = await page.$('.ring-4.ring-yellow-400');
    if (highlightedTile) {
      console.log(`  Click ${i + 1}: Following hint...`);
      await highlightedTile.click();
      await page.waitForTimeout(800);
    } else {
      console.log('  No highlighted tile found, trying to find any tile...');
      // Just click a random tile if no hints
      const anyTile = await page.$('button.w-full.h-full');
      if (anyTile) {
        await anyTile.click();
        await page.waitForTimeout(800);
      }
    }
  }
  
  if (!solved) {
    console.log('❌ Could not solve puzzle automatically');
    await page.screenshot({ path: 'level-1-stuck.png' });
  }
  
  // Wait a bit more for victory modal
  await page.waitForTimeout(2000);
  
  // Check for Continue button
  const continueButton = await page.$('button:has-text("Continue")');
  if (continueButton) {
    console.log('✅ Continue button found in victory modal!');
    await page.screenshot({ path: 'victory-modal-continue.png' });
    
    // Click Continue
    console.log('\n📈 Clicking Continue to advance to Level 2...');
    await continueButton.click();
    await page.waitForTimeout(2000);
    
    // Check Level 2
    const level2Text = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('.grid.grid-cols-5 span'));
      return elements.find(el => el.textContent === 'L2');
    });
    
    if (level2Text) {
      console.log('✅ Advanced to Level 2!');
      
      // Check if hints are NOT shown on Level 2
      const hintText2 = await page.$('text=💡 Hint:');
      if (!hintText2) {
        console.log('✅ Hints NOT automatically shown on Level 2 (as expected)');
      } else {
        console.log('❌ Hints still showing on Level 2 (should be hidden)');
      }
      
      await page.screenshot({ path: 'level-2-no-hints.png' });
      
      // Check the hint button is still available
      const hintButton = await page.$('button:has-text("Hint")');
      if (hintButton) {
        console.log('✅ Hint button available for manual activation');
      }
    } else {
      console.log('❌ Level 2 not displayed');
      const dashboardContent = await page.$eval('.grid.grid-cols-5', el => el.textContent);
      console.log('Dashboard content:', dashboardContent);
    }
  } else {
    console.log('❌ Continue button NOT found - checking what buttons are visible...');
    const buttons = await page.$$eval('button', buttons => 
      buttons.map(b => b.textContent?.trim()).filter(Boolean)
    );
    console.log('Visible buttons:', buttons);
    await page.screenshot({ path: 'no-continue-button.png' });
  }
  
  console.log('\n📊 Test Summary:');
  console.log('- Level 1 should show hints automatically ✓');
  console.log('- Continue button should appear after winning');
  console.log('- Level 2+ should NOT show hints automatically');
  console.log('- Difficulty should increase with each level');
  console.log('\n📸 Screenshots saved for inspection');
  
  await browser.close();
}

testLevelProgression().catch(console.error);