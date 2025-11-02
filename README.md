# Arythmatic Mobile App

A comprehensive business management mobile application built with React Native for managing customers, sales reps, interactions, invoices, payments, and products.

## 🚀 Features

### 📊 **Dashboard**
- Real-time analytics and KPIs
- Revenue tracking with multi-currency conversion
- Live exchange rates
- Sales performance metrics
- Team performance tracking
- Top products and sales reps
- Recent activity feed

### 👥 **Customer Management**
- Complete customer CRUD operations
- Customer profiles with contact details
- Activity history tracking
- Navigation to related interactions and invoices
- Export customer data to CSV
- Advanced filtering and search

### 💼 **Sales Representatives**
- Sales rep performance tracking
- KPI metrics (total reps, active, top performers)
- Individual rep profiles
- Interaction and invoice tracking per rep
- Export functionality
- Mobile-responsive cards

### 💬 **Interactions**
- Track customer interactions
- Status management (New, In Progress, Completed)
- Notes and product management
- Create invoices from interactions
- Status and audit history
- Export to CSV

### 🧾 **Invoice Management**
- Create, edit, and manage invoices
- Multi-currency support (USD, EUR, GBP, INR)
- Line items with tax calculations
- Invoice status tracking (Draft, Open, Paid, Void)
- PDF generation ready
- Send invoice functionality
- Duplicate invoices
- Payment recording
- Export to CSV

### 💳 **Payment Management**
- Payment tracking and processing
- Server-side accurate KPI counts
- Payment status management (Success, Pending, Failed, Voided)
- Refund and void capabilities
- Customer information display
- Export payment data
- Audit history

### 📦 **Product Management**
- Product catalog management
- Pricing management
- Stock tracking
- Product categories
- Active/inactive status
- Export product data
- Notes and audit history

## 🛠️ Tech Stack

- **Framework**: React Native
- **State Management**: React Hooks
- **API Client**: Axios
- **Authentication**: Token-based with secure storage
- **UI Components**: Custom components with React Native
- **Navigation**: Custom navigation system
- **Storage**: Secure encrypted storage

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- React Native development environment
- For iOS: Xcode (Mac only)
- For Android: Android Studio

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd arythmatic-mobile-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install iOS dependencies** (Mac only)
   ```bash
   cd ios
   pod install
   cd ..
   ```

## 🚀 Running the App

### Development Mode

**iOS**
```bash
npm run ios
# or
npx react-native run-ios
```

**Android**
```bash
npm run android
# or
npx react-native run-android
```

**Web** (if configured)
```bash
npm run web
```

### Metro Bundler
```bash
npm start
# or
npx react-native start
```

## 🔐 Authentication

The app uses token-based authentication:

1. **Login Screen**: Enter credentials
2. **Token Storage**: Tokens are securely stored
3. **Auto-refresh**: Tokens refresh automatically
4. **Protected Routes**: All screens require authentication

### Test Credentials
```
Email: test@example.com
Password: password123
```

## 📁 Project Structure

```
arythmatic-mobile-app/
├── api/
│   └── client.js              # Axios API client with interceptors
├── components/
│   ├── Customer/              # Customer-related components
│   ├── Dashboard/             # Dashboard components
│   ├── Interaction/           # Interaction components
│   ├── Invoice/               # Invoice components
│   ├── Payment/               # Payment components
│   ├── Product/               # Product components
│   ├── SalesRep/              # Sales rep components
│   ├── ProtectedRoute.js      # Auth guard component
│   └── Sidebar.js             # Navigation sidebar
├── constants/
│   └── config.js              # App configuration and colors
├── contexts/
│   └── AuthContext.js         # Authentication context
├── hooks/
│   ├── useDashboard.js        # Dashboard data hook
│   ├── useCustomers.js        # Customer data hook
│   ├── useInteractions.js     # Interactions data hook
│   ├── useInvoices.js         # Invoice data hook
│   └── ...                    # Other custom hooks
├── screens/
│   ├── DashboardScreen.js     # Main dashboard
│   ├── CustomerScreen.js      # Customer management
│   ├── InteractionScreen.js   # Interactions
│   ├── InvoicesScreen.js      # Invoice management
│   ├── PaymentScreen.js       # Payment management
│   ├── ProductScreen.js       # Product catalog
│   └── SalesRepsScreen.js     # Sales rep management
├── services/
│   ├── apiClient.js           # Base API client
│   ├── customerService.js     # Customer API calls
│   ├── dashboardService.js    # Dashboard API calls
│   ├── interactionService.js  # Interaction API calls
│   ├── invoiceService.js      # Invoice API calls
│   ├── paymentService.js      # Payment API calls
│   └── ...                    # Other service modules
├── utils/
│   ├── errorHandler.js        # Centralized error handling
│   └── storage.js             # Secure storage utilities
├── App.js                     # Main app component
└── package.json               # Dependencies and scripts
```

## 🎨 Design System

### Colors
- **Primary**: `#6B5CE7` (Purple)
- **Background**: `#0B0E17` (Dark Blue)
- **Panel**: `#151A2B` (Dark Gray)
- **Text**: `#E2E8F0` (Light Gray)
- **Subtext**: `#9AA6BF` (Medium Gray)
- **Border**: `#202838` (Dark Border)

### Typography
- **Headings**: 18-24px, Bold (700)
- **Body**: 14-16px, Regular (400-500)
- **Small**: 11-13px, Medium (500-600)

## 🔄 API Integration

### Base URL
```
https://interaction-tracker-api-133046591892.us-central1.run.app/api/v1
```

### Authentication Headers
```javascript
Authorization: Token <access_token>
Content-Type: application/json
```

### Endpoints
- `/auth/login/` - User authentication
- `/customers/` - Customer management
- `/sales-reps/` - Sales rep data
- `/interactions/` - Interaction tracking
- `/invoices/` - Invoice management
- `/payments/` - Payment processing
- `/products/` - Product catalog
- `/analytics/overview/` - Dashboard analytics

## 📱 Key Features Implementation

### Multi-Currency Support
- Real-time exchange rate conversion
- Support for USD, EUR, GBP, INR, JPY, CNY, CAD, AUD
- Automatic conversion in revenue calculations

### Export Functionality
- CSV export for all data entities
- Formatted with proper headers and summary
- Share functionality integrated

### Accurate KPI Calculations
- Server-side count endpoints for accuracy
- Fallback to client-side calculations
- Real-time data updates

### Mobile-First Design
- Responsive layouts for all screen sizes
- Touch-optimized interactions
- Smooth animations and transitions
- Efficient data loading with pagination

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- <filename>
```

## 📦 Building for Production

### iOS
```bash
# Create production build
npx react-native run-ios --configuration Release

# Archive for App Store
# Use Xcode to archive and upload
```

### Android
```bash
# Create release APK
cd android
./gradlew assembleRelease

# Create release AAB (for Play Store)
./gradlew bundleRelease
```

## 🔒 Security

- Secure token storage using encrypted storage
- HTTPS-only API communication
- Automatic token refresh
- Session management
- Input validation and sanitization

## 🐛 Troubleshooting

### Common Issues

**Metro bundler issues**
```bash
npm start -- --reset-cache
```

**iOS build issues**
```bash
cd ios
pod deintegrate
pod install
cd ..
```

**Android build issues**
```bash
cd android
./gradlew clean
cd ..
```



## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.

---



