import { chromium } from 'playwright';

async function checkHardModeSpacing() {
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
  await page.waitForTimeout(2000);
  
  // Analyze tile spacing
  const spacingData = await page.evaluate(() => {
    const tiles = document.querySelectorAll('button[class*="rounded-lg"]');
    if (tiles.length === 0) return { error: 'No tiles found' };
    
    const firstTile = tiles[0];
    const tileRect = firstTile.getBoundingClientRect();
    const tileWrapper = firstTile.parentElement;
    const wrapperRect = tileWrapper?.getBoundingClientRect();
    
    const grid = document.querySelector('.grid.gap-1');
    const gridStyles = grid ? window.getComputedStyle(grid) : null;
    
    return {
      tileHeight: tileRect.height,
      tileWidth: tileRect.width,
      wrapperHeight: wrapperRect?.height,
      wrapperWidth: wrapperRect?.width,
      wrapperClass: tileWrapper?.className,
      gridGap: gridStyles?.gap,
      gridTemplateRows: gridStyles?.gridTemplateRows,
      aspectRatioApplied: tileWrapper?.className.includes('aspect-square')
    };
  });
  
  console.log('Spacing Analysis:', spacingData);
  
  // Take screenshot
  await page.screenshot({ path: 'hard-mode-spacing.png', fullPage: false });
  
  await browser.close();
}

checkHardModeSpacing().catch(console.error);