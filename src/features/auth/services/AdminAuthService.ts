import {
  LoginCredentials,
  RegisterData,
  LoginResponse,
  AuthUser,
} from '../../../shared/types';

interface RawLoginResponse {
  user: AuthUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number | null | undefined;
  };
}

import { apiClient } from '../../../core/api/baseClient';

export class AdminAuthService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<RawLoginResponse>(
      '/admin/auth/login',
      credentials
    );

    const { user, tokens } = response.data;

    if (user.role !== 'admin') {
      throw new Error('هذا الحساب ليس حساب إدارة');
    }

    const expiresInMinutes = tokens.expiresAt || 1440;
    const expiresAtTimestamp = new Date().getTime() + expiresInMinutes * 60 * 1000;

    return {
      user,
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: expiresAtTimestamp,
      },
    };
  }

  static async register(userData: RegisterData): Promise<LoginResponse> {
    const response = await apiClient.post<RawLoginResponse>('/admin/auth/register', userData);

    const { user, tokens } = response.data;
    const expiresInMinutes = tokens.expiresAt || 1440;
    const expiresAtTimestamp = new Date().getTime() + expiresInMinutes * 60 * 1000;

    return {
      user,
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: expiresAtTimestamp,
      },
    };
  }

  static async logout(): Promise<void> {
    await apiClient.post<null>('/admin/auth/logout');
  }

  static async getCurrentUser(): Promise<AuthUser> {
    const response = await apiClient.get<AuthUser>('/admin/auth/user');
    return response.data;
  }

  static async updateProfile(profileData: Partial<AuthUser>): Promise<AuthUser> {
    const response = await apiClient.patch<AuthUser>('/admin/auth/profile', profileData);
    return response.data;
  }

  static async changePassword(data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      '/admin/auth/change-password',
      data
    );
    return response.data;
  }

  static async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/admin/auth/forgot-password', {
      email,
    });
    return response.data;
  }

  static async resetPassword(data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/admin/auth/reset-password', data);
    return response.data;
  }

  static async verifyEmailCode(email: string, code: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/admin/auth/verify-email-code', {
      email,
      code,
    });
    return response.data;
  }

  static async resendVerificationCode(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      '/admin/auth/resend-verification-code',
      { email }
    );
    return response.data;
  }

  static async verifyResetCode(
    email: string,
    code: string
  ): Promise<{ message: string; token: string }> {
    const response = await apiClient.post<{ message: string; token: string }>(
      '/admin/auth/verify-reset-code',
      { email, code }
    );
    return response.data;
  }

  static async resendResetCode(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/admin/auth/resend-reset-code', {
      email,
    });
    return response.data;
  }
}
