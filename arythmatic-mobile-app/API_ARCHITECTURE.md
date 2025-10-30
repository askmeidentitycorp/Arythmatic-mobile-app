# 🏗️ API Architecture Documentation

## Overview

This React Native app features a **production-ready, scalable API integration** designed to seamlessly transition from mock authentication to real ROPG or Microsoft OAuth authentication.

## 🎯 Key Features

- ✅ **Mock Authentication** (current) → Easy switch to real auth
- ✅ **Encrypted Storage** for all tokens and sensitive data
- ✅ **React Query** for intelligent caching and state management
- ✅ **Axios** with automatic token injection
- ✅ **Centralized Error Handling** with retry logic
- ✅ **Type-safe** data transformations (snake_case ↔ camelCase)
- ✅ **Offline-first** with network detection
- ✅ **Modular Architecture** for easy maintenance

## 📁 Project Structure

```
arythmatic-mobile-app/
├── api/
│   ├── client.js              # Axios instance with interceptors
│   ├── authService.js         # 🔥 Mock/Real auth (MIGRATION POINT)
│   ├── customerService.js     # Customer CRUD operations
│   ├── productService.js      # Product CRUD operations
│   ├── salesRepService.js     # Sales rep operations
│   └── tagService.js          # Tags and entity-tags
│
├── hooks/
│   ├── useCustomersQuery.js   # React Query hooks for customers
│   ├── useProductsQuery.js    # React Query hooks for products
│   └── ...                    # Other entity hooks
│
├── utils/
│   ├── storage.js             # Encrypted storage wrapper
│   ├── errorHandler.js        # Centralized error handling
│   ├── formatters.js          # Data transformations
│   └── networkUtils.js        # Network connectivity helpers
│
├── context/
│   ├── ApiProvider.js         # React Query setup
│   └── AuthContext.js         # Authentication state
│
├── MIGRATION_GUIDE.md         # Detailed migration instructions
└── API_ARCHITECTURE.md        # This file
```

## 🔐 Authentication Flow

### Current: Mock Authentication

```javascript
// User logs in with mock credentials
await signIn({ 
  username: 'test@test.com', 
  password: 'password123' 
});

// Mock token generated locally
const token = 'mock-1-1234567890-abc123';

// Token stored in encrypted storage
await secureStorage.setItem('access_token', token);

// Token automatically attached to all API requests
Authorization: Token mock-1-1234567890-abc123
```

### Future: Real Authentication (ROPG/OAuth)

```javascript
// User logs in with real credentials
await signIn({ 
  username: 'user@company.com', 
  password: 'real-password' 
});

// Real token from backend
const response = await post('/auth/token/obtain/', credentials);
const token = response.access; // Real JWT/DRF token

// Same storage, same flow
await secureStorage.setItem('access_token', token);

// Same authorization header
Authorization: Token <real-token>
```

**Migration**: Change 1 line in `api/authService.js`:

```javascript
// BEFORE:
export const authService = mockAuth;

// AFTER:
export const authService = realAuth;
```

## 🔄 Data Flow

### Reading Data (Query)

```
Component
  → useCustomersQuery hook
    → React Query (cache check)
      → customerService.getCustomers()
        → axios client (adds token)
          → API endpoint
        ← Response
      ← Cached & returned
    ← Data + loading state
  ← Render
```

### Writing Data (Mutation)

```
Component
  → useCreateCustomer hook
    → mutate(newCustomer)
      → keysToSnake(newCustomer)
        → axios.post('/customers/', data)
          → API endpoint
        ← Success response
      ← Data returned
      → queryClient.invalidateQueries()
        → Refetch customer lists
      ← UI updates automatically
```

## 🚀 Quick Start

### 1. Wrap App with Providers

```javascript
// App.js
import { ApiProvider } from './context/ApiProvider';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
    <ApiProvider>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </ApiProvider>
  );
}
```

### 2. Use in Components

```javascript
// screens/CustomerScreen.js
import { useCustomersNested, useCreateCustomerNested } from '../hooks/useCustomersQuery';

function CustomerScreen() {
  const { data: customers, isLoading } = useCustomersNested();
  const createMutation = useCreateCustomerNested();
  
  const handleCreate = () => {
    createMutation.mutate({
      firstName: 'John',
      lastName: 'Doe',
      companyName: 'Acme Corp',
    });
  };
  
  if (isLoading) return <Loader />;
  
  return (
    <FlatList
      data={customers}
      renderItem={({ item }) => <CustomerCard customer={item} />}
    />
  );
}
```

### 3. Handle Authentication

```javascript
// screens/LoginScreen.js
import { useAuth } from '../contexts/AuthContext';

function LoginScreen() {
  const { signIn, isLoading, error } = useAuth();
  
  const handleLogin = async () => {
    await signIn({
      username: email,
      password: password,
    });
  };
}
```

