# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Arythmatic Mobile App** is a React Native (Expo) sales tracking and CRM mobile application for managing customers, sales representatives, products, interactions, invoices, and payments. The app connects to a Django REST Framework backend API and features a pluggable authentication system supporting both test mode and Microsoft Azure AD (MSAL).

## Commands

### Development
```bash
# Start Expo development server
npm start

# Start on specific platform
npm run android
npm run ios
npm run web
```

### Testing
There are no automated test scripts defined. To test:
- Use `npm start` and manually test features
- Reference `TESTING_CHECKLIST.md` for manual testing scenarios
- Test API connections: Check `services/apiClient.js` for `testConnection()` and `testAuth()` methods

### Environment Setup
- Copy `.env.sample` to `.env`
- Set `AUTH_PROVIDER=test` for development (default)
- Set `AUTH_PROVIDER=msal` for production with Microsoft Azure AD
- Configure MSAL credentials if using Azure AD authentication

## Architecture

### Application Structure

**Entry Point Flow:**
`index.js` → `App.js` → `AuthProvider` → `ProtectedRoute` → `AppContent`

**Navigation:**
The app uses a custom navigation system (not React Navigation library) with:
- Sidebar-based navigation (`Sidebar.js`)
- State-managed screen switching in `App.js`
- Custom navigation props created by `createNavigationProp()` function
- Context-aware back navigation through `navigationContext` state

### Key Directories

- **`components/`** - Reusable UI components organized by feature (Customer, Dashboard, Interaction, Invoice, Payment, Product, SalesRep)
- **`contexts/`** - React Context providers (currently only `AuthContext.js`)
- **`screens/`** - Main screen components (Dashboard, Customer, Product, SalesReps, Interactions, Invoices, Payments)
- **`services/`** - API clients and business logic services for each entity
- **`constants/`** - Configuration files (`config.js` for colors, `authConfig.js` for auth settings)
- **`hooks/`** - Custom React hooks (e.g., `useDashboard` for analytics data)
- **`utils/`** - Utility functions

### Authentication Architecture

**Multi-Provider System:** The app uses a controller pattern to support multiple authentication providers:

1. **`authController.js`** - Central controller that routes auth calls to the appropriate provider
2. **`AuthContext.js`** - React Context managing global authentication state using `useReducer`
3. **`ProtectedRoute.js`** - Guards that prevent unauthorized access
4. **Auth Providers:**
   - `testProvider.js` - Mock authentication for development (username/password)
   - `msalProvider.js` - Microsoft Azure AD authentication (OIDC/OAuth2)

**Configuration:**
- Set provider via `AUTH_PROVIDER` in `.env` (values: `test`, `msal`, `oidc`)
- Test mode credentials in `constants/authConfig.js` → `TEST_CONFIG.validCredentials`
- MSAL configuration in `constants/authConfig.js` → `MSAL_CONFIG`

**Flow:**
- User credentials → `authController.signIn()` → Provider-specific implementation → Tokens stored → `AuthContext` updated → Dashboard rendered
- See `docs/AUTHENTICATION_FLOW_CHART.md` for detailed Mermaid flowchart

### API Integration

**Backend:** Django REST Framework API hosted at `https://interaction-tracker-api-133046591892.us-central1.run.app/api/v1`

**API Client (`services/apiClient.js`):**
- Singleton instance handling all HTTP requests
- Token-based authentication (`Authorization: Token <token>`)
- AsyncStorage for token persistence
- Note: Currently uses hardcoded token for development (`HARDCODED_TOKEN`)

**Service Layer:** Each entity has a dedicated service file:
- `dashboardService.js` - Analytics endpoints with fallback data
- `customerService.js` - Customer CRUD operations
- `productService.js` - Product management
- `salesRepService.js` - Sales rep management
- `interactionService.js` - Interaction tracking
- `invoiceService.js` - Invoice management
- `paymentService.js` - Payment processing

**Error Handling Strategy:**
- Dashboard service has graceful degradation with fallback data (`getDefaultOverviewData()`, etc.)
- Sequential API calls with delays to prevent server overload
- Error states shown in UI but app continues with available data

### State Management

**Global State:**
- Authentication: `AuthContext` using `useReducer` pattern
- No Redux or other state management libraries

