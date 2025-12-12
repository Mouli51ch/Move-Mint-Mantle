#!/usr/bin/env node

/**
 * Simple script to check if wallet connect button is visible on pages
 */

const fetch = require('node-fetch');

async function checkPages() {
  console.log('🔍 Checking if pages are loading...');
  
  const pages = [
    'http://localhost:3000/test-wallet',
    'http://localhost:3000/app/mint'
  ];
  
  for (const url of pages) {
    try {
      console.log(`📄 Checking ${url}...`);
      const response = await fetch(url);
      
      if (response.ok) {
        const html = await response.text();
        
        // Check for wallet connection component
        const hasWalletComponent = html.includes('Connect Wallet') || 
                                 html.includes('WalletConnection') ||
                                 html.includes('wallet-connection');
        
        // Check for any errors
        const hasErrors = html.includes('Error:') || 
                         html.includes('ReferenceError') ||
                         html.includes('TypeError');
        
        console.log(`  ✅ Page loads: ${response.status}`);
        console.log(`  🔗 Has wallet component: ${hasWalletComponent}`);
        console.log(`  ❌ Has errors: ${hasErrors}`);
        
        if (hasErrors) {
          // Extract error messages
          const errorMatches = html.match(/Error:[^<]+/g) || [];
          console.log(`  🐛 Errors found:`, errorMatches.slice(0, 3));
        }
        
      } else {
        console.log(`  ❌ Page failed to load: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`  💥 Request failed: ${error.message}`);
    }
    
    console.log('');
  }
}

// Run the check
checkPages().catch(console.error);