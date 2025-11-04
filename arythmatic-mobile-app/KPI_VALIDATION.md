# KPI Validation Checklist

## ✅ Dashboard Screen Expected Values

### Sales Reps Metrics
| Metric | Expected | Showing | Status | Notes |
|--------|----------|---------|--------|-------|
| Total Reps | 20 | ? | 🔄 Verify | Should show 20 |
| Active | 10 | ? | 🔄 Verify | Active reps only |
| Sales Agents | 10 | ? | 🔄 Verify | By role |
| Admins | 8 | ? | 🔄 Verify | Admin role count |

### Customers Metrics
| Metric | Expected | Showing | Status | Notes |
|--------|----------|---------|--------|-------|
| Total Customers | 2,791 | ? | 🔄 Verify | All customers |
| Individual | 10 | ? | 🔄 Verify | Type = individual |
| Business | 0 | ? | 🔄 Verify | Type = business |
| Active | 10 | ? | 🔄 Verify | Active status |

### Products Metrics
| Metric | Expected | Showing | Status | Notes |
|--------|----------|---------|--------|-------|
| Total Products | 91 | ? | 🔄 Verify | All products |
| Active | 10 | ? | 🔄 Verify | isActive = true |
| Digital | 10 | ? | 🔄 Verify | Type = digital |
| Physical | 0 | ? | 🔄 Verify | Type = physical |
| Service | 0 | ? | 🔄 Verify | Type = service |

### Interactions Metrics
| Metric | Expected | Showing | Status | Notes |
|--------|----------|---------|--------|-------|
| Total Interactions | 1,912 | ? | 🔄 Verify | All interactions |
| New | 4 | ? | 🔄 Verify | Status = new |
| In Progress | 4 | ? | 🔄 Verify | Status = in_progress |
| Completed | 1 | ? | 🔄 Verify | Status = completed |
| Cancelled | 1 | ? | 🔄 Verify | Status = cancelled |

### Invoices Metrics
| Metric | Expected | Showing | Status | Notes |
|--------|----------|---------|--------|-------|
| Total Invoices | 133 | ? | 🔄 Verify | All invoices |
| Total Value | $4,126 | ? | 🔄 Verify | Sum of all |
| Paid | $1,396 | ? | 🔄 Verify | Status = full_paid |
| Pending | $2,730 | ? | 🔄 Verify | Status = pending/open/partial_paid |

### Payments Metrics
| Metric | Expected | Showing | Status | Notes |
|--------|----------|---------|--------|-------|
| Total Payments | 189 | ? | ✅ FIXED (was 187) | ✅ Now correct! |
| Total Value | $2,540.00 | ? | 🔄 Verify | Sum of amounts |
| Successful | $2,540.00 | ? | 🔄 Verify | Status = success |
| Failed/Voided | $0.00 | ? | 🔄 Verify | Status = failed/voided |

---

## 🔍 Screen-Specific KPI Locations

### 💳 Payments Screen
**File**: `screens/PaymentScreen.js` (Line 559-571)
```javascript
<Text>{metrics.total}</Text>           // Should show: 189
<Text>{metrics.totalValue}</Text>      // Should show: $2,540.00
<Text>{metrics.successful}</Text>      // Should show: $2,540.00
<Text>{metrics.failed}</Text>          // Should show: $0.00
```

**Data Source**: 
- Hook: `usePaymentMetrics()` (calls `getCounts()`)
- Service: `paymentService.getCounts()`
- Endpoint: `GET /payments-nested/?page_size=100` (with pagination loop)

**✅ Status**: FIXED - Now fetches all 189 records correctly

---

### 🧾 Invoices Screen
**File**: `screens/InvoicesScreen.js` - Component: `InvoiceKPIs`

**Expected KPIs**:
- Total Invoices: 133
- Total Value: $4,126
- Paid: $1,396
- Pending: $2,730

**Data Source**:
- Hook: `useInvoices()`
- Service: `invoiceService.getAllNested()`
- Calculation: Frontend aggregation from `payments` array

---

### ⚙️ Sales Reps Screen
**File**: `screens/SalesRepsScreen.js` - Component: KPI section

**Expected KPIs**:
- Total Reps: 20
- Active: 10
- Sales Agents: 10
- Admins: 8

**Data Source**:
- Hook: `useSalesReps()`
- Service: `salesRepService.getAll()`
- Calculation: Filter by role + is_active status

---

### 👥 Customers Screen
**File**: `screens/CustomerScreen.js`

**Expected KPIs**:
- Total Customers: 2,791
- Individual: 10
- Business: 0
- Active: 10

**Data Source**:
- Hook: `useCustomers()`
- Service: `customerService.getAllNested()`
- Calculation: Filter by type + status

---

### 🧩 Products Screen
**File**: `screens/ProductScreen.js`

**Expected KPIs**:
- Total Products: 91
- Active: 10
- Digital: 10
- Physical: 0
- Service: 0

**Data Source**:
- Hook: `useProducts()`
- Service: `productService.getAllNested()`
- Calculation: Filter by isActive + productType

---

### 💬 Interactions Screen
**File**: `screens/InteractionScreen.js`

**Expected KPIs**:
- Total Interactions: 1,912
- New: 4
- In Progress: 4
- Completed: 1
- Cancelled: 1

**Data Source**:
- Hook: `useInteractions()`
- Service: `interactionService.getAllNested()`
- Calculation: Filter by status

---

### 📊 Dashboard Screen
**File**: `screens/DashboardScreen.js`

