// API client for user service endpoints
import { tokenStorage } from './tokenStorage';

const getUserServiceUrl = () => {
  return import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:8080';
};

// Helper to make authenticated requests
const fetchWithAuth = async (endpoint, options = {}) => {
  const token = tokenStorage.getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${getUserServiceUrl()}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle token refresh on 401
  if (response.status === 401 && token) {
    // Try to refresh the token
    const refreshed = await userApi.refreshToken();
    if (refreshed) {
      // Retry the original request with new token
      headers['Authorization'] = `Bearer ${tokenStorage.getAccessToken()}`;
      return fetch(`${getUserServiceUrl()}${endpoint}`, {
        ...options,
        headers,
      });
    }
  }

  return response;
};

export const userApi = {
  // Authentication
  register: async (username, email, password) => {
    const response = await fetch(`${getUserServiceUrl()}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    return response.json();
  },

  login: async (username, password) => {
    const response = await fetch(`${getUserServiceUrl()}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    tokenStorage.setTokens(data.access_token, data.refresh_token);
    return data;
  },

  refreshToken: async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${getUserServiceUrl()}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        tokenStorage.clearTokens();
        return false;
      }

      const data = await response.json();
      tokenStorage.setTokens(data.access_token, data.refresh_token);
      return true;
    } catch (error) {
      tokenStorage.clearTokens();
      return false;
    }
  },

  verify: async () => {
    const response = await fetchWithAuth('/verify');

    if (!response.ok) {
      throw new Error('Token verification failed');
    }

    return response.json();
  },

  // Email verification
  verifyEmail: async (token) => {
    const response = await fetch(`${getUserServiceUrl()}/verify-email?token=${token}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Email verification failed');
    }

    return response.json();
  },

  resendVerification: async (email) => {
    const response = await fetch(`${getUserServiceUrl()}/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to resend verification email');
    }

    return response.json();
  },

  // Password reset
  requestPasswordReset: async (email) => {
    const response = await fetch(`${getUserServiceUrl()}/request-password-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to request password reset');
    }

    return response.json();
  },

  resetPassword: async (token, newPassword) => {
    const response = await fetch(`${getUserServiceUrl()}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Password reset failed');
    }

    return response.json();
  },

  // Profile management
  getProfile: async () => {
    const response = await fetchWithAuth('/profile');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch profile');
    }

    return response.json();
  },

  updateUsername: async (newUsername, password) => {
    const response = await fetchWithAuth('/profile/username', {
      method: 'PUT',
      body: JSON.stringify({ new_username: newUsername, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update username');
    }

    return response.json();
  },

  updateEmail: async (newEmail, password) => {
    const response = await fetchWithAuth('/profile/email', {
      method: 'PUT',
      body: JSON.stringify({ new_email: newEmail, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update email');
    }

    return response.json();
  },

  updatePassword: async (currentPassword, newPassword) => {
    const response = await fetchWithAuth('/profile/password', {
      method: 'PUT',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update password');
    }

    return response.json();
  },

  deleteAccount: async (password) => {
    const response = await fetchWithAuth('/delete-account', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete account');
    }

    tokenStorage.clearTokens();
    return response.json();
  },

  // Health check
  checkHealth: async () => {
    const response = await fetch(`${getUserServiceUrl()}/health`);
    return response.json();
  },
};
