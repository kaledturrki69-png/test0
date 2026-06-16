import apiClient from '@/lib/api-client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  code: string;
  new_password: string;
}

export interface AuthResponse {
  user: any;
  access: string;
  refresh: string;
}

export const authService = {
  // Login with Django API
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post(
      '/api/v1/accounts/login/',
      credentials
    );
    return response.data;
  },

  // Register with Django API
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post(
      '/api/v1/accounts/register/',
      userData
    );
    return response.data;
  },

  // Refresh token
  async refreshToken(refresh: string): Promise<{ access: string }> {
    const response = await apiClient.post('/api/v1/accounts/refresh/', {
      refresh
    });
    return response.data;
  },

  // Logout
  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/api/v1/accounts/logout/', { refresh: refreshToken });
  },

  // Get current user
  async getCurrentUser(): Promise<any> {
    const response = await apiClient.get('/api/v1/accounts/user/');
    return response.data;
  },

  // Forgot password
  async forgotPassword(data: ForgotPasswordData): Promise<{ detail: string }> {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send reset code');
    }

    return await response.json();
  },

  // Reset password with code
  async resetPassword(data: ResetPasswordData): Promise<{ detail: string }> {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to reset password');
    }

    return await response.json();
  }
};