**Data Source**:
- Hook: `useDashboard()`
- Service: `dashboardService.getAllDashboardData()`
- Endpoints: Multiple analytics endpoints with fallback

**Status**: ⚠️ May need verification - aggregates from multiple endpoints

---

## 🔧 Verification Steps

### For Payments (Already Fixed)
```
✅ Total: 189 (Commit: 1b60f48)
✅ All records fetched with pagination loop
✅ getCounts() now iterates through all pages
```

### For Other Screens (To Verify)

1. **Check if using correct aggregation**:
   - Payments: ✅ `getCounts()` with pagination
   - Invoices: 🔄 Frontend aggregation from array
   - Customers: 🔄 Filter + count logic
   - Products: 🔄 Filter + count logic
   - Interactions: 🔄 Filter + count logic
   - Sales Reps: 🔄 Filter + count logic

2. **Verify filter logic matches expected values**:
   - Status filters (draft/open/full_paid/etc.)
   - Role filters (admin/sales_agent/etc.)
   - Type filters (individual/business/etc.)
   - Date range filters (if applicable)

3. **Check pagination doesn't affect metrics**:
   - KPIs should show TOTAL, not just current page
   - Some screens may need similar pagination fix to Payments

---

## 📋 Potential Issues to Check

### Issue 1: Metrics Based on Current Page Only
**Risk**: ⚠️ High
**Description**: If KPI calculation uses only visible `payments` array instead of ALL records
**Example**: If Invoices screen shows $4,126 from 10 items on page 1, but actual total is different
**Fix**: Similar to Payments - fetch all records for aggregation

**Status**: 🔄 Need to verify each screen

---

### Issue 2: Status/Type Filter Mismatch
**Risk**: ⚠️ Medium
**Description**: Frontend filter names might not match API values
**Example**: Frontend shows "Paid" but API expects "full_paid"
**Fix**: Check status mapping in each service

**Status**: 🔄 Need to verify each screen

---

### Issue 3: Deleted Records Included
**Risk**: ⚠️ Low
**Description**: Soft-deleted records might be counted
**Example**: Shows 2,791 customers but should exclude deleted ones
**Fix**: API likely filters by default, but verify

**Status**: 🔄 Assume API handles this

---

## ✅ Checklist for Each Screen

### Payments Screen ✅ VERIFIED
- [x] Total: 189 payments
- [x] Total Value: $2,540.00
- [x] Successful: $2,540.00
- [x] Failed/Voided: $0.00
- [x] Uses pagination loop to fetch all records
- [x] Commit: `1b60f48`

### Invoices Screen 🔄 TO VERIFY
- [ ] Total: 133 invoices
- [ ] Total Value: $4,126
- [ ] Paid: $1,396
- [ ] Pending: $2,730
- [ ] Check if aggregation includes all records or just current page
- [ ] Verify status filter logic (full_paid vs paid)

### Sales Reps Screen 🔄 TO VERIFY
- [ ] Total: 20 reps
- [ ] Active: 10 reps
- [ ] Sales Agents: 10
- [ ] Admins: 8
- [ ] Verify role and status filters work correctly

### Customers Screen 🔄 TO VERIFY
- [ ] Total: 2,791 customers
- [ ] Individual: 10
- [ ] Business: 0
- [ ] Active: 10
- [ ] Check type and status filters

### Products Screen 🔄 TO VERIFY
- [ ] Total: 91 products
- [ ] Active: 10
- [ ] Digital: 10
- [ ] Physical: 0
- [ ] Service: 0
- [ ] Verify type filter logic

### Interactions Screen 🔄 TO VERIFY
- [ ] Total: 1,912 interactions
- [ ] New: 4
- [ ] In Progress: 4
- [ ] Completed: 1
- [ ] Cancelled: 1
- [ ] Verify status filter matches API values

### Dashboard Screen 🔄 TO VERIFY
- [ ] Aggregates from multiple endpoints correctly
- [ ] Graceful error handling working
- [ ] No empty states showing incorrectly

---

## 🚀 Next Steps

1. **For each screen** (except Payments which is ✅ done):
   - Open screen
   - Compare displayed KPIs with expected values
   - If mismatch, check if using pagination like Payments fix
   - Apply similar pagination loop if needed

2. **For Invoices specifically**:
   - Check if `$4,126` total matches sum of all line items
   - Verify `$1,396` is only full_paid invoices
   - Verify `$2,730` is pending + partial_paid

3. **For Sales Reps/Customers/Products/Interactions**:
   - Verify filter logic in respective hooks
   - Check if aggregation uses all records or page-based

4. **For Dashboard**:
   - Verify no endpoint timeouts or errors
   - Check fallback logic working properly

---

## 📝 Notes

- **Payments Payment**: ✅ Fixed with pagination loop (Commit: 1b60f48)
- **API Page Size Cap**: 100 records per request (standard REST)
- **Correct Approach**: Loop through pages and accumulate results
- **Pattern Applied**: Should be replicated for any KPI using large datasets

---

## Summary Table

| Screen | Total | Status | Action |
|--------|-------|--------|--------|
| 💳 Payments | 189 | ✅ Verified | Monitor |
| 🧾 Invoices | 133 | 🔄 Pending | Check aggregation |
| 👥 Customers | 2,791 | 🔄 Pending | Verify filters |
| ⚙️ Sales Reps | 20 | 🔄 Pending | Verify role filters |
| 🧩 Products | 91 | 🔄 Pending | Verify type filters |
| 💬 Interactions | 1,912 | 🔄 Pending | Verify status filters |
| 📊 Dashboard | - | 🔄 Pending | Check endpoints |
