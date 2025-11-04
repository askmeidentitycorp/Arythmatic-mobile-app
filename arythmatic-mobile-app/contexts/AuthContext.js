// contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import authController from '../services/authController';
import apiClient from '../services/apiClient';
import { AUTH_PROVIDER } from '../constants/authConfig';
import { subscribeUnauthorized } from '../utils/authEvents';

/**
 * Auth Context
 * Provides centralized authentication state management
 */

// Initial state
const initialState = {
  // Authentication state
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  
  // User data
  user: null,
  accessToken: null,
  
  // Provider info
  provider: AUTH_PROVIDER,
  providerInfo: authController.getProviderInfo(),
  supportedMethods: authController.getSupportedMethods(),
  
  // Error state
  error: null,
};

// Action types
const AuthActionTypes = {
  INITIALIZE_START: 'INITIALIZE_START',
  INITIALIZE_SUCCESS: 'INITIALIZE_SUCCESS',
  INITIALIZE_FAILURE: 'INITIALIZE_FAILURE',
  
  SIGN_IN_START: 'SIGN_IN_START',
  SIGN_IN_SUCCESS: 'SIGN_IN_SUCCESS',
  SIGN_IN_FAILURE: 'SIGN_IN_FAILURE',
  
  SIGN_OUT_START: 'SIGN_OUT_START',
  SIGN_OUT_SUCCESS: 'SIGN_OUT_SUCCESS',
  SIGN_OUT_FAILURE: 'SIGN_OUT_FAILURE',
  
  REFRESH_TOKEN_SUCCESS: 'REFRESH_TOKEN_SUCCESS',
  REFRESH_TOKEN_FAILURE: 'REFRESH_TOKEN_FAILURE',
  
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.INITIALIZE_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AuthActionTypes.INITIALIZE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isInitialized: true,
        isAuthenticated: !!action.payload.user,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        error: null,
      };

    case AuthActionTypes.INITIALIZE_FAILURE:
      return {
        ...state,
        isLoading: false,
        isInitialized: true,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        error: action.payload.error,
      };

    case AuthActionTypes.SIGN_IN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AuthActionTypes.SIGN_IN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        error: null,
      };

    case AuthActionTypes.SIGN_IN_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        error: action.payload.error,
      };

    case AuthActionTypes.SIGN_OUT_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AuthActionTypes.SIGN_OUT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        error: null,
      };

    case AuthActionTypes.SIGN_OUT_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };

    case AuthActionTypes.REFRESH_TOKEN_SUCCESS:
      return {
        ...state,
        accessToken: action.payload.accessToken,
        error: null,
      };

    case AuthActionTypes.REFRESH_TOKEN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        error: action.payload.error,
      };

    case AuthActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext(null);

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication state
  const initialize = useCallback(async () => {
    try {
      dispatch({ type: AuthActionTypes.INITIALIZE_START });

      const currentUser = await authController.getCurrentUser();
      
      if (currentUser) {
        // Set token in apiClient
        await apiClient.setToken(currentUser.accessToken);
        
        dispatch({
          type: AuthActionTypes.INITIALIZE_SUCCESS,
          payload: {
            user: currentUser.user,
            accessToken: currentUser.accessToken,
          },
        });
      } else {
        // Clear token in apiClient
        await apiClient.setToken(null);
        
        dispatch({
          type: AuthActionTypes.INITIALIZE_SUCCESS,
          payload: {
            user: null,
            accessToken: null,
          },
        });
      }
    } catch (error) {
      console.error('❌ Auth: Initialization failed:', error.message);
      dispatch({
        type: AuthActionTypes.INITIALIZE_FAILURE,
        payload: { error: error.message },
      });
    }
  }, []);

  // Sign in
  const signIn = useCallback(async (credentials = {}) => {
    try {
      dispatch({ type: AuthActionTypes.SIGN_IN_START });

      const result = await authController.signIn(credentials);
      
      // Set token in apiClient immediately after successful sign in
      await apiClient.setToken(result.tokens.accessToken);
      
      dispatch({
        type: AuthActionTypes.SIGN_IN_SUCCESS,
        payload: {
          user: result.user,
          accessToken: result.tokens.accessToken,
        },
      });

      return result;
    } catch (error) {
      dispatch({
        type: AuthActionTypes.SIGN_IN_FAILURE,
        payload: { error: error.message },
      });
      throw error;
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      dispatch({ type: AuthActionTypes.SIGN_OUT_START });

      await authController.signOut();
      
      // Clear token in apiClient
      await apiClient.setToken(null);
      
      dispatch({ type: AuthActionTypes.SIGN_OUT_SUCCESS });
    } catch (error) {
      dispatch({
        type: AuthActionTypes.SIGN_OUT_FAILURE,
        payload: { error: error.message },
      });
      throw error;
    }
  }, []);

  // Refresh token
  const refreshToken = useCallback(async () => {
    try {
      const result = await authController.refreshToken();
      
      // Update token in apiClient
      await apiClient.setToken(result.tokens.accessToken);
      
      dispatch({
        type: AuthActionTypes.REFRESH_TOKEN_SUCCESS,
        payload: {
          accessToken: result.tokens.accessToken,
        },
      });

      return result;
    } catch (error) {
      dispatch({
        type: AuthActionTypes.REFRESH_TOKEN_FAILURE,
        payload: { error: error.message },
      });
      throw error;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: AuthActionTypes.CLEAR_ERROR });
  }, []);

  // Initialize on mount and subscribe to unauthorized events
  useEffect(() => {
    initialize();
    const unsubscribe = subscribeUnauthorized(() => {
      // Force sign-out on 401 from anywhere
      signOut().catch(() => {});
    });
    return unsubscribe;
  }, [initialize, signOut]);

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    signIn,
    signOut,
    refreshToken,
    clearError,
    initialize,
    
    // Helper functions
    isTestMode: state.providerInfo.isTestMode,
    isMSAL: state.providerInfo.isMSAL,
    hasUsernamePassword: state.supportedMethods.hasUsernamePassword,
    hasInteractiveLogin: state.supportedMethods.hasInteractiveLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Export context for testing
export { AuthContext };

export default AuthProvider;