#!/usr/bin/env node

/**
 * MVP Validation Script
 * Validates that all core MVP functionality is working
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 MoveMint MVP Validation\n');

// Check if all critical files exist
const criticalFiles = [
  // Core API integration
  'lib/api/client.ts',
  'lib/api/service.ts',
  'lib/types/api.ts',
  
  // Main application pages
  'app/app/upload/page.tsx',
  'app/app/results/page.tsx',
  'app/app/mint/page.tsx',
  'app/app/dashboard/page.tsx',
  
  // Core components
  'components/ui/wallet-connection.tsx',
  'components/ui/real-time-progress.tsx',
  'components/error/error-boundary.tsx',
  
  // Essential utilities
  'lib/utils/progress-tracker.ts',
  'lib/utils/error-handler.ts',
  'lib/utils/dance-content-transformer.ts',
  'lib/services/session-service.ts',
  
  // Configuration
  'lib/config/environment.ts',
  'lib/config/deployment.ts',
  '.env.local.example',
];

let allFilesExist = true;

console.log('📁 Checking critical files...');
criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check package.json for required dependencies
console.log('\n📦 Checking dependencies...');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const requiredDeps = [
    'next',
    'react',
    'typescript',
    '@types/react',
  ];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      console.log(`  ✅ ${dep}`);
    } else {
      console.log(`  ❌ ${dep} - MISSING`);
      allFilesExist = false;
    }
  });
} else {
  console.log('  ❌ package.json - MISSING');
  allFilesExist = false;
}

// Check environment configuration
console.log('\n⚙️  Checking configuration...');
const envExamplePath = path.join(__dirname, '..', '.env.local.example');
if (fs.existsSync(envExamplePath)) {
  const envContent = fs.readFileSync(envExamplePath, 'utf8');
  const requiredEnvVars = [
    'NEXT_PUBLIC_UNIVERSAL_MINTING_ENGINE_API_URL',
    'NEXT_PUBLIC_STORY_PROTOCOL_CHAIN_ID',
    'NEXT_PUBLIC_APP_ENV',
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (envContent.includes(envVar)) {
      console.log(`  ✅ ${envVar}`);
    } else {
      console.log(`  ❌ ${envVar} - MISSING`);
      allFilesExist = false;
    }
  });
} else {
  console.log('  ❌ .env.local.example - MISSING');
  allFilesExist = false;
}

// Check core workflow completeness
console.log('\n🔄 Checking workflow completeness...');
const workflows = [
  { name: 'Video Upload', files: ['app/app/upload/page.tsx', 'hooks/use-video-upload.ts'] },
  { name: 'Analysis Results', files: ['app/app/results/page.tsx', 'lib/utils/dance-content-transformer.ts'] },
  { name: 'NFT Minting', files: ['app/app/mint/page.tsx', 'hooks/use-license-configuration.ts'] },
  { name: 'Dashboard', files: ['app/app/dashboard/page.tsx'] },
  { name: 'Wallet Integration', files: ['components/ui/wallet-connection.tsx', 'hooks/use-wallet.ts'] },
  { name: 'Session Management', files: ['lib/services/session-service.ts', 'hooks/use-session.ts'] },
  { name: 'Error Handling', files: ['lib/utils/error-handler.ts', 'components/error/error-boundary.tsx'] },
  { name: 'Progress Tracking', files: ['lib/utils/progress-tracker.ts', 'components/ui/real-time-progress.tsx'] },
];

workflows.forEach(workflow => {
  const allWorkflowFilesExist = workflow.files.every(file => {
    const filePath = path.join(__dirname, '..', file);
    return fs.existsSync(filePath);
  });
  
  if (allWorkflowFilesExist) {
    console.log(`  ✅ ${workflow.name} workflow`);
  } else {
    console.log(`  ❌ ${workflow.name} workflow - INCOMPLETE`);
    allFilesExist = false;
  }
});

// Final validation
console.log('\n' + '='.repeat(50));
if (allFilesExist) {
  console.log('🎉 MVP VALIDATION PASSED!');
  console.log('\nYour MoveMint MVP is ready for deployment!');
  console.log('\nNext steps:');
  console.log('1. Copy .env.local.example to .env.local');
  console.log('2. Configure your environment variables');
  console.log('3. Run npm run dev to start development');
  console.log('4. Test the complete workflow: Upload → Results → Mint → Dashboard');
  process.exit(0);
} else {
  console.log('❌ MVP VALIDATION FAILED!');
  console.log('\nSome critical files or dependencies are missing.');
  console.log('Please ensure all components are properly implemented.');
  process.exit(1);
}