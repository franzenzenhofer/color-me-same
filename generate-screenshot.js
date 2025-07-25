const { chromium } = require('playwright');
const path = require('path');

async function generateGameScreenshot() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1200, height: 630 }, // Standard og:image dimensions
    deviceScaleFactor: 2, // High quality
  });
  
  const page = await context.newPage();
  
  // Start local server first with: npm run dev
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  
  // Wait for game to load
  await page.waitForSelector('.game-board', { timeout: 10000 });
  
  // Start a new game
  const newGameButton = await page.$('button:has-text("NEW GAME")');
  if (newGameButton) {
    await newGameButton.click();
    await page.waitForTimeout(1000); // Wait for animation
  }
  
  // Make a few moves to show the game in action
  const tiles = await page.$$('.tile');
  if (tiles.length > 0) {
    // Click a few tiles to show some color changes
    await tiles[4].click(); // Center-ish tile
    await page.waitForTimeout(500);
    await tiles[0].click(); // Corner tile
    await page.waitForTimeout(500);
  }
  
  // Take screenshot
  await page.screenshot({ 
    path: path.join(__dirname, 'public', 'game-screenshot.png'),
    fullPage: false
  });
  
  console.log('✅ Screenshot saved to public/game-screenshot.png');
  
  await browser.close();
}

generateGameScreenshot().catch(console.error);