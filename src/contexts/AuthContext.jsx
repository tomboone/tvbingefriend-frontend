import { createContext, useContext, useState, useEffect } from 'react';
import { userApi } from '../utils/userApi';
import { tokenStorage } from '../utils/tokenStorage';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const initializeAuth = async () => {
      if (tokenStorage.hasTokens()) {
        try {
          const userData = await userApi.verify();
          setUser(userData);
        } catch (err) {
          // Token is invalid, clear it
          tokenStorage.clearTokens();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    try {
      setError(null);
      await userApi.login(username, password);
      const userData = await userApi.verify();
      setUser(userData);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const register = async (username, email, password) => {
    try {
      setError(null);
      await userApi.register(username, email, password);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    tokenStorage.clearTokens();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await userApi.verify();
      setUser(userData);
    } catch (err) {
      console.error('Failed to refresh user data:', err);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
