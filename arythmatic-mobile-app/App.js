/* eslint-disable react/jsx-uses-react */
import React, { useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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

  // Enhanced navigation system for cross-screen navigation
  const navigateToInvoices = (filters) => {
    setCurrentScreen("Business");
    setBusinessScreen("Invoices");
    setNavigationParams({ filters });
  };

  const navigateToPayments = (filters) => {
    setCurrentScreen("Business");
    setBusinessScreen("Payments");
    setNavigationParams({ filters });
  };

  const navigateToCustomers = (filters) => {
    setCurrentScreen("Business");
    setBusinessScreen("Customers");
    setNavigationParams({ filters });
  };

  const navigateToProducts = (filters) => {
    setCurrentScreen("Business");
    setBusinessScreen("Products");
    setNavigationParams({ filters });
  };

  // Create a comprehensive navigation prop to pass to screens
  const createNavigationProp = () => {
    return {
      navigate: (screenName, params = {}) => {
        switch (screenName) {
          case 'Interactions':
            navigateToInteractions(params.repId, params.repName);
            break;
          case 'Invoices':
            navigateToInvoices(params.filters);
            break;
          case 'Payments':
            navigateToPayments(params.filters);
            break;
          case 'Customers':
            navigateToCustomers(params.filters);
            break;
          case 'Products':
            navigateToProducts(params.filters);
            break;
          case 'SalesReps':
            setCurrentScreen("Business");
            setBusinessScreen("SalesReps");
            setNavigationParams(params.filters ? { filters: params.filters } : null);
            break;
          default:
            console.log('Unknown screen:', screenName);
        }
      },
      goBack: () => {
        // Default go back to SalesReps or previous screen
        setBusinessScreen("SalesReps");
        setNavigationParams(null);
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

        {/* Profile Menu Overlay */}
        {showProfileMenu && (
          <TouchableOpacity 
            style={styles.profileOverlay} 
            activeOpacity={1}
            onPress={() => setShowProfileMenu(false)}
          />
        )}
        
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

            {/* Profile & Logout */}
            <View style={styles.profileContainer}>
              <TouchableOpacity 
                style={styles.profileBtn} 
                onPress={() => setShowProfileMenu(!showProfileMenu)}
              >
                <Text style={styles.profileIcon}>👤</Text>
              </TouchableOpacity>
              
              {/* Profile Menu Dropdown */}
              {showProfileMenu && (
                <View style={styles.profileMenu}>
                  <TouchableOpacity 
                    style={styles.profileMenuItem}
                    onPress={() => {
                      setShowProfileMenu(false);
                      Alert.alert("Profile", "Profile settings coming soon!");
                    }}
                  >
                    <Text style={styles.profileMenuText}>👤 Profile</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.profileMenuItem}
                    onPress={() => {
                      setShowProfileMenu(false);
                      Alert.alert("Settings", "Settings coming soon!");
                    }}
                  >
                    <Text style={styles.profileMenuText}>⚙️ Settings</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.profileMenuDivider} />
                  
                  <TouchableOpacity 
                    style={[styles.profileMenuItem, styles.logoutMenuItem]}
                    onPress={() => {
                      setShowProfileMenu(false);
                      Alert.alert(
                        "Logout",
                        "Are you sure you want to logout?",
                        [
                          { text: "Cancel", style: "cancel" },
                          { 
                            text: "Logout", 
                            style: "destructive",
                            onPress: () => {
                              setLoggedIn(false);
                              setCurrentScreen("Dashboard");
                              setBusinessScreen("SalesReps");
                              setMenuOpen(false);
                            }
                          }
                        ]
                      );
                    }}
                  >
                    <Text style={styles.logoutMenuText}>⏻ Logout</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Screen content */}
          <View style={{ flex: 1 }}>
            {currentScreen === "Dashboard" && <DashboardScreen navigation={createNavigationProp()} />}
            {currentScreen === "Business" && businessScreen === "SalesReps" && (
              <SalesRepsScreen 
                navigation={createNavigationProp()} 
                onNavigateToInteractions={navigateToInteractions}
              />
            )}
            {currentScreen === "Business" && businessScreen === "Customers" && (
              <CustomerScreen navigation={createNavigationProp()} />
            )}
            {currentScreen === "Business" && businessScreen === "Products" && (
              <ProductsScreen navigation={createNavigationProp()} />
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
              <InvoicesScreen 
                navigation={createNavigationProp()}
                route={{ params: navigationParams }}
              />
            )}
            {currentScreen === "Business" && businessScreen === "Payments" && (
              <PaymentsScreen 
                navigation={createNavigationProp()}
                route={{ params: navigationParams }}
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
  profileContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
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
  profileMenu: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: colors.panel,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 150,
    zIndex: 1000,
  },
  profileMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  profileMenuText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
  profileMenuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  logoutMenuItem: {
    borderBottomWidth: 0,
  },
  logoutMenuText: {
    fontSize: 14,
    color: "#ff4444",
    fontWeight: "600",
  },
  profileOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    backgroundColor: "transparent",
  },
});