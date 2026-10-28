import { 
  useQuery, 
  useMutation, 
  useQueryClient, 
  UseQueryOptions,
  UseMutationOptions 
} from '@tanstack/react-query';
import { AdminService, AdminDashboardStats, PaginatedResponse } from '../services/AdminService';
import { 
  Project, 
  Educator, 
  User, 
  EducationalRequest, 
  SupportTicket,
  EducatorApplication,
  ManagedItem,
  AdminActivity,
  UserStatus,
  EducatorStatus
} from '../../../shared/types';

// تعريف مفاتيح الاستعلام (Query Keys) لـ React Query
export const adminQueryKeys = {
  all: ['admin'] as const,
  dashboardStats: () => [...adminQueryKeys.all, 'dashboardStats'] as const,
  projects: (params: any = {}) => [...adminQueryKeys.all, 'projects', params] as const,
  project: (id: string) => [...adminQueryKeys.all, 'projects', id] as const,
  educators: (params: any = {}) => [...adminQueryKeys.all, 'educators', params] as const,
  educator: (id: string) => [...adminQueryKeys.all, 'educators', id] as const,
  educatorApplications: (params: any = {}) => [...adminQueryKeys.all, 'educatorApplications', params] as const,
  educatorApplication: (id: string) => [...adminQueryKeys.all, 'educatorApplications', id] as const,
  users: (params: any = {}) => [...adminQueryKeys.all, 'users', params] as const,
  user: (id: string) => [...adminQueryKeys.all, 'users', id] as const,
  educationalRequests: (params: any = {}) => [...adminQueryKeys.all, 'educationalRequests', params] as const,
  educationalRequest: (id: string) => [...adminQueryKeys.all, 'educationalRequests', id] as const,
  supportTickets: (params: any = {}) => [...adminQueryKeys.all, 'supportTickets', params] as const,
  supportTicket: (id: string) => [...adminQueryKeys.all, 'supportTickets', id] as const,
  managedItems: (type: string) => [...adminQueryKeys.all, 'managedItems', type] as const,
  activityFeed: (params: any = {}) => [...adminQueryKeys.all, 'activityFeed', params] as const,
  academicMajors: (params: any = {}) => [...adminQueryKeys.all, 'academicMajors', params] as const,
  services: (params: any = {}) => [...adminQueryKeys.all, 'services', params] as const,
  skills: (params: any = {}) => [...adminQueryKeys.all, 'skills', params] as const,
};

// Hooks لجلب البيانات (Queries)

export const useAdminDashboardStats = (options?: Omit<UseQueryOptions<AdminDashboardStats, Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery<AdminDashboardStats, Error>({
    queryKey: adminQueryKeys.dashboardStats(),
    queryFn: AdminService.getDashboardStats,
    ...options,
  });
};

export const useAdminProjects = (
  params?: Parameters<typeof AdminService.getProjects>[0],
  options?: Omit<UseQueryOptions<PaginatedResponse<Project>, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<PaginatedResponse<Project>, Error>({
    queryKey: adminQueryKeys.projects(params),
    queryFn: () => AdminService.getProjects(params),
    ...options,
  });
};

export const useAdminProject = (id: string, options?: Omit<UseQueryOptions<Project, Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery<Project, Error>({
    queryKey: adminQueryKeys.project(id),
    queryFn: () => AdminService.getProject(id),
    enabled: !!id,
    ...options,
  });
};

export const useAdminEducators = (
  params?: Parameters<typeof AdminService.getEducators>[0],
  options?: Omit<UseQueryOptions<PaginatedResponse<Educator>, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<PaginatedResponse<Educator>, Error>({
    queryKey: adminQueryKeys.educators(params),
    queryFn: () => AdminService.getEducators(params),
    ...options,
  });
};

export const useAdminEducator = (id: string, options?: Omit<UseQueryOptions<Educator, Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery<Educator, Error>({
    queryKey: adminQueryKeys.educator(id),
    queryFn: () => AdminService.getEducator(id),
    enabled: !!id,
    ...options,
  });
};

export const useAdminEducatorApplications = (
  params?: Parameters<typeof AdminService.getEducatorApplications>[0],
  options?: Omit<UseQueryOptions<PaginatedResponse<EducatorApplication>, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<PaginatedResponse<EducatorApplication>, Error>({
    queryKey: adminQueryKeys.educatorApplications(params),
    queryFn: () => AdminService.getEducatorApplications(params),
    ...options,
  });
};

