import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { realtime, wireRealtimeInvalidation } from '../../core/services/realtime';

// إعداد Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 401 || error?.response?.status === 403) return false;
        return failureCount < 3;
      },
      // Prevent refetch storms when switching apps / refocusing
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
    },
    mutations: {
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  React.useEffect(() => {
    let lastRefetch = 0;
    const configuredInterval = Number((import.meta as any).env?.VITE_REFETCH_THROTTLE_MS);
    const MIN_INTERVAL = Number.isFinite(configuredInterval) && configuredInterval > 0
      ? configuredInterval
      : 30 * 1000;

    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      const now = Date.now();
      if (now - lastRefetch < MIN_INTERVAL) return;
      lastRefetch = now;
      // Only refetch stale queries to avoid duplicate network calls
      queryClient.refetchQueries({ type: 'active', stale: true }).catch(() => {});
    };

    const onOnline = () => {
      // when connection restores, softly refetch stale queries
      queryClient.refetchQueries({ type: 'active', stale: true }).catch(() => {});
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('online', onOnline);

    // Wire realtime invalidation if WS/SSE URL provided
    const unsubscribe = wireRealtimeInvalidation(queryClient);
    realtime.connect();

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('online', onOnline);
      try { unsubscribe?.(); } catch {}
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {(import.meta as any).env?.DEV && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </QueryClientProvider>
  );
};

export { queryClient };
