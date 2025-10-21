// components/DebugComponents/ApiTestButton.js

import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/config';
import apiDebugger from '../../utils/apiDebugger';

/**
 * Development-only button to test API endpoints and debug data issues
 * 
 * Usage: Add <ApiTestButton /> to any screen during development
 */
export default function ApiTestButton({ onTestComplete = () => {} }) {
  const [testing, setTesting] = useState(false);

  const runApiTests = async () => {
    if (testing) return;
    
    setTesting(true);
    console.log('🧪 Starting API endpoint tests...');

    try {
      // Run quick data consistency check
      const summary = await apiDebugger.quickDataCheck();
      
      // Show results in alert
      const results = summary.map(item => 
        `${item.entity}: ${item.hasError ? '❌ ERROR' : '✅'} - ${item.recommendation}`
      ).join('\n\n');
      
      Alert.alert(
        'API Test Results', 
        results,
        [
          { 
            text: 'Test Dashboard', 
            onPress: async () => {
              const dashboardTest = await apiDebugger.testDashboardData();
              console.log('📊 Dashboard test completed:', dashboardTest);
              Alert.alert('Dashboard Test', 'Check console for detailed results');
            }
          },
          { 
            text: 'Full Endpoint Test', 
            onPress: async () => {
              const fullTest = await apiDebugger.testAllEndpoints();
              console.log('🔍 Full test completed:', fullTest);
              Alert.alert('Full Test', 'Check console for detailed results');
            }
          },
          { text: 'OK' }
        ]
      );
      
      onTestComplete(summary);
      
    } catch (error) {
      console.error('❌ API test failed:', error);
      Alert.alert('Test Failed', error.message);
    } finally {
      setTesting(false);
    }
  };

  // Only show in development mode
  if (!__DEV__) {
    return null;
  }

  return (
    <TouchableOpacity 
      style={[styles.button, testing && styles.buttonDisabled]}
      onPress={runApiTests}
      disabled={testing}
    >
      <Text style={styles.buttonText}>
        {testing ? '🧪 Testing APIs...' : '🔧 Test API Data'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary || '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});