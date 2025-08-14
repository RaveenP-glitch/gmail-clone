import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is authenticated on app load
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      const token = apiService.getAuthToken();
      console.log('AuthContext: checkAuth - token exists:', !!token);
      
      if (!token) {
        if (isMounted) {
          console.log('AuthContext: No token found, setting not authenticated');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
        return;
      }

      try {
        // Small delay to prevent rapid requests
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('AuthContext: Attempting to get user profile...');
        const response = await apiService.getUserProfile();
        console.log('AuthContext: User profile response:', response);
        if (isMounted) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
        }
      } catch (error) {
        if (isMounted) {
          // Token is invalid, remove it and all stored data
          apiService.setAuthToken(null);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          dispatch({ type: 'LOGIN_FAILURE', payload: 'Session expired' });
          console.log('Authentication failed, user needs to re-login:', error.message);
        }
      }
    };

    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (token) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      // Set the token
      apiService.setAuthToken(token);
      
      // Get user profile
      const response = await apiService.getUserProfile();
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(response.user));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
      
      return response.user;
    } catch (error) {
      apiService.setAuthToken(null);
      localStorage.removeItem('user');
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state regardless of API call success
      apiService.setAuthToken(null);
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const getAuthUrl = async () => {
    try {
      const response = await apiService.getAuthUrl();
      return response.authUrl;
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    logout,
    getAuthUrl,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 