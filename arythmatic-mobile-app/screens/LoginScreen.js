// screens/LoginScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../constants/config';
import { TEST_CONFIG } from '../constants/authConfig';

export default function LoginScreen() {
  const {
    signIn,
    isLoading,
    error,
    clearError,
    isTestMode,
    isMSAL,
    hasUsernamePassword,
    hasInteractiveLogin,
  } = useAuth();

  // Form state for test login
  const [username, setUsername] = useState(TEST_CONFIG.defaultUsername || '');
  const [password, setPassword] = useState(TEST_CONFIG.defaultPassword || '');
  const [showPassword, setShowPassword] = useState(false);

  // Handle test login
  const handleTestLogin = useCallback(async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both username and password');
      return;
    }

    try {
      clearError();
      await signIn({ username: username.trim(), password });
      // Navigation will be handled by App.js based on auth state
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    }
  }, [username, password, signIn, clearError]);

  // Handle MSAL login
  const handleMSALLogin = useCallback(async () => {
    try {
      clearError();
      await signIn();
      // Navigation will be handled by App.js based on auth state
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    }
  }, [signIn, clearError]);

  // Clear form
  const clearForm = useCallback(() => {
    setUsername(TEST_CONFIG.defaultUsername || '');
    setPassword(TEST_CONFIG.defaultPassword || '');
  }, []);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🧮</Text>
          <Text style={styles.title}>Arythmatic</Text>
          <Text style={styles.subtitle}>
            {isTestMode ? 'Development Mode' : isMSAL ? 'Microsoft Login' : 'Sign In'}
          </Text>
        </View>

        {/* Auth Provider Info */}
        <View style={styles.providerInfo}>
          <Text style={styles.providerText}>
            Authentication: {isTestMode ? 'Test Mode' : isMSAL ? 'Microsoft MSAL' : 'Unknown'}
          </Text>
        </View>

        {/* Test Login Form */}
        {hasUsernamePassword && (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Test Login</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username / Email</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username or email"
                placeholderTextColor={colors.subtext}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  placeholderTextColor={colors.subtext}
                  secureTextEntry={!showPassword}
                  textContentType="password"
                  autoComplete="password"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.passwordToggleText}>
                    {showPassword ? '🙈' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Test Credentials Help */}
            {isTestMode && (
              <View style={styles.helpContainer}>
                <Text style={styles.helpTitle}>Valid Test Credentials:</Text>
                <Text style={styles.helpText}>• test@test.com / password123</Text>
                <Text style={styles.helpText}>• admin@test.com / admin123</Text>
                <Text style={styles.helpText}>• demo@demo.com / demo123</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleTestLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.bg} size="small" />
              ) : (
                <Text style={styles.buttonText}>Sign In with Test Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={clearForm}
              disabled={isLoading}
            >
              <Text style={styles.secondaryButtonText}>Clear Form</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Microsoft Login */}
        {hasInteractiveLogin && (
          <View style={styles.form}>
            {hasUsernamePassword && <View style={styles.divider} />}
            
            <Text style={styles.sectionTitle}>Microsoft Sign-In</Text>
            
            <TouchableOpacity
              style={[styles.button, styles.microsoftButton]}
              onPress={handleMSALLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.microsoftIcon}>🏢</Text>
                  <Text style={styles.microsoftButtonText}>Continue with Microsoft</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={clearError} style={styles.errorDismiss}>
              <Text style={styles.errorDismissText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Secure authentication powered by {isTestMode ? 'Test Mode' : 'Microsoft Azure'}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.subtext,
    marginBottom: 10,
  },
  providerInfo: {
    backgroundColor: colors.panel,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  providerText: {
    textAlign: 'center',
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  form: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
  },
  input: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  passwordToggleText: {
    fontSize: 16,
  },
  helpContainer: {
    backgroundColor: colors.panel,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    color: colors.subtext,
    marginBottom: 2,
  },
  button: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.subtext,
    fontSize: 16,
    fontWeight: '600',
  },
  microsoftButton: {
    backgroundColor: '#0078d4',
    flexDirection: 'row',
  },
  microsoftIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  microsoftButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 20,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorDismiss: {
    alignSelf: 'center',
  },
  errorDismissText: {
    color: '#c62828',
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: {
    fontSize: 12,
    color: colors.subtext,
    textAlign: 'center',
  },
});
