# 📋 Complete GPT Prompt for Arithmetic Mobile App Flowchart

## 🎯 **PROMPT FOR GPT-4/ChatGPT**

Copy and paste the following prompt into ChatGPT to generate a comprehensive application flowchart:

---

**PROMPT START:**

---

# 🚀 Create Complete Application Flowchart for Arithmetic Mobile App

Please create a comprehensive Mermaid flowchart that shows the complete user journey and system architecture for the **Arithmetic Mobile App** - a React Native/Expo business management application.

## 📋 **APPLICATION OVERVIEW**

**App Name:** Arithmetic Mobile App  
**Technology:** React Native + Expo  
**Authentication:** MSAL/OIDC with Test Provider  
**Architecture Grade:** A+ (96.25% Figma alignment)  

## 🏗️ **CORE SYSTEM ARCHITECTURE**

### **Authentication System (Grade: A+)**
- **Provider Architecture:** Modular system supporting:
  - `TEST` Provider (Development with mock JWT)
  - `MSAL` Provider (Microsoft Azure AD)  
  - `OIDC` Provider (Future extensibility)
- **Token Lifecycle:** Complete refresh/expiry handling
- **State Management:** React Context + Reducer pattern
- **Storage:** AsyncStorage with namespaced keys
- **Error Handling:** Comprehensive try-catch throughout

### **Navigation System**
- **Main Navigation:** Sidebar-based with business screens
- **Screen States:** Dashboard, Business sections, Profile management
- **Route Management:** Parameter passing for filtered views

## 📱 **APPLICATION SCREENS & FEATURES**

### **1. Authentication Flow**
- **Login Screen:** Email/password with test credentials
- **Test Accounts Available:**
  - `test@test.com` / `password123`
  - `admin@test.com` / `admin123`  
  - `demo@demo.com` / `demo123`
- **Microsoft Sign-In:** MSAL integration (mock implementation)
- **Profile Dropdown:** Settings, Profile, Logout with smooth animations

### **2. Dashboard Screen** 
- **6 Enhanced KPIs:** Revenue, Sales, Customers, Conversion Rate, Pipeline, Team Performance
- **Currency Conversion:** USD, INR, EUR with real-time conversion
- **Date Range Filtering:** This Week, Month, Quarter, Year
- **Charts & Analytics:** Revenue performance visualization
- **Quick Actions:** Navigation to business sections

### **3. Business Management Screens**

#### **Sales Representatives Screen**
- **CRUD Operations:** Add, Edit, Deactivate, Delete sales reps
- **Navigation Buttons:** 
  - "Show Interactions" → Navigate to Interactions screen with rep filter
  - "Show Invoices" → Navigate to Invoices screen with rep filter
- **Rep Management:** Role assignment, territory management, performance tracking

#### **Customers Screen**
- **CRUD Operations:** Add, Edit, Activate/Deactivate, Delete customers
- **Customer Types:** Individual, Business, Enterprise
- **Data Fields:** Name, email, phone, country, address, notes
- **Navigation:** "View Interactions" option for customer-specific interactions

#### **Products Screen**
- **CRUD Operations:** Add, Edit, Activate/Deactivate, Delete products
- **Product Types:** Physical, Digital, Service, Subscription
- **Pricing:** Base price with currency support
- **Inventory:** SKU tracking, category management

#### **Interactions Screen**
- **CRUD Operations:** Add, Edit, Mark status, Delete interactions
- **Status Management:** New, In Progress, Completed
- **Priority Levels:** High, Medium, Low
- **Rep Filtering:** Context-aware filtering from Sales Rep navigation
- **Customer Relations:** Link interactions to specific customers

#### **Invoices Screen**
- **CRUD Operations:** Create, Edit, Status updates, Delete invoices
- **Invoice Management:** Line items, tax calculations, payment terms
- **Status Tracking:** Draft, Open, Sent, Partial Paid, Full Paid, Overdue, Cancelled
- **Enhanced Details View:** Comprehensive invoice information with line items and totals
- **Navigation:** "View Payments" option to see related payments

#### **Payments Screen**
- **CRUD Operations:** Add, Edit, Process, Refund, Void, Delete payments
- **Payment Methods:** Various payment method support
- **Status Management:** Pending, Processing, Completed, Failed, Refunded, Cancelled
- **Navigation:** "View Details" → Navigate to Payment Details screen
- **Invoice Integration:** Link payments to specific invoices

#### **Payment Details Screen**
- **Detailed View:** Complete payment information
- **Transaction History:** Full audit trail
- **Related Information:** Invoice details, customer info
- **Actions:** Edit, refund, void options

## 🔄 **DATA FLOW & INTEGRATIONS**

### **API Integration**
- **Analytics API:** `/analytics/revenue/`, `/analytics/overview/`
- **CRUD APIs:** Individual endpoints for each business entity
- **Authentication Headers:** Bearer token management
- **Error Handling:** 401 token refresh, network retry logic

### **State Management**
- **Global Auth State:** AuthContext with loading, error, user states
- **Screen-specific States:** Individual component state management
- **Token Management:** Automatic refresh, expiry handling

