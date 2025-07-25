import { chromium } from 'playwright';

async function testMobileGridFullWidth() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    isMobile: true
  });
  const page = await context.newPage();
  
  try {
    // Visit the game
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
    
    // Start game and test different difficulty levels
    const difficulties = ['easy', 'medium', 'hard'];
    
    for (const difficulty of difficulties) {
      console.log(`\nTesting ${difficulty} mode:`);
      
      // Click difficulty button
      await page.click(`button[data-difficulty="${difficulty}"]`);
      await page.waitForTimeout(500);
      
      // Get grid and viewport measurements
      const measurements = await page.evaluate(() => {
        const grid = document.querySelector('.grid');
        const viewport = { width: window.innerWidth, height: window.innerHeight };
        const gridRect = grid?.getBoundingClientRect();
        
        // Check for horizontal scroll
        const hasHorizontalScroll = document.documentElement.scrollWidth > window.innerWidth;
        
        // Get computed styles
        const gridStyles = grid ? window.getComputedStyle(grid) : null;
        
        return {
          viewport,
          grid: gridRect ? {
            width: gridRect.width,
            height: gridRect.height,
            left: gridRect.left,
            right: gridRect.right,
            aspectRatio: gridStyles?.aspectRatio,
            padding: gridStyles?.padding,
            gap: gridStyles?.gap
          } : null,
          hasHorizontalScroll,
          bodyWidth: document.body.scrollWidth,
          htmlWidth: document.documentElement.scrollWidth
        };
      });
      
      console.log('Viewport width:', measurements.viewport.width);
      console.log('Grid width:', measurements.grid?.width);
      console.log('Grid left:', measurements.grid?.left);
      console.log('Grid right:', measurements.grid?.right);
      console.log('Has horizontal scroll:', measurements.hasHorizontalScroll);
      console.log('Grid aspect ratio:', measurements.grid?.aspectRatio);
      
      // Calculate usage percentage
      if (measurements.grid) {
        const usagePercent = (measurements.grid.width / measurements.viewport.width) * 100;
        console.log(`Grid uses ${usagePercent.toFixed(1)}% of viewport width`);
        
        if (usagePercent < 90) {
          console.log('⚠️  Grid is not using full viewport width!');
        }
        
        if (measurements.hasHorizontalScroll) {
          console.log('❌ Horizontal scroll detected!');
        }
      }
      
      // Take screenshot
      await page.screenshot({ 
        path: `mobile-grid-${difficulty}-fullwidth-test.png`,
        fullPage: true 
      });
      
      // Go back to home screen
      await page.click('.group'); // Click header home button
      await page.waitForTimeout(500);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testMobileGridFullWidth();