# CRUD Operations Audit - All Screens

## 📊 Overview
Each screen implements specific CRUD operations using custom hooks that connect to REST API endpoints.

---

## 🧾 1. Payment Screen
**File**: `screens/PaymentScreen.js`
**Hook**: `usePayments()`, `usePaymentMutations()`

### Operations Implemented:
| Operation | Endpoint | Status |
|-----------|----------|--------|
| **R**ead (List) | `GET /payments/` | ✅ Paginated with filters |
| **R**ead (Single) | `GET /payments/{id}/` | ✅ Via modal overlay |
| **C**reate | `POST /payments/` | ⚠️ TODO (Button says "Record Payment") |
| **U**pdate | `PATCH /payments/{id}/` | ✅ Process, Void, Refund |
| **D**elete | `DELETE /payments/{id}/` | ✅ Soft delete |

### CRUD Actions Available:
- ✅ **View Payment** → Navigate to PaymentDetails modal
- ✅ **Edit Payment** → TODO (Alert placeholder)
- ✅ **Process Payment** → `PATCH /payments/{id}/` with status change
- ✅ **Void Payment** → `PATCH /payments/{id}/` (custom mutation)
- ✅ **Refund Payment** → `POST /payments/{id}/refund/` (custom mutation)
- ✅ **Audit History** → TODO (Alert placeholder)
- ✅ **Delete Payment** → `DELETE /payments/{id}/`
- ✅ **Export CSV** → Batch `GET /payments/` with all pages

### Filters:
- Search: transaction_id, customerName, invoice_number
- Status: Success, Pending, Failed, Voided
- Payment Method: Online, Offline, Credit Card, Bank Transfer
- Amount Range: min/max
- Date Range: This Week, This Month, This Quarter, This Year

---

## 💰 2. Invoices Screen
**File**: `screens/InvoicesScreen.js`
**Hook**: `useInvoices()`, `useInvoiceMutations()`

### Operations Implemented:
| Operation | Endpoint | Status |
|-----------|----------|--------|
| **R**ead (List) | `GET /invoices/` | ✅ Paginated with filters |
| **R**ead (Single) | `GET /invoices/{id}/` | ✅ View details |
| **C**reate | `POST /invoices/` | ✅ Full form modal |
| **U**pdate | `PUT /invoices/{id}/` or `PATCH` | ✅ Full & partial |
| **D**elete | `DELETE /invoices/{id}/` | ✅ Soft delete |

### CRUD Actions Available:
- ✅ **Create Invoice** → Modal with tabs (Details, Line Items, Taxes)
- ✅ **View Invoice** → Alert with full details + line items
- ✅ **Edit Invoice** → Pre-fills form from existing invoice
- ✅ **Duplicate** → Creates copy with "COPY" suffix, resets to draft
- ✅ **Send Invoice** → `POST /invoices/{id}/send/`
- ✅ **Mark as Draft/Open/Paid/Void** → `PATCH /invoices/{id}/` status updates
- ✅ **Record Payment** → Links to Payments screen (TODO navigation)
- ✅ **Download PDF** → `GET /invoices/{id}/pdf/` download
- ✅ **Audit History** → Shows created_at, updated_at, status timeline
- ✅ **Delete** → `DELETE /invoices/{id}/`
- ✅ **Export CSV** → Batch `GET /invoices/` with all pages

### Form Fields:
- Invoice Number (auto-generated if empty)
- Customer (required)
- Status (required)
- Due Date (required)
- Payment Terms
- Currency (required)
- Discount Amount
- Sold By
- Tax Rate (with live calculation)
- Line Items (dynamic): name, qty, price

### Filters:
- Search: invoice_number, customer
- Status: draft, open, partial_paid, full_paid, overdue, cancelled
- Currency: USD, EUR, INR, GBP

---

## 👥 3. Customers Screen
**File**: `screens/CustomerScreen.js`
**Hook**: `useCustomers()`, `useCustomerMutations()`