## 🛠️ Available Services

### Customer Service
- `getCustomers(params)` - List customers
- `getCustomersNested(params)` - List with nested data
- `getCustomerById(id)` - Single customer
- `createCustomer(data)` - Create customer
- `updateCustomer(id, data)` - Update customer
- `patchCustomer(id, updates)` - Partial update
- `deleteCustomer(id)` - Delete customer

### Product Service
- `getProducts(params)` - List products
- `getProductById(id)` - Single product
- `createProduct(data)` - Create product
- `updateProduct(id, data)` - Update product
- `deleteProduct(id)` - Delete product

### Sales Rep Service
- `getSalesReps(params)` - List sales reps
- `getSalesRepById(id)` - Single sales rep
- `getSalesPerformance(params)` - Analytics
- `createSalesRep(data)` - Create sales rep
- `updateSalesRep(id, data)` - Update sales rep
- `deleteSalesRep(id)` - Delete sales rep

### Tag Service
- `getTags(params)` - List tags
- `createTag(data)` - Create tag
- `getEntityTags(params)` - Get entity-tag mappings
- `createEntityTag(data)` - Assign tag to entity
- `deleteEntityTag(id)` - Remove tag from entity

## 🎨 Utilities

### Storage (Encrypted)
```javascript
import { secureStorage, StorageKeys } from '../utils/storage';

// Store
await secureStorage.setItem(StorageKeys.ACCESS_TOKEN, token);

// Retrieve
const token = await secureStorage.getItem(StorageKeys.ACCESS_TOKEN);

// Remove
await secureStorage.removeItem(StorageKeys.ACCESS_TOKEN);
```

### Error Handling
```javascript
import { handleAxiosError, shouldRetry } from '../utils/errorHandler';

try {
  await apiCall();
} catch (error) {
  const apiError = handleAxiosError(error);
  console.log(apiError.getUserMessage());
  
  if (shouldRetry(apiError)) {
    // Retry logic
  }
}
```

### Data Formatting
```javascript
import { keysToSnake, keysToCamel, formatCurrency } from '../utils/formatters';

// Convert for API
const apiData = keysToSnake({ firstName: 'John' });
// → { first_name: 'John' }

// Convert from API
const uiData = keysToCamel({ first_name: 'John' });
// → { firstName: 'John' }

// Format currency
formatCurrency(1234.56); // → "$1,234.56"
```

### Network Utils
```javascript
import { isOnline, waitForNetwork } from '../utils/networkUtils';

// Check connectivity
const online = await isOnline();

// Wait for network
const connected = await waitForNetwork(10000); // 10s timeout
```

## 🔧 Configuration

### API Base URL
Located in `api/client.js`:
```javascript
const API_BASE_URL = 'https://interaction-tracker-api-133046591892.us-central1.run.app/api/v1';
```

### React Query Config
Located in `context/ApiProvider.js`:
```javascript
{
  cacheTime: 24 * 60 * 60 * 1000,  // 24 hours
  staleTime: 5 * 60 * 1000,         // 5 minutes
  retry: 2,                         // Retry twice on failure
  refetchOnReconnect: true,         // Refetch when back online
}
```

### Mock Users
Located in `api/authService.js`:
```javascript
const MOCK_USERS = [
  { username: 'test@test.com', password: 'password123' },
  { username: 'demo@demo.com', password: 'demo123' },
];
```

## 📦 Dependencies

```json
{
  "@tanstack/react-query": "Latest",
  "axios": "Latest",
  "react-native-encrypted-storage": "Latest",
  "@react-native-community/netinfo": "Latest"
}
```

## 🚀 Migration Steps

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed instructions.

**TL;DR**:
1. Uncomment real auth in `api/authService.js`
2. Change `export const authService = realAuth`
3. (Optional) Enable token refresh in `api/client.js`
4. Test with real credentials

## 🎓 Best Practices

1. **Always use React Query hooks** instead of direct API calls
2. **Use camelCase in components** (auto-converts to snake_case for API)
3. **Handle loading and error states** properly
4. **Never log tokens** outside of `__DEV__` blocks
5. **Use optimistic updates** for better UX
6. **Invalidate queries** after mutations
7. **Check network connectivity** before critical operations

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Clear storage and re-login |
| Data not updating | Invalidate React Query cache |
| Network errors | Check `isOnline()` before requests |
| Mock login failing | Use correct credentials (see above) |

## 📚 Further Reading

- [React Query Docs](https://tanstack.com/query/latest)
- [Axios Docs](https://axios-http.com/)
- [React Native Encrypted Storage](https://github.com/emeraldsanto/react-native-encrypted-storage)

---

**Built with ❤️ for scalability and maintainability**
