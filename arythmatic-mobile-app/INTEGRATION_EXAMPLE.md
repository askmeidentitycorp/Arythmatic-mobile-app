# Integration Example: Updating Existing Code

This guide shows how to update your existing screens to use the new API architecture.

## Before & After Comparison

### Example 1: Customer Screen

#### ❌ BEFORE (Old approach)

```javascript
// screens/CustomerScreen.js (OLD)
import React, { useState, useEffect } from 'react';
import { customerService } from '../services/customerService';

function CustomerScreen() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    loadCustomers();
  }, []);
  
  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAllNested();
      setCustomers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreate = async (customerData) => {
    try {
      await customerService.createNested(customerData);
      loadCustomers(); // Manual refetch
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };
  
  if (loading) return <Loader />;
  if (error) return <Text>Error: {error}</Text>;
  
  return <CustomerList data={customers} onCreate={handleCreate} />;
}
```

#### ✅ AFTER (New approach with React Query)

```javascript
// screens/CustomerScreen.js (NEW)
import React from 'react';
import { useCustomersNested, useCreateCustomerNested } from '../hooks/useCustomersQuery';

function CustomerScreen() {
  // Single hook replaces all the useState/useEffect logic
  const { data: customers, isLoading, error } = useCustomersNested();
  
  // Mutation automatically refetches after success
  const createMutation = useCreateCustomerNested({
    onSuccess: () => {
      Alert.alert('Success', 'Customer created!');
    },
    onError: (err) => {
      Alert.alert('Error', err.message);
    },
  });
  
  const handleCreate = (customerData) => {
    createMutation.mutate(customerData);
  };
  
  if (isLoading) return <Loader />;
  if (error) return <Text>Error: {error.message}</Text>;
  
  return <CustomerList data={customers} onCreate={handleCreate} />;
}
```

**Benefits:**
- ✅ Less code (no manual state management)
- ✅ Automatic caching (instant on subsequent visits)
- ✅ Automatic refetching after mutations
- ✅ Better error handling
- ✅ Retry logic built-in

---

### Example 2: Login Screen

#### ❌ BEFORE (Using old auth controller)

```javascript
// screens/LoginScreen.js (OLD)
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import authController from '../services/authController';

function LoginScreen() {
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async () => {
    try {
      setLoading(true);
      await authController.signIn({ username, password });
      // Navigate manually
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };
}
```

#### ✅ AFTER (Using new AuthContext with new auth service)

```javascript
// screens/LoginScreen.js (NEW)
import { useAuth } from '../contexts/AuthContext';

function LoginScreen() {
  const { signIn, isLoading, error } = useAuth();
  
  const handleLogin = async () => {
    try {
      await signIn({ username, password });
      // AuthContext automatically navigates after successful login
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    }
  };
  
  return (
    <View>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title={isLoading ? 'Logging in...' : 'Login'}
        onPress={handleLogin}
        disabled={isLoading}
      />
      {error && <Text style={{color: 'red'}}>{error}</Text>}
    </View>
  );
}
```

---

### Example 3: Product Screen with Filtering

#### ❌ BEFORE

```javascript
// screens/ProductScreen.js (OLD)
function ProductScreen() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadProducts();
  }, [search]); // Fetches on every search change
  
  const loadProducts = async () => {
    setLoading(true);
    const data = await productService.getAll({ search });
    setProducts(data);
    setLoading(false);
  };
}
```

#### ✅ AFTER

```javascript
// screens/ProductScreen.js (NEW)
import { useProducts } from '../hooks/useProductsQuery';
import { useDebounce } from '../hooks/useDebounce'; // Or lodash debounce

function ProductScreen() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500); // Wait 500ms after typing
  
  // Automatically refetches when debouncedSearch changes
  const { data: products, isLoading } = useProducts({ search: debouncedSearch });
  
  return (
    <View>
      <SearchBar value={search} onChangeText={setSearch} />
      {isLoading ? (
        <Loader />
      ) : (
        <ProductList products={products} />
      )}
    </View>
  );
}
```

**Benefits:**
- ✅ Smart caching (same search = instant results)
- ✅ Debouncing prevents excessive API calls
- ✅ Previous data shown while loading new results

---

### Example 4: Editing with Optimistic Updates

#### ❌ BEFORE

```javascript
// screens/CustomerEditScreen.js (OLD)
function CustomerEditScreen({ customerId }) {
  const [customer, setCustomer] = useState(null);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    loadCustomer();
  }, [customerId]);
  
  const loadCustomer = async () => {
    const data = await customerService.getById(customerId);
    setCustomer(data);
  };
  
  const handleSave = async (updates) => {
    setSaving(true);
    await customerService.update(customerId, updates);
    setSaving(false);
    loadCustomer(); // Refetch to get latest data
  };
}
```

#### ✅ AFTER

