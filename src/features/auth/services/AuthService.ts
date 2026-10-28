import {
  LoginCredentials,
  RegisterData,
  LoginResponse,
  AuthUser,
} from '../../../shared/types';
import { apiClient } from '../../../core/api/client';

interface RawLoginResponse {
  user: AuthUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number | null | undefined;
  };
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<RawLoginResponse>(
      '/auth/login',
      credentials
    );

    const { user, tokens } = response.data;
    const expiresInMinutes = tokens.expiresAt || 1440; // Default to 24 hours if not provided
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
    // Assuming general registration should go to /auth/register, not educator/auth/register
    const response = await apiClient.post<RawLoginResponse>('/auth/register', userData);

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
    await apiClient.post<null>('/auth/logout');
  }

  static async getCurrentUser(): Promise<AuthUser> {
    const response = await apiClient.get<AuthUser>('/auth/user');
    return response.data;
  }

  static async updateProfile(profileData: Partial<AuthUser>): Promise<AuthUser> {
    const response = await apiClient.put<AuthUser>('/auth/profile', profileData);
    return response.data;
  }

  static async changePassword(data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      '/auth/change-password',
      data
    );
    return response.data;
  }

  static async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/forgot-password', {
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
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  }

  static async verifyEmailCode({ email, code }: { email: string; code: string }): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/verify-email', {
      email,
      code,
    });
    return response.data;
  }

  static async resendVerificationCode(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      '/auth/resend-verification-code',
      { email }
    );
    return response.data;
  }

  static async verifyResetCode(
    { email, code }: { email: string; code: string }
  ): Promise<{ message: string; token: string }> {
    const response = await apiClient.post<{ message: string; token: string }>(
      '/auth/verify-reset-code',
      { email, code }
    );
    return response.data;
  }

  static async resendResetCode(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/resend-reset-code', {
      email,
    });
    return response.data;
  }
}
