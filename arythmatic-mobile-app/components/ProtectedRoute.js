// components/ProtectedRoute.js
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../constants/config';
import LoginScreen from '../screens/LoginScreen';

/**
 * ProtectedRoute Component
 * Protects screens and checks authentication status
 * Shows LoginScreen if not authenticated, children if authenticated
 */
const ProtectedRoute = ({ 
  children, 
  fallback = null,
  requireAuth = true,
  showLoader = true,
  minRole = null 
}) => {
  const { 
    isAuthenticated, 
    isLoading, 
    isInitialized,
    user,
    error 
  } = useAuth();

  // Show loading spinner while initializing
  if (!isInitialized || (isLoading && showLoader)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>
          {isInitialized ? 'Signing in...' : 'Initializing authentication...'}
        </Text>
      </View>
    );
  }

  // Show error state if there's an initialization error
  if (error && !isAuthenticated) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Authentication Error</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // If authentication is not required, always show children
  if (!requireAuth) {
    return children;
  }

  // If not authenticated, show login screen or fallback
  if (!isAuthenticated) {
    if (fallback) {
      return fallback;
    }
    return <LoginScreen />;
  }

  // Check role-based access if specified
  if (minRole && user && user.roles) {
    const roleHierarchy = {
      'user': 1,
      'admin': 2,
      'superadmin': 3,
    };

    const userRole = user.roles.find(role => roleHierarchy[role]);
    const userRoleLevel = roleHierarchy[userRole] || 0;
    const requiredRoleLevel = roleHierarchy[minRole] || 1;

    if (userRoleLevel < requiredRoleLevel) {
      return (
        <View style={styles.accessDeniedContainer}>
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            You don't have sufficient permissions to access this screen.
            Required role: {minRole}
          </Text>
          <Text style={styles.accessDeniedSubtext}>
            Your role: {userRole || 'none'}
          </Text>
        </View>
      );
    }
  }

  // User is authenticated and authorized, show protected content
  return children;
};

// Convenience wrapper components
export const PublicRoute = ({ children }) => (
  <ProtectedRoute requireAuth={false}>
    {children}
  </ProtectedRoute>
);

export const AdminRoute = ({ children }) => (
  <ProtectedRoute minRole="admin">
    {children}
  </ProtectedRoute>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#c62828',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#c62828',
    textAlign: 'center',
    lineHeight: 24,
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
    padding: 20,
  },
  accessDeniedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff9800',
    marginBottom: 10,
    textAlign: 'center',
  },
  accessDeniedText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  accessDeniedSubtext: {
    fontSize: 14,
    color: colors.subtext,
    textAlign: 'center',
  },
});

export default ProtectedRoute;