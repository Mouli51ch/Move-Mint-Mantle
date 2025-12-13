/**
 * Generate New Wallet for Minting
 * This script generates a new private key and wallet address for minting
 */

const { generatePrivateKey, privateKeyToAccount } = require('viem/accounts');

function generateNewWallet() {
  console.log('🔑 Generating new wallet for minting...\n');
  
  // Generate a new private key
  const privateKey = generatePrivateKey();
  console.log('Private Key:', privateKey);
  
  // Create account from private key
  const account = privateKeyToAccount(privateKey);
  console.log('Wallet Address:', account.address);
  
  console.log('\n📋 Update your .env file with:');
  console.log(`STORY_PROTOCOL_PRIVATE_KEY=${privateKey.slice(2)}`); // Remove 0x prefix
  console.log(`MINTING_WALLET_ADDRESS=${account.address}`);
  
  console.log('\n⚠️  Important:');
  console.log('1. Fund this wallet with IP tokens from: https://faucet.story.foundation/');
  console.log('2. This wallet will be used for ALL minting operations');
  console.log('3. Keep the private key secure and never share it');
  
  return { privateKey, address: account.address };
}

// Generate multiple wallets for testing
console.log('Generating 3 wallet options:\n');

for (let i = 1; i <= 3; i++) {
  console.log(`=== Wallet Option ${i} ===`);
  generateNewWallet();
  console.log('\n');
}

console.log('Choose one of the above wallets and update your .env file.');
console.log('Make sure to fund the chosen wallet with IP tokens before testing minting.');