export const useAdminEducatorApplication = (id: string, options?: Omit<UseQueryOptions<EducatorApplication, Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery<EducatorApplication, Error>({
    queryKey: adminQueryKeys.educatorApplication(id),
    queryFn: () => AdminService.getEducatorApplication(id),
    enabled: !!id,
    ...options,
  });
};

export const useAdminUsers = (
  params?: Parameters<typeof AdminService.getUsers>[0],
  options?: Omit<UseQueryOptions<PaginatedResponse<User>, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<PaginatedResponse<User>, Error>({
    queryKey: adminQueryKeys.users(params),
    queryFn: () => AdminService.getUsers(params),
    ...options,
  });
};

export const useAdminUser = (id: string, options?: Omit<UseQueryOptions<User, Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery<User, Error>({
    queryKey: adminQueryKeys.user(id),
    queryFn: () => AdminService.getUser(id),
    enabled: !!id,
    ...options,
  });
};

export const useAdminEducationalRequests = (
  params?: Parameters<typeof AdminService.getEducationalRequests>[0],
  options?: Omit<UseQueryOptions<PaginatedResponse<EducationalRequest>, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<PaginatedResponse<EducationalRequest>, Error>({
    queryKey: adminQueryKeys.educationalRequests(params),
    queryFn: () => AdminService.getEducationalRequests(params),
    ...options,
  });
};

export const useAdminEducationalRequest = (id: string, options?: Omit<UseQueryOptions<EducationalRequest, Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery<EducationalRequest, Error>({
    queryKey: adminQueryKeys.educationalRequest(id),
    queryFn: () => AdminService.getEducationalRequest(id),
    enabled: !!id,
    ...options,
  });
};

export const useAdminSupportTickets = (
  params?: Parameters<typeof AdminService.getSupportTickets>[0],
  options?: Omit<UseQueryOptions<PaginatedResponse<SupportTicket>, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<PaginatedResponse<SupportTicket>, Error>({
    queryKey: adminQueryKeys.supportTickets(params),
    queryFn: () => AdminService.getSupportTickets(params),
    ...options,
  });
};

export const useAdminSupportTicket = (id: string, options?: Omit<UseQueryOptions<SupportTicket, Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery<SupportTicket, Error>({
    queryKey: adminQueryKeys.supportTicket(id),
    queryFn: () => AdminService.getSupportTicket(id),
    enabled: !!id,
    ...options,
  });
};

export const useAdminManagedItems = (
  type: 'skills' | 'services' | 'specializations',
  options?: Omit<UseQueryOptions<ManagedItem[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ManagedItem[], Error>({
    queryKey: adminQueryKeys.managedItems(type),
    queryFn: () => AdminService.getManagedItems(type),
    enabled: !!type,
    ...options,
  });
};

export const useAdminActivityFeed = (
  params?: Parameters<typeof AdminService.getActivityFeed>[0],
  options?: Omit<UseQueryOptions<PaginatedResponse<AdminActivity>, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<PaginatedResponse<AdminActivity>, Error>({
    queryKey: adminQueryKeys.activityFeed(params),
    queryFn: () => AdminService.getActivityFeed(params),
    ...options,
  });
};

// Academic Majors
export const useAdminAcademicMajors = (
  params?: Parameters<typeof AdminService.getAcademicMajors>[0],
  options?: Omit<UseQueryOptions<any[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<any[], Error>({
    queryKey: adminQueryKeys.academicMajors(params),
    queryFn: () => AdminService.getAcademicMajors(params),
    ...options,
  });
};

export const useCreateAcademicMajor = (
  options?: UseMutationOptions<any, Error, { ar: string; en: string }>
) => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { ar: string; en: string}>({
    mutationFn: (name) => AdminService.createAcademicMajor(name),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.academicMajors() });
      const previous = queryClient.getQueriesData<any[]>({ queryKey: adminQueryKeys.academicMajors() });
      const temp = { id: `temp-${Date.now()}`, name: { ar: vars.ar, en: vars.en }, status: 'ACTIVE' } as any;
      previous.forEach(([key, old]) => {
        queryClient.setQueryData(key, (Array.isArray(old) ? [...old, temp] : [temp]));
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previous?.forEach?.(([key, data]: any) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.academicMajors() });
    },
    onSuccess: (data, vars, ctx) => {
      // Replace temp with real item if present
      const datasets = queryClient.getQueriesData<any[]>({ queryKey: adminQueryKeys.academicMajors() });
      datasets.forEach(([key, list]) => {
        if (!Array.isArray(list)) return;
        const idx = list.findIndex((i: any) => String(i.id).startsWith('temp-'));
        if (idx >= 0) {
          const next = list.slice();
          next[idx] = data;
          queryClient.setQueryData(key, next);
        }
      });
      options?.onSuccess?.(data, vars, ctx);
    },
    ...options,
  });
};

