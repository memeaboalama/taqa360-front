import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';
import {
  SystemService,
  SystemSettings,
  SystemStats,
} from '../services/SystemService';
import {
  ManagedItem,
  Country,
  City,
  EducationLevel,
  Subject,
  Language,
  SystemHealthCheck,
  SystemVersionInfo,
  SystemNotification,
  FeatureFlag,
  SystemAnalytics,
} from '../types';

// تعريف مفاتيح الاستعلام (Query Keys) لـ React Query
export const systemQueryKeys = {
  all: ['system'] as const,
  settings: () => [...systemQueryKeys.all, 'settings'] as const,
  stats: () => [...systemQueryKeys.all, 'stats'] as const,
  skills: (search?: string) => [...systemQueryKeys.all, 'skills', search] as const,
  popularSkills: (limit?: number) => [...systemQueryKeys.all, 'popularSkills', limit] as const,
  services: (search?: string) => [...systemQueryKeys.all, 'services', search] as const,
  popularServices: (limit?: number) => [...systemQueryKeys.all, 'popularServices', limit] as const,
  specializations: (search?: string) => [...systemQueryKeys.all, 'specializations', search] as const,
  countries: () => [...systemQueryKeys.all, 'countries'] as const,
  cities: (countryCode?: string) => [...systemQueryKeys.all, 'cities', countryCode] as const,
  educationLevels: () => [...systemQueryKeys.all, 'educationLevels'] as const,
  subjects: (educationLevel?: string) => [...systemQueryKeys.all, 'subjects', educationLevel] as const,
  languages: () => [...systemQueryKeys.all, 'languages'] as const,
  healthCheck: () => [...systemQueryKeys.all, 'healthCheck'] as const,
  versionInfo: () => [...systemQueryKeys.all, 'versionInfo'] as const,
  systemNotifications: () => [...systemQueryKeys.all, 'systemNotifications'] as const,
  featureFlags: () => [...systemQueryKeys.all, 'featureFlags'] as const,
  analytics: (timeframe?: 'day' | 'week' | 'month' | 'year') => [...systemQueryKeys.all, 'analytics', timeframe] as const,
  globalSearch: (query: string, types?: string[]) => [...systemQueryKeys.all, 'globalSearch', query, types] as const,
};

// Hooks لجلب البيانات (Queries)

export const useSystemSettings = (
  options?: Omit<UseQueryOptions<SystemSettings, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<SystemSettings, Error>({
    queryKey: systemQueryKeys.settings(),
    queryFn: SystemService.getSystemSettings,
    ...options,
  });
};

export const useSystemStats = (
  options?: Omit<UseQueryOptions<SystemStats, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<SystemStats, Error>({
    queryKey: systemQueryKeys.stats(),
    queryFn: SystemService.getSystemStats,
    ...options,
  });
};

