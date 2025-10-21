// debug/testAnalyticsAPI.js
// Script to test individual analytics endpoints and identify HTTP 500 issues

const BASE_URL = "https://interaction-tracker-api-133046591892.us-central1.run.app/api/v1";
const TOKEN = "602a23070f1c92b8812773e645b7bf2f4a1cc4fc";

const testEndpoint = async (endpoint, params = {}) => {
  try {
    let url = `${BASE_URL}${endpoint}`;
    
    if (Object.keys(params).length > 0) {
      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
      url += `?${queryString}`;
    }
    
    console.log(`\n🔍 Testing: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${TOKEN}`
      }
    });
    
    console.log(`📡 Response: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Success:`, JSON.stringify(data, null, 2).substring(0, 500) + '...');
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ Error:`, errorText);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }
  } catch (error) {
    console.log(`💥 Network Error:`, error.message);
    return { success: false, error: error.message };
  }
};

const testAllEndpoints = async () => {
  console.log('🚀 Testing Analytics API Endpoints...\n');
  
  const endpoints = [
    { path: '/analytics/overview/', params: { period: 'month' } },
    { path: '/analytics/revenue/', params: { period: 'month' } },
    { path: '/analytics/sales-performance/', params: { period: 'month' } },
    { path: '/analytics/products/', params: { period: 'month' } },
    { path: '/analytics/team-performance/', params: { period: 'month' } },
    { path: '/analytics/real-time/', params: {} }
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.path, endpoint.params);
    results.push({
      endpoint: endpoint.path,
      ...result
    });
    
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 SUMMARY:');
  console.log('=' .repeat(50));
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.endpoint}`);
    if (!result.success) {
      console.log(`    Error: ${result.error}`);
    }
  });
  
  const passCount = results.filter(r => r.success).length;
  console.log(`\n🎯 Results: ${passCount}/${results.length} endpoints working`);
  
  if (passCount === 0) {
    console.log('\n🔧 TROUBLESHOOTING SUGGESTIONS:');
    console.log('1. Check if the API server is running');
    console.log('2. Verify the authentication token');
    console.log('3. Check network connectivity');
    console.log('4. Review server logs for errors');
  }
};

// Run the test
testAllEndpoints().catch(console.error);

// Usage: node debug/testAnalyticsAPI.js