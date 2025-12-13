#!/usr/bin/env node

/**
 * Debug Session Data Format
 * Check what format the analysis results are stored in
 */

const fs = require('fs');
const path = require('path');

function debugSessionData() {
  console.log('🔍 Debugging Session Data Format');
  console.log('================================');
  
  // Check if we're in a browser environment (this won't work in Node.js)
  console.log('⚠️  This script needs to be run in the browser console');
  console.log('📋 Copy and paste this code in your browser console:');
  console.log('');
  console.log(`
// Debug session data in browser console
console.log('🔍 Checking session storage...');

// Check all session storage keys
const sessionKeys = Object.keys(sessionStorage);
console.log('📦 Session storage keys:', sessionKeys);

// Look for analysis-related keys
const analysisKeys = sessionKeys.filter(key => 
  key.includes('analysis') || 
  key.includes('video') || 
  key.includes('dance')
);
console.log('🎭 Analysis-related keys:', analysisKeys);

// Check each analysis key
analysisKeys.forEach(key => {
  try {
    const data = JSON.parse(sessionStorage.getItem(key));
    console.log(\`📊 \${key}:\`, data);
    
    if (data && data.analysisResults) {
      console.log('  - analysisResults keys:', Object.keys(data.analysisResults));
      if (data.analysisResults.detectedMovements) {
        console.log('  - detectedMovements length:', data.analysisResults.detectedMovements.length);
        console.log('  - first movement:', data.analysisResults.detectedMovements[0]);
      } else {
        console.log('  - ❌ No detectedMovements found');
      }
    }
  } catch (e) {
    console.log(\`❌ Error parsing \${key}:\`, e.message);
  }
});

// Check localStorage as well
const localKeys = Object.keys(localStorage);
console.log('💾 Local storage keys:', localKeys);

const localAnalysisKeys = localKeys.filter(key => 
  key.includes('analysis') || 
  key.includes('video') || 
  key.includes('dance')
);
console.log('🎭 Local analysis-related keys:', localAnalysisKeys);

localAnalysisKeys.forEach(key => {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    console.log(\`💾 \${key}:\`, data);
  } catch (e) {
    console.log(\`❌ Error parsing local \${key}:\`, e.message);
  }
});
`);
  
  console.log('');
  console.log('🎯 What to look for:');
  console.log('1. Check if analysisResults exists');
  console.log('2. Check if detectedMovements is an array');
  console.log('3. Check the structure of movement objects');
  console.log('4. Look for any missing or malformed data');
}

// Also provide a function to create mock analysis data for testing
function createMockAnalysisData() {
  console.log('');
  console.log('🧪 Creating Mock Analysis Data for Testing');
  console.log('==========================================');
  console.log('');
  console.log('// Run this in browser console to create mock data:');
  console.log(`
const mockAnalysisResults = {
  videoId: 'video-' + Date.now(),
  duration: 120,
  detectedMovements: [
    {
      name: 'Hip Hop Step',
      type: 'Hip Hop',
      confidence: 0.9,
      timeRange: { start: 0, end: 2 },
      description: 'Basic hip hop movement',
      difficulty: 'Beginner'
    },
    {
      name: 'Body Wave',
      type: 'Hip Hop',
      confidence: 0.85,
      timeRange: { start: 2, end: 4 },
      description: 'Fluid body wave motion',
      difficulty: 'Intermediate'
    },
    {
      name: 'Freeze',
      type: 'Breaking',
      confidence: 0.95,
      timeRange: { start: 4, end: 6 },
      description: 'Static freeze position',
      difficulty: 'Advanced'
    }
  ],
  qualityMetrics: {
    overall: 0.88,
    technical: 0.85,
    artistic: 0.90,
    consistency: 0.87
  },
  recommendations: ['Great energy!', 'Work on transitions'],
  primaryStyle: 'Hip Hop',
  danceMetrics: {
    averageDifficulty: 'Intermediate',
    uniqueStyles: 2,
    technicalComplexity: 0.75,
    artisticExpression: 0.80
  },
  styleDistribution: [
    { style: 'Hip Hop', displayName: 'Hip Hop', percentage: 70 },
    { style: 'Breaking', displayName: 'Breaking', percentage: 30 }
  ],
  movementsByStyle: {
    'Hip Hop': ['Hip Hop Step', 'Body Wave'],
    'Breaking': ['Freeze']
  }
};

const mockSession = {
  videoId: mockAnalysisResults.videoId,
  analysisResults: mockAnalysisResults,
  analysisCompletedAt: Date.now(),
  qualityScore: 0.88
};

// Save to session storage
sessionStorage.setItem('movemint_analysis_session', JSON.stringify(mockSession));
console.log('✅ Mock analysis data created and saved to session storage');
console.log('🔄 Refresh the mint page to use this data');
`);
}

if (require.main === module) {
  debugSessionData();
  createMockAnalysisData();
}

module.exports = { debugSessionData, createMockAnalysisData };