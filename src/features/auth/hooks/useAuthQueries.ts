import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { AuthService } from '../services/AuthService';
import { LoginCredentials, RegisterData, LoginResponse, AuthUser } from '../../../shared/types';

// Auth Query Keys
export const authQueryKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authQueryKeys.all, 'currentUser'] as const,
};

// Auth Hooks
export const useLogin = (
  options?: UseMutationOptions<LoginResponse, Error, LoginCredentials>
) => {
  const queryClient = useQueryClient();
  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: AuthService.login,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.currentUser() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useRegister = (
  options?: UseMutationOptions<LoginResponse, Error, RegisterData>
) => {
  const queryClient = useQueryClient();
  return useMutation<LoginResponse, Error, RegisterData>({
    mutationFn: AuthService.register,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.currentUser() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useLogout = (
  options?: UseMutationOptions<void, Error, void>
) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: AuthService.logout,
    onSuccess: (data, variables, context) => {
      queryClient.removeQueries({ queryKey: authQueryKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useGetCurrentUser = (
  options?: Omit<UseQueryOptions<AuthUser, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<AuthUser, Error>({
    queryKey: authQueryKeys.currentUser(),
    queryFn: AuthService.getCurrentUser,
    ...options,
  });
};

export const useUpdateProfile = (
  options?: UseMutationOptions<AuthUser, Error, Partial<AuthUser>>
) => {
  const queryClient = useQueryClient();
  return useMutation<AuthUser, Error, Partial<AuthUser>>({
    mutationFn: AuthService.updateProfile,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.currentUser() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useChangePassword = (
  options?: UseMutationOptions<{ message: string }, Error, { current_password: string; new_password: string; new_password_confirmation: string }>
) => {
  return useMutation<{ message: string }, Error, { current_password: string; new_password: string; new_password_confirmation: string }>({
    mutationFn: AuthService.changePassword,
    ...options,
  });
};

export const useForgotPassword = (
  options?: UseMutationOptions<{ message: string }, Error, string>
) => {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: AuthService.forgotPassword,
    ...options,
  });
};

export const useResetPassword = (
  options?: UseMutationOptions<{ message: string }, Error, { token: string; email: string; password: string; password_confirmation: string }>
) => {
  return useMutation<{ message: string }, Error, { token: string; email: string; password: string; password_confirmation: string }>({
    mutationFn: AuthService.resetPassword,
    ...options,
  });
};

export const useVerifyEmailCode = (
  options?: UseMutationOptions<{ message: string }, Error, { email: string; code: string }>
) => {
  return useMutation<{ message: string }, Error, { email: string; code: string }>({
    mutationFn: AuthService.verifyEmailCode,
    ...options,
  });
};

export const useResendVerificationCode = (
  options?: UseMutationOptions<{ message: string }, Error, string>
) => {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: AuthService.resendVerificationCode,
    ...options,
  });
};

export const useVerifyResetCode = (
  options?: UseMutationOptions<{ message: string; token: string }, Error, { email: string; code: string }>
) => {
  return useMutation<{ message: string; token: string }, Error, { email: string; code: string }>({
    mutationFn: AuthService.verifyResetCode,
    ...options,
  });
};

export const useResendResetCode = (
  options?: UseMutationOptions<{ message: string }, Error, string>
) => {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: AuthService.resendResetCode,
    ...options,
  });
};

