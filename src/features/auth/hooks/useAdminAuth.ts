import { useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { AdminAuthService } from '../services/AdminAuthService';
import { LoginCredentials, RegisterData, AuthUser } from '../../../shared/types';

export const useAdminAuth = () => {
  const {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    status,
    login: storeLogin,
    logout: storeLogout,
    setLoading,
    setUser,
    updateUser,
    isTokenExpired,
    hasRole,
    hasPermission,
  } = useAuthStore();

  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => AdminAuthService.login(credentials),
    onSuccess: (data) => {
      storeLogin(data.user, data.tokens);
      queryClient.invalidateQueries({ queryKey: ['admin-user'] });
    },
    onError: (error: Error) => {
      setLoading(false);
      throw error;
    },
  });

  const registerMutation = useMutation({
    mutationFn: (userData: RegisterData) => AdminAuthService.register(userData),
    onSuccess: (data) => {
      storeLogin(data.user, data.tokens);
      queryClient.invalidateQueries({ queryKey: ['admin-user'] });
    },
    onError: (error: Error) => {
      setLoading(false);
      throw error;
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => AdminAuthService.logout(),
    onSuccess: () => {
      storeLogout();
      queryClient.clear();
    },
    onError: () => {
      storeLogout();
      queryClient.clear();
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (profileData: Partial<AuthUser>) => AdminAuthService.updateProfile(profileData),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['admin-user'] });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: {
      current_password: string;
      new_password: string;
      new_password_confirmation: string;
    }) => AdminAuthService.changePassword(data),
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => AdminAuthService.forgotPassword(email),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: {
      token: string;
      email: string;
      password: string;
      password_confirmation: string;
    }) => AdminAuthService.resetPassword(data),
  });

  const verifyEmailCodeMutation = useMutation({
    mutationFn: (data: { email: string; code: string }) =>
      AdminAuthService.verifyEmailCode(data.email, data.code),
  });

  const resendVerificationCodeMutation = useMutation({
    mutationFn: (email: string) => AdminAuthService.resendVerificationCode(email),
  });

  const verifyResetCodeMutation = useMutation({
    mutationFn: (data: { email: string; code: string }) =>
      AdminAuthService.verifyResetCode(data.email, data.code),
  });

  const resendResetCodeMutation = useMutation({
    mutationFn: (email: string) => AdminAuthService.resendResetCode(email),
  });

  const { data: currentUser } = useQuery({
    queryKey: ['admin-user'],
    queryFn: () => AdminAuthService.getCurrentUser(),
    enabled: isAuthenticated && !isTokenExpired() && hasRole('admin'),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (currentUser) {
      updateUser(currentUser);
    }
  }, [currentUser, updateUser]);

  useEffect(() => {
    if (isAuthenticated && isTokenExpired()) {
      storeLogout();
      queryClient.clear();
    }
  }, [isAuthenticated, isTokenExpired, storeLogout, queryClient]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setLoading(true);
      return loginMutation.mutateAsync(credentials);
    },
    [loginMutation, setLoading]
  );

  const register = useCallback(
    async (userData: RegisterData) => {
      setLoading(true);
      return registerMutation.mutateAsync(userData);
    },
    [registerMutation, setLoading]
  );

  const logout = useCallback(async () => {
    setLoading(true);
    return logoutMutation.mutateAsync();
  }, [logoutMutation, setLoading]);

  const updateProfile = useCallback(
    async (profileData: Partial<AuthUser>) => {
      return updateProfileMutation.mutateAsync(profileData);
    },
    [updateProfileMutation]
  );

  const changePassword = useCallback(
    async (data: {
      current_password: string;
      new_password: string;
      new_password_confirmation: string;
    }) => {
      return changePasswordMutation.mutateAsync(data);
    },
    [changePasswordMutation]
  );

  const forgotPassword = useCallback(
    async (email: string) => {
      return forgotPasswordMutation.mutateAsync(email);
    },
    [forgotPasswordMutation]
  );

  const resetPassword = useCallback(
    async (data: {
      token: string;
      email: string;
      password: string;
      password_confirmation: string;
    }) => {
      return resetPasswordMutation.mutateAsync(data);
    },
    [resetPasswordMutation]
  );

  const verifyEmailCode = useCallback(
    async (email: string, code: string) => {
      return verifyEmailCodeMutation.mutateAsync({ email, code });
    },
    [verifyEmailCodeMutation]
  );

  const resendVerificationCode = useCallback(
    async (email: string) => {
      return resendVerificationCodeMutation.mutateAsync(email);
    },
    [resendVerificationCodeMutation]
  );

  const verifyResetCode = useCallback(
    async (email: string, code: string) => {
      return verifyResetCodeMutation.mutateAsync({ email, code });
    },
    [verifyResetCodeMutation]
  );

  const resendResetCode = useCallback(
    async (email: string) => {
      return resendResetCodeMutation.mutateAsync(email);
    },
    [resendResetCodeMutation]
  );

  return {
    user,
    tokens,
    isAuthenticated: isAuthenticated && hasRole('admin'),
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
    status,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmailCode,
    resendVerificationCode,
    verifyResetCode,
    resendResetCode,
    hasRole,
    hasPermission,
    isTokenExpired,
    isLoginPending: loginMutation.isPending,
    isRegisterPending: registerMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
    isUpdateProfilePending: updateProfileMutation.isPending,
    isChangePasswordPending: changePasswordMutation.isPending,
    isForgotPasswordPending: forgotPasswordMutation.isPending,
    isResetPasswordPending: resetPasswordMutation.isPending,
    isVerifyEmailCodePending: verifyEmailCodeMutation.isPending,
    isResendVerificationCodePending: resendVerificationCodeMutation.isPending,
    isVerifyResetCodePending: verifyResetCodeMutation.isPending,
    isResendResetCodePending: resendResetCodeMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    logoutError: logoutMutation.error,
    updateProfileError: updateProfileMutation.error,
    changePasswordError: changePasswordMutation.error,
    forgotPasswordError: forgotPasswordMutation.error,
    resetPasswordError: resetPasswordMutation.error,
    verifyEmailCodeError: verifyEmailCodeMutation.error,
    resendVerificationCodeError: resendVerificationCodeMutation.error,
    verifyResetCodeError: verifyResetCodeMutation.error,
    resendResetCodeError: resendResetCodeMutation.error,
  };
};
