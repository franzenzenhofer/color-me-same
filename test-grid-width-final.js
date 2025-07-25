import { chromium } from 'playwright';

async function testGridWidthFinal() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    isMobile: true
  });
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3001/');
    await page.waitForTimeout(1000);
    
    // Test Hard mode
    await page.getByText('Hard').click();
    await page.waitForTimeout(500);
    await page.getByText('Start Game').click();
    await page.waitForTimeout(1000);
    
    const measurements = await page.evaluate(() => {
      const grid = document.querySelector('.grid');
      const container = document.querySelector('.relative.flex.flex-col');
      const tiles = document.querySelectorAll('.grid > div');
      
      if (!grid) return { error: 'No grid found' };
      
      const gridRect = grid.getBoundingClientRect();
      const containerRect = container?.getBoundingClientRect();
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      
      return {
        viewport,
        grid: {
          width: gridRect.width,
          height: gridRect.height,
          left: gridRect.left,
          right: gridRect.right,
          tileCount: tiles.length
        },
        container: containerRect ? {
          width: containerRect.width,
          left: containerRect.left,
          right: containerRect.right
        } : null,
        widthUsage: ((gridRect.width / viewport.width) * 100).toFixed(1) + '%',
        hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth
      };
    });
    
    console.log('Final measurements:', measurements);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testGridWidthFinal();