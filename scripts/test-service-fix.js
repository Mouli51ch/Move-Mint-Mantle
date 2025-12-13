#!/usr/bin/env node

/**
 * Test that the service correctly parses the license templates
 */

const http = require('http');

async function testServiceFix() {
  console.log('🧪 Testing service fix...\n');

  try {
    // Simulate what the service does
    console.log('📡 Getting templates from proxy...');
    
    const response = await makeRequest('localhost', 3000, '/api/proxy/license-remixer?action=templates');
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      
      console.log('✅ Proxy response received');
      
      // Simulate the service transformation
      const templatesData = data.data?.templates || data.templates;
      
      if (!templatesData) {
        console.error('❌ No templates data found');
        return;
      }
      
      console.log('✅ Templates data found');
      
      // Transform like the service does
      const templates = Object.entries(templatesData).map(([id, template]) => ({
        id,
        name: template.name,
        description: template.description,
        category: template.category || 'General',
        commercial: template.parameters?.commercialUse || false,
        derivatives: template.parameters?.derivativesAllowed || false,
        royaltyPercentage: template.parameters?.revenueSharePercentage || 0,
        features: template.parameters?.prohibitedUses ? 
          [`Commercial use: ${template.parameters.commercialUse ? 'Allowed' : 'Not allowed'}`,
           `Derivatives: ${template.parameters.derivativesAllowed ? 'Allowed' : 'Not allowed'}`,
           `Revenue share: ${template.parameters.revenueSharePercentage}%`,
           `Use case: ${template.useCase || 'General'}`] : []
      }));
      
      console.log('✅ Templates transformed successfully');
      console.log(`📋 Found ${templates.length} templates:`);
      
      templates.forEach(template => {
        console.log(`  - ${template.id}: ${template.name}`);
        console.log(`    Commercial: ${template.commercial}, Derivatives: ${template.derivatives}`);
        console.log(`    Royalty: ${template.royaltyPercentage}%`);
      });
      
    } else {
      console.error(`❌ Proxy returned status: ${response.statusCode}`);
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

testServiceFix();