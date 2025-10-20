// testCurrencyConversion.js
// Test script to verify currency conversion matches website

console.log('🧮 Testing Currency Conversion Logic\n');

// Current API data (from our test)
const apiData = {
  summary_by_currency: {
    INR: { total_revenue: 243500.0, sales_count: 8 },
    USD: { total_revenue: 240.0, sales_count: 2 }
  }
};

// Exchange rates from mobile app
const exchangeRates = {
  USD: { INR: 87.94, EUR: 0.85, USD: 1 },
  INR: { USD: 0.01137, EUR: 0.00967, INR: 1 },
  EUR: { USD: 1.18, INR: 103.46, EUR: 1 }
};

function calculateTotalRevenue(currency = 'USD') {
  console.log(`📊 Calculating total revenue in ${currency}:`);
  console.log('─'.repeat(40));
  
  let totalRevenue = 0;
  let totalSales = 0;
  let isConverted = false;

  // Try to get data for selected currency first
  const currencyData = apiData.summary_by_currency[currency.toUpperCase()];
  if (currencyData) {
    totalRevenue = currencyData.total_revenue || 0;
    totalSales = currencyData.sales_count || 0;
    console.log(`✅ Found direct ${currency} data: ${totalRevenue}`);
  } else {
    console.log(`❌ No direct ${currency} data found, converting from other currencies`);
  }

  // If selected currency not available or we want to include all currencies, convert from available currencies
  const availableCurrencies = Object.keys(apiData.summary_by_currency);
  if (availableCurrencies.length > 0) {
    let convertedRevenue = 0;
    let totalSalesFromAll = 0;
    
    console.log('\n🔄 Converting from all available currencies:');
    
    availableCurrencies.forEach(fromCurrency => {
      const currData = apiData.summary_by_currency[fromCurrency];
      const amount = currData.total_revenue || 0;
      const sales = currData.sales_count || 0;
      
      // Convert to selected currency
      const rate = exchangeRates[fromCurrency]?.[currency.toUpperCase()] || 1;
      const convertedAmount = amount * rate;
      
      console.log(`  ${fromCurrency}: ${amount} × ${rate} = ${convertedAmount.toFixed(2)} ${currency}`);
      
      convertedRevenue += convertedAmount;
      totalSalesFromAll += sales;
    });
    
    totalRevenue = convertedRevenue;
    totalSales = totalSalesFromAll;
    isConverted = true;
    
    console.log(`\n💰 Total converted revenue: ${convertedRevenue.toFixed(2)} ${currency}`);
    console.log(`📈 Total sales: ${totalSales}`);
  }

  return {
    totalRevenue: totalRevenue,
    totalSales: totalSales,
    isConverted: isConverted,
    formatted: `$${Math.round(totalRevenue).toLocaleString()}`
  };
}

// Test different currencies
const currencies = ['USD', 'INR', 'EUR'];

currencies.forEach(curr => {
  const result = calculateTotalRevenue(curr);
  console.log(`\n🏁 Result for ${curr}:`);
  console.log(`   Revenue: ${result.formatted}`);
  console.log(`   Sales: ${result.totalSales}`);
  console.log(`   Converted: ${result.isConverted ? 'Yes' : 'No'}`);
  console.log('═'.repeat(50));
});

// Test the exact calculation for USD (what website shows)
console.log('\n🎯 EXACT USD CALCULATION (for website comparison):');
console.log('─'.repeat(50));

const inrAmount = 243500.0;
const usdAmount = 240.0;
const inrToUsdRate = 0.01137;

const convertedINR = inrAmount * inrToUsdRate;
const totalUSD = convertedINR + usdAmount;

console.log(`INR Amount: ₹${inrAmount.toLocaleString()}`);
console.log(`USD Amount: $${usdAmount}`);
console.log(`INR to USD Rate: ${inrToUsdRate}`);
console.log(`Converted INR: ₹${inrAmount.toLocaleString()} × ${inrToUsdRate} = $${convertedINR.toFixed(2)}`);
console.log(`Total USD: $${convertedINR.toFixed(2)} + $${usdAmount} = $${totalUSD.toFixed(2)}`);
console.log(`Formatted: $${Math.round(totalUSD).toLocaleString()}`);

console.log('\n📊 WEBSITE COMPARISON:');
console.log(`Mobile App Should Show: $${Math.round(totalUSD).toLocaleString()}`);
console.log(`Website Shows: $3,005`);
console.log(`Difference: $${Math.abs(3005 - Math.round(totalUSD))}`);

if (Math.abs(3005 - Math.round(totalUSD)) < 10) {
  console.log('✅ VALUES MATCH! (within $10 difference)');
} else {
  console.log('❌ VALUES DON\'T MATCH - may need rate adjustment');
}