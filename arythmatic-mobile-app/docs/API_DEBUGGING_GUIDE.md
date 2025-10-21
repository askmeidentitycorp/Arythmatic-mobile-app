# API Data Debugging Guide

## Overview
This guide helps you identify and fix issues where your mobile app is retrieving wrong or inconsistent data from the API endpoints.

## Quick Diagnosis

### 1. Add Debug Button to Any Screen

```javascript
import ApiTestButton from '../components/DebugComponents/ApiTestButton';

// Add this to any screen's render method
<ApiTestButton />
```

This will show a button (only in development) that tests API consistency.

### 2. Console Debugging

All hooks now include enhanced logging. Check your console for:
- `🐛 DEBUG useCustomers:` - Shows which endpoint is being called
- `📞 API Call:` - Shows the exact API request
- `📥 Raw Response:` - Shows the API response structure

### 3. Manual Testing

```javascript
// In any component or console
import apiDebugger from '../utils/apiDebugger';

// Quick test
const summary = await apiDebugger.quickDataCheck();

// Compare specific endpoints
const customerComparison = await apiDebugger.debugHookBehavior('Customers', customerService);

// Test dashboard data
const dashboardTest = await apiDebugger.testDashboardData();
```

## Common Issues and Fixes

### Issue 1: Wrong Data Returned

**Symptoms:**
- Customer screen shows products
- Product screen shows invoices  
- Data doesn't match what's expected

**Cause:** Using wrong endpoint (nested vs regular)

**Fix:**
```javascript
// Check current hook usage
const { customers } = useCustomers(params, 20, true); // nested=true
const { products } = useProducts(params, 20, false); // nested=false

// Run comparison test
const test = await apiDebugger.debugHookBehavior('Customers', customerService);
console.log('Recommendation:', test.analysis.recommendation);
```

### Issue 2: Missing or Incomplete Data

**Symptoms:**
- Objects missing expected properties
- Pagination not working correctly
- Empty results when data exists

**Cause:** Different response structures between endpoints

**Fix:**
```javascript
// Test data structure
const validation = apiDebugger.validateDataStructure(
  yourData, 
  ['expectedField1', 'expectedField2']
);

if (!validation.valid) {
  console.log('Missing fields:', validation.missingFields);
  console.log('Available fields:', validation.availableFields);
}
```

### Issue 3: Inconsistent Pagination

**Symptoms:**
- Page numbers don't work correctly
- Wrong number of items per page
- Navigation buttons don't work

**Cause:** Inconsistent parameter naming

**Fix:**
- All hooks now use standardized parameters: `{ page, page_size }`
- Removed redundant `limit` parameter from useCustomers

### Issue 4: Dashboard Data Issues

**Symptoms:**
- KPIs show wrong numbers
- Charts don't load
- Currency conversion problems

**Cause:** Complex multi-endpoint API structure

**Fix:**
```javascript
// Test dashboard data quality
const dashboardTest = await apiDebugger.testDashboardData();

// Check specific currency data
const currencyData = dashboardData?.revenue?.summary_by_currency?.USD;
```

## Hook Configuration Guidelines

### When to Use Nested Endpoints (`useNested = true`)

Use nested endpoints when you need:
- Related data (customer orders, product categories)
- Complete object relationships
- Dashboard views with multiple data sources

**Example:**
```javascript
// Customer detail view - needs related orders/interactions
const { customers } = useCustomers(params, 20, true);

// Dashboard - needs complete analytics data
const dashboardData = useDashboard(params);
```

### When to Use Simple Endpoints (`useNested = false`)

Use simple endpoints when you need:
- Basic list views
- Search functionality
- Fast loading for mobile
- Simple CRUD operations

**Example:**
```javascript
// Product list view - just need basic info
const { products } = useProducts(params, 20, false);

// Invoice list - basic data sufficient
const { invoices } = useInvoices(params, 10, false);
```

## Debugging Workflow

1. **Identify the Issue**
   - Use debug button on affected screen
   - Check console logs for errors

2. **Compare Endpoints**
   - Run `apiDebugger.debugHookBehavior()` for the entity
   - Check if nested vs regular returns different data

3. **Validate Data Structure** 
   - Use `apiDebugger.validateDataStructure()` to check fields
   - Ensure expected properties are present

4. **Test Fixes**
   - Switch between nested/regular endpoints
   - Verify data consistency
   - Test pagination and filtering

5. **Update Hook Configuration**
   - Adjust `useNested` parameter based on requirements
   - Update search parameters if needed

## Global Debug Access

In development mode, the debugger is available globally:

```javascript
// In React Native debugger console
apiDebugger.quickDataCheck().then(console.log);

// Test specific service
apiDebugger.debugHookBehavior('Products', productService).then(console.log);
```

## Performance Tips

1. **Use Simple Endpoints for Lists**: Faster loading, less bandwidth
2. **Use Nested Endpoints for Details**: Complete data when needed
3. **Implement Proper Caching**: Consider React Query for complex scenarios
4. **Monitor Network Requests**: Use debug logs to optimize API calls

## Next Steps

If issues persist after following this guide:

1. Check network connectivity and API server status
2. Verify authentication tokens are valid
3. Review API documentation for endpoint specifications
4. Consider implementing retry mechanisms for failed requests
5. Add error boundaries for graceful error handling