**Local State:**
- Screens manage their own state with `useState`
- Custom hooks encapsulate complex state logic (e.g., `useDashboard`)

**Data Flow:**
Screen → Service → API Client → Backend API

### Styling

**Design System:**
- Centralized colors in `constants/config.js`
- Dark theme: `#0B1422` (bg), `#0E1726` (panel), `#E7E9EF` (text), `#6B5CE7` (primary)
- StyleSheet.create() pattern for component styles
- No CSS-in-JS libraries

**UI Components:**
- Custom components (no Expo/React Native Paper/Native Base)
- Modal-based forms using `CrudModal.js`
- Consistent card-based layouts

### Navigation Patterns

**Cross-Screen Navigation:**
When navigating between screens with context (e.g., SalesReps → Interactions):
```javascript
navigation.navigate('Interactions', { 
  repId: salesRepId, 
  repName: salesRepName,
  from: 'SalesReps' 
});
```

**Back Navigation:**
- `navigationContext` tracks origin screen
- `navigateBackFromContext()` handles contextual back behavior
- Custom back buttons in header

## Important Patterns

### Adding New CRUD Screens
1. Create screen component in `screens/`
2. Create service file in `services/` with API methods
3. Create feature-specific components in `components/<Feature>/`
4. Add screen case to `App.js` routing logic
5. Add sidebar item in `Sidebar.js`

### Working with Forms
- Use `CrudModal` component for create/edit operations
- Pass `mode` prop: `'add'` or `'edit'`
- Handle validation in modal before API call
- Show success/error feedback via `Alert.alert()`

### Analytics/Dashboard Data
- Use `useDashboard` hook for accessing dashboard data
- Currency conversion handled in hook
- Date range filtering via parameters to API
- Fallback data ensures UI never breaks

### Token Management
- Tokens stored in AsyncStorage via `apiClient.setToken()`
- Token included in all API requests as `Authorization: Token <token>`
- 401 responses clear token and require re-authentication
- For production, integrate with `authController` refresh token flow

## Backend API Notes

**Base URL:** `https://interaction-tracker-api-133046591892.us-central1.run.app/api/v1`

**Authentication:** Token-based (Django REST Framework TokenAuthentication)

**Key Endpoints:**
- `/analytics/overview/` - Dashboard KPI summary
- `/analytics/revenue/` - Revenue data by currency
- `/analytics/sales-performance/` - Sales rep performance
- `/customers/`, `/products/`, `/sales-reps/`, `/interactions/`, `/invoices/`, `/payments/` - CRUD operations
- Nested endpoints available: `/customers-nested/`, etc.

**Known Issues:**
- Server sometimes returns HTTP 500 errors
- Dashboard service has sequential call delays (100ms) to prevent overload
- Fallback data pattern implemented to handle failures gracefully

## Configuration Files

**`app.json`:**
- Expo configuration
- App name, slug, version
- Platform-specific settings (iOS, Android, Web)
- New Architecture enabled: `"newArchEnabled": true`

**`.env` / `.env.sample`:**
- Authentication provider selection
- MSAL Azure AD credentials
- Test mode settings

**`babel.config.js`:**
- Modern JSX transform enabled
- Expo preset configuration

**`constants/config.js`:**
- Global color scheme
- No other app-wide constants

**`constants/authConfig.js`:**
- Authentication provider enum
- MSAL configuration
- Test credentials
- Storage keys
- Configuration validation

## Common Gotchas

- **Navigation:** This app does NOT use React Navigation library despite having navigation patterns. It uses custom state-based navigation.
- **AsyncStorage:** Used for token storage, not localStorage (this is React Native, not web).
- **API Token:** Currently hardcoded for development. For production, ensure proper token management through auth flow.
- **Windows Development:** Running on Windows, commands use PowerShell syntax.
- **Expo New Architecture:** Enabled in `app.json`, be aware of compatibility with dependencies.
- **API Rate Limiting:** Backend may throttle requests; dashboard service implements delays between calls.

## Code Quality Notes

- Comprehensive error handling in service layer
- Console logging for debugging (remove for production)
- Alert.alert() used for user feedback (native mobile pattern)
- No TypeScript (pure JavaScript)
- No linting/formatting commands defined
- Manual testing checklist in `TESTING_CHECKLIST.md`
