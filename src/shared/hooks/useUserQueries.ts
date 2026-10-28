import { useMutation, useQuery, useQueryClient, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import {
  UserService,
  EducationalRequestFilters,
  CreateEducationalRequestData,
  UpdateEducationalRequestData,
} from '../services/UserService';
import {
  User,
  EducationalRequest,
  Attachment,
  PaginatedResponse,
  PaymentStatus,
  FulfillmentStatus,
} from '../types';

// User Query Keys
export const userQueryKeys = {
  all: ['user'] as const,
  profile: () => [...userQueryKeys.all, 'profile'] as const,
  educationalRequests: (filters?: EducationalRequestFilters) => [...userQueryKeys.all, 'educationalRequests', filters] as const,
  educationalRequestDetail: (id: string) => [...userQueryKeys.all, 'educationalRequest', id] as const,
  dashboardStats: () => [...userQueryKeys.all, 'dashboardStats'] as const,
  notifications: () => [...userQueryKeys.all, 'notifications'] as const,
};

// User Hooks
export const useUserProfile = (
  options?: Omit<UseQueryOptions<User, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<User, Error>({
    queryKey: userQueryKeys.profile(),
    queryFn: UserService.getProfile,
    ...options,
  });
};

export const useUpdateProfile = (
  options?: UseMutationOptions<User, Error, Partial<User>>
) => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, Partial<User>>({
    mutationFn: UserService.updateProfile,
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(userQueryKeys.profile(), data);
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUploadAvatar = (
  options?: UseMutationOptions<User, Error, File>
) => {
  const queryClient = useQueryClient();
  return useMutation<User, Error, File>({
    mutationFn: UserService.uploadAvatar,
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(userQueryKeys.profile(), data);
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useEducationalRequests = (
  filters?: EducationalRequestFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<EducationalRequest>, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<PaginatedResponse<EducationalRequest>, Error>({
    queryKey: userQueryKeys.educationalRequests(filters),
    queryFn: () => UserService.getEducationalRequests(filters),
    ...options,
  });
};

export const useEducationalRequest = (
  id: string,
  options?: Omit<UseQueryOptions<EducationalRequest, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<EducationalRequest, Error>({
    queryKey: userQueryKeys.educationalRequestDetail(id),
    queryFn: () => UserService.getEducationalRequest(id),
    enabled: !!id,
    ...options,
  });
};

export const useCreateEducationalRequest = (
  options?: UseMutationOptions<EducationalRequest, Error, CreateEducationalRequestData>
) => {
  const queryClient = useQueryClient();
  return useMutation<EducationalRequest, Error, CreateEducationalRequestData>({
    mutationFn: UserService.createEducationalRequest,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.educationalRequests() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateEducationalRequest = (
  options?: UseMutationOptions<EducationalRequest, Error, { id: string; data: UpdateEducationalRequestData }>
) => {
  const queryClient = useQueryClient();
  return useMutation<EducationalRequest, Error, { id: string; data: UpdateEducationalRequestData }>({
    mutationFn: ({ id, data }) => UserService.updateEducationalRequest(id, data),
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(userQueryKeys.educationalRequestDetail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: userQueryKeys.educationalRequests() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useDeleteEducationalRequest = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: UserService.deleteEducationalRequest,
    onSuccess: (data, id, context) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.educationalRequests() });
      options?.onSuccess?.(data, id, context);
    },
    ...options,
  });
};

export const useCancelEducationalRequest = (
  options?: UseMutationOptions<EducationalRequest, Error, { id: string; reason?: string }>
) => {
  const queryClient = useQueryClient();
  return useMutation<EducationalRequest, Error, { id: string; reason?: string }>({
    mutationFn: ({ id, reason }) => UserService.cancelEducationalRequest(id, reason),
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(userQueryKeys.educationalRequestDetail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: userQueryKeys.educationalRequests() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useAcceptEducationalRequest = (
  options?: UseMutationOptions<EducationalRequest, Error, { id: string; message?: string }>
) => {
  const queryClient = useQueryClient();
  return useMutation<EducationalRequest, Error, { id: string; message?: string }>({
    mutationFn: ({ id, message }) => UserService.acceptEducationalRequest(id, message),
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(userQueryKeys.educationalRequestDetail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: userQueryKeys.educationalRequests() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useRejectEducationalRequest = (
  options?: UseMutationOptions<EducationalRequest, Error, { id: string; reason: string }>
) => {
  const queryClient = useQueryClient();
  return useMutation<EducationalRequest, Error, { id: string; reason: string }>({
    mutationFn: ({ id, reason }) => UserService.rejectEducationalRequest(id, reason),
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(userQueryKeys.educationalRequestDetail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: userQueryKeys.educationalRequests() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUpdatePaymentStatus = (
  options?: UseMutationOptions<EducationalRequest, Error, { requestId: string; status: PaymentStatus }>
) => {
  const queryClient = useQueryClient();
  return useMutation<EducationalRequest, Error, { requestId: string; status: PaymentStatus }>({
    mutationFn: ({ requestId, status }) => UserService.updatePaymentStatus(requestId, status),
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(userQueryKeys.educationalRequestDetail(variables.requestId), data);
      queryClient.invalidateQueries({ queryKey: userQueryKeys.educationalRequests() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useMarkRequestAsPaid = (
  options?: UseMutationOptions<EducationalRequest, Error, { requestId: string; paymentDetails?: any }>
) => {
  const queryClient = useQueryClient();
  return useMutation<EducationalRequest, Error, { requestId: string; paymentDetails?: any }>({
    mutationFn: ({ requestId, paymentDetails }) => UserService.markRequestAsPaid(requestId, paymentDetails),
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(userQueryKeys.educationalRequestDetail(variables.requestId), data);
      queryClient.invalidateQueries({ queryKey: userQueryKeys.educationalRequests() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateFulfillmentStatus = (
  options?: UseMutationOptions<EducationalRequest, Error, { requestId: string; status: FulfillmentStatus }>
) => {
  const queryClient = useQueryClient();
  return useMutation<EducationalRequest, Error, { requestId: string; status: FulfillmentStatus }>({
    mutationFn: ({ requestId, status }) => UserService.updateFulfillmentStatus(requestId, status),
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(userQueryKeys.educationalRequestDetail(variables.requestId), data);
      queryClient.invalidateQueries({ queryKey: userQueryKeys.educationalRequests() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useMarkRequestAsCompleted = (
  options?: UseMutationOptions<EducationalRequest, Error, { requestId: string; feedback?: string }>
) => {
  const queryClient = useQueryClient();
  return useMutation<EducationalRequest, Error, { requestId: string; feedback?: string }>({
    mutationFn: ({ requestId, feedback }) => UserService.markRequestAsCompleted(requestId, feedback),
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(userQueryKeys.educationalRequestDetail(variables.requestId), data);
      queryClient.invalidateQueries({ queryKey: userQueryKeys.educationalRequests() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUploadRequestAttachment = (
  options?: UseMutationOptions<Attachment, Error, { requestId: string; file: File; title?: string }>
) => {
  const queryClient = useQueryClient();
  return useMutation<Attachment, Error, { requestId: string; file: File; title?: string }>({
    mutationFn: ({ requestId, file, title }) => UserService.uploadRequestAttachment(requestId, file, title),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.educationalRequestDetail(variables.requestId) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useDeleteRequestAttachment = (
  options?: UseMutationOptions<void, Error, { requestId: string; attachmentId: string }>
) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { requestId: string; attachmentId: string }>({
    mutationFn: ({ requestId, attachmentId }) => UserService.deleteRequestAttachment(requestId, attachmentId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.educationalRequestDetail(variables.requestId) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useAddRequestNote = (
  options?: UseMutationOptions<void, Error, { requestId: string; content: string }>
) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { requestId: string; content: string }>({
    mutationFn: ({ requestId, content }) => UserService.addRequestNote(requestId, content),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.educationalRequestDetail(variables.requestId) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUserDashboardStats = (
  options?: Omit<UseQueryOptions<any, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<any, Error>({
    queryKey: userQueryKeys.dashboardStats(),
    queryFn: UserService.getDashboardStats,
    ...options,
  });
};

export const useUserNotifications = (
  options?: Omit<UseQueryOptions<any[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<any[], Error>({
    queryKey: userQueryKeys.notifications(),
    queryFn: UserService.getNotifications,
    ...options,
  });
};

export const useMarkNotificationAsRead = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: UserService.markNotificationAsRead,
    onSuccess: (data, notificationId, context) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.notifications() });
      options?.onSuccess?.(data, notificationId, context);
    },
    ...options,
  });
};

export const useCreateSupportRequest = (
  options?: UseMutationOptions<any, Error, { subject: string; message: string; category?: string }>
) => {
  return useMutation<any, Error, { subject: string; message: string; category?: string }>({
    mutationFn: UserService.createSupportRequest,
    ...options,
  });
};

