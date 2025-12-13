#!/usr/bin/env node

/**
 * Create Mock Session Data
 * Creates proper session data that matches what the UI expects
 */

function createMockSessionData() {
  console.log('🧪 Creating Mock Session Data for Browser Testing');
  console.log('=================================================');
  
  console.log('📋 Copy and paste this code in your browser console:');
  console.log('');
  console.log(`
// Clear existing session data
sessionStorage.clear();
localStorage.clear();

// Create mock analysis results that match the expected format
const mockAnalysisResults = {
  videoId: 'video-' + Date.now(),
  duration: 150, // 2.5 minutes
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
    artisticExpression: 0.80,
    totalMovements: 3
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

// Create analysis session
const analysisSession = {
  videoId: mockAnalysisResults.videoId,
  analysisResults: mockAnalysisResults,
  analysisCompletedAt: Date.now(),
  qualityScore: 0.88
};

// Create workflow session
const workflowSession = {
  currentStep: 'minting',
  startedAt: Date.now() - 300000, // 5 minutes ago
  lastUpdatedAt: Date.now(),
  analysis: analysisSession
};

// Save to session storage with the correct keys
sessionStorage.setItem('movemint_analysis_session', JSON.stringify(analysisSession));
sessionStorage.setItem('movemint_workflow_session', JSON.stringify(workflowSession));
sessionStorage.setItem('movemint_video_id', mockAnalysisResults.videoId);

console.log('✅ Mock session data created successfully!');
console.log('📊 Analysis session:', analysisSession);
console.log('🔄 Workflow session:', workflowSession);
console.log('');
console.log('🔄 Now refresh the mint page to use this mock data');
console.log('🎯 The mint page should now have proper analysis results to work with');
`);
  
  console.log('');
  console.log('🎯 What this does:');
  console.log('1. Creates realistic dance analysis results');
  console.log('2. Sets up proper session storage keys');
  console.log('3. Provides data in the format the UI expects');
  console.log('4. Includes all required fields for minting');
  console.log('');
  console.log('🔧 After running this in the browser:');
  console.log('1. Refresh the mint page');
  console.log('2. Try minting - it should work without errors');
  console.log('3. Check the browser console for any remaining issues');
}

if (require.main === module) {
  createMockSessionData();
}

module.exports = { createMockSessionData };