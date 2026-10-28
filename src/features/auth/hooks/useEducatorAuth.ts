import { useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import {
  useEducatorLogin,
  useEducatorRegister,
  useEducatorLogout,
  useEducatorGetCurrentUser,
  useEducatorUpdateProfile,
  useEducatorChangePassword,
  useEducatorForgotPassword,
  useEducatorResetPassword,
  useEducatorVerifyEmailCode,
  useEducatorResendVerificationCode,
  useEducatorVerifyResetCode,
  useEducatorResendResetCode,
  educatorAuthQueryKeys,
} from './useEducatorAuthQueries';
import { LoginCredentials, RegisterData, AuthUser } from '../../../shared/types';

export const useEducatorAuth = () => {
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

  // Use hooks from useEducatorAuthQueries.ts
  const loginMutation = useEducatorLogin({
    onSuccess: (data) => {
      storeLogin(data.user, data.tokens);
      queryClient.invalidateQueries({ queryKey: educatorAuthQueryKeys.currentUser() });
    },
    onError: (error: Error) => {
      setLoading(false);
      // The error is already handled by apiClient, just ensure loading state is reset
    },
  });

  const registerMutation = useEducatorRegister({
    onSuccess: () => {
      // Deliberately no storeLogin() here: the account still has to confirm its
      // email, and storing the session flips authStatus to 'loggedIn', which makes
      // AppRoutes unmount this auth flow before the verification screen is shown.
      setLoading(false);
      queryClient.invalidateQueries({ queryKey: educatorAuthQueryKeys.currentUser() });
    },
    onError: () => {
      setLoading(false);
      // The error is already handled by apiClient, just ensure loading state is reset
    },
  });

  const logoutMutation = useEducatorLogout({
    onSuccess: () => {
      storeLogout();
      queryClient.clear();
    },
    onError: () => {
      // Even if logout API fails, we should clear local state
      storeLogout();
      queryClient.clear();
    },
  });

  const updateProfileMutation = useEducatorUpdateProfile({
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: educatorAuthQueryKeys.currentUser() });
    },
  });

  const changePasswordMutation = useEducatorChangePassword();
  const forgotPasswordMutation = useEducatorForgotPassword();
  const resetPasswordMutation = useEducatorResetPassword();
  const verifyEmailCodeMutation = useEducatorVerifyEmailCode();
  const resendVerificationCodeMutation = useEducatorResendVerificationCode();
  const verifyResetCodeMutation = useEducatorVerifyResetCode();
  const resendResetCodeMutation = useEducatorResendResetCode();

  const { data: currentUser } = useEducatorGetCurrentUser({
    enabled: isAuthenticated && !isTokenExpired() && hasRole('educator'),
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    // If the query fails, it means the token might be invalid or expired, so log out
    onError: () => {
      if (isAuthenticated && isTokenExpired()) {
        storeLogout();
        queryClient.clear();
      }
    },
  });

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
  }, [currentUser, setUser]);

  // This effect is now redundant as useEducatorGetCurrentUser handles token expiration
  // useEffect(() => {
  //   if (isAuthenticated && isTokenExpired()) {
  //     storeLogout();
  //     queryClient.clear();
  //   }
  // }, [isAuthenticated, isTokenExpired, storeLogout, queryClient]);

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
    isAuthenticated: isAuthenticated && hasRole('educator'),
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

export const useEducatorUser = () => {
  const { user } = useEducatorAuth();
  return user;
};

export const useIsEducator = () => {
  const { hasRole } = useEducatorAuth();
  return hasRole('educator');
};

