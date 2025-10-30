# API Integration Migration Guide

## 📚 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Current State (Mock Auth)](#current-state-mock-auth)
3. [Migration to Real Auth](#migration-to-real-auth)
4. [Usage Examples](#usage-examples)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

This app uses a **modular, layered architecture** designed for easy migration from mock to real authentication:

```
┌─────────────────────────────────────────┐
│           React Components              │
│         (Screens, UI Logic)             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│        React Query Hooks                │
│  (useCustomers, useProducts, etc.)      │
│  • Caching & state management           │
│  • Automatic refetching                 │
│  • Optimistic updates                   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         API Services                    │
│  (customerService, authService, etc.)   │
│  • Business logic                       │
│  • Data transformation                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         API Client (Axios)              │
│  • HTTP requests                        │
│  • Token interceptors                   │
│  • Error handling                       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Encrypted Storage                  │
│  • Secure token storage                 │
│  • User data persistence                │
└─────────────────────────────────────────┘
```

### Key Files

| Layer | Files | Purpose |
|-------|-------|---------|
| **Utilities** | `utils/storage.js`, `utils/errorHandler.js`, `utils/formatters.js` | Core helpers |
| **API Client** | `api/client.js` | Axios instance with interceptors |
| **Auth Service** | `api/authService.js` | **🔥 MIGRATION POINT** |
| **API Services** | `api/customerService.js`, `api/productService.js`, etc. | Entity CRUD |
| **React Query** | `context/ApiProvider.js` | Query client setup |
| **Hooks** | `hooks/useCustomersQuery.js`, etc. | React Query hooks |
| **Context** | `contexts/AuthContext.js` | Auth state management |

---

## Current State (Mock Auth)

### How Mock Auth Works

The app currently uses **simulated authentication**:

1. **Mock Users**: Defined in `api/authService.js`
   ```javascript
   const MOCK_USERS = [
     { username: 'test@test.com', password: 'password123' },
     { username: 'demo@demo.com', password: 'demo123' }
   ];
   ```

2. **Mock Tokens**: Generated locally
   ```javascript
   const token = `mock-${user.id}-${timestamp}-${random}`;
   ```

3. **Storage**: Tokens stored in encrypted storage (same as real auth)

4. **API Calls**: Mock tokens sent with every request (API doesn't validate them)

### Why Mock Auth?

- ✅ **Safe Development**: No risk of using real credentials
- ✅ **Offline Testing**: Works without backend connectivity
- ✅ **Same Flow**: Uses identical storage/context as real auth
- ✅ **Easy Migration**: Switch with 1 line change

---

## Migration to Real Auth

### Step 1: Configure Real Auth Endpoint

When your backend is ready, uncomment the real auth logic in `api/authService.js`:

```javascript
// api/authService.js (lines 190-338)

const realAuth = {
  login: async (username, password) => {
    // ✅ UNCOMMENT THIS BLOCK:
    const response = await post('/auth/token/obtain/', {
      username,
      password,
    });

    const { access, refresh, user } = response;

    await secureStorage.setItem(StorageKeys.ACCESS_TOKEN, access);
    await secureStorage.setItem(StorageKeys.REFRESH_TOKEN, refresh);
    await secureStorage.setItem(StorageKeys.USER_DATA, user);

    return {
      user,
      tokens: {
        accessToken: access,
        refreshToken: refresh,
      },
    };
  },
  // ... rest of realAuth methods
};
```

### Step 2: Switch Auth Export

Change line 332 in `api/authService.js`:

```javascript
// BEFORE (Mock):
export const authService = mockAuth;

// AFTER (Real):
export const authService = realAuth;
```

### Step 3: Enable Token Refresh (Optional)

Uncomment the token refresh logic in `api/client.js` (lines 93-128):

```javascript
// api/client.js response interceptor
if (error.response?.status === 401) {
  if (!originalRequest._retry) {
    originalRequest._retry = true;
    
    const refreshToken = await secureStorage.getItem(StorageKeys.REFRESH_TOKEN);
    
    if (refreshToken) {
      const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
        refresh: refreshToken,
      });
      
      const { access } = response.data;
      await secureStorage.setItem(StorageKeys.ACCESS_TOKEN, access);
      
      originalRequest.headers.Authorization = `Token ${access}`;
      return apiClient(originalRequest);
    }
  }
}
```

### Step 4: Test

1. **Clear app data** to remove mock tokens
2. **Login with real credentials**
3. **Verify API calls** work with real tokens

---

## Usage Examples

### Using React Query Hooks (Recommended)

```javascript
import { useCustomersNested, useCreateCustomerNested } from '../hooks/useCustomersQuery';

function CustomerScreen() {
  // Fetch customers with automatic caching
  const { data: customers, isLoading, error } = useCustomersNested();
  
  // Create mutation
  const createMutation = useCreateCustomerNested({
    onSuccess: () => {
      Alert.alert('Success', 'Customer created!');
    },
  });
  
  const handleCreate = () => {
    createMutation.mutate({
      firstName: 'John',
      lastName: 'Doe',
      companyName: 'Acme Corp',
      email: 'john@acme.com',
    });
  };
  
  if (isLoading) return <Loader />;
  if (error) return <Text>Error: {error.message}</Text>;
  
  return (
    <FlatList
      data={customers}
      renderItem={({ item }) => <CustomerCard customer={item} />}
    />
  );
}
```

### Direct API Service Usage

```javascript
import { getCustomers, createCustomer } from '../api/customerService';

async function fetchCustomers() {
  try {
    const customers = await getCustomers({ page: 1, limit: 20 });
    console.log(customers);
  } catch (error) {
    console.error('Failed to fetch:', error.message);
  }
}
```

### Authentication Flow

```javascript
import { useAuth } from '../contexts/AuthContext';

function LoginScreen() {
  const { signIn, isLoading, error } = useAuth();
  
  const handleLogin = async () => {
    try {
      await signIn({
        username: email,
        password: password,
      });
      // Navigate to dashboard
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    }
  };
}
```

---

## Best Practices

### 1. Use React Query Hooks (Not Direct API Calls)

**✅ DO:**
```javascript
const { data, isLoading } = useCustomers();
```

**❌ DON'T:**
```javascript
const [customers, setCustomers] = useState([]);
useEffect(() => {
  customerService.getAll().then(setCustomers);
}, []);
```

**WHY**: React Query provides caching, automatic refetching, and better error handling.

### 2. Use camelCase in Components

The API uses `snake_case`, but our services auto-convert:

```javascript
// ✅ Use camelCase in your code
const newCustomer = {
  firstName: 'John',
  lastName: 'Doe',
  companyName: 'Acme',
};

createCustomer(newCustomer); // Auto-converts to snake_case
```

### 3. Handle Loading and Error States

```javascript
const { data, isLoading, isError, error } = useCustomers();

if (isLoading) return <Loader />;
if (isError) return <ErrorView message={error.message} />;
return <CustomerList data={data} />;
```

### 4. Use Optimistic Updates

```javascript
const updateMutation = useUpdateCustomer({
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(customerKeys.detail(newData.id));
    
    // Optimistically update cache
    const previous = queryClient.getQueryData(customerKeys.detail(newData.id));
    queryClient.setQueryData(customerKeys.detail(newData.id), newData);
    
    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(customerKeys.detail(newData.id), context.previous);
  },
});
```

### 5. Never Log Tokens in Production

```javascript
// ✅ Safe (only logs in dev)
if (__DEV__) {
  console.log('Token:', token);
}

// ❌ NEVER DO THIS
console.log('Token:', token);
```

---

## Troubleshooting

### Issue: "401 Unauthorized" errors

**Cause**: Token is invalid or expired

**Solution**:
1. Check if token refresh is enabled (see Step 3 above)
2. Clear app storage and re-login
3. Verify backend token validation

### Issue: Mock login not working

**Cause**: Using wrong credentials

**Solution**: Use one of the mock accounts:
- `test@test.com` / `password123`
- `demo@demo.com` / `demo123`

### Issue: Data not refetching

**Cause**: React Query cache is stale

**Solution**:
```javascript
const { data, refetch } = useCustomers();

// Force refetch
refetch();

// Or invalidate cache
queryClient.invalidateQueries(customerKeys.lists());
```

### Issue: Network errors offline

**Cause**: App tries to fetch without connectivity

**Solution**: React Query automatically retries. Optionally check connectivity:

```javascript
import { isOnline } from '../utils/networkUtils';

const online = await isOnline();
if (!online) {
  Alert.alert('Offline', 'Please check your connection');
}
```

---

## Summary

### Migration Checklist

- [ ] Backend ROPG endpoint ready (`/auth/token/obtain/`)
- [ ] Uncomment real auth logic in `api/authService.js`
- [ ] Change export from `mockAuth` to `realAuth`
- [ ] (Optional) Enable token refresh in `api/client.js`
- [ ] Clear app storage for testing
- [ ] Test login with real credentials
- [ ] Verify API calls work with real tokens

### Key Advantages of This Architecture

1. **One-line migration** from mock to real auth
2. **Type-safe** with consistent error handling
3. **Secure** with encrypted token storage
4. **Performant** with React Query caching
5. **Maintainable** with clear separation of concerns

---

**Questions?** Check the inline comments in each file for detailed explanations.
