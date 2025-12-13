#!/usr/bin/env node

/**
 * Test Live Minting Flow
 * Tests the actual minting flow against the running dev server
 */

const puppeteer = require('puppeteer');

async function testLiveMintingFlow() {
  console.log('🎯 [TEST] Testing live minting flow with browser automation...\n');
  
  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({ 
      headless: false, // Set to true for headless mode
      devtools: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[DEBUG]') || text.includes('[RENDER]') || text.includes('IP ID')) {
        console.log(`🖥️ [BROWSER] ${text}`);
      }
    });
    
    // Navigate to test page
    console.log('📱 [TEST] Navigating to test page...');
    await page.goto('http://localhost:3000/test-ip-id');
    
    // Wait for page to load
    await page.waitForSelector('button', { timeout: 10000 });
    console.log('✅ [TEST] Page loaded successfully');
    
    // Click the test button
    console.log('🖱️ [TEST] Clicking test button...');
    await page.click('button');
    
    // Wait for the test to complete (look for success display)
    console.log('⏳ [TEST] Waiting for minting to complete...');
    
    try {
      // Wait for either success display or error
      await page.waitForSelector('.bg-green-950\\/30, .bg-red-950\\/30', { timeout: 30000 });
      console.log('✅ [TEST] Minting completed');
      
      // Check if success display is visible
      const successDisplay = await page.$('.bg-green-950\\/30');
      if (successDisplay) {
        console.log('✅ [SUCCESS] Success display is visible');
        
        // Check if IP ID is displayed
        const ipIdElement = await page.$('code');
        if (ipIdElement) {
          const ipIdText = await page.evaluate(el => el.textContent, ipIdElement);
          console.log('🆔 [SUCCESS] IP ID found:', ipIdText);
          
          if (ipIdText && ipIdText.startsWith('0x') && ipIdText.length === 66) {
            console.log('✅ [SUCCESS] IP ID format is correct');
          } else {
            console.log('❌ [ERROR] IP ID format is incorrect');
          }
        } else {
          console.log('❌ [ERROR] IP ID element not found');
        }
        
      } else {
        console.log('❌ [ERROR] Success display not found');
      }
      
    } catch (error) {
      console.log('⏰ [TIMEOUT] Minting took too long or failed');
    }
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-ip-id-result.png', fullPage: true });
    console.log('📸 [TEST] Screenshot saved as test-ip-id-result.png');
    
  } catch (error) {
    console.error('❌ [ERROR] Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is available
try {
  require('puppeteer');
  testLiveMintingFlow();
} catch (error) {
  console.log('⚠️ [SKIP] Puppeteer not available, skipping browser test');
  console.log('💡 [INFO] To run browser tests, install puppeteer: npm install puppeteer');
  
  // Fallback to API-only test
  console.log('🔄 [FALLBACK] Running API-only test...');
  require('./test-frontend-ip-id-flow.js');
}