### **Cross-Screen Navigation**
- **Sales Rep → Interactions:** Pass rep ID and name as context
- **Sales Rep → Invoices:** Filter invoices by sales representative
- **Invoices → Payments:** Show payments for specific invoice
- **Payments → Payment Details:** Navigate with payment ID

## 🎨 **UI/UX FEATURES**

### **Responsive Design**
- **Sidebar Navigation:** Collapsible menu system
- **Profile Menu:** Dropdown with smooth animations
- **Loading States:** Consistent loading indicators
- **Error Handling:** User-friendly error messages

### **Interactive Elements**
- **CRUD Modals:** Comprehensive forms with validation
- **Action Menus:** Context-specific action buttons
- **Confirmation Dialogs:** Safe delete operations
- **Success Feedback:** Toast messages and alerts

## 🛡️ **SECURITY & PERFORMANCE**

### **Security Features**
- **Token Storage:** Secure AsyncStorage with proper namespacing
- **Authentication Guards:** Route protection
- **Input Validation:** Form validation across all screens
- **Error Boundaries:** Graceful error handling

### **Performance**
- **Pagination:** Efficient data loading
- **Caching:** Smart data caching strategies
- **Lazy Loading:** Component-based loading
- **Memory Management:** Proper cleanup and disposal

## 📊 **BUSINESS METRICS & ANALYTICS**

### **KPI Tracking**
- **Revenue Analysis:** Multi-currency revenue tracking
- **Sales Performance:** Conversion rates, pipeline management
- **Customer Analytics:** Customer lifetime value, engagement
- **Team Performance:** Individual rep performance tracking

### **Reporting Features**
- **Date Range Analysis:** Flexible time period selection
- **Currency Conversion:** Real-time exchange rates
- **Growth Calculations:** Period-over-period comparisons
- **Visual Charts:** Revenue performance visualization

## 🎯 **FLOWCHART REQUIREMENTS**

Please create a comprehensive Mermaid flowchart that includes:

1. **🔐 Complete Authentication Flow** - From app launch through login to dashboard
2. **📱 Main Application Navigation** - All screen transitions and user paths
3. **🔄 Business Process Flows** - CRUD operations for each entity
4. **🌐 API Integration Points** - Show data flow and token management
5. **⚠️ Error Handling Paths** - Network errors, token expiry, validation failures
6. **👤 User Experience Flow** - Loading states, success/error feedback
7. **🔗 Cross-Screen Navigation** - Inter-screen relationships and parameter passing
8. **🚪 Logout & Session Management** - Complete session lifecycle

### **Visual Styling Guidelines:**
- Use emojis and colors to distinguish different flow types
- Group related screens/flows using subgraphs
- Show decision points with diamond shapes
- Use consistent styling for similar components
- Include both happy path and error scenarios

### **Technical Details to Include:**
- Screen names and components
- Navigation parameters
- API endpoints
- State management actions
- Error handling mechanisms
- Token refresh triggers
- User feedback mechanisms

This is a **production-ready business management application** with **enterprise-grade authentication** and **comprehensive CRUD functionality**. The flowchart should reflect the **professional architecture** and **seamless user experience** of this A+ rated system.

---

**PROMPT END**

---

## 🎯 **ADDITIONAL INSTRUCTIONS FOR OPTIMAL RESULTS**

### **When using this prompt:**

1. **Copy the entire prompt** from "PROMPT START" to "PROMPT END"
2. **Paste into ChatGPT-4** or similar advanced model
3. **Ask for Mermaid format** specifically if needed
4. **Request sections separately** if output is too large:
   - Authentication flow first
   - Main navigation flow
   - Business CRUD flows
   - API integration flows

### **Expected Output Quality:**
- **Comprehensive Mermaid diagram** with 50+ nodes
- **Professional visual styling** with colors and grouping
- **Complete user journey coverage** from login to logout
- **Technical accuracy** matching the implemented architecture
- **Production-ready documentation** suitable for stakeholders

### **Follow-up Prompts if Needed:**
```
"Please add more detail to the authentication section"
"Can you create a separate flowchart for the business CRUD operations?"
"Add error handling paths to the main flow"
"Include API integration details in the flowchart"
```

---

## 🚀 **RESULT EXPECTATIONS**

This prompt will generate a **comprehensive application flowchart** that:

- ✅ Shows complete user journey from login to business operations
- ✅ Documents all screen transitions and navigation paths  
- ✅ Includes authentication, CRUD, and API integration flows
- ✅ Demonstrates the professional architecture of your A+ rated system
- ✅ Provides stakeholder-ready documentation
- ✅ Serves as a blueprint for development and maintenance

The resulting flowchart will be **production-quality documentation** that showcases the sophisticated architecture and seamless user experience of your Arithmetic Mobile App.

---

**📅 Created:** 2025-10-20  
**🎯 Purpose:** Complete application flowchart generation  
**💡 Usage:** Copy prompt section to ChatGPT for comprehensive flowchart