```javascript
// screens/CustomerEditScreen.js (NEW)
import { useCustomer, useUpdateCustomer } from '../hooks/useCustomersQuery';

function CustomerEditScreen({ customerId }) {
  const { data: customer, isLoading } = useCustomer(customerId);
  
  const updateMutation = useUpdateCustomer({
    // Optimistic update: UI updates immediately
    onMutate: async (newData) => {
      // Show updated data instantly
      await queryClient.cancelQueries(['customers', 'detail', customerId]);
      const previous = queryClient.getQueryData(['customers', 'detail', customerId]);
      queryClient.setQueryData(['customers', 'detail', customerId], newData);
      return { previous };
    },
    // Rollback if error
    onError: (err, newData, context) => {
      queryClient.setQueryData(['customers', 'detail', customerId], context.previous);
      Alert.alert('Error', 'Failed to save changes');
    },
    onSuccess: () => {
      Alert.alert('Success', 'Changes saved!');
    },
  });
  
  const handleSave = (updates) => {
    updateMutation.mutate({ id: customerId, data: updates });
  };
  
  if (isLoading) return <Loader />;
  
  return <CustomerForm customer={customer} onSave={handleSave} />;
}
```

**Benefits:**
- ✅ Instant UI feedback (optimistic update)
- ✅ Automatic rollback on error
- ✅ No manual refetching needed
- ✅ Better UX with loading states per mutation

---

## Step-by-Step Migration

### 1. Update App.js to include new providers

```javascript
// App.js
import { ApiProvider } from './context/ApiProvider';
import AuthProvider from './contexts/AuthContext';

export default function App() {
  return (
    <ApiProvider>
      <AuthProvider>
        {/* Your existing navigation */}
        <NavigationContainer>
          <Stack.Navigator>
            {/* ... */}
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </ApiProvider>
  );
}
```

### 2. Update imports in screens

```javascript
// OLD:
import { customerService } from '../services/customerService';

// NEW:
import { useCustomersNested, useCreateCustomerNested } from '../hooks/useCustomersQuery';
```

### 3. Replace state management with React Query hooks

```javascript
// OLD:
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
useEffect(() => { loadData(); }, []);

// NEW:
const { data, isLoading } = useCustomersNested();
```

### 4. Replace manual mutations with mutation hooks

```javascript
// OLD:
const handleCreate = async (newItem) => {
  await service.create(newItem);
  loadData(); // Manual refetch
};

// NEW:
const createMutation = useCreateCustomer();
const handleCreate = (newItem) => {
  createMutation.mutate(newItem); // Auto refetches
};
```

### 5. Update authentication

```javascript
// OLD:
import authController from '../services/authController';
await authController.signIn({ username, password });

// NEW:
import { useAuth } from '../contexts/AuthContext';
const { signIn } = useAuth();
await signIn({ username, password });
```

---

## Common Patterns

### Pattern 1: List with Create/Update/Delete

```javascript
function EntityScreen() {
  const { data, isLoading } = useEntities();
  const createMutation = useCreateEntity();
  const updateMutation = useUpdateEntity();
  const deleteMutation = useDeleteEntity();
  
  return (
    <EntityList
      data={data}
      isLoading={isLoading}
      onCreate={(item) => createMutation.mutate(item)}
      onUpdate={(id, updates) => updateMutation.mutate({ id, data: updates })}
      onDelete={(id) => deleteMutation.mutate(id)}
    />
  );
}
```

### Pattern 2: Master-Detail with Deep Linking

```javascript
function EntityDetailScreen({ route }) {
  const { id } = route.params;
  const { data: entity, isLoading, error } = useEntity(id);
  
  if (isLoading) return <Loader />;
  if (error) return <ErrorView error={error} />;
  if (!entity) return <NotFoundView />;
  
  return <EntityDetail entity={entity} />;
}
```

### Pattern 3: Form with Validation

```javascript
function EntityFormScreen({ route }) {
  const { id } = route.params; // undefined for create
  const isEditing = !!id;
  
  const { data: entity } = useEntity(id, { enabled: isEditing });
  const createMutation = useCreateEntity();
  const updateMutation = useUpdateEntity();
  
  const handleSubmit = (formData) => {
    if (isEditing) {
      updateMutation.mutate({ id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };
  
  return (
    <EntityForm
      initialValues={entity}
      onSubmit={handleSubmit}
      isSubmitting={createMutation.isLoading || updateMutation.isLoading}
    />
  );
}
```

---

## Testing the Migration

### 1. Test Mock Login
```javascript
// Use mock credentials
Username: test@test.com
Password: password123
```

### 2. Test CRUD Operations
- Create a customer
- Edit a customer
- Delete a customer
- Verify data persists after app refresh (caching)

### 3. Test Offline Behavior
- Turn off network
- Navigate around app (should show cached data)
- Try to create/edit (should show error)
- Turn on network
- Retry (should work)

### 4. Test Token Persistence
- Login
- Close app completely
- Reopen app
- Should still be logged in

---

## Troubleshooting Migration

| Issue | Solution |
|-------|----------|
| "useQuery is not defined" | Add `import { useQuery } from '@tanstack/react-query'` |
| "Cannot read property 'data' of undefined" | Wrap app with `<ApiProvider>` |
| Data not refetching | Check `queryClient.invalidateQueries()` is called after mutations |
| Auth state not persisting | Verify `<AuthProvider>` wraps navigation |
| Network errors | Check API base URL in `api/client.js` |

---

## Next Steps

1. ✅ Update App.js with providers
2. ✅ Migrate one screen at a time (start with simple read-only screens)
3. ✅ Test each screen thoroughly
4. ✅ Update complex screens with mutations
5. ✅ Test end-to-end flows
6. ✅ Remove old service imports once all screens migrated
7. ✅ Deploy and monitor

---

**Pro Tip**: Keep both old and new code side-by-side during migration. Only remove old code after confirming new code works perfectly.
