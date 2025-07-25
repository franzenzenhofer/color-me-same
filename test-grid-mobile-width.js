import { chromium } from 'playwright';

async function testGridWidth() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    isMobile: true,
    deviceScaleFactor: 2
  });
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3001/');
    await page.waitForTimeout(1000);
    
    // Test Easy mode (3x3)
    console.log('\n=== Testing Easy Mode (3x3) ===');
    await page.getByText('Easy').click();
    await page.waitForTimeout(500);
    await page.getByText('Start Game').click();
    await page.waitForTimeout(1000);
    
    let measurements = await page.evaluate(() => {
      const grid = document.querySelector('.grid');
      const tiles = document.querySelectorAll('.grid > div');
      if (!grid) return { error: 'No grid found' };
      
      const gridRect = grid.getBoundingClientRect();
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const hasScroll = document.documentElement.scrollWidth > window.innerWidth;
      const styles = window.getComputedStyle(grid);
      
      return {
        viewport,
        grid: {
          width: gridRect.width,
          height: gridRect.height,
          left: gridRect.left,
          right: gridRect.right,
          padding: styles.padding,
          gap: styles.gap
        },
        tileCount: tiles.length,
        hasHorizontalScroll: hasScroll,
        widthUsage: ((gridRect.width / viewport.width) * 100).toFixed(1) + '%'
      };
    });
    
    console.log('Measurements:', measurements);
    await page.screenshot({ path: 'mobile-3x3-grid.png', fullPage: true });
    
    // Go back to test Medium mode (6x6)
    await page.click('button:has-text("Color Me Same")');
    await page.waitForTimeout(500);
    
    console.log('\n=== Testing Medium Mode (6x6) ===');
    await page.getByText('Medium').click();
    await page.waitForTimeout(500);
    await page.getByText('Start Game').click();
    await page.waitForTimeout(1000);
    
    measurements = await page.evaluate(() => {
      const grid = document.querySelector('.grid');
      const tiles = document.querySelectorAll('.grid > div');
      if (!grid) return { error: 'No grid found' };
      
      const gridRect = grid.getBoundingClientRect();
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const hasScroll = document.documentElement.scrollWidth > window.innerWidth;
      const styles = window.getComputedStyle(grid);
      
      return {
        viewport,
        grid: {
          width: gridRect.width,
          height: gridRect.height,
          left: gridRect.left,
          right: gridRect.right,
          padding: styles.padding,
          gap: styles.gap
        },
        tileCount: tiles.length,
        hasHorizontalScroll: hasScroll,
        widthUsage: ((gridRect.width / viewport.width) * 100).toFixed(1) + '%'
      };
    });
    
    console.log('Measurements:', measurements);
    await page.screenshot({ path: 'mobile-6x6-grid.png', fullPage: true });
    
    // Go back to test Hard mode (10x10)
    await page.click('button:has-text("Color Me Same")');
    await page.waitForTimeout(500);
    
    console.log('\n=== Testing Hard Mode (10x10) ===');
    await page.getByText('Hard').click();
    await page.waitForTimeout(500);
    await page.getByText('Start Game').click();
    await page.waitForTimeout(1000);
    
    measurements = await page.evaluate(() => {
      const grid = document.querySelector('.grid');
      const tiles = document.querySelectorAll('.grid > div');
      if (!grid) return { error: 'No grid found' };
      
      const gridRect = grid.getBoundingClientRect();
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const hasScroll = document.documentElement.scrollWidth > window.innerWidth;
      const styles = window.getComputedStyle(grid);
      
      return {
        viewport,
        grid: {
          width: gridRect.width,
          height: gridRect.height,
          left: gridRect.left,
          right: gridRect.right,
          padding: styles.padding,
          gap: styles.gap
        },
        tileCount: tiles.length,
        hasHorizontalScroll: hasScroll,
        widthUsage: ((gridRect.width / viewport.width) * 100).toFixed(1) + '%'
      };
    });
    
    console.log('Measurements:', measurements);
    await page.screenshot({ path: 'mobile-10x10-grid.png', fullPage: true });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testGridWidth();