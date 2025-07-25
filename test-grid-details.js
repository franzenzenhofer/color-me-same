import { chromium } from 'playwright';

async function testGridDetails() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    isMobile: true
  });
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3001/');
    await page.waitForTimeout(1000);
    
    // Test Hard mode (10x10)
    await page.getByText('Hard').click();
    await page.waitForTimeout(500);
    await page.getByText('Start Game').click();
    await page.waitForTimeout(1000);
    
    const measurements = await page.evaluate(() => {
      const grid = document.querySelector('.grid');
      if (!grid) return { error: 'No grid found' };
      
      const gridRect = grid.getBoundingClientRect();
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const styles = window.getComputedStyle(grid);
      const container = grid.parentElement;
      const containerRect = container?.getBoundingClientRect();
      
      // Get page shell padding
      const pageShell = document.querySelector('.flex-1.p-2');
      const pageShellStyles = pageShell ? window.getComputedStyle(pageShell) : null;
      
      return {
        viewport,
        grid: {
          width: gridRect.width,
          height: gridRect.height,
          left: gridRect.left,
          right: gridRect.right,
          computedWidth: styles.width,
          computedHeight: styles.height,
          padding: styles.padding,
          aspectRatio: styles.aspectRatio
        },
        container: containerRect ? {
          width: containerRect.width,
          height: containerRect.height,
          left: containerRect.left,
          right: containerRect.right
        } : null,
        pageShell: {
          padding: pageShellStyles?.padding,
          paddingLeft: pageShellStyles?.paddingLeft,
          paddingRight: pageShellStyles?.paddingRight
        },
        widthUsage: ((gridRect.width / viewport.width) * 100).toFixed(1) + '%'
      };
    });
    
    console.log('Grid details:', JSON.stringify(measurements, null, 2));
    
    await page.screenshot({ path: 'mobile-grid-details.png', fullPage: true });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testGridDetails();