/**
 * Base Query Hook
 * Enterprise-grade React Query hooks following patterns from Meta, Airbnb, and Stripe
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
  MutationKey
} from '@tanstack/react-query';
import {
  ApiResponse,
  PaginatedResponse,
  QueryParams,
  BaseEntity
} from '../api/types';
import { AppError, errorManager, ErrorCode } from '../api/errors';
import { useCallback, useMemo } from 'react';
import { apiClient } from '../api/baseClient';

// Query Configuration Types
export interface BaseQueryConfig<TData = any> {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  retry?: boolean | number;
  retryDelay?: number;
  suspense?: boolean;
  keepPreviousData?: boolean;
  onSuccess?: (data: TData) => void;
  onError?: (error: AppError) => void;
}

export interface BaseMutationConfig<TData = any, TVariables = any> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: AppError, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: AppError | null, variables: TVariables) => void;
  enableOptimisticUpdates?: boolean;
}

// Query Key Factory
export class QueryKeyFactory {
  static readonly QUERIES = {
    EDUCATORS: 'educators',
    PROJECTS: 'projects',
    BIDS: 'bids',
    TASKS: 'tasks',
    SUPPORT_TICKETS: 'support-tickets',
    DASHBOARD: 'dashboard',
    ADMIN: 'admin',
    USERS: 'users',
    EDUCATIONAL_REQUESTS: 'educational-requests',
    INVOICES: 'invoices',
    NOTIFICATIONS: 'notifications',
    SYSTEM: 'system'
  } as const;

  // Generate standard query keys
  static all(entity: string): QueryKey {
    return [entity];
  }

  static lists(entity: string): QueryKey {
    return [entity, 'list'];
  }

  static list(entity: string, params?: QueryParams): QueryKey {
    return [entity, 'list', params];
  }

  static detail(entity: string, id: string): QueryKey {
    return [entity, 'detail', id];
  }

  static search(entity: string, query: string, params?: QueryParams): QueryKey {
    return [entity, 'search', query, params];
  }

  static count(entity: string, filters?: Record<string, any>): QueryKey {
    return [entity, 'count', filters];
  }

  static related(entity: string, id: string, relation: string, params?: QueryParams): QueryKey {
    return [entity, 'detail', id, relation, params];
  }

  static stats(entity: string, period?: string): QueryKey {
    return [entity, 'stats', period];
  }

  static dashboard(section?: string): QueryKey {
    return ['dashboard', section];
  }

  // Invalidation helpers
  static invalidateAll(queryClient: any, entity: string, refetchType: 'active' | 'inactive' | 'all' | 'none' = 'all'): Promise<void> {
    return queryClient.invalidateQueries({ queryKey: [entity], refetchType });
  }

  static invalidateList(queryClient: any, entity: string): Promise<void> {
    return queryClient.invalidateQueries({ queryKey: [entity, 'list'] });
  }

  static invalidateDetail(queryClient: any, entity: string, id: string): Promise<void> {
    return queryClient.invalidateQueries({ queryKey: [entity, 'detail', id] });
  }
}

// Base Query Hook
export function useBaseQuery<TData = any>(
  queryKey: QueryKey,
  queryFn: () => Promise<ApiResponse<TData>>,
  config?: BaseQueryConfig<TData>
) {
  const defaultConfig: UseQueryOptions<ApiResponse<TData>, AppError, TData> = {
    queryKey,
    queryFn,
    // Only pass options if explicitly provided so QueryClient defaults can apply
    ...(typeof config?.enabled !== 'undefined' ? { enabled: config.enabled } : {}),
    ...(typeof config?.staleTime !== 'undefined' ? { staleTime: config.staleTime } : {}),
    // Support both gcTime (v5) and legacy cacheTime by mapping to gcTime
    ...(typeof config?.gcTime !== 'undefined' ? { gcTime: config.gcTime } : {}),
    ...(typeof config?.cacheTime !== 'undefined' ? { gcTime: config.cacheTime } : {}),
    ...(typeof config?.refetchOnWindowFocus !== 'undefined' ? { refetchOnWindowFocus: config.refetchOnWindowFocus } : {}),
    ...(typeof config?.refetchOnMount !== 'undefined' ? { refetchOnMount: config.refetchOnMount } : {}),
    retry: typeof config?.retry !== 'undefined' ? config.retry : ((failureCount: number, error: AppError) => {
      if (!error || !(error instanceof AppError)) return failureCount < 2;
      // Do not retry on auth, not found, or server logic errors
      if ([ErrorCode.UNAUTHORIZED, ErrorCode.FORBIDDEN, ErrorCode.NOT_FOUND, ErrorCode.INTERNAL_SERVER_ERROR].includes(error.code)) {
        return false;
      }
      return failureCount < 2;
    }),
    ...(typeof config?.retryDelay !== 'undefined' ? { retryDelay: config.retryDelay } : {}),
    ...(typeof config?.suspense !== 'undefined' ? { suspense: config.suspense } : {}),
    ...(typeof config?.keepPreviousData !== 'undefined' ? { keepPreviousData: config.keepPreviousData } : {}),
    select: (data) => data.data,
    onSuccess: config?.onSuccess,
    onError: (error) => {
      errorManager.handleError(error);
      config?.onError?.(error);
    }
  };

  return useQuery(defaultConfig);
}

// Paginated Query Hook
export function usePaginatedQuery<TData = any>(
  queryKey: QueryKey,
  queryFn: () => Promise<PaginatedResponse<TData>>,
  config?: BaseQueryConfig<TData[]>
) {
  const query = useQuery<PaginatedResponse<TData>, AppError, PaginatedResponse<TData>>({
    queryKey,
    queryFn,
    ...(typeof config?.enabled !== 'undefined' ? { enabled: config.enabled } : {}),
    ...(typeof config?.staleTime !== 'undefined' ? { staleTime: config.staleTime } : {}),
    ...(typeof config?.cacheTime !== 'undefined' ? { cacheTime: config.cacheTime } : {}),
    ...(typeof config?.refetchOnWindowFocus !== 'undefined' ? { refetchOnWindowFocus: config.refetchOnWindowFocus } : {}),
    ...(typeof config?.keepPreviousData !== 'undefined' ? { keepPreviousData: config.keepPreviousData } : {}),
    onError: (error) => {
      errorManager.handleError(error);
      config?.onError?.(error as AppError);
    }
  });

  // Expose API's pagination object directly and keep data stable
  const pagination = useMemo(() => query.data?.pagination, [query.data]);
  const data = useMemo(() => query.data?.data || [], [query.data]);

  const hasNextPage = useMemo(() =>
    pagination ? Boolean(pagination.meta.page.isNext) : false,
    [pagination]
  );
  const hasPreviousPage = useMemo(() =>
    pagination ? Boolean(pagination.meta.page.isPrevious) : false,
    [pagination]
  );

  return {
    ...query,
    data,
    pagination,
    hasNextPage,
    hasPreviousPage,
    totalItems: pagination?.meta.page.total || 0,
    currentPage: pagination?.meta.page.current || 1,
    totalPages: pagination?.meta.page.last || 1
  };
}

// Base Mutation Hook
export function useBaseMutation<TData = any, TVariables = any>(
  mutationKey: MutationKey,
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  config?: BaseMutationConfig<TData, TVariables>
) {
  const queryClient = useQueryClient();

  const defaultConfig: UseMutationOptions<ApiResponse<TData>, AppError, TVariables> = {
    mutationKey,
    mutationFn,
    onSuccess: async (data, variables) => {
      // Pass inner data to configured onSuccess
      try {
        config?.onSuccess?.(data.data, variables);
      } catch {}

      // Clear API client's internal cache to ensure next GETs fetch fresh data
      try { apiClient.clearCache?.(); } catch {}

      // Derive likely affected entity from mutationKey and invalidate related queries
      try {
        let entityKey: any = null;
        if (Array.isArray(mutationKey) && mutationKey.length >= 2) {
          entityKey = mutationKey[1] || mutationKey[0];
        } else if (typeof mutationKey === 'string') {
          entityKey = mutationKey;
        }
        if (entityKey) {
          await queryClient.invalidateQueries({ predicate: (q) => {
            try {
              const key = q.queryKey;
              if (Array.isArray(key)) {
                return key.includes(entityKey) || key[0] === entityKey;
              }
              return String(key) === String(entityKey);
            } catch (e) { return true; }
          }});
        }
      } catch {}


    },
    onError: (error, variables) => {
      errorManager.handleError(error);
      config?.onError?.(error, variables);
    },
    onSettled: (data, error, variables) => {
      config?.onSettled?.(data?.data, error, variables);
    }
  };

  const mutation = useMutation(defaultConfig);

  // Optimistic update helpers
  const optimisticUpdate = useCallback(
    <TEntity extends BaseEntity>(
      queryKey: QueryKey,
      updater: (old: TEntity[]) => TEntity[],
      rollback?: () => void
    ) => {
      if (!config?.enableOptimisticUpdates) return;

      // Cancel outgoing refetches
      queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update
      queryClient.setQueryData(queryKey, (old: any) => {
        if (Array.isArray(old)) {
          return updater(old);
        }
        return old;
      });

      // Return rollback function
      return () => {
        queryClient.setQueryData(queryKey, previousData);
        rollback?.();
      };
    },
    [queryClient, config?.enableOptimisticUpdates]
  );

  return {
    ...mutation,
    optimisticUpdate
  };
}

// Infinite Query Hook for infinite scrolling
export function useInfiniteQuery<TData = any>(
  queryKey: QueryKey,
  queryFn: ({ pageParam }: { pageParam: number }) => Promise<PaginatedResponse<TData>>,
  config?: BaseQueryConfig<TData[]>
) {
  const query = useQuery({
    queryKey,
    queryFn: () => queryFn({ pageParam: 1 }),
    enabled: config?.enabled ?? true,
    staleTime: config?.staleTime ?? 5 * 60 * 1000,
    onError: (error: AppError) => {
      errorManager.handleError(error);
      config?.onError?.(error);
    }
  });

  // Simplified infinite query for demo purposes
  // In real implementation, use React Query's useInfiniteQuery
  return query;
}

// Real-time Query Hook with WebSocket support
export function useRealtimeQuery<TData = any>(
  queryKey: QueryKey,
  queryFn: () => Promise<ApiResponse<TData>>,
  config?: BaseQueryConfig<TData> & {
    realtimeEnabled?: boolean;
    websocketUrl?: string;
    realtimeEvents?: string[];
  }
) {
  const query = useBaseQuery(queryKey, queryFn, config);
  const queryClient = useQueryClient();

  // WebSocket subscription (simplified implementation)
  const subscribeToUpdates = useCallback(() => {
    if (!config?.realtimeEnabled || !config?.websocketUrl) return;

    // In real implementation, establish WebSocket connection
    // and listen for updates, then invalidate appropriate queries
    
    return () => {
      // Cleanup WebSocket connection
    };
  }, [config?.realtimeEnabled, config?.websocketUrl]);

  return {
    ...query,
    subscribeToUpdates
  };
}

// Query Status Helper Hook
export function useQueryStatus() {
  const queryClient = useQueryClient();

  const getQueryStatus = useCallback((queryKey: QueryKey) => {
    const query = queryClient.getQueryState(queryKey);
    return {
      isLoading: query?.status === 'loading',
      isError: query?.status === 'error',
      isSuccess: query?.status === 'success',
      isPending: query?.status === 'pending',
      dataUpdatedAt: query?.dataUpdatedAt,
      errorUpdatedAt: query?.errorUpdatedAt,
      fetchStatus: query?.fetchStatus
    };
  }, [queryClient]);

  const invalidateQueries = useCallback((queryKey: QueryKey) => {
    return queryClient.invalidateQueries({ queryKey });
  }, [queryClient]);

  const refetchQueries = useCallback((queryKey: QueryKey) => {
    return queryClient.refetchQueries({ queryKey });
  }, [queryClient]);

  const resetQueries = useCallback((queryKey: QueryKey) => {
    return queryClient.resetQueries({ queryKey });
  }, [queryClient]);

  return {
    getQueryStatus,
    invalidateQueries,
    refetchQueries,
    resetQueries
  };
}

// Cache Management Hook
export function useCacheManager() {
  const queryClient = useQueryClient();

  const clearCache = useCallback(() => {
    queryClient.clear();
  }, [queryClient]);

  const getCacheSize = useCallback(() => {
    return queryClient.getQueryCache().getAll().length;
  }, [queryClient]);

  const getCacheData = useCallback((queryKey: QueryKey) => {
    return queryClient.getQueryData(queryKey);
  }, [queryClient]);

  const setCacheData = useCallback((queryKey: QueryKey, data: any) => {
    queryClient.setQueryData(queryKey, data);
  }, [queryClient]);

  const removeCacheData = useCallback((queryKey: QueryKey) => {
    queryClient.removeQueries({ queryKey });
  }, [queryClient]);

  return {
    clearCache,
    getCacheSize,
    getCacheData,
    setCacheData,
    removeCacheData
  };
}

export default useBaseQuery;
