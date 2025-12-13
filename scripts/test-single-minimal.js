#!/usr/bin/env node

/**
 * Test Single Minimal Case
 */

const FRONTEND_URL = 'http://localhost:3000';

async function testMinimalCase() {
  console.log('🧪 Testing minimal case...');
  
  const minimalData = {
    title: "Minimal Test",
    description: "Testing minimal data",
    danceStyle: "Ballet",
    userAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    analysisResults: {
      totalMoves: 0,
      uniqueSequences: 0,
      confidenceScore: 0,
      complexity: "Beginner"
    }
  };
  
  console.log('📤 Sending request:', JSON.stringify(minimalData, null, 2));
  
  try {
    const response = await fetch(`${FRONTEND_URL}/api/prepare-mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(minimalData)
    });
    
    const result = await response.json();
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response body:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Request successful');
    } else {
      console.log('❌ Request failed');
    }
  } catch (error) {
    console.log('❌ Request error:', error.message);
  }
}

testMinimalCase();