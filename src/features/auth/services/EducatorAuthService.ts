import { apiClient } from '../../../core/api/client';
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

export class EducatorAuthService {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<RawLoginResponse>(
      '/educator/auth/login',
      credentials
    );

    // API returns ApiResponse<{ user|educator, tokens }>
    const payload = (response.data as any)?.data ?? (response.data as any);
    const user = payload.user || payload.educator;
    const tokens = payload.tokens;

    if (!user || !tokens) throw new Error('Invalid login response');

    // التحقق من أن المستخدم متخصص
    if (user.role && user.role !== 'educator') {
      throw new Error('هذا الحساب ليس حساب متخصص');
    }

    let expiresAtTimestamp: number;

    if (!tokens?.expiresAt) {
      expiresAtTimestamp = Date.now() + 1440 * 60 * 1000;
    } else if (typeof tokens.expiresAt === 'number') {
      if (tokens.expiresAt > 1000000000000) {
        expiresAtTimestamp = tokens.expiresAt;
      } else if (tokens.expiresAt > 1000000000) {
        expiresAtTimestamp = tokens.expiresAt * 1000;
      } else {
        expiresAtTimestamp = Date.now() + tokens.expiresAt * 60 * 1000;
      }
    } else if (typeof tokens.expiresAt === 'string') {
      const parsed = Date.parse(tokens.expiresAt);
      expiresAtTimestamp = isNaN(parsed) ? Date.now() + 1440 * 60 * 1000 : parsed;
    } else {
      expiresAtTimestamp = Date.now() + 1440 * 60 * 1000;
    }

    return {
      user,
      tokens: {
        accessToken: tokens?.accessToken,
        refreshToken: tokens?.refreshToken,
        expiresAt: expiresAtTimestamp,
      },
    };
  }

  static async register(userData: RegisterData): Promise<LoginResponse> {
    const response = await apiClient.post<RawLoginResponse>(
      '/educator/auth/register',
      userData
    );

    const payload = (response.data as any)?.data ?? (response.data as any);
    const user = payload.user || payload.educator;
    const tokens = payload.tokens;

    let expiresAtTimestamp: number;

    if (!tokens?.expiresAt) {
      expiresAtTimestamp = Date.now() + 1440 * 60 * 1000;
    } else if (typeof tokens.expiresAt === 'number') {
      if (tokens.expiresAt > 1000000000000) {
        expiresAtTimestamp = tokens.expiresAt;
      } else if (tokens.expiresAt > 1000000000) {
        expiresAtTimestamp = tokens.expiresAt * 1000;
      } else {
        expiresAtTimestamp = Date.now() + tokens.expiresAt * 60 * 1000;
      }
    } else if (typeof tokens.expiresAt === 'string') {
      const parsed = Date.parse(tokens.expiresAt);
      expiresAtTimestamp = isNaN(parsed) ? Date.now() + 1440 * 60 * 1000 : parsed;
    } else {
      expiresAtTimestamp = Date.now() + 1440 * 60 * 1000;
    }

    return {
      user,
      tokens: {
        accessToken: tokens?.accessToken,
        refreshToken: tokens?.refreshToken,
        expiresAt: expiresAtTimestamp,
      },
    };
  }

  static async logout(): Promise<void> {
    await apiClient.post<null>('/educator/auth/logout');
  }

  static async getCurrentUser(): Promise<AuthUser> {
    const response = await apiClient.get<AuthUser>('/educator/auth/user');
    return response.data;
  }

  static async updateProfile(profileData: Partial<AuthUser>): Promise<AuthUser> {
    const response = await apiClient.patch<AuthUser>('/educator/auth/profile', profileData);
    return response.data;
  }

  static async changePassword(data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      '/educator/auth/change-password',
      data
    );
    return response.data;
  }

  static async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/educator/auth/forgot-password', {
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
    const response = await apiClient.post<{ message: string }>('/educator/auth/reset-password', data);
    return response.data;
  }

  static async verifyEmailCode({ email, code }: { email: string; code: string }): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/educator/auth/verify-email-code', {
      email,
      code,
    });
    return response.data;
  }

  static async resendVerificationCode(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      '/educator/auth/resend-verification-code',
      { email }
    );
    return response.data;
  }

  static async verifyResetCode(
    email: string,
    code: string
  ): Promise<{ message: string; token: string }> {
    const response = await apiClient.post<{ message: string; token: string }>(
      '/educator/auth/verify-reset-code',
      { email, code }
    );
    return response.data;
  }

  static async resendResetCode(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/educator/auth/resend-reset-code', {
      email,
    });
    return response.data;
  }
}

