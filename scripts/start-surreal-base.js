#!/usr/bin/env node

/**
 * Start Surreal-Base Universal Minting Engine
 * 
 * This script helps start the Surreal-Base Universal Minting Engine
 * if it's not already running.
 */

const { spawn } = require('child_process');
const fetch = require('node-fetch');
const path = require('path');

async function checkIfRunning() {
  const possiblePorts = [3001, 3002, 4000, 8000];
  
  for (const port of possiblePorts) {
    try {
      const response = await fetch(`http://localhost:${port}/api/health`, {
        signal: AbortSignal.timeout(2000)
      });
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Surreal-Base Universal Minting Engine already running on port ${port}`);
        console.log(`   Status: ${data.status}`);
        console.log(`   Network: ${data.config?.network}`);
        return port;
      }
    } catch (error) {
      // Port not available
    }
  }
  return null;
}

async function startSurrealBase() {
  console.log('🚀 Starting Surreal-Base Universal Minting Engine...\n');

  // Check if already running
  const runningPort = await checkIfRunning();
  if (runningPort) {
    console.log('\n🎉 Surreal-Base is already running and ready to use!');
    return;
  }

  console.log('🔍 Surreal-Base not found running. Attempting to start...');

  // Try to find the Surreal-Base directory
  const possiblePaths = [
    '../Surreal-Base/universal-minting-engine',
    '../../Surreal-Base/universal-minting-engine',
    '../../../Surreal-Base/universal-minting-engine',
    './Surreal-Base/universal-minting-engine',
  ];

  let surrealBasePath = null;
  const fs = require('fs');

  for (const possiblePath of possiblePaths) {
    const fullPath = path.resolve(__dirname, possiblePath);
    if (fs.existsSync(fullPath) && fs.existsSync(path.join(fullPath, 'package.json'))) {
      surrealBasePath = fullPath;
      console.log(`✅ Found Surreal-Base at: ${fullPath}`);
      break;
    }
  }

  if (!surrealBasePath) {
    console.log('❌ Could not find Surreal-Base Universal Minting Engine directory.');
    console.log('\nPlease ensure Surreal-Base is available at one of these locations:');
    possiblePaths.forEach(p => console.log(`   ${path.resolve(__dirname, p)}`));
    console.log('\nOr start it manually:');
    console.log('   cd path/to/Surreal-Base/universal-minting-engine');
    console.log('   npm install');
    console.log('   npm run dev');
    return;
  }

  console.log(`🚀 Starting Surreal-Base from: ${surrealBasePath}`);

  // Start the Surreal-Base engine
  const child = spawn('npm', ['run', 'dev'], {
    cwd: surrealBasePath,
    stdio: 'pipe',
    shell: true
  });

  console.log('📡 Starting Surreal-Base Universal Minting Engine...');
  console.log('   This may take a moment to initialize...');

  let startupComplete = false;

  child.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`[Surreal-Base] ${output.trim()}`);
    
    // Check for startup indicators
    if (output.includes('Ready') || output.includes('started') || output.includes('listening')) {
      startupComplete = true;
    }
  });

  child.stderr.on('data', (data) => {
    const output = data.toString();
    console.log(`[Surreal-Base Error] ${output.trim()}`);
  });

  child.on('close', (code) => {
    console.log(`\n[Surreal-Base] Process exited with code ${code}`);
  });

  // Wait a bit and check if it's running
  setTimeout(async () => {
    const runningPort = await checkIfRunning();
    if (runningPort) {
      console.log('\n🎉 Surreal-Base Universal Minting Engine started successfully!');
      console.log(`   Available at: http://localhost:${runningPort}`);
      console.log('   Health check: http://localhost:${runningPort}/api/health');
      console.log('\n✅ Ready for MoveMint integration!');
    } else {
      console.log('\n⏳ Surreal-Base may still be starting up...');
      console.log('   Check the logs above for any errors');
      console.log('   Try running the integration test in a few moments');
    }
  }, 10000); // Wait 10 seconds

  // Keep the process running
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping Surreal-Base Universal Minting Engine...');
    child.kill();
    process.exit();
  });
}

// Run the startup
startSurrealBase().catch(console.error);