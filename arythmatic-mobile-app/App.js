/* eslint-disable react/jsx-uses-react */
import React, { useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Platform, Modal, Dimensions } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "./constants/config";

// Auth system
import AuthProvider, { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import DashboardScreen from "./screens/DashboardScreen";

// Business screens
import CustomerScreen from "./screens/CustomerScreen";
import InteractionsScreen from "./screens/InteractionScreen";
import InvoicesScreen from "./screens/InvoicesScreen";
import PaymentsScreen from "./screens/PaymentScreen";
import PaymentDetailsScreen from "./screens/PaymentDetailsScreen";
import ProductsScreen from "./screens/ProductScreen";
import SalesRepsScreen from "./screens/SalesRepsScreen";

import Sidebar from "./components/Sidebar";
const _React = React; 

// Main App Component (wrapped by AuthProvider)
const AppContent = () => {
  const { signOut, user, isTestMode, isMSAL } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState("Dashboard");
  const [businessScreen, setBusinessScreen] = useState("SalesReps");
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [navigationParams, setNavigationParams] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [navigationContext, setNavigationContext] = useState(null); // Track where we came from
  const navigationRef = useRef(null);

  console.log("✅ App.js mounted with auth user:", user?.email);

  // Function to navigate to Interactions
  const navigateToInteractions = (repId, repName, fromScreen = null) => {
    setNavigationParams({ repId, repName });
    setNavigationContext(fromScreen ? { from: fromScreen, type: 'action' } : null);
    setCurrentScreen("Business");
    setBusinessScreen("Interactions");
  };

  // Function to navigate back to SalesReps
  const navigateBackToSalesReps = () => {
    setBusinessScreen("SalesReps");
    setNavigationParams(null);
    setNavigationContext(null);
  };

  // Function to navigate to Invoices with context
  const navigateToInvoices = (salesRepId, salesRepName, fromScreen = null) => {
    setNavigationParams({ salesRepId, salesRepName });
    setNavigationContext(fromScreen ? { from: fromScreen, type: 'action' } : null);
    setCurrentScreen("Business");
    setBusinessScreen("Invoices");
  };

  // Function to navigate back from context
  const navigateBackFromContext = () => {
    if (navigationContext?.from === 'SalesReps') {
      navigateBackToSalesReps();
    } else {
      // Default back behavior
      setCurrentScreen('Dashboard');
      setNavigationContext(null);
      setNavigationParams(null);
    }
  };

  // Function to navigate to Payment Details
  const navigateToPaymentDetails = (paymentId) => {
    console.log("App.js: navigateToPaymentDetails called with paymentId:", paymentId);
    setSelectedPaymentId(paymentId);
    setShowPaymentDetails(true);
  };

  // Function to navigate back from Payment Details
  const navigateBackFromPaymentDetails = () => {
    setShowPaymentDetails(false);
    setSelectedPaymentId(null);
  };

  // Create a navigation prop to pass to screens
  const createNavigationProp = (screenName) => {
    return {
      navigate: (targetScreen, params) => {
        if (targetScreen === 'Interactions') {
          navigateToInteractions(params.repId, params.repName, params.from);
        } else if (targetScreen === 'Invoices') {
          navigateToInvoices(params.salesRepId, params.salesRepName, params.from);
        }
      },
      goBack: () => {
        // Handle navigation back based on current screen and context
        if (navigationContext) {
          navigateBackFromContext();
        } else if (currentScreen === 'Business') {
          if (businessScreen === 'Interactions') {
            navigateBackToSalesReps();
          } else {
            setCurrentScreen('Dashboard');
          }
        }
      },
      // Helper methods for action-based navigation
      navigateToInteractions: (repId, repName) => navigateToInteractions(repId, repName, screenName),
      navigateToInvoices: (salesRepId, salesRepName) => navigateToInvoices(salesRepId, salesRepName, screenName)
    };
  };

  // Create navigation prop for PaymentDetailsScreen
  const createPaymentDetailsNavigationProp = () => {
    return {
      goBack: navigateBackFromPaymentDetails
    };
  };

  // Handle profile button press
  const handleProfilePress = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  // Handle logout
  const handleLogout = () => {
    setShowProfileDropdown(false);
    signOut();
  };

  // Close dropdown when clicking outside
  const closeProfileDropdown = () => {
    setShowProfileDropdown(false);
  };

  // If we're showing payment details, render that screen
  if (showPaymentDetails) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, flexDirection: "row" }}>
          {/* Sidebar */}
          <Sidebar
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            currentScreen={currentScreen}
            setCurrentScreen={setCurrentScreen}
            businessScreen={businessScreen}
            setBusinessScreen={setBusinessScreen}
          />

          {/* Main content */}
          <View style={{ flex: 1, backgroundColor: colors.bg }}>
            {/* Top Header Row */}
            <View style={styles.contentHeader}>
              {/* Sidebar toggle */}
              <TouchableOpacity
                onPress={() => setMenuOpen(!menuOpen)}
                style={styles.menuButton}
              >
                <Text style={styles.menuButtonText}>
                  {menuOpen ? "✕" : "≡"}
                </Text>
              </TouchableOpacity>

              {/* Breadcrumb */}
              <Text 
                style={styles.breadcrumb}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Home / {currentScreen === "Business" ? businessScreen : currentScreen} / Payment Details
              </Text>

              {/* Back button */}
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={navigateBackFromPaymentDetails}
              >
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
            </View>

            {/* Payment Details Screen */}
            <View style={{ flex: 1 }}>
              <PaymentDetailsScreen 
                route={{ params: { paymentId: selectedPaymentId } }}
                navigation={createPaymentDetailsNavigationProp()}
              />
            </View>
          </View>
          
          {/* Profile Dropdown Overlay */}
          {showProfileDropdown && (
            <Modal
              transparent
              visible={showProfileDropdown}
              onRequestClose={closeProfileDropdown}
              animationType="fade"
            >
              <TouchableOpacity 
                style={styles.modalOverlay} 
                onPress={closeProfileDropdown}
                activeOpacity={1}
              >
                <View style={styles.profileModal}>
                  <View style={styles.profileModalContent}>
                    <View style={styles.userInfoModal}>
                      <Text style={styles.userNameModal} numberOfLines={1}>
                        {user?.name || user?.email || 'User'}
                      </Text>
                      <Text style={styles.userRoleModal}>
                        {isTestMode ? 'Test Mode' : isMSAL ? 'MSAL Auth' : 'Authenticated'}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.profileMenuButton} 
                      onPress={() => {
                        setShowProfileDropdown(false);
                        // TODO: Navigate to Profile screen
                        console.log('Navigate to Profile');
                      }}
                    >
                      <Text style={styles.profileMenuButtonIcon}>👤</Text>
                      <Text style={styles.profileMenuButtonText}>Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.profileMenuButton} 
                      onPress={() => {
                        setShowProfileDropdown(false);
                        // TODO: Navigate to Active Sessions screen
                        console.log('Navigate to Active Sessions');
                      }}
                    >
                      <Text style={styles.profileMenuButtonIcon}>💻</Text>
                      <Text style={styles.profileMenuButtonText}>Active Sessions</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.logoutButtonModal} onPress={handleLogout}>
                      <Text style={styles.logoutButtonTextModal}>🚺 Logout</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </Modal>
          )}
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, flexDirection: "row" }}>
        {/* Sidebar */}
        <Sidebar
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          currentScreen={currentScreen}
          setCurrentScreen={setCurrentScreen}
          businessScreen={businessScreen}
          setBusinessScreen={setBusinessScreen}
        />

        {/* Main content */}
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
          {/* Top Header Row */}
          <View style={styles.contentHeader}>
            {/* Sidebar toggle */}
            <TouchableOpacity
              onPress={() => setMenuOpen(!menuOpen)}
              style={styles.menuButton}
            >
              <Text style={styles.menuButtonText}>
                {menuOpen ? "✕" : "≡"}
              </Text>
            </TouchableOpacity>

            {/* Breadcrumb */}
            <Text 
              style={styles.breadcrumb}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Home / {currentScreen === "Business" ? businessScreen : currentScreen}
            </Text>

            {/* Profile Icon */}
            <TouchableOpacity style={styles.profileBtn} onPress={handleProfilePress}>
              <Text style={styles.profileIcon}>👤</Text>
            </TouchableOpacity>
          </View>

          {/* Screen content */}
          <View style={{ flex: 1 }}>
            {currentScreen === "Dashboard" && <DashboardScreen />}
            {currentScreen === "Business" && businessScreen === "SalesReps" && (
              <SalesRepsScreen 
                navigation={createNavigationProp('SalesReps')} 
                onNavigateToInteractions={navigateToInteractions}
              />
            )}
            {currentScreen === "Business" && businessScreen === "Customers" && (
              <CustomerScreen 
                navigation={createNavigationProp('Customers')}
              />
            )}
            {currentScreen === "Business" && businessScreen === "Products" && (
              <ProductsScreen 
                navigation={createNavigationProp('Products')}
              />
            )}
            {currentScreen === "Business" && businessScreen === "Interactions" && (
              <InteractionsScreen 
                navigation={{
                  ...createNavigationProp('Interactions'),
                  params: navigationParams,
                  backToScreen: navigationContext?.from
                }}
                onBack={navigationContext?.from ? navigateBackFromContext : navigateBackToSalesReps}
                initialRepId={navigationParams?.repId}
                initialRepName={navigationParams?.repName}
              />
            )}
            {currentScreen === "Business" && businessScreen === "Invoices" && (
              <InvoicesScreen 
                navigation={{
                  ...createNavigationProp('Invoices'),
                  params: navigationParams,
                  backToScreen: navigationContext?.from
                }}
              />
            )}
            {currentScreen === "Business" && businessScreen === "Payments" && (
              <PaymentsScreen 
                navigation={createNavigationProp('Payments')}
                onNavigateToDetails={navigateToPaymentDetails}
              />
            )}
          </View>
        </View>
        
        {/* Profile Dropdown Overlay */}
        {showProfileDropdown && (
          <Modal
            transparent
            visible={showProfileDropdown}
            onRequestClose={closeProfileDropdown}
            animationType="fade"
          >
            <TouchableOpacity 
              style={styles.modalOverlay} 
              onPress={closeProfileDropdown}
              activeOpacity={1}
            >
              <View style={styles.profileModal}>
                <View style={styles.profileModalContent}>
                  <View style={styles.userInfoModal}>
                    <Text style={styles.userNameModal} numberOfLines={1}>
                      {user?.name || user?.email || 'User'}
                    </Text>
                    <Text style={styles.userRoleModal}>
                      {isTestMode ? 'Test Mode' : isMSAL ? 'MSAL Auth' : 'Authenticated'}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.profileMenuButton} 
                    onPress={() => {
                      setShowProfileDropdown(false);
                      console.log('Navigate to Profile');
                    }}
                  >
                    <Text style={styles.profileMenuButtonIcon}>👤</Text>
                    <Text style={styles.profileMenuButtonText}>Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.profileMenuButton} 
                    onPress={() => {
                      setShowProfileDropdown(false);
                      console.log('Navigate to Active Sessions');
                    }}
                  >
                    <Text style={styles.profileMenuButtonIcon}>💻</Text>
                    <Text style={styles.profileMenuButtonText}>Active Sessions</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.logoutButtonModal} onPress={handleLogout}>
                    <Text style={styles.logoutButtonTextModal}>🚺 Logout</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </Modal>
        )}
      </View>
    </SafeAreaProvider>
  );
};

