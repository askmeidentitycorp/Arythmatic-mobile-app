/* eslint-disable react/jsx-uses-react */
import React, { useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "./constants/config";

import DashboardScreen from "./screens/DashboardScreen";
import LoginScreen from "./screens/LoginScreen";

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

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState("Dashboard");
  const [businessScreen, setBusinessScreen] = useState("SalesReps");
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [navigationParams, setNavigationParams] = useState(null);
  const navigationRef = useRef(null);

  console.log("✅ App.js mounted");


  if (!loggedIn) {
    return (
      <SafeAreaProvider>
        <LoginScreen onLogin={() => setLoggedIn(true)} />
      </SafeAreaProvider>
    );
  }

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
  const createNavigationProp = () => {
    return {
      navigate: (screenName, params) => {
        if (screenName === 'Interactions') {
          navigateToInteractions(params.repId, params.repName);
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

            {/* Profile Icon */}
            <TouchableOpacity style={styles.profileBtn} onPress={() => {}}>
              <Text style={styles.profileIcon}>👤</Text>
            </TouchableOpacity>
          </View>

          {/* Screen content */}
          <View style={{ flex: 1 }}>
            {currentScreen === "Dashboard" && <DashboardScreen />}
            {currentScreen === "Business" && businessScreen === "SalesReps" && (
              <SalesRepsScreen 
                navigation={createNavigationProp()} 
                onNavigateToInteractions={navigateToInteractions}
              />
            )}
            {currentScreen === "Business" && businessScreen === "Customers" && (
              <CustomerScreen />
            )}
            {currentScreen === "Business" && businessScreen === "Products" && (
              <ProductsScreen />
            )}
            {currentScreen === "Business" && businessScreen === "Interactions" && (
              <InteractionsScreen 
                navigation={createNavigationProp()}
                onBack={navigateBackToSalesReps}
                initialRepId={navigationParams?.repId}
                initialRepName={navigationParams?.repName}
              />
            )}
            {currentScreen === "Business" && businessScreen === "Invoices" && (
              <InvoicesScreen />
            )}
            {currentScreen === "Business" && businessScreen === "Payments" && (
              <PaymentsScreen 
                onNavigateToDetails={navigateToPaymentDetails}
              />
            )}
          </View>
        </View>
      </View>
    </SafeAreaProvider>
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
  profileBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.panel,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    marginLeft: 12,
  },
  profileIcon: { fontSize: 15, color: colors.text, fontWeight: "600" },
});