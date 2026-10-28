import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';
import { AdminAuthService } from '../services/AdminAuthService';
import { LoginCredentials, RegisterData, LoginResponse, AuthUser } from '../../../shared/types';

// تعريف مفاتيح الاستعلام (Query Keys) لـ React Query
export const adminAuthQueryKeys = {
  all: ['adminAuth'] as const,
  currentUser: () => [...adminAuthQueryKeys.all, 'currentUser'] as const,
};

// Admin Auth Hooks
export const useAdminLogin = (
  options?: UseMutationOptions<LoginResponse, Error, LoginCredentials>
) => {
  const queryClient = useQueryClient();
  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: AdminAuthService.login,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: adminAuthQueryKeys.currentUser() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useAdminRegister = (
  options?: UseMutationOptions<LoginResponse, Error, RegisterData>
) => {
  const queryClient = useQueryClient();
  return useMutation<LoginResponse, Error, RegisterData>({
    mutationFn: AdminAuthService.register,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: adminAuthQueryKeys.currentUser() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useAdminLogout = (
  options?: UseMutationOptions<void, Error, void>
) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: AdminAuthService.logout,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: adminAuthQueryKeys.currentUser() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useAdminGetCurrentUser = (
  options?: Omit<UseQueryOptions<AuthUser, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<AuthUser, Error>({
    queryKey: adminAuthQueryKeys.currentUser(),
    queryFn: AdminAuthService.getCurrentUser,
    ...options,
  });
};

export const useAdminUpdateProfile = (
  options?: UseMutationOptions<AuthUser, Error, Partial<AuthUser>>
) => {
  const queryClient = useQueryClient();
  return useMutation<AuthUser, Error, Partial<AuthUser>>({
    mutationFn: AdminAuthService.updateProfile,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: adminAuthQueryKeys.currentUser() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useAdminChangePassword = (
  options?: UseMutationOptions<{ message: string }, Error, { current_password: string; new_password: string; new_password_confirmation: string }>
) => {
  return useMutation<{ message: string }, Error, { current_password: string; new_password: string; new_password_confirmation: string }>({
    mutationFn: AdminAuthService.changePassword,
    ...options,
  });
};

export const useAdminForgotPassword = (
  options?: UseMutationOptions<{ message: string }, Error, string>
) => {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: AdminAuthService.forgotPassword,
    ...options,
  });
};

export const useAdminResetPassword = (
  options?: UseMutationOptions<{ message: string }, Error, { token: string; email: string; password: string; password_confirmation: string }>
) => {
  return useMutation<{ message: string }, Error, { token: string; email: string; password: string; password_confirmation: string }>({
    mutationFn: AdminAuthService.resetPassword,
    ...options,
  });
};

export const useAdminVerifyEmailCode = (
  options?: UseMutationOptions<{ message: string }, Error, { email: string; code: string }>
) => {
  return useMutation<{ message: string }, Error, { email: string; code: string }>({
    mutationFn: AdminAuthService.verifyEmailCode,
    ...options,
  });
};

export const useAdminResendVerificationCode = (
  options?: UseMutationOptions<{ message: string }, Error, string>
) => {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: AdminAuthService.resendVerificationCode,
    ...options,
  });
};

export const useAdminVerifyResetCode = (
  options?: UseMutationOptions<{ message: string; token: string }, Error, { email: string; code: string }>
) => {
  return useMutation<{ message: string; token: string }, Error, { email: string; code: string }>({
    mutationFn: AdminAuthService.verifyResetCode,
    ...options,
  });
};

export const useAdminResendResetCode = (
  options?: UseMutationOptions<{ message: string }, Error, string>
) => {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: AdminAuthService.resendResetCode,
    ...options,
  });
};