export const useUpdateAcademicMajor = (
  options?: UseMutationOptions<any, Error, { id: string; name: { ar: string; en: string } }>
) => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { id: string; name: { ar: string; en: string } }>({
    mutationFn: ({ id, name }) => AdminService.updateAcademicMajor(id, name),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.academicMajors() });
      const previous = queryClient.getQueriesData<any[]>({ queryKey: adminQueryKeys.academicMajors() });
      previous.forEach(([key, list]) => {
        if (!Array.isArray(list)) return;
        queryClient.setQueryData(key, list.map((i: any) => String(i.id) === String(vars.id) ? { ...i, name: vars.name } : i));
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previous?.forEach?.(([key, data]: any) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.academicMajors() });
    },
    onSuccess: (data, vars, ctx) => {
      options?.onSuccess?.(data, vars, ctx);
    },
    ...options,
  });
};

export const useToggleAcademicMajorStatus = (
  options?: UseMutationOptions<any, Error, string>
) => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: (id) => AdminService.toggleAcademicMajorStatus(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.academicMajors() });
      const previous = queryClient.getQueriesData<any[]>({ queryKey: adminQueryKeys.academicMajors() });
      previous.forEach(([key, list]) => {
        if (!Array.isArray(list)) return;
        queryClient.setQueryData(key, list.map((i: any) => String(i.id) === String(id) ? { ...i, status: String(i.status).toLowerCase() === 'active' ? 'INACTIVE' : 'ACTIVE' } : i));
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previous?.forEach?.(([key, data]: any) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.academicMajors() });
    },
    onSuccess: (data, id, ctx) => {
      options?.onSuccess?.(data, id, ctx);
    },
    ...options,
  });
};

export const useDeleteAcademicMajor = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => AdminService.deleteAcademicMajor(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.academicMajors() });
      const previous = queryClient.getQueriesData<any[]>({ queryKey: adminQueryKeys.academicMajors() });
      previous.forEach(([key, list]) => {
        if (!Array.isArray(list)) return;
        queryClient.setQueryData(key, list.filter((i: any) => String(i.id) !== String(id)));
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previous?.forEach?.(([key, data]: any) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.academicMajors() });
    },
    onSuccess: (data, id, ctx) => {
      options?.onSuccess?.(data, id, ctx);
    },
    ...options,
  });
};

// Services
export const useAdminServices = (
  params?: Parameters<typeof AdminService.getServices>[0],
  options?: Omit<UseQueryOptions<any[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<any[], Error>({
    queryKey: adminQueryKeys.services(params),
    queryFn: () => AdminService.getServices(params),
    ...options,
  });
};

export const useCreateService = (
  options?: UseMutationOptions<any, Error, { name: { ar: string; en: string }; description?: { ar: string; en: string } }>
) => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { name: { ar: string; en: string }; description?: { ar: string; en: string } }>({
    mutationFn: (payload) => AdminService.createService(payload),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.services() });
      const previous = queryClient.getQueriesData<any[]>({ queryKey: adminQueryKeys.services() });
      const temp = { id: `temp-${Date.now()}`, name: vars.name, description: vars.description, status: 'ACTIVE' } as any;
      previous.forEach(([key, old]) => {
        queryClient.setQueryData(key, (Array.isArray(old) ? [...old, temp] : [temp]));
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previous?.forEach?.(([key, data]: any) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.services() });
    },
    onSuccess: (data, vars, ctx) => {
      const datasets = queryClient.getQueriesData<any[]>({ queryKey: adminQueryKeys.services() });
      datasets.forEach(([key, list]) => {
        if (!Array.isArray(list)) return;
        const idx = list.findIndex((i: any) => String(i.id).startsWith('temp-'));
        if (idx >= 0) {
          const next = list.slice();
          next[idx] = data;
          queryClient.setQueryData(key, next);
        }
      });
      options?.onSuccess?.(data, vars, ctx);
    },
    ...options,
  });
};

