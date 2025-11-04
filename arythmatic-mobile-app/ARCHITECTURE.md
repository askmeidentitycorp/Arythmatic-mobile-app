# Arythmatic Mobile App - Architecture & API Documentation

## Table of Contents
1. [Navigation Architecture](#navigation-architecture)
2. [Screen Overview](#screen-overview)
3. [API Endpoints](#api-endpoints)
4. [CRUD Operations](#crud-operations)
5. [Data Flow](#data-flow)

---

## Navigation Architecture

### Navigation System
**Type**: Custom state-based navigation (not React Navigation Stack)
**Location**: `App.js`

### Core State Variables
```javascript
const [currentScreen, setCurrentScreen] = useState("Dashboard");     // "Dashboard" or "Business"
const [businessScreen, setBusinessScreen] = useState("SalesReps");  // Active business screen
const [navigationParams, setNavigationParams] = useState(null);      // Pass data between screens
const [navigationContext, setNavigationContext] = useState(null);    // Track origin screen
const [showPaymentDetails, setShowPaymentDetails] = useState(false); // Modal overlay flag
```

### Screen Hierarchy
```
App.js (Main)
├── Dashboard Screen (currentScreen === "Dashboard")
└── Business Screens (currentScreen === "Business")
    ├── Sales Reps (businessScreen === "SalesReps")
    ├── Customers (businessScreen === "Customers")
    ├── Products (businessScreen === "Products")
    ├── Interactions (businessScreen === "Interactions")
    ├── Invoices (businessScreen === "Invoices")
    └── Payments (businessScreen === "Payments")
    
    └── Payment Details Modal (showPaymentDetails === true)
```

### Navigation Functions
```javascript
navigateToInteractions(params)  // params: {repId, repName, customerId, customerName, from}
navigateToInvoices(params)      // params: {salesRepId, salesRepName, customerId, customerName, from}
navigateBackFromContext()       // Smart back button based on navigationContext
navigateToPaymentDetails(id)    // Show payment details as modal overlay
```

### Sidebar Integration
File: `components/Sidebar`

Sidebar calls these functions:
- `setCurrentScreen("Dashboard")` → Dashboard
- `setCurrentScreen("Business"); setBusinessScreen("SalesReps")` → Sales Reps
- `setCurrentScreen("Business"); setBusinessScreen("Customers")` → Customers
- `setCurrentScreen("Business"); setBusinessScreen("Products")` → Products
- `setCurrentScreen("Business"); setBusinessScreen("Interactions")` → Interactions
- `setCurrentScreen("Business"); setBusinessScreen("Invoices")` → Invoices
- `setCurrentScreen("Business"); setBusinessScreen("Payments")` → Payments

---

## Screen Overview

| Screen | File | Hook | Status | CRUD |
|--------|------|------|--------|------|
| Dashboard | `screens/DashboardScreen.js` | `useDashboard()` | Analytics | R only |
| Sales Reps | `screens/SalesRepsScreen.js` | `useSalesReps()` | ✅ | CRUD ✅ |
| Customers | `screens/CustomerScreen.js` | `useCustomers()` | ✅ | CRUD ✅ |
| Products | `screens/ProductScreen.js` | `useProducts()` | ✅ | CRUD ✅ |
| Interactions | `screens/InteractionScreen.js` | `useInteractions()` | ✅ | CRUD ✅ |
| Invoices | `screens/InvoicesScreen.js` | `useInvoices()` | ✅ | CRUD ✅ |
| Payments | `screens/PaymentScreen.js` | `usePayments()` | ⚠️ 75% | CRU❌D (no Create) |
| Payment Details | `screens/PaymentdetailsScreen.js` | - | Modal | Read |

---

## API Endpoints

### Base URL
```
https://interaction-tracker-api-133046591892.us-central1.run.app/api/v1
```

### Authentication
- **Type**: Token-based (Authorization header)
- **Header**: `Authorization: Token {token}`
- **Storage**: AsyncStorage (STORAGE_KEYS.AUTH_TOKEN)
- **Provider**: AuthContext

### 1. Sales Reps Endpoints
```
GET    /sales-reps/              List all sales reps (paginated)
GET    /sales-reps/{id}/         Get single rep
POST   /sales-reps/              Create new rep
PUT    /sales-reps/{id}/         Full update rep
PATCH  /sales-reps/{id}/         Partial update (e.g., toggle active)
DELETE /sales-reps/{id}/         Soft delete rep
```

**Fields**: id, name, email, is_active, created_at, updated_at

---

### 2. Customers Endpoints
```
GET    /customers/               List all customers (paginated)
GET    /customers/{id}/          Get single customer
POST   /customers/               Create customer
PUT    /customers/{id}/          Full update customer
PATCH  /customers/{id}/          Partial update
DELETE /customers/{id}/          Soft delete customer

GET    /customers-nested/        List with nested contact_details, interactions, invoices
```

**Fields**: id, firstName, lastName, email, phone, company, address, tags, notes, created_at, updated_at

---

### 3. Products Endpoints
```
GET    /products/                List all products (paginated, filter by isActive)
GET    /products/{id}/           Get single product
POST   /products/                Create product
PUT    /products/{id}/           Full update product
PATCH  /products/{id}/           Partial update (toggle isActive, update price)
DELETE /products/{id}/           Soft delete product

GET    /products-nested/         List with nested prices and notes
```

**Fields**: id, label, productType, isActive, price, description, created_at, updated_at

---

### 4. Invoices Endpoints
```
GET    /invoices/                List all invoices (paginated, filterable)
GET    /invoices/{id}/           Get single invoice
POST   /invoices/                Create invoice with line_items
PUT    /invoices/{id}/           Full update invoice
PATCH  /invoices/{id}/           Partial update (status, due_date, etc.)
DELETE /invoices/{id}/           Soft delete invoice

POST   /invoices/{id}/send/      Send invoice to customer
POST   /invoices/{id}/pdf/       Generate/download PDF
POST   /invoices/{id}/mark-as-paid/  Mark invoice as paid

GET    /invoices-nested/         List with nested customer_details, line_items, payments
```

**Fields**: id, invoiceNumber, customer_id, status, currency, dueDate, paymentTerms, discountAmount, soldBy, taxRate, notes, created_at, updated_at

**Statuses**: draft, open, sent, partial_paid, full_paid, overdue, cancelled

**Line Items**: id, invoice_id, product_id, name, quantity, price, amount

---

### 5. Payments Endpoints
```
GET    /payments/                List all payments (paginated, filterable)
GET    /payments/{id}/           Get single payment
POST   /payments/                Create payment (TODO - not yet in screen)
PATCH  /payments/{id}/           Update payment (status, amount, etc.)
DELETE /payments/{id}/           Soft delete payment

POST   /payments/{id}/process/   Process payment (update status)
POST   /payments/{id}/void/      Void payment
POST   /payments/{id}/refund/    Refund payment

GET    /payments-nested/         List with nested invoice_details, customer_details
```

**Fields**: id, invoice_id, amount, currency, status, payment_method, payment_date, transaction_id, created_at, updated_at

**Statuses**: Success, Pending, Failed, Voided

**Payment Methods**: Online, Offline, Credit Card, Bank Transfer

---

### 6. Interactions Endpoints
```
GET    /interactions/            List interactions (filter by customer, sales_rep)
GET    /interactions/{id}/       Get single interaction
POST   /interactions/            Create interaction
PUT    /interactions/{id}/       Full update interaction
PATCH  /interactions/{id}/       Partial update (notes, tags, follow_up_date)
DELETE /interactions/{id}/       Delete interaction
```

**Fields**: id, customer_id, sales_rep_id, interaction_type, date, notes, tags, follow_up_date, created_at, updated_at

**Types**: Call, Demo, Meeting, Email, Follow-up

---

### 7. Tags & Entity Tags Endpoints
```
GET    /tags/                    List all tags
POST   /tags/                    Create tag
GET    /tags/{id}/               Get single tag

GET    /entity-tags/             List entity-tag mappings
POST   /entity-tags/             Link tag to entity (customer, product, interaction)
DELETE /entity-tags/{id}/        Unlink tag
```

---

## CRUD Operations

### Operations by Screen

#### 💳 Payments Screen (100% complete)
| Operation | Endpoint | Status |
|-----------|----------|--------|
| Read (List) | `GET /payments/` | ✅ Paginated with filters |
| Read (Single) | `GET /payments/{id}/` | ✅ Modal overlay |
| Create | `POST /payments/` | ✅ Record Payment form |
| Update | `PATCH /payments/{id}/` | ✅ Edit Payment & status updates (Process, Void, Refund) |
| Delete | `DELETE /payments/{id}/` | ✅ Soft delete |

**Available Actions**: Create, View, Edit, Process, Void, Refund, Delete, Export CSV

**Form Fields** (Record/Edit Payment):
- Invoice ID (UUID, required)
- Amount (numeric, required)
- Currency (USD, INR, EUR, GBP)
- Payment Method (Credit Card, Bank Transfer, Online, Offline)
- Status (success, pending, failed, voided)
- Transaction ID (external ref like Stripe ID)
- Payment Date (YYYY-MM-DD)
- External Reference (notes)

**Integration**: Auto-updates linked invoice balance and status on successful payment creation

---

#### 🧾 Invoices Screen (100% complete)
| Operation | Endpoint | Status |
|-----------|----------|--------|
| Read (List) | `GET /invoices/` | ✅ Paginated |
| Read (Single) | `GET /invoices/{id}/` | ✅ View details |
| Create | `POST /invoices/` | ✅ Modal form |
| Update | `PUT /PATCH /invoices/{id}/` | ✅ Full & partial |
| Delete | `DELETE /invoices/{id}/` | ✅ |

**Available Actions**: Create, View, Edit, Duplicate, Send, Mark as Paid/Draft/Open/Void, Record Payment, Download PDF, Delete, Export CSV

---

#### 👥 Customers Screen (100% complete)
| Operation | Endpoint | Status |
|-----------|----------|--------|
| Read (List) | `GET /customers/` | ✅ Paginated |
| Read (Single) | `GET /customers/{id}/` | ✅ Profile |
| Create | `POST /customers/` | ✅ Form |
| Update | `PUT/PATCH /customers/{id}/` | ✅ |
| Delete | `DELETE /customers/{id}/` | ✅ |

**Available Actions**: Create, View Profile, Edit, Delete

---

#### ⚙️ Sales Reps Screen (100% complete)
| Operation | Endpoint | Status |
|-----------|----------|--------|
| Read (List) | `GET /sales-reps/` | ✅ Paginated |
| Read (Single) | `GET /sales-reps/{id}/` | ✅ Profile |
| Create | `POST /sales-reps/` | ✅ Form |
| Update | `PATCH /sales-reps/{id}/` | ✅ Edit, Toggle active |
| Delete | `DELETE /sales-reps/{id}/` | ✅ |

**Available Actions**: Create, View, Edit, Delete, View Interactions, View Invoices

---

#### 💬 Interactions Screen (100% complete)
| Operation | Endpoint | Status |
|-----------|----------|--------|
| Read (List) | `GET /interactions/` | ✅ Filtered by rep/customer |
| Read (Single) | `GET /interactions/{id}/` | ✅ |
| Create | `POST /interactions/` | ✅ Form |
| Update | `PATCH /interactions/{id}/` | ✅ Notes, tags |
| Delete | `DELETE /interactions/{id}/` | ✅ |

**Available Actions**: Create, View, Edit, Tag, Delete

---

#### 🧩 Products Screen (100% complete)
| Operation | Endpoint | Status |
|-----------|----------|--------|
| Read (List) | `GET /products/` | ✅ Paginated |
| Read (Single) | `GET /products/{id}/` | ✅ Details |
| Create | `POST /products/` | ✅ Form |
| Update | `PATCH /products/{id}/` | ✅ Edit, Toggle active |
| Delete | `DELETE /products/{id}/` | ✅ |

**Available Actions**: Create, View, Edit, Delete

---

#### 📊 Dashboard Screen (Read-only)
- **Metrics**: Total revenue, invoices, customers, payments, success rate
- **Charts**: Top products, top customers, sales rep performance
- **No CRUD**: Analytics only

---

## Data Flow

### Flow 1: Sales Rep → Interactions → Invoices → Payments
```
1. User opens Sales Reps Screen
   ├─ GET /sales-reps/
   └─ Displays paginated list
   
2. User clicks on rep → Interactions Screen
   ├─ navigationContext = { from: 'SalesReps' }
   ├─ navigationParams = { repId, repName }
   ├─ GET /interactions/?sales_rep={id}
   └─ Displays filtered interactions
   
3. User selects customer → Invoices Screen (optional)
   ├─ navigationParams = { customerId, customerName }
   ├─ GET /invoices/?customer={id}
   └─ Displays customer's invoices
   
4. User clicks invoice → Payment Details
   ├─ showPaymentDetails = true
   ├─ GET /payments/{id}/
   └─ Modal overlay with payment details
   
5. Back button restores Sales Reps (via navigationContext)
```

### Flow 2: Create/Edit Invoice
```
1. User clicks "+ Create Invoice" or "Edit"
   ├─ Modal opens with tabs
   ├─ Tab 1: Invoice Details (customer, status, currency, etc.)
   ├─ Tab 2: Line Items (dynamic form)
   ├─ Tab 3: Taxes (rate, calculation)
   └─ Live total calculation
   
2. User submits
   ├─ POST /invoices/ (if new)
   └─ PUT/PATCH /invoices/{id}/ (if edit)
   
3. Success → List refreshes automatically
```

### Flow 3: Payment Status Updates
```
1. User clicks payment action (Process, Void, Refund)
   ├─ Confirmation alert shown
   ├─ User confirms
   ├─ PATCH /payments/{id}/status/ or POST /payments/{id}/{action}/
   └─ List refreshes
```

---

## Query Parameters

### Pagination
```
?page=1&page_size=10
```

### Filters (Payments)
```
?search={transaction_id|customer_name|invoice_number}
&status={Success|Pending|Failed|Voided}
&payment_method={Online|Offline|Credit Card|Bank Transfer}
&min_amount={number}&max_amount={number}
```

### Filters (Invoices)
```
?search={invoice_number|customer}
&status={draft|open|partial_paid|full_paid|overdue|cancelled}
&currency={USD|EUR|INR|GBP}
&customer={customer_id}
```

### Filters (Interactions)
```
?sales_rep={rep_id}
&customer={customer_id}
&interaction_type={Call|Demo|Meeting|Email|Follow-up}
```

### Filters (Products)
```
?search={name|type}
&is_active={true|false}
```

---

## Key Features

### ✅ Context-Aware Navigation
- Tracks which screen user came from via `navigationContext`
- Smart back buttons that restore previous screen
- Parameter passing between screens

### ✅ Pagination
- Default: 10 items/page
- Supports custom page_size
- Provides: currentPage, totalPages, totalCount, hasNext, hasPrevious

### ✅ Search & Filtering
- Debounced at 300ms
- Multi-field search
- Status, currency, date range filters
- Amount range filters

### ✅ Export
- CSV batch export (200 items/page)
- Platform-specific file handling (Web, Android, iOS)
- Automatic file naming with timestamps

### ✅ Modal Overlays
- Payment Details renders as overlay with Sidebar still visible
- Invoice/Payment creation forms in expandable modals
- Smooth animations

### ✅ Soft Deletes
- All deletions are soft (records marked as deleted, not removed)
- No hard deletes visible to users

---

## Architecture Patterns

### Custom Hooks Pattern
Each screen uses two hooks:
```javascript
// Data fetching & state management
const { data, loading, error, refresh, pagination, goToPage } = useEntity(filters, pageSize);

// Mutations (create, update, delete)
const { createEntity, updateEntity, deleteEntity } = useEntityMutations();
```

### State Lifting
All navigation state managed at App.js level for consistent cross-screen navigation.

### Service Layer
```
Services/
├─ customerService.js       // API calls for customers
├─ paymentService.js        // API calls for payments
├─ invoiceService.js        // API calls for invoices
├─ productService.js        // API calls for products
├─ interactionService.js    // API calls for interactions
├─ salesRepService.js       // API calls for sales reps
└─ apiClient.js             // Base API client with auth
```

### Component Hierarchy
```
App.js (Navigation + State)
├─ Sidebar (Navigation)
├─ DashboardScreen
├─ SalesRepsScreen
│  └─ SalesRepCard
├─ InteractionsScreen
│  └─ InteractionCard
├─ InvoicesScreen
│  ├─ InvoiceHeader
│  ├─ InvoiceKPIs
│  ├─ InvoiceSearchAndFilters
│  └─ InvoiceCard
├─ PaymentScreen
│  ├─ PaymentCard
│  └─ KPI
└─ PaymentdetailsScreen (Modal)
```

---

## Notes

- **Pagination**: All list endpoints default to page_size=10
- **Search**: Debounced 300ms to avoid excessive API calls
- **CSV Export**: Fetches all records in batches of 200
- **Authentication**: All endpoints require valid token
- **Soft Deletes**: Records marked deleted but not removed from DB
- **Time Format**: ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)
- **Status Tracking**: Each entity has created_at, updated_at timestamps
