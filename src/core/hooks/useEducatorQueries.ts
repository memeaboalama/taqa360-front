/**
 * Educator Query Hooks
 * Comprehensive React Query hooks for educator operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBaseQuery, usePaginatedQuery, useBaseMutation, QueryKeyFactory, BaseQueryConfig } from './useBaseQuery';
import { 
  educatorService, 
  EducatorProfile,
  EducatorDashboardData,
  AcademicMajor,
  WorkExperience,
  Certification,
  EducatorSkill,
  EducatorLanguage,
  EducatorService as EducatorServiceType,
  PaymentInfo,
  SocialLinks,
  WithdrawalRequest
} from '../services/EducatorService';
import { QueryParams } from '../api/types';
import { useCallback } from 'react';

// Profile Management Hooks
export function useEducatorProfile() {
  return useBaseQuery(
    QueryKeyFactory.all('educator-profile'),
    () => educatorService.getProfile(),
    {
      staleTime: 300000 // 5 minutes
    }
  );
}

export function useUpdateEducatorProfile() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['educator', 'profile', 'update'],
    (profileData: Partial<EducatorProfile>) => educatorService.updateProfile(profileData),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(QueryKeyFactory.all('educator-profile'), data);
        QueryKeyFactory.invalidateAll(queryClient, 'educator-dashboard');
      }
    }
  );
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['educator', 'avatar', 'upload'],
    (file: File) => educatorService.uploadAvatar(file),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'educator-profile');
      }
    }
  );
}

export function useUpdateAvailabilityStatus() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['educator', 'availability', 'update'],
    (status: 'available' | 'busy' | 'unavailable') => educatorService.updateAvailabilityStatus(status),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'educator-profile');
      }
    }
  );
}

// Assignment Hooks
// The dashboard query key is ['dashboard','educator'] (see useEducatorDashboard),
// so invalidating 'educator-dashboard' never matched it and the invitation list
// stayed stale after a decision. Its staleTime is 60s, so it must be invalidated
// explicitly or the dashboard will not refresh on its own.
const invalidateAfterAssignmentDecision = (queryClient: any) => {
  queryClient.invalidateQueries({ queryKey: QueryKeyFactory.dashboard('educator') });
  queryClient.invalidateQueries({ queryKey: ['educator-dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['educator-projects'] });
  queryClient.invalidateQueries({ queryKey: ['educator-assignments'] });
};

export function useAcceptAssignment() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['educator', 'assignment', 'accept'],
    ({ assignmentId, note, agreement_notes }: { assignmentId: string; note?: string; agreement_notes?: string }) =>
      educatorService.acceptAssignment(assignmentId, note ?? agreement_notes),
    {
      onSuccess: () => invalidateAfterAssignmentDecision(queryClient),
    }
  );
}

export function useRejectAssignment() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['educator', 'assignment', 'reject'],
    ({ assignmentId, note, reason }: { assignmentId: string; note?: string; reason?: string }) =>
      educatorService.rejectAssignment(assignmentId, reason ?? note),
    {
      onSuccess: () => invalidateAfterAssignmentDecision(queryClient),
    }
  );
}

// Dashboard Hook
export function useEducatorDashboard() {
  return useBaseQuery(
    QueryKeyFactory.dashboard('educator'),
    () => educatorService.getDashboard(),
    {
      staleTime: 60000, // 1 minute
      refetchOnWindowFocus: false
    }
  );
}

// Academic Information Hooks
export function useAcademicMajors() {
  return useBaseQuery(
    QueryKeyFactory.all('academic-majors'),
    () => educatorService.getAcademicMajors()
  );
}

export function useCreateAcademicMajor() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['educator', 'academic-major', 'create'],
    (data: Omit<AcademicMajor, 'id' | 'verification_status'>) =>
      educatorService.createAcademicMajor(data),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'academic-majors');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-profile');
      }
    }
  );
}

export function useUpdateAcademicMajor() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['educator', 'academic-major', 'update'],
    ({ id, data }: { id: string; data: Partial<AcademicMajor> }) =>
      educatorService.updateAcademicMajor(id, data),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'academic-majors');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-profile');
      }
    }
  );
}

export function useDeleteAcademicMajor() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['educator', 'academic-major', 'delete'],
    (id: string) => educatorService.deleteAcademicMajor(id),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'academic-majors');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-profile');
      }
    }
  );
}

// Work Experience Hooks
export function useWorkExperience() {
  return useBaseQuery(
    QueryKeyFactory.all('work-experience'),
    () => educatorService.getWorkExperience()
  );
}

export function useCreateWorkExperience() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['educator', 'work-experience', 'create'],
    (data: Omit<WorkExperience, 'id' | 'verification_status'>) =>
      educatorService.createWorkExperience(data),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'work-experience');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-profile');
      }
    }
  );
}

export function useUpdateWorkExperience() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['educator', 'work-experience', 'update'],
    ({ id, data }: { id: string; data: Partial<WorkExperience> }) =>
      educatorService.updateWorkExperience(id, data),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'work-experience');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-profile');
      }
    }
  );
}

export function useDeleteWorkExperience() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['educator', 'work-experience', 'delete'],
    (id: string) => educatorService.deleteWorkExperience(id),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'work-experience');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-profile');
      }
    }
  );
}

// Certifications Hooks
export function useCertifications() {
  return useBaseQuery(
    QueryKeyFactory.all('certifications'),
    () => educatorService.getCertifications()
  );
}

export function useCreateCertification() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['educator', 'certification', 'create'],
    (data: Omit<Certification, 'id' | 'verification_status'>) =>
      educatorService.createCertification(data),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'certifications');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-profile');
      }
    }
  );
}

export function useUpdateCertification() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['educator', 'certification', 'update'],
    ({ id, data }: { id: string; data: Partial<Certification> }) =>
      educatorService.updateCertification(id, data),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'certifications');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-profile');
      }
    }
  );
}

export function useDeleteCertification() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['educator', 'certification', 'delete'],
    (id: string) => educatorService.deleteCertification(id),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'certifications');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-profile');
      }
    }
  );
}

// Skills, Languages, Services Hooks
export function useEducatorSkills() {
  return useBaseQuery(
    QueryKeyFactory.all('educator-skills'),
    () => educatorService.getSkills()
  );
}

export function useCreateEducatorSkill() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['educator', 'skills', 'create'],
    (data: any) => educatorService.createSkill(data),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'educator-skills');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-profile');
      }
    }
  );
}

export function useUpdateEducatorSkill() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['educator', 'skills', 'update-one'],
    ({ id, data }: { id: string; data: any }) => educatorService.updateSkill(id, data),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'educator-skills');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-profile');
      }
    }
  );
}

export function useDeleteEducatorSkill() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['educator', 'skills', 'delete'],
    (id: string) => educatorService.deleteSkill(id),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'educator-skills');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-profile');
      }
    }
  );
}

export function useUpdateEducatorSkills() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['educator', 'skills', 'update'],
    (skills: EducatorSkill[]) => educatorService.updateSkills(skills),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'educator-skills');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-profile');
      }
    }
  );
}

export function useEducatorLanguages() {
  return useBaseQuery(
    QueryKeyFactory.all('educator-languages'),
    () => educatorService.getLanguages()
  );
}

export function useSupportedLanguages() {
  return useBaseQuery(
    QueryKeyFactory.all('supported-languages'),
    () => educatorService.getSupportedLanguages()
  );
}

export function useCreateEducatorLanguage() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['educator', 'languages', 'create'],
    (data: { language_id: string; level: string; is_primary: boolean }) => educatorService.createLanguage(data),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'educator-languages');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-profile');
      }
    }
  );
}

export function useUpdateEducatorLanguage() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['educator', 'languages', 'update-one'],
    ({ id, data }: { id: string; data: { language_id: string; level: string; is_primary: boolean } }) => educatorService.updateLanguage(id, data),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'educator-languages');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-profile');
      }
    }
  );
}

export function useDeleteEducatorLanguage() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['educator', 'languages', 'delete'],
    (id: string) => educatorService.deleteLanguage(id),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'educator-languages');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-profile');
      }
    }
  );
}

export function useUpdateEducatorLanguages() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['educator', 'languages', 'update'],
    (languages: EducatorLanguage[]) => educatorService.updateLanguages(languages),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'educator-languages');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-profile');
      }
    }
  );
}

export function useEducatorServices() {
  return useBaseQuery(
    QueryKeyFactory.all('educator-services'),
    () => educatorService.getServices()
  );
}

export function useCreateEducatorService() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['educator', 'services', 'create'],
    (data: any) => educatorService.createService(data),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'educator-services');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-profile');
      }
    }
  );
}

export function useUpdateEducatorService() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['educator', 'services', 'update-one'],
    ({ id, data }: { id: string; data: any }) => educatorService.updateService(id, data),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'educator-services');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-profile');
      }
    }
  );
}

export function useDeleteEducatorService() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['educator', 'services', 'delete'],
    (id: string) => educatorService.deleteService(id),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'educator-services');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-profile');
      }
    }
  );
}

export function useUpdateEducatorServices() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['educator', 'services', 'update'],
    (services: EducatorServiceType[]) => educatorService.updateServices(services),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'educator-services');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-profile');
      }
    }
  );
}

// Social Links and Payment Info Hooks
export function useSocialLinks() {
  return useBaseQuery(
    QueryKeyFactory.all('social-links'),
    () => educatorService.getSocialLinks()
  );
}

export function useUpdateSocialLinks() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['educator', 'social-links', 'update'],
    (links: SocialLinks) => educatorService.updateSocialLinks(links),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'social-links');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-profile');
      }
    }
  );
}

export function usePaymentInfo() {
  return useBaseQuery(
    QueryKeyFactory.all('payment-info'),
    () => educatorService.getPaymentInfo()
  );
}

export function useUpdatePaymentInfo() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['educator', 'payment-info', 'update'],
    (info: PaymentInfo) => educatorService.updatePaymentInfo(info),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'payment-info');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-profile');
      }
    }
  );
}

export function useDeletePaymentInfo() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['educator', 'payment-info', 'delete'],
    () => educatorService.deletePaymentInfo(),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'payment-info');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-profile');
      }
    }
  );
}

// Projects and Tasks Hooks
export function useEducatorProjects(params?: QueryParams) {
  return usePaginatedQuery(
    QueryKeyFactory.list('educator-projects', params),
    () => educatorService.getMyProjects(params)
  );
}

export function useEducatorTasks(params?: QueryParams) {
  return usePaginatedQuery(
    QueryKeyFactory.list('educator-tasks', params),
    () => educatorService.getMyTasks(params)
  );
}

// New endpoints adoption
export function useEducatorAssignments(params?: any) {
  const query = useQuery<any>({
    queryKey: QueryKeyFactory.list('educator-assignments', params),
    queryFn: () => educatorService.getAssignments(params),
  });

  // Tolerate both payload shapes: the service unwraps the API envelope, but an
  // extra `data` level must not silently turn the list into an empty array.
  const payload: any = query.data?.data ?? {};
  const assignments = Array.isArray(payload?.assignments)
    ? payload.assignments
    : Array.isArray(payload?.data?.assignments)
      ? payload.data.assignments
      : [];

  return {
    ...query,
    data: assignments,
    pagination: (query.data as any)?.pagination ?? payload?.pagination,
    counts: payload?.counts ?? payload?.data?.counts,
  } as any;
}

export function useEducatorTasksList(filters?: Record<string, any>) {
  return useBaseQuery(
    QueryKeyFactory.list('educator-tasks-v2', filters || {}),
    () => educatorService.getTasks(filters || {})
  );
}

export function useEducatorTaskDetail(taskId: string) {
  return useBaseQuery(
    QueryKeyFactory.detail('educator-task', taskId),
    () => educatorService.getTaskDetail(taskId),
    { enabled: !!taskId, staleTime: 0 }
  );
}

export function useCreateEducatorSubTask() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['educator', 'subtask', 'create'],
    ({ taskId, title }: { taskId: string; title: string }) => educatorService.createSubTask(taskId, title),
    {
      onSuccess: (data, variables) => {
        QueryKeyFactory.invalidateAll(queryClient, 'educator-tasks');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-projects');
        QueryKeyFactory.invalidateDetail(queryClient, 'educator-task', variables.taskId);
      }
    }
  );
}

export function useToggleEducatorSubTask() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['educator', 'subtask', 'toggle'],
    ({ taskId, subTaskId }: { taskId: string; subTaskId: string }) => educatorService.toggleSubTask(taskId, subTaskId),
    {
      onSuccess: (data, variables) => {
        QueryKeyFactory.invalidateAll(queryClient, 'educator-tasks');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-projects');
        QueryKeyFactory.invalidateDetail(queryClient, 'educator-task', variables.taskId);
      }
    }
  );
}

export function useUpdateEducatorSubTask() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['educator', 'subtask', 'update'],
    ({ taskId, subTaskId, title }: { taskId: string; subTaskId: string; title: string }) => educatorService.updateSubTask(taskId, subTaskId, { title }),
    {
      onSuccess: (data, variables) => {
        QueryKeyFactory.invalidateAll(queryClient, 'educator-tasks');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-projects');
        QueryKeyFactory.invalidateDetail(queryClient, 'educator-task', variables.taskId);
      }
    }
  );
}

export function useDeleteEducatorSubTask() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['educator', 'subtask', 'delete'],
    ({ taskId, subTaskId }: { taskId: string; subTaskId: string }) => educatorService.deleteSubTask(taskId, subTaskId),
    {
      onSuccess: (data, variables) => {
        QueryKeyFactory.invalidateAll(queryClient, 'educator-tasks');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-projects');
        QueryKeyFactory.invalidateDetail(queryClient, 'educator-task', variables.taskId);
      }
    }
  );
}

export function useUploadEducatorTaskAttachment() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['educator', 'task', 'attachment', 'upload'],
    ({ taskId, file, title }: { taskId: string; file: File; title?: string }) => educatorService.uploadTaskAttachment(taskId, file, title),
    {
      onSuccess: (data, variables) => {
        QueryKeyFactory.invalidateAll(queryClient, 'educator-tasks');
        QueryKeyFactory.invalidateDetail(queryClient, 'educator-task', variables.taskId);
      }
    }
  );
}

export function useUploadEducatorSubTaskAttachment() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['educator', 'subtask', 'attachment', 'upload'],
    ({ taskId, subTaskId, file, title }: { taskId: string; subTaskId: string; file: File; title?: string }) => educatorService.uploadSubTaskAttachment(taskId, subTaskId, file, title),
    {
      onSuccess: (data, variables) => {
        QueryKeyFactory.invalidateAll(queryClient, 'educator-tasks');
        QueryKeyFactory.invalidateDetail(queryClient, 'educator-task', variables.taskId);
      }
    }
  );
}

export function useUploadEducatorDeliverable() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['educator', 'task', 'deliverable', 'upload'],
    ({ taskId, file, title }: { taskId: string; file: File; title?: string }) => educatorService.uploadDeliverable(taskId, file, title),
    {
      onSuccess: (data, variables) => {
        QueryKeyFactory.invalidateAll(queryClient, 'educator-tasks');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-projects');
        QueryKeyFactory.invalidateDetail(queryClient, 'educator-task', variables.taskId);
      }
    }
  );
}

export function useEducatorUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['educator', 'task', 'status', 'update'],
    ({ taskId, status }: { taskId: string; status: 'PENDING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' }) => status === 'COMPLETED' ? educatorService.completeTask(taskId) : educatorService.updateTaskStatus(taskId, status),
    {
      onSuccess: (data, variables) => {
        QueryKeyFactory.invalidateAll(queryClient, 'educator-tasks');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-projects');
        QueryKeyFactory.invalidateDetail(queryClient, 'educator-task', variables.taskId);
      }
    }
  );
}

export function useDeleteEducatorDeliverable() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['educator', 'task', 'deliverable', 'delete'],
    ({ taskId, deliverableId }: { taskId: string; deliverableId: string }) => educatorService.deleteDeliverable(taskId, deliverableId),
    {
      onSuccess: (data, variables) => {
        QueryKeyFactory.invalidateAll(queryClient, 'educator-tasks');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-projects');
        QueryKeyFactory.invalidateDetail(queryClient, 'educator-task', variables.taskId);
      }
    }
  );
}

// Earnings and Transactions Hooks
export function useEducatorEarnings(params?: QueryParams) {
  return useBaseQuery(
    QueryKeyFactory.list('educator-earnings', params),
    () => educatorService.getEarnings(params),
    {
      staleTime: 300000 // 5 minutes
    }
  );
}

export function useEducatorTransactions(params?: QueryParams) {
  return usePaginatedQuery(
    QueryKeyFactory.list('educator-transactions', params),
    () => educatorService.getTransactions(params)
  );
}

export function useRequestWithdrawal() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['educator', 'withdrawal', 'request'],
    ({ amount, notes }: { amount: number; notes?: string }) =>
      educatorService.requestWithdrawal(amount, notes),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'withdrawal-requests');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-earnings');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-dashboard');
      }
    }
  );
}

export function useWithdrawalRequests(params?: QueryParams) {
  return usePaginatedQuery(
    QueryKeyFactory.list('withdrawal-requests', params),
    () => educatorService.getWithdrawalRequests(params)
  );
}

// Bids Management Hooks
export function useEducatorBids(
  params?: QueryParams & { paginated?: boolean; status?: string; search?: string; sort_by?: string; per_page?: number; page?: number; },
  config?: BaseQueryConfig<any>
) {
  return usePaginatedQuery(
    QueryKeyFactory.list('educator-bids', params),
    () => educatorService.getBids(params),
    config
  );
}

export function useEducatorBidDetail(id: string) {
  return useBaseQuery(
    QueryKeyFactory.detail(QueryKeyFactory.QUERIES.BIDS, id),
    () => educatorService.getBid(id),
    { enabled: !!id }
  );
}

export function useCreateBid() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['educator', 'bid', 'create'],
    (bidData: any) => educatorService.createBid(bidData),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'educator-bids');
        QueryKeyFactory.invalidateAll(queryClient, 'educator-dashboard');
      }
    }
  );
}

export function useUpdateBid() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['educator', 'bid', 'update'],
    ({ id, data }: { id: string; data: any }) =>
      educatorService.updateBid(id, data),
    {
      onSuccess: (data, variables) => {
        QueryKeyFactory.invalidateList(queryClient, 'educator-bids');
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.BIDS, variables.id);
      }
    }
  );
}

export function useDeleteBid() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['educator', 'bid', 'delete'],
    (id: string) => educatorService.deleteBid(id),
    {
      onSuccess: (data, id) => {
        QueryKeyFactory.invalidateList(queryClient, 'educator-bids');
        queryClient.removeQueries({
          queryKey: QueryKeyFactory.detail(QueryKeyFactory.QUERIES.BIDS, id)
        });
      }
    }
  );
}

// Bid Tasks Hooks
export function useEducatorBidTasks(bidId: string) {
  return useBaseQuery(
    QueryKeyFactory.related('educator-bids', bidId, 'tasks'),
    () => educatorService.getBidTasks(bidId),
    {
      enabled: !!bidId
    }
  );
}

export function useUpdateBidTask() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['educator', 'bid-task', 'update'],
    ({ bidId, taskId, data }: { bidId: string; taskId: string; data: any }) =>
      educatorService.updateBidTask(bidId, taskId, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({
          queryKey: QueryKeyFactory.related('educator-bids', variables.bidId, 'tasks')
        });
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.BIDS, variables.bidId);
      }
    }
  );
}

// Support and Communication Hooks
export function useEducatorSupportTickets(params?: QueryParams) {
  return usePaginatedQuery(
    QueryKeyFactory.list('educator-support-tickets', params),
    () => educatorService.getSupportTickets(params)
  );
}

export function useCreateSupportTicket() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['educator', 'support-ticket', 'create'],
    (ticketData: {
      category: string;
      subject: string;
      message: string;
      priority?: 'low' | 'medium' | 'high';
      attachments?: File[];
    }) => educatorService.createSupportTicket(ticketData),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'educator-support-tickets');
      }
    }
  );
}

export function useEducatorInboxMessages(params?: QueryParams) {
  return usePaginatedQuery(
    QueryKeyFactory.list('educator-inbox', params),
    () => educatorService.getInboxMessages(params),
    {
      staleTime: 30000 // 30 seconds
    }
  );
}

export function useMarkMessageAsRead() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['educator', 'message', 'mark-read'],
    (id: string) => educatorService.markMessageAsRead(id),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'educator-inbox');
      }
    }
  );
}

// Notifications Hooks
export function useEducatorNotifications(params?: QueryParams) {
  return usePaginatedQuery(
    QueryKeyFactory.list('educator-notifications', params),
    () => educatorService.getNotifications(params),
    {
      staleTime: 30000 // 30 seconds
    }
  );
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  // NOTE: useMutation is used directly (not useBaseMutation) because the
  // service resolves void. useBaseMutation reads `data.data` in its default
  // onSuccess, which throws on void results and silently skips invalidation,
  // leaving the notifications list stale after a successful mark-as-read.
  return useMutation({
    mutationKey: ['educator', 'notification', 'mark-read'],
    mutationFn: (id: string) => educatorService.markNotificationAsRead(id),
    onSuccess: () => {
      QueryKeyFactory.invalidateAll(queryClient, 'educator-notifications');
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  // Same reason as useMarkNotificationAsRead: the service resolves void.
  return useMutation({
    mutationKey: ['educator', 'notifications', 'mark-all-read'],
    mutationFn: () => educatorService.markAllNotificationsAsRead(),
    onSuccess: () => {
      QueryKeyFactory.invalidateAll(queryClient, 'educator-notifications');
    },
  });
}

// Application Management Hooks
export function useSubmitApplication() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['educator', 'application', 'submit'],
    () => educatorService.submitApplication(),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, 'educator-profile');
        QueryKeyFactory.invalidateAll(queryClient, 'application-status');
      }
    }
  );
}

export function useApplicationStatus() {
  return useBaseQuery(
    QueryKeyFactory.all('application-status'),
    () => educatorService.getApplicationStatus(),
    {
      staleTime: 300000 // 5 minutes
    }
  );
}

// Document Upload Hook
export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['educator', 'document', 'upload'],
    ({ type, file, metadata }: { type: string; file: File; metadata?: any }) =>
      educatorService.uploadDocument(type, file, metadata),
    {
      onSuccess: (data, variables) => {
        // Invalidate related queries based on document type
        switch (variables.type) {
          case 'academic':
            QueryKeyFactory.invalidateAll(queryClient, 'academic-majors');
            break;
          case 'experience':
            QueryKeyFactory.invalidateAll(queryClient, 'work-experience');
            break;
          case 'certification':
            QueryKeyFactory.invalidateAll(queryClient, 'certifications');
            break;
          default:
            QueryKeyFactory.invalidateAll(queryClient, 'educator-profile');
        }
      }
    }
  );
}

// Composite Hook for Educator Profile Data
export function useEducatorProfileData() {
  const profile = useEducatorProfile();

  // Map profile.data into list-like query objects so consumers can use .data/.isLoading/.refetch
  const makeListProxy = (selector: (d: any) => any[]) => ({
    data: (profile.data && selector(profile.data)) || [],
    isLoading: profile.isLoading,
    isError: profile.isError,
    refetch: profile.refetch,
  });

  const academicMajors = makeListProxy((d) => Array.isArray(d.academicMajors) ? d.academicMajors : []);
  const workExperience = makeListProxy((d) => Array.isArray(d.workExperience) ? d.workExperience : (Array.isArray(d.achievements) ? d.achievements.filter((a: any) => String(a.type).toLowerCase() === 'work_experience') : []));
  const certifications = makeListProxy((d) => Array.isArray(d.certifications) ? d.certifications : (Array.isArray(d.achievements) ? d.achievements.filter((a: any) => String(a.type).toLowerCase() !== 'work_experience') : []));
  const skills = makeListProxy((d) => Array.isArray(d.skills) ? d.skills : []);
  const languages = makeListProxy((d) => Array.isArray(d.languages) ? d.languages : []);
  const services = makeListProxy((d) => Array.isArray(d.services) ? d.services : []);
  const socialLinks = makeListProxy((d) => Array.isArray(d.socialLinks) ? d.socialLinks : []);
  const paymentInfo = {
    data: (profile.data && (profile.data.bankInfo || profile.data.paymentInfo)) || {},
    isLoading: profile.isLoading,
    isError: profile.isError,
    refetch: profile.refetch,
  } as any;
  const achievements = makeListProxy((d) => Array.isArray(d.achievements) ? d.achievements : []);

  return {
    profile,
    academicMajors,
    workExperience,
    certifications,
    skills,
    languages,
    services,
    socialLinks,
    paymentInfo,
    achievements,
    isLoading: profile.isLoading,
    isError: profile.isError,
    refetchAll: useCallback(() => {
      profile.refetch();
    }, [profile.refetch])
  };
}

// Composite Hook for Educator Dashboard
export function useEducatorDashboardData() {
  const dashboard = useEducatorDashboard();
  const projects = useEducatorProjects({ per_page: 5 });
  const bids = useEducatorBids({ per_page: 5 });
  const notifications = useEducatorNotifications({ per_page: 10 });
  const earnings = useEducatorEarnings();

  return {
    dashboard,
    projects,
    bids,
    notifications,
    earnings,
    isLoading: dashboard.isLoading || projects.isLoading || bids.isLoading || 
               notifications.isLoading || earnings.isLoading,
    isError: dashboard.isError || projects.isError || bids.isError || 
             notifications.isError || earnings.isError,
    refetchAll: useCallback(() => {
      dashboard.refetch();
      projects.refetch();
      bids.refetch();
      notifications.refetch();
      earnings.refetch();
    }, [
      dashboard.refetch,
      projects.refetch,
      bids.refetch,
      notifications.refetch,
      earnings.refetch
    ])
  };
}
