import { chromium } from 'playwright';

async function testMobileGrid() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    isMobile: true
  });
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3001/');
    await page.waitForTimeout(2000);
    
    // Click Easy button directly by text
    await page.getByText('Easy').click();
    await page.waitForTimeout(1000);
    
    // Take screenshot
    await page.screenshot({ path: 'mobile-easy-mode.png', fullPage: true });
    
    // Get measurements
    const measurements = await page.evaluate(() => {
      const grid = document.querySelector('.grid');
      if (!grid) return { error: 'No grid found' };
      
      const gridRect = grid.getBoundingClientRect();
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const hasScroll = document.documentElement.scrollWidth > window.innerWidth;
      
      return {
        viewport,
        grid: {
          width: gridRect.width,
          height: gridRect.height,
          left: gridRect.left,
          right: gridRect.right
        },
        hasHorizontalScroll: hasScroll,
        widthUsage: ((gridRect.width / viewport.width) * 100).toFixed(1) + '%'
      };
    });
    
    console.log('Easy mode measurements:', measurements);
    
    // Go back and test hard mode
    await page.click('button:has-text("Color Me Same")');
    await page.waitForTimeout(1000);
    
    await page.getByText('Hard').click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'mobile-hard-mode.png', fullPage: true });
    
    const hardMeasurements = await page.evaluate(() => {
      const grid = document.querySelector('.grid');
      if (!grid) return { error: 'No grid found' };
      
      const gridRect = grid.getBoundingClientRect();
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const hasScroll = document.documentElement.scrollWidth > window.innerWidth;
      
      return {
        viewport,
        grid: {
          width: gridRect.width,
          height: gridRect.height,
          left: gridRect.left,
          right: gridRect.right
        },
        hasHorizontalScroll: hasScroll,
        widthUsage: ((gridRect.width / viewport.width) * 100).toFixed(1) + '%'
      };
    });
    
    console.log('Hard mode measurements:', hardMeasurements);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testMobileGrid();