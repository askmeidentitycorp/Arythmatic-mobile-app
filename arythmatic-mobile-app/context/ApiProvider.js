// context/ApiProvider.js
/**
 * API Provider
 * Sets up React Query for the entire app
 * 
 * WHY REACT QUERY:
 * - Automatic caching and background refetching
 * - Optimistic updates for better UX
 * - Retry logic and error handling built-in
 * - Reduces boilerplate compared to manual state management
 * - Offline support when combined with network utilities
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { shouldRetry, getRetryDelay } from '../utils/errorHandler';

/**
 * Create Query Client with app-specific configuration
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache time: How long unused data stays in cache
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
      
      // Stale time: How long data is considered fresh
      staleTime: 1000 * 60 * 5, // 5 minutes
      
      // Retry configuration
      retry: (failureCount, error) => {
        // Don't retry more than 2 times
        if (failureCount >= 2) return false;
        // Use our error handler to decide
        return shouldRetry(error);
      },
      
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => getRetryDelay(attemptIndex),
      
      // Refetch on window focus (useful for web, less so for mobile)
      refetchOnWindowFocus: false,
      
      // Refetch on reconnect (important for mobile)
      refetchOnReconnect: true,
      
      // Refetch on mount if data is stale
      refetchOnMount: true,
      
      // Keep previous data while fetching new data
      keepPreviousData: true,
      
      // Suspense mode (set to false for React Native)
      suspense: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      retryDelay: 1000,
      
      // Mutation callback for global error handling
      onError: (error) => {
        if (__DEV__) {
          console.error('🚨 Mutation Error:', error);
        }
      },
    },
  },
});

/**
 * API Provider Component
 * Wraps app with React Query context
 */
export const ApiProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Export query client for use outside components (if needed)
export { queryClient };

export default ApiProvider;