export const useSkills = (
  search?: string,
  options?: Omit<UseQueryOptions<ManagedItem[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ManagedItem[], Error>({
    queryKey: systemQueryKeys.skills(search),
    queryFn: () => SystemService.getSkills(search),
    ...options,
  });
};

export const usePopularSkills = (
  limit?: number,
  options?: Omit<UseQueryOptions<{ id: string; name: string; usage_count: number }[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<{ id: string; name: string; usage_count: number }[], Error>({
    queryKey: systemQueryKeys.popularSkills(limit),
    queryFn: () => SystemService.getPopularSkills(limit),
    ...options,
  });
};

export const useServices = (
  search?: string,
  options?: Omit<UseQueryOptions<ManagedItem[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ManagedItem[], Error>({
    queryKey: systemQueryKeys.services(search),
    queryFn: () => SystemService.getServices(search),
    ...options,
  });
};

export const usePopularServices = (
  limit?: number,
  options?: Omit<UseQueryOptions<{ id: string; name: string; usage_count: number }[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<{ id: string; name: string; usage_count: number }[], Error>({
    queryKey: systemQueryKeys.popularServices(limit),
    queryFn: () => SystemService.getPopularServices(limit),
    ...options,
  });
};

export const useSpecializations = (
  search?: string,
  options?: Omit<UseQueryOptions<ManagedItem[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ManagedItem[], Error>({
    queryKey: systemQueryKeys.specializations(search),
    queryFn: () => SystemService.getSpecializations(search),
    ...options,
  });
};

export const useCountries = (
  options?: Omit<UseQueryOptions<Country[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Country[], Error>({
    queryKey: systemQueryKeys.countries(),
    queryFn: SystemService.getCountries,
    ...options,
  });
};

export const useCities = (
  countryCode?: string,
  options?: Omit<UseQueryOptions<City[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<City[], Error>({
    queryKey: systemQueryKeys.cities(countryCode),
    queryFn: () => SystemService.getCities(countryCode),
    ...options,
  });
};

export const useEducationLevels = (
  options?: Omit<UseQueryOptions<EducationLevel[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<EducationLevel[], Error>({
    queryKey: systemQueryKeys.educationLevels(),
    queryFn: SystemService.getEducationLevels,
    ...options,
  });
};

export const useSubjects = (
  educationLevel?: string,
  options?: Omit<UseQueryOptions<Subject[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Subject[], Error>({
    queryKey: systemQueryKeys.subjects(educationLevel),
    queryFn: () => SystemService.getSubjects(educationLevel),
    ...options,
  });
};

export const useLanguages = (
  options?: Omit<UseQueryOptions<Language[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Language[], Error>({
    queryKey: systemQueryKeys.languages(),
    queryFn: SystemService.getLanguages,
    ...options,
  });
};

export const useHealthCheck = (
  options?: Omit<UseQueryOptions<SystemHealthCheck, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<SystemHealthCheck, Error>({
    queryKey: systemQueryKeys.healthCheck(),
    queryFn: SystemService.healthCheck,
    ...options,
  });
};

export const useVersionInfo = (
  options?: Omit<UseQueryOptions<SystemVersionInfo, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<SystemVersionInfo, Error>({
    queryKey: systemQueryKeys.versionInfo(),
    queryFn: SystemService.getVersionInfo,
    ...options,
  });
};

export const useFeatureFlags = (
  options?: Omit<UseQueryOptions<FeatureFlag, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<FeatureFlag, Error>({
    queryKey: systemQueryKeys.featureFlags(),
    queryFn: SystemService.getFeatureFlags,
    ...options,
  });
};

export const useSystemAnalytics = (
  timeframe?: 'day' | 'week' | 'month' | 'year',
  options?: Omit<UseQueryOptions<SystemAnalytics, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<SystemAnalytics, Error>({
    queryKey: systemQueryKeys.analytics(timeframe),
    queryFn: () => SystemService.getAnalytics(timeframe),
    ...options,
  });
};

export const useSystemNotifications = (
  options?: Omit<UseQueryOptions<SystemNotification[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<SystemNotification[], Error>({
    queryKey: systemQueryKeys.systemNotifications(),
    queryFn: SystemService.getSystemNotifications,
    ...options,
  });
};

export const useGlobalSearch = (
  query: string,
  types?: string[],
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<any, Error>({
    queryKey: systemQueryKeys.globalSearch(query, types),
    queryFn: () => SystemService.globalSearch(query, types),
    enabled: !!query,
    ...options,
  });
};

// Hooks لتعديل البيانات (Mutations)

export const useClearCache = (
  options?: UseMutationOptions<{ cleared: string[]; message: string }, Error, string[]>
) => {
  const queryClient = useQueryClient();
  return useMutation<{ cleared: string[]; message: string }, Error, string[]>({
    mutationFn: SystemService.clearCache,
    onSuccess: (data, variables, context) => {
      // Invalidate relevant queries based on cleared types, or all if not specified
      queryClient.invalidateQueries(); 
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