export const useUpdateService = (
  options?: UseMutationOptions<any, Error, { id: string; payload: { name: { ar: string; en: string }; description?: { ar: string; en: string } } }>
) => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { id: string; payload: { name: { ar: string; en: string }; description?: { ar: string; en: string } } }>({
    mutationFn: ({ id, payload }) => AdminService.updateService(id, payload),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.services() });
      const previous = queryClient.getQueriesData<any[]>({ queryKey: adminQueryKeys.services() });
      previous.forEach(([key, list]) => {
        if (!Array.isArray(list)) return;
        queryClient.setQueryData(key, list.map((i: any) => String(i.id) === String(vars.id) ? { ...i, name: vars.payload.name, description: vars.payload.description } : i));
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previous?.forEach?.(([key, data]: any) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.services() });
    },
    onSuccess: (data, vars, ctx) => {
      options?.onSuccess?.(data, vars, ctx);
    },
    ...options,
  });
};

export const useToggleServiceStatus = (
  options?: UseMutationOptions<any, Error, string>
) => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: (id) => AdminService.toggleServiceStatus(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.services() });
      const previous = queryClient.getQueriesData<any[]>({ queryKey: adminQueryKeys.services() });
      previous.forEach(([key, list]) => {
        if (!Array.isArray(list)) return;
        queryClient.setQueryData(key, list.map((i: any) => String(i.id) === String(id) ? { ...i, status: String(i.status).toLowerCase() === 'active' ? 'INACTIVE' : 'ACTIVE' } : i));
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previous?.forEach?.(([key, data]: any) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.services() });
    },
    onSuccess: (data, id, ctx) => {
      options?.onSuccess?.(data, id, ctx);
    },
    ...options,
  });
};

export const useDeleteService = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => AdminService.deleteService(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.services() });
      const previous = queryClient.getQueriesData<any[]>({ queryKey: adminQueryKeys.services() });
      previous.forEach(([key, list]) => {
        if (!Array.isArray(list)) return;
        queryClient.setQueryData(key, list.filter((i: any) => String(i.id) !== String(id)));
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previous?.forEach?.(([key, data]: any) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.services() });
    },
    onSuccess: (data, id, ctx) => {
      options?.onSuccess?.(data, id, ctx);
    },
    ...options,
  });
};

// Skills
export const useAdminSkills = (
  params?: Parameters<typeof AdminService.getSkills>[0],
  options?: Omit<UseQueryOptions<any[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<any[], Error>({
    queryKey: adminQueryKeys.skills(params),
    queryFn: () => AdminService.getSkills(params),
    ...options,
  });
};

export const useCreateSkill = (
  options?: UseMutationOptions<any, Error, { ar: string; en: string }>
) => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { ar: string; en: string }>({
    mutationFn: (name) => AdminService.createSkill(name),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.skills() });
      const previous = queryClient.getQueriesData<any[]>({ queryKey: adminQueryKeys.skills() });
      const temp = { id: `temp-${Date.now()}`, name: { ar: vars.ar, en: vars.en }, status: 'ACTIVE' } as any;
      previous.forEach(([key, old]) => {
        queryClient.setQueryData(key, (Array.isArray(old) ? [...old, temp] : [temp]));
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previous?.forEach?.(([key, data]: any) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.skills() });
    },
    onSuccess: (data, vars, ctx) => {
      const datasets = queryClient.getQueriesData<any[]>({ queryKey: adminQueryKeys.skills() });
      datasets.forEach(([key, list]) => {
        if (!Array.isArray(list)) return;
        const idx = list.findIndex((i: any) => String(i.id).startsWith('temp-'));
        if (idx >= 0) {
          const next = list.slice();
          next[idx] = data;
          queryClient.setQueryData(key, next);
        }
      });
      options?.onSuccess?.(data, vars, ctx);
    },
    ...options,
  });
};

