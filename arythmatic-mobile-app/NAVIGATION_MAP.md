# Navigation Map - Arythmatic Sales Tracker

## State Variables

```javascript
const [currentScreen, setCurrentScreen] = useState("Dashboard");  // "Dashboard" or "Business"
const [businessScreen, setBusinessScreen] = useState("SalesReps"); // Active business screen
const [navigationParams, setNavigationParams] = useState(null);     // Pass data between screens
const [navigationContext, setNavigationContext] = useState(null);   // Track origin screen
```

## Main Navigation Routes

| Screen | Route | File |
|--------|-------|------|
| Dashboard | `currentScreen === "Dashboard"` | `screens/DashboardScreen` |
| Sales Reps | `currentScreen === "Business" && businessScreen === "SalesReps"` | `screens/SalesRepsScreen` |
| Customers | `currentScreen === "Business" && businessScreen === "Customers"` | `screens/CustomerScreen` |
| Products | `currentScreen === "Business" && businessScreen === "Products"` | `screens/ProductScreen` |
| Interactions | `currentScreen === "Business" && businessScreen === "Interactions"` | `screens/InteractionScreen` |
| Invoices | `currentScreen === "Business" && businessScreen === "Invoices"` | `screens/InvoicesScreen` |
| Payments | `currentScreen === "Business" && businessScreen === "Payments"` | `screens/PaymentScreen` |
| Payment Details | `showPaymentDetails === true` | `screens/PaymentdetailsScreen` |

## Navigation Flows

### Sales Rep Flow
1. **Sales Reps Screen** → `navigation.navigate('Interactions', { repId, repName })`
2. **Interactions Screen** → `navigation.navigate('Invoices', { salesRepId, salesRepName })`
3. **Invoices Screen** → `onNavigateToDetails(paymentId)` → **Payment Details Modal**

### Sidebar Navigation
Clicking sidebar items calls:
- `setCurrentScreen("Dashboard")` for Dashboard
- `setCurrentScreen("Business"); setBusinessScreen("SalesReps")` for any business screen

### Back Navigation
- **navigationContext** tracks source screen
- Smart back buttons restore original screen via `navigateBackFromContext()`
