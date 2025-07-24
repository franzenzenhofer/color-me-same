import { chromium } from 'playwright';

async function testMobileGrids() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }
  });
  const page = await context.newPage();
  
  console.log('Testing mobile responsiveness...');
  
  // Test different grid sizes
  const tests = [
    { difficulty: 'Easy', expectedSize: 3 },
    { difficulty: 'Medium', level: 15, expectedSize: 8 },
    { difficulty: 'Hard', level: 25, expectedSize: 10 }
  ];
  
  for (const test of tests) {
    console.log(`\nTesting ${test.difficulty} (${test.expectedSize}x${test.expectedSize} grid)...`);
    
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(1000);
    
    // Select difficulty
    await page.getByRole('button', { name: test.difficulty }).click();
    
    // If we need a specific level, navigate to it
    if (test.level) {
      for (let i = 1; i < test.level; i++) {
        const rightArrow = await page.$('button:has(svg[class*="lucide-chevron-right"])');
        if (rightArrow) await rightArrow.click();
        await page.waitForTimeout(100);
      }
    }
    
    // Start game
    await page.getByRole('button', { name: /start game/i }).click();
    await page.waitForTimeout(2000);
    
    // Check for horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      return body.scrollWidth > window.innerWidth || 
             html.scrollWidth > window.innerWidth ||
             body.offsetWidth > window.innerWidth ||
             html.offsetWidth > window.innerWidth;
    });
    
    console.log(`Has horizontal overflow: ${hasOverflow}`);
    
    // Check game board position
    const boardBounds = await page.locator('.grid').first().boundingBox();
    if (boardBounds) {
      console.log(`Board width: ${boardBounds.width}, Board right edge: ${boardBounds.x + boardBounds.width}`);
      console.log(`Viewport width: 375, Fits in viewport: ${boardBounds.x + boardBounds.width <= 375}`);
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: `mobile-${test.difficulty.toLowerCase()}-${test.expectedSize}x${test.expectedSize}.png`,
      fullPage: false 
    });
    
    console.log(`Screenshot saved: mobile-${test.difficulty.toLowerCase()}-${test.expectedSize}x${test.expectedSize}.png`);
  }
  
  await browser.close();
  console.log('\nTest complete!');
}

testMobileGrids().catch(console.error);