// Main App with Auth Provider
export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <ProtectedRoute>
          <AppContent />
        </ProtectedRoute>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  contentHeader: {
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderColor: colors.border,
    height: 80,
    minHeight: 80,
    maxWidth: screenWidth,
    overflow: 'hidden',
  },
  menuButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.primary,
    borderRadius: 6,
    marginRight: 8,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonText: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 14 
  },
  breadcrumb: { 
    color: colors.text, 
    fontSize: 13, 
    fontWeight: "500", 
    flex: 1,
    marginHorizontal: 8,
    textAlign: 'left',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.panel,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  backButtonText: { 
    color: colors.text, 
    fontWeight: "600", 
    fontSize: 12 
  },
  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.panel,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    flexShrink: 0,
  },
  profileIcon: { 
    fontSize: 16, 
    color: colors.text, 
    fontWeight: "600" 
  },
  
  // Modal Overlay Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  profileModal: {
    marginTop: 80, // Height of header
    marginRight: 12,
    marginLeft: 'auto',
  },
  profileModalContent: {
    backgroundColor: colors.panel,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userInfoModal: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userNameModal: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  userRoleModal: {
    fontSize: 12,
    color: colors.subtext,
  },
  profileMenuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileMenuButtonIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  profileMenuButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  logoutButtonModal: {
    padding: 16,
    alignItems: 'center',
  },
  logoutButtonTextModal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
  },
});
