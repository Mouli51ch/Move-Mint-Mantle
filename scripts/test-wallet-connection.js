#!/usr/bin/env node

/**
 * Test script to verify wallet connection functionality
 * This script opens the test wallet page and checks if the wallet connect button appears
 */

const puppeteer = require('puppeteer');

async function testWalletConnection() {
  console.log('🔍 Testing wallet connection functionality...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false, // Show browser for debugging
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Navigate to test wallet page
    console.log('📱 Opening test wallet page...');
    await page.goto('http://localhost:3000/test-wallet', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Check if wallet connection component is present
    console.log('🔍 Looking for wallet connection component...');
    
    const walletComponent = await page.$('[data-testid="wallet-connection"]') || 
                           await page.$('.wallet-connection') ||
                           await page.waitForSelector('button:contains("Connect Wallet")', { timeout: 5000 }).catch(() => null);
    
    if (!walletComponent) {
      // Try to find any button with "Connect" text
      const connectButtons = await page.$$eval('button', buttons => 
        buttons.filter(btn => btn.textContent.includes('Connect')).map(btn => ({
          text: btn.textContent,
          visible: btn.offsetParent !== null,
          disabled: btn.disabled
        }))
      );
      
      console.log('🔍 Found buttons with "Connect" text:', connectButtons);
      
      if (connectButtons.length === 0) {
        console.error('❌ No wallet connect button found!');
        
        // Take screenshot for debugging
        await page.screenshot({ path: 'wallet-connection-debug.png', fullPage: true });
        console.log('📸 Screenshot saved as wallet-connection-debug.png');
        
        // Get page content for debugging
        const pageContent = await page.content();
        console.log('📄 Page HTML length:', pageContent.length);
        
        // Check for any errors in console
        const logs = await page.evaluate(() => {
          return window.console.logs || [];
        });
        console.log('🐛 Console logs:', logs);
        
        return false;
      }
    }
    
    console.log('✅ Wallet connection component found!');
    
    // Try to click the connect button
    try {
      const connectButton = await page.waitForSelector('button:contains("Connect Wallet")', { timeout: 5000 });
      if (connectButton) {
        console.log('🖱️ Clicking connect wallet button...');
        await connectButton.click();
        
        // Wait for modal to appear
        await page.waitForTimeout(1000);
        
        // Check if wallet modal appeared
        const modal = await page.$('.fixed.inset-0') || await page.$('[role="dialog"]');
        if (modal) {
          console.log('✅ Wallet selection modal appeared!');
        } else {
          console.log('⚠️ No modal appeared after clicking connect button');
        }
      }
    } catch (error) {
      console.log('⚠️ Could not click connect button:', error.message);
    }
    
    // Keep browser open for manual testing
    console.log('🔍 Browser will stay open for manual testing. Close it when done.');
    console.log('📍 Test page: http://localhost:3000/test-wallet');
    console.log('📍 Mint page: http://localhost:3000/app/mint');
    
    // Wait for user to close browser
    await page.waitForTimeout(60000); // Wait 1 minute
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  } finally {
    if (browser) {
      // Don't close browser automatically for debugging
      // await browser.close();
    }
  }
}

// Run the test
if (require.main === module) {
  testWalletConnection()
    .then(success => {
      if (success) {
        console.log('✅ Wallet connection test completed');
      } else {
        console.log('❌ Wallet connection test failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Test crashed:', error);
      process.exit(1);
    });
}

module.exports = { testWalletConnection };