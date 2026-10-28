/**
 * Advanced Error Handler Hook
 * Provides comprehensive error handling with user notifications and recovery
 */

import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  AppError, 
  ErrorCode, 
  ErrorSeverity, 
  ErrorUtils,
  errorManager 
} from '../api/errors';

// Error State Interface
interface ErrorState {
  error: AppError | null;
  isRetrying: boolean;
  retryCount: number;
  canRetry: boolean;
  isRecovering: boolean;
}

// Error Handler Configuration
interface ErrorHandlerConfig {
  maxRetries?: number;
  retryDelay?: number;
  showToast?: boolean;
  logError?: boolean;
  enableRecovery?: boolean;
  fallbackMessage?: string;
  onError?: (error: AppError) => void;
  onRetry?: (retryCount: number) => void;
  onRecover?: () => void;
}

// Recovery Strategy Interface
interface RecoveryStrategy {
  canRecover: (error: AppError) => boolean;
  recover: (error: AppError) => Promise<void>;
  description: string;
}

export function useErrorHandler(config: ErrorHandlerConfig = {}) {
  const queryClient = useQueryClient();
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRetrying: false,
    retryCount: 0,
    canRetry: false,
    isRecovering: false
  });

  const {
    maxRetries = 3,
    retryDelay = 1000,
    showToast = true,
    logError = true,
    enableRecovery = true,
    fallbackMessage = 'حدث خطأ غير متوقع',
    onError,
    onRetry,
    onRecover
  } = config;

  // Built-in recovery strategies
  const recoveryStrategies: RecoveryStrategy[] = [
    {
      canRecover: (error) => error.code === ErrorCode.UNAUTHORIZED,
      recover: async (error) => {
        // Try to refresh token
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            // Call refresh token endpoint
            // This is a simplified implementation
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
          }
        } catch (refreshError) {
          // Redirect to login
          window.location.href = '/login';
        }
      },
      description: 'محاولة تحديث رمز المصادقة'
    },
    {
      canRecover: (error) => error.code === ErrorCode.NETWORK_ERROR,
      recover: async (error) => {
        // Wait and retry network connection
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Try to ping the server
        try {
          await fetch('/api/health', { method: 'GET' });
        } catch {
          throw new AppError('لا يزال الاتصال بالخادم غير متوفر');
        }
      },
      description: 'التحقق من الاتصال بالخادم'
    },
    {
      canRecover: (error) => error.code === ErrorCode.SERVICE_UNAVAILABLE,
      recover: async (error) => {
        // Wait for service to come back online
        await new Promise(resolve => setTimeout(resolve, 5000));
      },
      description: 'انتظار عودة الخدمة'
    }
  ];

  // Handle error with full context
  const handleError = useCallback(async (error: Error | AppError, context?: any) => {
    const appError = error instanceof AppError 
      ? error 
      : new AppError(error.message || fallbackMessage);

    // Update error state
    setErrorState(prev => ({
      ...prev,
      error: appError,
      canRetry: ErrorUtils.isRetryable(appError),
      isRetrying: false,
      isRecovering: false
    }));

    // Log error if enabled
    if (logError) {
      console.error('[ErrorHandler]', {
        error: appError.toJSON(),
        context,
        timestamp: new Date().toISOString()
      });
    }

    // Call external error handler
    onError?.(appError);

    // Handle through error manager
    await errorManager.handleError(appError);

    // Show toast notification if enabled
    if (showToast && typeof window !== 'undefined') {
      // Assuming a toast system is available globally
      const message = ErrorUtils.getUserMessage(appError);
      const toastType = appError.severity === ErrorSeverity.CRITICAL ? 'error' : 'warning';
      
      // This would integrate with your toast system
      // window.showToast?.(message, toastType);
    }

  }, [fallbackMessage, logError, showToast, onError]);

  // Retry failed operation
  const retry = useCallback(async (operation?: () => Promise<any>) => {
    const { error, retryCount } = errorState;
    
    if (!error || retryCount >= maxRetries) {
      return;
    }

    setErrorState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1
    }));

    onRetry?.(retryCount + 1);

    try {
      // Wait before retry with exponential backoff
      const delay = retryDelay * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));

      // Execute retry operation if provided
      if (operation) {
        await operation();
      }

      // Clear error on successful retry
      setErrorState({
        error: null,
        isRetrying: false,
        retryCount: 0,
        canRetry: false,
        isRecovering: false
      });

    } catch (retryError) {
      const newError = retryError instanceof AppError 
        ? retryError 
        : new AppError('فشلت محاولة الأعادة');

      setErrorState(prev => ({
        ...prev,
        error: newError,
        isRetrying: false,
        canRetry: prev.retryCount < maxRetries - 1
      }));

      // Handle retry error
      await handleError(newError);
    }
  }, [errorState, maxRetries, retryDelay, onRetry, handleError]);

  // Attempt to recover from error
  const recover = useCallback(async () => {
    const { error } = errorState;
    
    if (!error || !enableRecovery) {
      return;
    }

    setErrorState(prev => ({
      ...prev,
      isRecovering: true
    }));

    // Find applicable recovery strategy
    const strategy = recoveryStrategies.find(s => s.canRecover(error));
    
    if (!strategy) {
      setErrorState(prev => ({
        ...prev,
        isRecovering: false
      }));
      return;
    }

    try {
      await strategy.recover(error);
      
      // Clear error on successful recovery
      setErrorState({
        error: null,
        isRetrying: false,
        retryCount: 0,
        canRetry: false,
        isRecovering: false
      });

      onRecover?.();

      // Invalidate all queries to refresh data
      await queryClient.invalidateQueries();

    } catch (recoveryError) {
      const newError = recoveryError instanceof AppError 
        ? recoveryError 
        : new AppError('فشلت محاولة الاستعادة');

      setErrorState(prev => ({
        ...prev,
        error: newError,
        isRecovering: false
      }));

      await handleError(newError);
    }
  }, [errorState, enableRecovery, queryClient, onRecover, handleError]);

  // Clear error state
  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isRetrying: false,
      retryCount: 0,
      canRetry: false,
      isRecovering: false
    });
  }, []);

  // Get user-friendly error message
  const getErrorMessage = useCallback(() => {
    if (!errorState.error) return '';
    return ErrorUtils.getUserMessage(errorState.error);
  }, [errorState.error]);

  // Get available recovery options
  const getRecoveryOptions = useCallback(() => {
    if (!errorState.error) return [];
    
    return recoveryStrategies
      .filter(strategy => strategy.canRecover(errorState.error!))
      .map(strategy => ({
        description: strategy.description,
        execute: () => strategy.recover(errorState.error!)
      }));
  }, [errorState.error]);

  // Handle global errors
  useEffect(() => {
    const handleUnhandledError = (event: ErrorEvent) => {
      handleError(new AppError(event.message || 'خطأ غير معالج'));
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleError(new AppError(event.reason?.message || 'رفض غير معالج'));
    };

    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [handleError]);

  return {
    // Error state
    error: errorState.error,
    isError: !!errorState.error,
    isRetrying: errorState.isRetrying,
    retryCount: errorState.retryCount,
    canRetry: errorState.canRetry,
    isRecovering: errorState.isRecovering,
    
    // Actions
    handleError,
    retry,
    recover,
    clearError,
    
    // Utilities
    getErrorMessage,
    getRecoveryOptions,
    
    // Error classification
    isNetworkError: errorState.error?.code === ErrorCode.NETWORK_ERROR,
    isAuthError: [ErrorCode.UNAUTHORIZED, ErrorCode.FORBIDDEN].includes(errorState.error?.code as ErrorCode),
    isValidationError: errorState.error?.code === ErrorCode.VALIDATION_ERROR,
    isServerError: errorState.error?.code === ErrorCode.INTERNAL_SERVER_ERROR,
    isCritical: errorState.error?.severity === ErrorSeverity.CRITICAL
  };
}

// Hook for handling specific error types
export function useAuthErrorHandler() {
  const errorHandler = useErrorHandler({
    enableRecovery: true,
    onError: (error) => {
      if (error.code === ErrorCode.UNAUTHORIZED) {
        // Handle token expiration
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
      }
    }
  });

  return {
    ...errorHandler,
    handleAuthError: errorHandler.handleError,
    isAuthError: [ErrorCode.UNAUTHORIZED, ErrorCode.FORBIDDEN].includes(
      errorHandler.error?.code as ErrorCode
    )
  };
}

// Hook for handling network errors
export function useNetworkErrorHandler() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const errorHandler = useErrorHandler({
    enableRecovery: true,
    onError: (error) => {
      if (error.code === ErrorCode.NETWORK_ERROR && !isOnline) {
        // Handle offline scenario
        console.warn('Network error occurred while offline');
      }
    }
  });

  return {
    ...errorHandler,
    isOnline,
    isNetworkError: errorHandler.error?.code === ErrorCode.NETWORK_ERROR
  };
}

export default useErrorHandler;
