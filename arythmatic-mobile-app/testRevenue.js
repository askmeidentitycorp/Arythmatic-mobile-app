// testRevenue.js
// Test script to check revenue API values

const fetch = require('node-fetch');

const BASE_URL = "https://interaction-tracker-api-133046591892.us-central1.run.app/api/v1";
const TOKEN = "602a23070f1c92b8812773e645b7bf2f4a1cc4fc";

async function testRevenueAPI() {
  console.log('🧪 Testing Revenue API...\n');

  try {
    // Test 1: Get revenue data for different periods
    const periods = ['week', 'month', 'quarter', 'year'];
    
    for (const period of periods) {
      console.log(`📊 Testing Revenue API for period: ${period}`);
      console.log('─'.repeat(50));
      
      const url = `${BASE_URL}/analytics/revenue/?period=${period}`;
      console.log(`🔗 URL: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${TOKEN}`
        }
      });

      console.log(`📡 Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ Error Response: ${errorText}`);
        continue;
      }

      const data = await response.json();
      console.log('✅ Revenue API Response:');
      console.log(JSON.stringify(data, null, 2));
      
      // Analyze the data structure
      if (data.summary_by_currency) {
        console.log('\n💰 Revenue by Currency:');
        Object.entries(data.summary_by_currency).forEach(([currency, currencyData]) => {
          console.log(`  ${currency}: ${currencyData.total_revenue || 0} (Sales: ${currencyData.sales_count || 0})`);
        });
      }
      
      if (data.total_sales_count !== undefined) {
        console.log(`\n💵 Total Sales Count: ${data.total_sales_count}`);
      }
      
      if (data.trends_by_currency) {
        console.log(`\n📈 Trends Data: ${data.trends_by_currency.length} periods`);
        data.trends_by_currency.forEach((trend, index) => {
          console.log(`  Period ${index + 1}: ${trend.period}`);
          if (trend.currencies) {
            Object.entries(trend.currencies).forEach(([curr, currData]) => {
              console.log(`    ${curr}: ${currData.revenue || 0}`);
            });
          }
        });
      }
      
      console.log('\n' + '='.repeat(60) + '\n');
    }
    
    // Test 2: Test overview API (contains revenue summary)
    console.log('📋 Testing Overview API...');
    console.log('─'.repeat(50));
    
    const overviewUrl = `${BASE_URL}/analytics/overview/`;
    console.log(`🔗 URL: ${overviewUrl}`);
    
    const overviewResponse = await fetch(overviewUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${TOKEN}`
      }
    });

    if (overviewResponse.ok) {
      const overviewData = await overviewResponse.json();
      console.log('✅ Overview API Response:');
      console.log(JSON.stringify(overviewData, null, 2));
      
      if (overviewData.metrics?.sales) {
        console.log(`\n💰 Sales Metrics: Current: ${overviewData.metrics.sales.current}, Previous: ${overviewData.metrics.sales.previous}`);
      }
    } else {
      console.log(`❌ Overview API Error: ${overviewResponse.status}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('🔍 Full Error:', error);
  }
}

// Run the test
testRevenueAPI().then(() => {
  console.log('🏁 Revenue API test completed');
}).catch(err => {
  console.error('💥 Test script error:', err);
});