export const useUpdateSkill = (
  options?: UseMutationOptions<any, Error, { id: string; name: { ar: string; en: string } }>
) => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, { id: string; name: { ar: string; en: string } }>({
    mutationFn: ({ id, name }) => AdminService.updateSkill(id, name),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.skills() });
      const previous = queryClient.getQueriesData<any[]>({ queryKey: adminQueryKeys.skills() });
      previous.forEach(([key, list]) => {
        if (!Array.isArray(list)) return;
        queryClient.setQueryData(key, list.map((i: any) => String(i.id) === String(vars.id) ? { ...i, name: vars.name } : i));
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previous?.forEach?.(([key, data]: any) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.skills() });
    },
    onSuccess: (data, vars, ctx) => {
      options?.onSuccess?.(data, vars, ctx);
    },
    ...options,
  });
};

export const useToggleSkillStatus = (
  options?: UseMutationOptions<any, Error, string>
) => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, string>({
    mutationFn: (id) => AdminService.toggleSkillStatus(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.skills() });
      const previous = queryClient.getQueriesData<any[]>({ queryKey: adminQueryKeys.skills() });
      previous.forEach(([key, list]) => {
        if (!Array.isArray(list)) return;
        queryClient.setQueryData(key, list.map((i: any) => String(i.id) === String(id) ? { ...i, status: String(i.status).toLowerCase() === 'active' ? 'INACTIVE' : 'ACTIVE' } : i));
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previous?.forEach?.(([key, data]: any) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.skills() });
    },
    onSuccess: (data, id, ctx) => {
      options?.onSuccess?.(data, id, ctx);
    },
    ...options,
  });
};

export const useDeleteSkill = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => AdminService.deleteSkill(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.skills() });
      const previous = queryClient.getQueriesData<any[]>({ queryKey: adminQueryKeys.skills() });
      previous.forEach(([key, list]) => {
        if (!Array.isArray(list)) return;
        queryClient.setQueryData(key, list.filter((i: any) => String(i.id) !== String(id)));
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previous?.forEach?.(([key, data]: any) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.skills() });
    },
    onSuccess: (data, id, ctx) => {
      options?.onSuccess?.(data, id, ctx);
    },
    ...options,
  });
};

// Hooks لتعديل البيانات (Mutations)

export const useCreateAdminProject = (options?: UseMutationOptions<Project, Error, Partial<Project>>) => {
  const queryClient = useQueryClient();
  return useMutation<Project, Error, Partial<Project>>({
    mutationFn: AdminService.createProject,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.projects() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboardStats() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateAdminProject = (options?: UseMutationOptions<Project, Error, { id: string; data: Partial<Project> }>) => {
  const queryClient = useQueryClient();
  return useMutation<Project, Error, { id: string; data: Partial<Project> }>({
    mutationFn: ({ id, data }) => AdminService.updateProject(id, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.projects() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.project(variables.id) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useDeleteAdminProject = (options?: UseMutationOptions<void, Error, string>) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: AdminService.deleteProject,
    onSuccess: (data, id, context) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.projects() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboardStats() });
      queryClient.removeQueries({ queryKey: adminQueryKeys.project(id) });
      options?.onSuccess?.(data, id, context);
    },
    ...options,
  });
};

export const usePublishAdminProject = (options?: UseMutationOptions<Project, Error, string>) => {
  const queryClient = useQueryClient();
  return useMutation<Project, Error, string>({
    mutationFn: AdminService.publishProject,
    onSuccess: (data, id, context) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.projects() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.project(id) });
      options?.onSuccess?.(data, id, context);
    },
    ...options,
  });
};

export const useUnpublishAdminProject = (options?: UseMutationOptions<Project, Error, string>) => {
  const queryClient = useQueryClient();
  return useMutation<Project, Error, string>({
    mutationFn: AdminService.unpublishProject,
    onSuccess: (data, id, context) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.projects() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.project(id) });
      options?.onSuccess?.(data, id, context);
    },
    ...options,
  });
};

