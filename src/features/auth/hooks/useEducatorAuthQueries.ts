import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { EducatorAuthService } from '../services/EducatorAuthService';
import { LoginCredentials, RegisterData, LoginResponse, AuthUser } from '../../../shared/types';

// Educator Auth Query Keys
export const educatorAuthQueryKeys = {
  all: ['educatorAuth'] as const,
  currentUser: () => [...educatorAuthQueryKeys.all, 'currentUser'] as const,
};

// Educator Auth Hooks
export const useEducatorLogin = (
  options?: UseMutationOptions<LoginResponse, Error, LoginCredentials>
) => {
  const queryClient = useQueryClient();
  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: EducatorAuthService.login,
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(educatorAuthQueryKeys.currentUser(), data.user);
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useEducatorRegister = (
  options?: UseMutationOptions<LoginResponse, Error, RegisterData>
) => {
  const queryClient = useQueryClient();
  return useMutation<LoginResponse, Error, RegisterData>({
    mutationFn: EducatorAuthService.register,
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(educatorAuthQueryKeys.currentUser(), data.user);
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useEducatorLogout = (
  options?: UseMutationOptions<void, Error, void>
) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: EducatorAuthService.logout,
    onSuccess: (data, variables, context) => {
      queryClient.removeQueries({ queryKey: educatorAuthQueryKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useEducatorGetCurrentUser = (
  options?: Omit<UseQueryOptions<AuthUser, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<AuthUser, Error>({
    queryKey: educatorAuthQueryKeys.currentUser(),
    queryFn: EducatorAuthService.getCurrentUser,
    ...options,
  });
};

export const useEducatorUpdateProfile = (
  options?: UseMutationOptions<AuthUser, Error, Partial<AuthUser>>
) => {
  const queryClient = useQueryClient();
  return useMutation<AuthUser, Error, Partial<AuthUser>>({
    mutationFn: EducatorAuthService.updateProfile,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: educatorAuthQueryKeys.currentUser() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useEducatorChangePassword = (
  options?: UseMutationOptions<{ message: string }, Error, { current_password: string; new_password: string; new_password_confirmation: string }>
) => {
  return useMutation<{ message: string }, Error, { current_password: string; new_password: string; new_password_confirmation: string }>({
    mutationFn: EducatorAuthService.changePassword,
    ...options,
  });
};

export const useEducatorForgotPassword = (
  options?: UseMutationOptions<{ message: string }, Error, string>
) => {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: EducatorAuthService.forgotPassword,
    ...options,
  });
};

export const useEducatorResetPassword = (
  options?: UseMutationOptions<{ message: string }, Error, { token: string; email: string; password: string; password_confirmation: string }>
) => {
  return useMutation<{ message: string }, Error, { token: string; email: string; password: string; password_confirmation: string }>({
    mutationFn: EducatorAuthService.resetPassword,
    ...options,
  });
};

export const useEducatorVerifyEmailCode = (
  options?: UseMutationOptions<{ message: string }, Error, { email: string; code: string }>
) => {
  return useMutation<{ message: string }, Error, { email: string; code: string }>({
    mutationFn: EducatorAuthService.verifyEmailCode,
    ...options,
  });
};

export const useEducatorResendVerificationCode = (
  options?: UseMutationOptions<{ message: string }, Error, string>
) => {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: EducatorAuthService.resendVerificationCode,
    ...options,
  });
};

export const useEducatorVerifyResetCode = (
  options?: UseMutationOptions<{ message: string; token: string }, Error, { email: string; code: string }>
) => {
  return useMutation<{ message: string; token: string }, Error, { email: string; code: string }>({
    mutationFn: EducatorAuthService.verifyResetCode,
    ...options,
  });
};

export const useEducatorResendResetCode = (
  options?: UseMutationOptions<{ message: string }, Error, string>
) => {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: EducatorAuthService.resendResetCode,
    ...options,
  });
};

