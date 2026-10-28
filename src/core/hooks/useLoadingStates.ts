/**
 * Loading States Management Hook
 * Professional loading state management with UX optimizations
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// Loading State Interface
interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
  progress?: number;
  error?: string | null;
}

// Multiple Loading States Manager
interface LoadingStatesManager {
  [key: string]: LoadingState;
}

// Loading Options
interface LoadingOptions {
  minDuration?: number; // Minimum loading duration for UX
  text?: string;
  showProgress?: boolean;
  silent?: boolean; // Don't show loading indicator
}

// Use Loading Hook
export function useLoading(initialState: boolean = false) {
  const [isLoading, setIsLoading] = useState(initialState);
  const [loadingText, setLoadingText] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startLoading = useCallback((options: LoadingOptions = {}) => {
    const { minDuration = 300, text = 'جاري التحميل...', silent = false } = options;
    
    if (!silent) {
      setIsLoading(true);
      setLoadingText(text);
      setProgress(0);
      setError(null);
      startTimeRef.current = Date.now();
    }
  }, []);

  const stopLoading = useCallback((options: { error?: string } = {}) => {
    const { error: errorMessage } = options;
    
    if (errorMessage) {
      setError(errorMessage);
      setIsLoading(false);
      return;
    }

    // Ensure minimum loading duration for better UX
    const elapsed = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
    const remainingTime = Math.max(300 - elapsed, 0);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setError(null);
      setProgress(100);
    }, remainingTime);
  }, []);

  const updateProgress = useCallback((newProgress: number) => {
    setProgress(Math.min(Math.max(newProgress, 0), 100));
  }, []);

  const updateText = useCallback((text: string) => {
    setLoadingText(text);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    loadingText,
    progress,
    error,
    startLoading,
    stopLoading,
    updateProgress,
    updateText,
    clearError
  };
}

// Multiple Loading States Hook
export function useLoadingStates() {
  const [states, setStates] = useState<LoadingStatesManager>({});

  const startLoading = useCallback((key: string, options: LoadingOptions = {}) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        isLoading: true,
        loadingText: options.text || 'جاري التحميل...',
        progress: 0,
        error: null
      }
    }));
  }, []);

  const stopLoading = useCallback((key: string, error?: string) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        isLoading: false,
        error: error || null,
        progress: 100
      }
    }));
  }, []);

  const updateProgress = useCallback((key: string, progress: number) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        progress: Math.min(Math.max(progress, 0), 100)
      }
    }));
  }, []);

  const getLoadingState = useCallback((key: string): LoadingState => {
    return states[key] || { isLoading: false, error: null };
  }, [states]);

  const isAnyLoading = useCallback((): boolean => {
    return Object.values(states).some(state => state.isLoading);
  }, [states]);

  const clearState = useCallback((key: string) => {
    setStates(prev => {
      const newStates = { ...prev };
      delete newStates[key];
      return newStates;
    });
  }, []);

  const clearAllStates = useCallback(() => {
    setStates({});
  }, []);

  return {
    states,
    startLoading,
    stopLoading,
    updateProgress,
    getLoadingState,
    isAnyLoading,
    clearState,
    clearAllStates
  };
}

// Async Operation Hook with Loading
export function useAsyncOperation<TResult = any, TError = Error>() {
  const [data, setData] = useState<TResult | null>(null);
  const [error, setError] = useState<TError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (
    operation: (signal?: AbortSignal) => Promise<TResult>,
    options: LoadingOptions = {}
  ) => {
    try {
      // Cancel previous operation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);

      const result = await operation(abortControllerRef.current.signal);
      
      setData(result);
      return result;
    } catch (err) {
      // Don't set error if operation was aborted
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err as TError);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    error,
    isLoading,
    execute,
    cancel,
    reset
  };
}

// Progressive Loading Hook (for step-by-step operations)
export function useProgressiveLoading(steps: string[]) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [failedSteps, setFailedSteps] = useState<Set<number>>(new Set());

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setFailedSteps(new Set());
  }, []);

  const nextStep = useCallback(() => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  }, [currentStep, steps.length]);

  const failCurrentStep = useCallback(() => {
    setFailedSteps(prev => new Set([...prev, currentStep]));
    setIsLoading(false);
  }, [currentStep]);

  const completeLoading = useCallback(() => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    setIsLoading(false);
  }, [currentStep]);

  const getProgress = useCallback(() => {
    return (completedSteps.size / steps.length) * 100;
  }, [completedSteps.size, steps.length]);

  const getCurrentStepText = useCallback(() => {
    return steps[currentStep] || '';
  }, [steps, currentStep]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setIsLoading(false);
    setCompletedSteps(new Set());
    setFailedSteps(new Set());
  }, []);

  return {
    isLoading,
    currentStep,
    completedSteps,
    failedSteps,
    progress: getProgress(),
    currentStepText: getCurrentStepText(),
    startLoading,
    nextStep,
    failCurrentStep,
    completeLoading,
    reset
  };
}

// Debounced Loading Hook (prevent flickering)
export function useDebouncedLoading(delay: number = 300) {
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedLoading, setDebouncedLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (loading) {
      // Show loading immediately if starting
      timeoutRef.current = setTimeout(() => {
        setDebouncedLoading(true);
      }, delay);
    } else {
      // Hide loading immediately if stopping
      setDebouncedLoading(false);
    }
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    debouncedLoading,
    setLoading
  };
}

// Loading with Retry Hook
export function useLoadingWithRetry<TResult = any>(
  operation: () => Promise<TResult>,
  maxRetries: number = 3,
  retryDelay: number = 1000
) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<TResult | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setRetryCount(0);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          setIsRetrying(true);
          setRetryCount(attempt);
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }

        const result = await operation();
        setData(result);
        setIsLoading(false);
        setIsRetrying(false);
        return result;
      } catch (err) {
        lastError = err as Error;
        
        if (attempt === maxRetries) {
          setError(lastError);
          setIsLoading(false);
          setIsRetrying(false);
          throw lastError;
        }
      }
    }
  }, [operation, maxRetries, retryDelay]);

  const retry = useCallback(() => {
    execute();
  }, [execute]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
    setIsRetrying(false);
    setRetryCount(0);
  }, []);

  return {
    data,
    error,
    isLoading,
    isRetrying,
    retryCount,
    execute,
    retry,
    reset,
    canRetry: !isLoading && !!error && retryCount < maxRetries
  };
}

export default {
  useLoading,
  useLoadingStates,
  useAsyncOperation,
  useProgressiveLoading,
  useDebouncedLoading,
  useLoadingWithRetry
};
