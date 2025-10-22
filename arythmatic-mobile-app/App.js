/* eslint-disable react/jsx-uses-react */
import React, { useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
import PaymentDetailsScreen from "./screens/PaymentdetailsScreen";
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
  const navigationRef = useRef(null);

  console.log("✅ App.js mounted with auth user:", user?.email);

  // Function to navigate to Interactions
  const navigateToInteractions = (repId, repName) => {
    setNavigationParams({ repId, repName });
    setBusinessScreen("Interactions");
  };

  // Function to navigate back to SalesReps
  const navigateBackToSalesReps = () => {
    setBusinessScreen("SalesReps");
    setNavigationParams(null);
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
          navigateToInteractions(params.repId, params.repName);
        }
      },
      goBack: () => {
        // Handle navigation back based on current screen
        if (currentScreen === 'Business') {
          if (businessScreen === 'Interactions') {
            navigateBackToSalesReps();
          } else {
            setCurrentScreen('Dashboard');
          }
        }
      }
    };
  };

  // Create navigation prop for PaymentDetailsScreen
  const createPaymentDetailsNavigationProp = () => {
    return {
      goBack: navigateBackFromPaymentDetails
    };
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
              <Text style={styles.breadcrumb}>
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
            <Text style={styles.breadcrumb}>
              Home / {currentScreen === "Business" ? businessScreen : currentScreen}
            </Text>

            {/* User Profile & Logout */}
            <View style={styles.userSection}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.name || user?.email}</Text>
                <Text style={styles.userProvider}>{isTestMode ? 'Test' : isMSAL ? 'MSAL' : 'Auth'}</Text>
              </View>
              <TouchableOpacity style={styles.profileBtn} onPress={signOut}>
                <Text style={styles.profileIcon}>🚪</Text>
              </TouchableOpacity>
            </View>
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
                navigation={createNavigationProp('Interactions')}
                onBack={navigateBackToSalesReps}
                initialRepId={navigationParams?.repId}
                initialRepName={navigationParams?.repName}
              />
            )}
            {currentScreen === "Business" && businessScreen === "Invoices" && (
              <InvoicesScreen 
                navigation={createNavigationProp('Invoices')}
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

const styles = StyleSheet.create({
  contentHeader: {
    paddingTop: 0,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderColor: colors.border,
    height: 50,
  },
  menuButton: {
    marginRight: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  menuButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  breadcrumb: { color: "#fff", fontSize: 15, fontWeight: "600", flex: 1 },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.panel,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: { 
    color: colors.text, 
    fontWeight: "600", 
    fontSize: 14 
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  userInfo: {
    marginRight: 8,
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  userProvider: {
    fontSize: 10,
    color: colors.subtext,
  },
  profileBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.panel,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileIcon: { fontSize: 15, color: colors.text, fontWeight: "600" },
});