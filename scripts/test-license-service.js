#!/usr/bin/env node

/**
 * Test the license service directly to debug the response structure
 */

const http = require('http');

async function testLicenseService() {
  console.log('🧪 Testing license service...\n');

  try {
    console.log('📡 Testing: /api/proxy/license-remixer?action=templates');
    
    const response = await makeRequest('localhost', 3000, '/api/proxy/license-remixer?action=templates');
    console.log(`  ✅ Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      console.log('📋 Full response structure:');
      console.log(JSON.stringify(data, null, 2));
      
      console.log('\n🔍 Analysis:');
      console.log('  - success:', data.success);
      console.log('  - data keys:', Object.keys(data.data || {}));
      
      if (data.data && data.data.templates) {
        console.log('  - templates found:', Object.keys(data.data.templates));
        console.log('  - first template:', Object.keys(data.data.templates)[0]);
        
        const firstTemplateKey = Object.keys(data.data.templates)[0];
        const firstTemplate = data.data.templates[firstTemplateKey];
        console.log('  - first template structure:', Object.keys(firstTemplate));
      }
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

function makeRequest(hostname, port, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port,
      path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Check if Next.js dev server is running
console.log('🔍 Checking if Next.js dev server is running...');

makeRequest('localhost', 3000, '/api/health')
  .then(() => {
    console.log('✅ Next.js dev server is running\n');
    return testLicenseService();
  })
  .catch(() => {
    console.log('❌ Next.js dev server is not running on localhost:3000');
    console.log('Please start the dev server with: npm run dev');
    process.exit(1);
  });