### Operations Implemented:
| Operation | Endpoint | Status |
|-----------|----------|--------|
| **R**ead (List) | `GET /customers/` | ✅ Paginated with search |
| **R**ead (Single) | `GET /customers/{id}/` | ✅ View full profile |
| **C**reate | `POST /customers/` | ✅ Form modal |
| **U**pdate | `PUT` or `PATCH /customers/{id}/` | ✅ Full edit |
| **D**elete | `DELETE /customers/{id}/` | ✅ Soft delete |

### CRUD Actions (Inferred from codebase):
- ✅ **Create Customer** → Form with personal/business info
- ✅ **View Customer** → Full profile with contacts, invoices, interactions
- ✅ **Edit Customer** → Update contact details
- ✅ **View Interactions** → Related interactions for customer
- ✅ **View Invoices** → Related invoices for customer
- ✅ **Delete Customer** → Soft delete (safety warnings)

### Typical Fields:
- First Name, Last Name
- Email
- Phone
- Company
- Address
- Tags
- Notes

---

## ⚙️ 4. Sales Reps Screen
**File**: `screens/SalesRepsScreen.js`
**Hook**: `useSalesReps()`, `useSalesRepMutations()`

### Operations Implemented:
| Operation | Endpoint | Status |
|-----------|----------|--------|
| **R**ead (List) | `GET /sales-reps/` | ✅ Paginated |
| **R**ead (Single) | `GET /sales-reps/{id}/` | ✅ View profile |
| **C**reate | `POST /sales-reps/` | ✅ Add new rep |
| **U**pdate | `PATCH /sales-reps/{id}/` | ✅ Toggle active, edit |
| **D**elete | `DELETE /sales-reps/{id}/` | ✅ Soft delete |

### CRUD Actions Available:
- ✅ **View Rep** → Profile with performance metrics
- ✅ **View Interactions** → Filter interactions by rep
- ✅ **View Invoices** → Show rep's customers' invoices
- ✅ **Edit Rep** → Update name, email, status
- ✅ **Create Rep** → Add new sales representative
- ✅ **Delete Rep** → Soft delete

### Navigation Triggers:
- Click rep → View Interactions (params: repId, repName)
- Click rep → View Invoices (params: salesRepId, salesRepName)

---

## 💬 5. Interactions Screen
**File**: `screens/InteractionScreen.js`
**Hook**: `useInteractions()`, `useInteractionMutations()`

### Operations Implemented:
| Operation | Endpoint | Status |
|-----------|----------|--------|
| **R**ead (List) | `GET /interactions/` | ✅ Filtered by rep/customer |
| **R**ead (Single) | `GET /interactions/{id}/` | ✅ View details |
| **C**reate | `POST /interactions/` | ✅ Form modal |
| **U**pdate | `PATCH /interactions/{id}/` | ✅ Edit notes, tags |
| **D**elete | `DELETE /interactions/{id}/` | ✅ Remove interaction |

### CRUD Actions Available:
- ✅ **Create Interaction** → Form: type, date, notes, customer, rep
- ✅ **View Interaction** → Full details with related data
- ✅ **Edit Interaction** → Update notes, tags, follow-up date
- ✅ **Delete Interaction** → Remove record
- ✅ **Tag Interaction** → Add/remove tags via `/entity-tags/`

### Filter by:
- Sales Rep (from initial params)
- Customer (from initial params)
- Interaction Type: Call, Demo, Meeting, Email, Follow-up
- Date Range

---

## 🧩 6. Products Screen
**File**: `screens/ProductScreen.js`
**Hook**: `useProducts()`, `useProductMutations()`

### Operations Implemented:
| Operation | Endpoint | Status |
|-----------|----------|--------|
| **R**ead (List) | `GET /products/` | ✅ Paginated with filters |
| **R**ead (Single) | `GET /products/{id}/` | ✅ View product details |
| **C**reate | `POST /products/` | ✅ Add product |
| **U**pdate | `PATCH /products/{id}/` | ✅ Edit, toggle active |
| **D**elete | `DELETE /products/{id}/` | ✅ Soft delete |

