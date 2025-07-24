import { chromium } from 'playwright';

async function testGameBoardOverflow() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }
  });
  const page = await context.newPage();
  
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1000);
  
  // Start a hard game (10x10 grid)
  await page.getByRole('button', { name: 'Hard' }).click();
  await page.getByRole('button', { name: /start game/i }).click();
  await page.waitForTimeout(3000);
  
  // Check game board specifically
  const boardData = await page.evaluate(() => {
    // Find the actual game board (not dashboard)
    const gameBoard = document.querySelector('.grid.gap-1.bg-black\\/20');
    if (!gameBoard) return { error: 'Game board not found' };
    
    const rect = gameBoard.getBoundingClientRect();
    const styles = window.getComputedStyle(gameBoard);
    
    return {
      found: true,
      left: rect.left,
      width: rect.width,
      right: rect.right,
      gridTemplate: styles.gridTemplateColumns,
      computedWidth: styles.width,
      className: gameBoard.className
    };
  });
  
  console.log('Game Board Data:', boardData);
  console.log(`Overflow: ${boardData.right > 375 ? 'YES' : 'NO'} (right edge: ${boardData.right})`);
  
  // Take screenshot
  await page.screenshot({ path: 'game-board-overflow-test.png', fullPage: false });
  
  await browser.close();
}

testGameBoardOverflow().catch(console.error);