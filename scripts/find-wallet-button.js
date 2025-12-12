#!/usr/bin/env node

/**
 * Find Wallet Connect Button Guide
 * Helps locate the wallet connection button
 */

console.log('🔍 WHERE TO FIND THE WALLET CONNECT BUTTON\n');

console.log('🎯 **OPTION 1: Test Page (Easiest)**');
console.log('   URL: http://localhost:3000/test-wallet');
console.log('   • Direct wallet component test');
console.log('   • No forms to fill out');
console.log('   • Button should be immediately visible');
console.log('   • Perfect for testing wallet connection');

console.log('\n🎭 **OPTION 2: Mint Page (Full Flow)**');
console.log('   URL: http://localhost:3000/app/mint');
console.log('   • Wallet connection now in FIRST step');
console.log('   • Look for "🔗 Connect Your Wallet First" section');
console.log('   • Green "Connect Wallet" button should be visible');
console.log('   • No need to fill forms first');

console.log('\n📋 **Step-by-Step Instructions:**');
console.log('1. Open http://localhost:3000/test-wallet');
console.log('2. Look for "Test Wallet Component" section');
console.log('3. You should see a green "Connect Wallet" button');
console.log('4. Click it → Wallet modal opens');
console.log('5. Click MetaMask → Connection request');
console.log('6. Approve in MetaMask → Address appears');

console.log('\n🔧 **If Button Still Missing:**');
console.log('• Check browser console for errors (F12)');
console.log('• Make sure MetaMask is installed');
console.log('• Try refreshing the page');
console.log('• Check if JavaScript is enabled');

console.log('\n🚨 **Troubleshooting:**');
console.log('• Button not visible? → Try test page first');
console.log('• Modal not opening? → Check console errors');
console.log('• MetaMask not connecting? → Unlock wallet');
console.log('• Network issues? → Check internet connection');

console.log('\n💡 **What You Should See:**');
console.log('✅ Green "Connect Wallet" button');
console.log('✅ Button opens modal when clicked');
console.log('✅ MetaMask option in modal');
console.log('✅ Wallet address after connection');

console.log('\n' + '='.repeat(50));
console.log('🎭 Test both pages to find your wallet button!');
console.log('Start with: http://localhost:3000/test-wallet');