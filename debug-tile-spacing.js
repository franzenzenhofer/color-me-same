import { chromium } from 'playwright';

async function debugTileSpacing() {
  const browser = await chromium.launch({ headless: false });
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
  
  const analysis = await page.evaluate(() => {
    // Find the actual game board
    const gameBoard = document.querySelector('.grid.gap-1.bg-black\\/20');
    const tiles = gameBoard?.querySelectorAll('.w-full.aspect-square');
    
    if (!tiles || tiles.length === 0) return { error: 'No game tiles found' };
    
    const firstTile = tiles[0];
    const tileButton = firstTile.querySelector('button');
    
    const tileRect = firstTile.getBoundingClientRect();
    const buttonRect = tileButton?.getBoundingClientRect();
    const boardRect = gameBoard?.getBoundingClientRect();
    
    const tileStyles = window.getComputedStyle(firstTile);
    const boardStyles = gameBoard ? window.getComputedStyle(gameBoard) : null;
    
    return {
      board: {
        width: boardRect?.width,
        height: boardRect?.height,
        gridTemplate: boardStyles?.gridTemplateColumns,
        gridTemplateRows: boardStyles?.gridTemplateRows,
        gap: boardStyles?.gap
      },
      tileWrapper: {
        width: tileRect.width,
        height: tileRect.height,
        className: firstTile.className,
        display: tileStyles.display,
        aspectRatio: tileStyles.aspectRatio
      },
      tileButton: {
        width: buttonRect?.width,
        height: buttonRect?.height
      },
      tileCount: tiles.length
    };
  });
  
  console.log('Game Board Analysis:', JSON.stringify(analysis, null, 2));
  
  await browser.close();
}

debugTileSpacing().catch(console.error);