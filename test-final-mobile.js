import { chromium } from 'playwright';

async function testFinalMobile() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    isMobile: true
  });
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3001/');
    await page.waitForTimeout(1000);
    
    // Test all modes
    const modes = ['Easy', 'Medium', 'Hard'];
    
    for (const mode of modes) {
      console.log(`\nTesting ${mode} mode:`);
      
      await page.getByText(mode).click();
      await page.waitForTimeout(500);
      await page.getByText('Start Game').click();
      await page.waitForTimeout(1000);
      
      // Check for overflow
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      
      // Get actual tile count
      const tileCount = await page.evaluate(() => {
        return document.querySelectorAll('.grid > div > div').length;
      });
      
      console.log(`- Tiles visible: ${tileCount}`);
      console.log(`- Has horizontal overflow: ${hasOverflow}`);
      
      await page.screenshot({ 
        path: `final-mobile-${mode.toLowerCase()}.png`, 
        fullPage: true 
      });
      
      // Go back
      await page.click('button:has-text("Color Me Same")');
      await page.waitForTimeout(500);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testFinalMobile();