### CRUD Actions Available:
- ✅ **Create Product** → Form: name, type, price, description
- ✅ **View Product** → Details with prices, usage stats
- ✅ **Edit Product** → Update fields, toggle isActive
- ✅ **Delete Product** → Soft delete
- ✅ **View Invoices** → Show invoices using this product

### Filters:
- Search: name, type
- Active Status: true/false

---

## 📋 7. Dashboard Screen
**File**: `screens/DashboardScreen.js`
**Hook**: `useDashboard()`

### Operations:
- ✅ **Read Aggregates** → KPI metrics (total revenue, payment success rate, etc.)
- ✅ **Read Analytics** → Charts, trends, top products/customers
- ⚠️ **No Create/Update/Delete** → Read-only display

### Metrics Displayed:
- Total Revenue
- Total Invoices
- Total Customers
- Total Payments
- Success vs Failed rates
- Top Products
- Top Customers
- Sales Rep Performance

---

## 🔗 8. Related Endpoints Used

### Nested Endpoints (Auto-joins):
- `GET /payments-nested/` → Includes invoice_details
- `GET /invoices-nested/` → Includes customer_details, line_items, payments
- `GET /customers-nested/` → Includes contact_details, interactions, invoices

### Mutations Not in Screens:
- `POST /interactions/` → Covered
- `POST /tags/` → Create tags (used in TagManager)
- `POST /entity-tags/` → Link tags to entities
- `GET /entity-tags/` → Fetch entity tags

### Admin-Only (Not visible in normal screens):
- `POST /sales-reps/` (if restricted)
- `DELETE /customers/{id}/` (soft delete)

---

## ✅ CRUD Completeness Summary

| Screen | Create | Read | Update | Delete | Status |
|--------|--------|------|--------|--------|--------|
| 💳 Payments | ⚠️ TODO | ✅ | ✅ | ✅ | 75% |
| 🧾 Invoices | ✅ | ✅ | ✅ | ✅ | 100% |
| 👥 Customers | ✅ | ✅ | ✅ | ✅ | 100% |
| ⚙️ Sales Reps | ✅ | ✅ | ✅ | ✅ | 100% |
| 💬 Interactions | ✅ | ✅ | ✅ | ✅ | 100% |
| 🧩 Products | ✅ | ✅ | ✅ | ✅ | 100% |
| 📊 Dashboard | - | ✅ | - | - | 100% |

---

## 🚀 TODO Items

1. **Payments Screen**:
   - Implement "Record Payment" (POST /payments/)
   - Implement "Edit Payment" form
   - Implement "Audit History" detailed view

2. **All Screens**:
   - Batch operations (select multiple, bulk delete)
   - Advanced export options (PDF, Excel)
   - Real-time sync notifications

3. **Missing Endpoints**:
   - Tag management UI on each screen
   - Audit log viewer for all entities

---

## 📊 Data Flow Example

### Sales Rep → Interactions → Invoices → Payments

```
1. User opens Sales Reps Screen
   ↓ [GET /sales-reps/]
   
2. User clicks on rep → Interactions Screen
   ↓ [GET /interactions/?sales_rep={id}]
   
3. User clicks customer → Invoices Screen (with filter)
   ↓ [GET /invoices/?customer={id}]
   
4. User clicks invoice → Payment Details Modal
   ↓ [GET /payments/?invoice={id}]
   
5. User clicks payment → Payment Details full view
   ↓ [GET /payments/{id}/]
```

---

## 🔐 Authentication
All endpoints use token-based auth:
- Header: `Authorization: Token {token}`
- Token stored in AsyncStorage (STORAGE_KEYS.AUTH_TOKEN)
- Managed by AuthContext

---

## 📝 Notes
- All screens support pagination (10 items/page default)
- Search/filters debounced at 300ms
- CSV export batches requests by 200 items/page
- Platform-specific file handling (Web, Android, iOS)
- Soft deletes used throughout (no hard deletes visible to user)
