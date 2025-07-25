const { test, expect } = require('@playwright/test');

test('capture og:image screenshot', async ({ page }) => {
  // Set viewport to standard og:image size
  await page.setViewportSize({ width: 1200, height: 630 });
  
  // Go to the game
  await page.goto('https://color-me-same.franzai.com');
  
  // Wait for game to load
  await page.waitForSelector('h1:has-text("Color Me Same")', { timeout: 10000 });
  
  // Start a new game
  const newGameButton = page.locator('button:has-text("NEW GAME")');
  if (await newGameButton.isVisible()) {
    await newGameButton.click();
    await page.waitForTimeout(1000);
  }
  
  // Wait for game board
  await page.waitForSelector('[class*="grid"]', { timeout: 5000 });
  
  // Make a few strategic moves to show colorful board
  const gameBoard = page.locator('[class*="grid"]').first();
  if (await gameBoard.isVisible()) {
    // Click center tile
    await page.click('[class*="grid"] > div:nth-child(5)');
    await page.waitForTimeout(500);
    
    // Click corner
    await page.click('[class*="grid"] > div:nth-child(1)');
    await page.waitForTimeout(500);
    
    // Click another spot
    await page.click('[class*="grid"] > div:nth-child(9)');
    await page.waitForTimeout(500);
  }
  
  // Take screenshot
  await page.screenshot({ 
    path: 'public/game-screenshot.png',
    clip: {
      x: 0,
      y: 0,
      width: 1200,
      height: 630
    }
  });
  
  console.log('✅ OG image captured and saved to public/game-screenshot.png');
});