export const useUpdateEducatorDocumentStatus = (
  options?: UseMutationOptions<Educator, Error, { educatorId: string; type: 'identity' | 'academic' | 'experience' | 'certification'; docId: string; status: 'VERIFIED' | 'REJECTED' | 'PENDING'; reason?: string; }>
) => {
  const queryClient = useQueryClient();
  return useMutation<Educator, Error, { educatorId: string; type: 'identity' | 'academic' | 'experience' | 'certification'; docId: string; status: 'VERIFIED' | 'REJECTED' | 'PENDING'; reason?: string; }>({
    mutationFn: ({ educatorId, ...payload }) => AdminService.updateEducatorDocumentStatus(educatorId, payload as any),
    onSuccess: (data, vars, ctx) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.educator(vars.educatorId) });
      options?.onSuccess?.(data, vars, ctx);
    },
    ...options,
  });
};

export const useUpdateAdminEducatorStatus = (options?: UseMutationOptions<Educator, Error, { id: string; status: EducatorStatus; reason?: string }>) => {
  const queryClient = useQueryClient();
  return useMutation<Educator, Error, { id: string; status: EducatorStatus; reason?: string }>({
    mutationFn: ({ id, status, reason }) => AdminService.updateEducatorStatus(id, status, reason),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.educators() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.educator(variables.id) });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.educatorApplications() }); // Invalidate applications as status change might affect them
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useDeleteAdminEducator = (options?: UseMutationOptions<void, Error, string>) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: AdminService.deleteEducator,
    onSuccess: (data, id, context) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.educators() });
      queryClient.removeQueries({ queryKey: adminQueryKeys.educator(id) });
      options?.onSuccess?.(data, id, context);
    },
    ...options,
  });
};

export const useApproveEducatorApplication = (options?: UseMutationOptions<EducatorApplication, Error, { id: string; message?: string }>) => {
  const queryClient = useQueryClient();
  return useMutation<EducatorApplication, Error, { id: string; message?: string }>({
    mutationFn: ({ id, message }) => AdminService.approveEducatorApplication(id, message),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.educatorApplications() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.educatorApplication(variables.id) });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.educators() }); // New educator might be created or status changed
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useRejectEducatorApplication = (options?: UseMutationOptions<EducatorApplication, Error, { id: string; reason: string }>) => {
  const queryClient = useQueryClient();
  return useMutation<EducatorApplication, Error, { id: string; reason: string }>({
    mutationFn: ({ id, reason }) => AdminService.rejectEducatorApplication(id, reason),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.educatorApplications() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.educatorApplication(variables.id) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateAdminUserStatus = (options?: UseMutationOptions<User, Error, { id: string; status: UserStatus; reason?: string }>) => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, { id: string; status: UserStatus; reason?: string }>({
    mutationFn: ({ id, status, reason }) => AdminService.updateUserStatus(id, status, reason),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.user(variables.id) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useDeleteAdminUser = (options?: UseMutationOptions<void, Error, string>) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: AdminService.deleteUser,
    onSuccess: (data, id, context) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users() });
      queryClient.removeQueries({ queryKey: adminQueryKeys.user(id) });
      options?.onSuccess?.(data, id, context);
    },
    ...options,
  });
};

export const useCreateAdminManagedItem = (options?: UseMutationOptions<ManagedItem, Error, { type: 'skills' | 'services' | 'specializations'; data: Partial<ManagedItem> }>) => {
  const queryClient = useQueryClient();
  return useMutation<ManagedItem, Error, { type: 'skills' | 'services' | 'specializations'; data: Partial<ManagedItem> }>({
    mutationFn: ({ type, data }) => AdminService.createManagedItem(type, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.managedItems(variables.type) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateAdminManagedItem = (options?: UseMutationOptions<ManagedItem, Error, { type: 'skills' | 'services' | 'specializations'; id: string; data: Partial<ManagedItem> }>) => {
  const queryClient = useQueryClient();
  return useMutation<ManagedItem, Error, { type: 'skills' | 'services' | 'specializations'; id: string; data: Partial<ManagedItem> }>({
    mutationFn: ({ type, id, data }) => AdminService.updateManagedItem(type, id, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.managedItems(variables.type) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useDeleteAdminManagedItem = (options?: UseMutationOptions<void, Error, { type: 'skills' | 'services' | 'specializations'; id: string }>) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { type: 'skills' | 'services' | 'specializations'; id: string }>({
    mutationFn: ({ type, id }) => AdminService.deleteManagedItem(type, id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.managedItems(variables.type) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};
