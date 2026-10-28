/**
 * Admin Query Hooks
 * Comprehensive React Query hooks for admin operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBaseQuery, usePaginatedQuery, useBaseMutation, QueryKeyFactory } from './useBaseQuery';
import { adminService, AdminDashboardData, BulkOperation } from '../services/AdminService';
import { QueryParams, PaginatedRequestParams } from '../api/types';
import { useCallback } from 'react';

// Dashboard Hooks
export function useAdminDashboard() {
  return useBaseQuery(
    QueryKeyFactory.dashboard('admin'),
    () => adminService.getDashboard(),
    {
      staleTime: 60000, // 1 minute - dashboard should be relatively fresh
      refetchOnWindowFocus: false
    }
  );
}

export function useAdminDashboardStats(period?: '7d' | '30d' | '90d') {
  return useBaseQuery(
    QueryKeyFactory.stats('admin', period),
    () => adminService.getDashboardStats(period),
    {
      enabled: !!period,
      staleTime: 300000 // 5 minutes
    }
  );
}

export function useAdminActivityFeed(params?: QueryParams) {
  return usePaginatedQuery(
    QueryKeyFactory.list('admin-activities', params),
    () => adminService.getActivityFeed(params),
    {
      staleTime: 30000 // 30 seconds
    }
  );
}

export function usePendingApprovals(type?: string) {
  return usePaginatedQuery(
    QueryKeyFactory.list('pending-approvals', { type }),
    () => adminService.getPendingApprovals(type),
    {
      staleTime: 60000 // 1 minute
    }
  );
}

export function useSystemHealth() {
  return useBaseQuery(
    QueryKeyFactory.all('system-health'),
    () => adminService.getSystemHealth(),
    {
      staleTime: 30000, // 30 seconds
      refetchInterval: 60000 // Refresh every minute
    }
  );
}

// Educator Management Hooks
export function useAdminEducators(params?: QueryParams) {
  return usePaginatedQuery(
    QueryKeyFactory.list(QueryKeyFactory.QUERIES.EDUCATORS, params),
    () => adminService.getEducators(params)
  );
}

export function useAdminEducator(id: string) {
  return useBaseQuery(
    QueryKeyFactory.detail(QueryKeyFactory.QUERIES.EDUCATORS, id),
    () => adminService.getEducator(id),
    {
      enabled: !!id
    }
  );
}

export function useUpdateEducatorStatus() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['admin', 'educator', 'update-status'],
    ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      adminService.updateEducatorStatus(id, status as any, reason),
    {
      onSuccess: (data, variables) => {
        // Invalidate educator lists and specific educator
        QueryKeyFactory.invalidateList(queryClient, QueryKeyFactory.QUERIES.EDUCATORS);
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.EDUCATORS, variables.id);
        QueryKeyFactory.invalidateAll(queryClient, 'pending-approvals');
      }
    }
  );
}

export function useApproveEducator() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['admin', 'educator', 'approve'],
    ({ id, message }: { id: string; message?: string }) =>
      adminService.approveEducator(id, message),
    {
      onSuccess: (data, variables) => {
        QueryKeyFactory.invalidateList(queryClient, QueryKeyFactory.QUERIES.EDUCATORS);
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.EDUCATORS, variables.id);
        QueryKeyFactory.invalidateAll(queryClient, 'pending-approvals');
      }
    }
  );
}

export function useRejectEducator() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['admin', 'educator', 'reject'],
    ({ id, reason }: { id: string; reason: string }) =>
      adminService.rejectEducator(id, reason),
    {
      onSuccess: (data, variables) => {
        QueryKeyFactory.invalidateList(queryClient, QueryKeyFactory.QUERIES.EDUCATORS);
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.EDUCATORS, variables.id);
        QueryKeyFactory.invalidateAll(queryClient, 'pending-approvals');
      }
    }
  );
}

// New explicit educator account/document approval hooks
export function useAcceptEducatorAccount() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['admin', 'educator', 'accept-account'],
    (id: string) => adminService.acceptEducatorAccount(id),
    {
      onSuccess: (_data, id) => {
        QueryKeyFactory.invalidateList(queryClient, QueryKeyFactory.QUERIES.EDUCATORS);
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.EDUCATORS, id);
        QueryKeyFactory.invalidateAll(queryClient, 'pending-approvals');
      }
    }
  );
}

export function useRejectEducatorAccount() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['admin', 'educator', 'reject-account'],
    ({ id, reason }: { id: string; reason: string }) => adminService.rejectEducatorAccount(id, reason),
    {
      onSuccess: (_data, variables) => {
        QueryKeyFactory.invalidateList(queryClient, QueryKeyFactory.QUERIES.EDUCATORS);
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.EDUCATORS, variables.id);
        QueryKeyFactory.invalidateAll(queryClient, 'pending-approvals');
      }
    }
  );
}

export function useApproveEducatorIdentity() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['admin', 'educator', 'approve-identity'],
    (id: string) => adminService.approveEducatorIdentity(id),
    {
      onSuccess: (_data, id) => {
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.EDUCATORS, id);
      }
    }
  );
}

export function useRejectEducatorIdentity() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['admin', 'educator', 'reject-identity'],
    ({ id, reason }: { id: string; reason: string }) => adminService.rejectEducatorIdentity(id, reason),
    {
      onSuccess: (_data, variables) => {
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.EDUCATORS, variables.id);
      }
    }
  );
}

export function useSuspendEducator() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['admin', 'educator', 'suspend'],
    ({ id, reason }: { id: string; reason: string }) => adminService.suspendEducator(id, reason),
    {
      onSuccess: (_data, variables) => {
        QueryKeyFactory.invalidateList(queryClient, QueryKeyFactory.QUERIES.EDUCATORS);
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.EDUCATORS, variables.id);
      }
    }
  );
}

export function useUnsuspendEducator() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['admin', 'educator', 'unsuspend'],
    (id: string) => adminService.unsuspendEducator(id),
    {
      onSuccess: (_data, id) => {
        QueryKeyFactory.invalidateList(queryClient, QueryKeyFactory.QUERIES.EDUCATORS);
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.EDUCATORS, id);
      }
    }
  );
}

export function useInviteEducator() {
  return useBaseMutation(
    ['admin', 'educator', 'invite'],
    (email: string) => adminService.inviteEducator(email)
  );
}

export function useApproveAcademicMajor() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['admin', 'educator', 'approve-major'],
    ({ educatorId, majorId }: { educatorId: string; majorId: string }) => adminService.approveAcademicMajor(educatorId, majorId),
    {
      onSuccess: (_data, variables) => {
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.EDUCATORS, variables.educatorId);
      }
    }
  );
}

export function useRejectAcademicMajor() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['admin', 'educator', 'reject-major'],
    ({ educatorId, majorId, reason }: { educatorId: string; majorId: string; reason: string }) => adminService.rejectAcademicMajor(educatorId, majorId, reason),
    {
      onSuccess: (_data, variables) => {
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.EDUCATORS, variables.educatorId);
      }
    }
  );
}

// Users Management Hooks
export function useAdminUsers(params?: QueryParams) {
  return usePaginatedQuery(
    QueryKeyFactory.list(QueryKeyFactory.QUERIES.USERS, params),
    () => adminService.getUsers(params)
  );
}

export function useAdminUser(id: string) {
  return useBaseQuery(
    QueryKeyFactory.detail(QueryKeyFactory.QUERIES.USERS, id),
    () => adminService.getUser(id),
    { enabled: !!id }
  );
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['admin', 'users', 'create'],
    (data: { name: string; email: string; phone?: string; password: string; city?: string; address?: string }) =>
      adminService.createUser(data),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateAll(queryClient, QueryKeyFactory.QUERIES.USERS);
      }
    }
  );
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['admin', 'users', 'update-status'],
    ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      adminService.updateUserStatus(id, status as any, reason),
    {
      onSuccess: (data, variables) => {
        QueryKeyFactory.invalidateAll(queryClient, QueryKeyFactory.QUERIES.USERS);
      }
    }
  );
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['admin', 'users', 'update'],
    ({ id, data }: { id: string; data: { name?: string; email?: string; phone?: string; city?: string; address?: string } }) =>
      adminService.updateUser(id, data),
    {
      onSuccess: (_data, variables) => {
        QueryKeyFactory.invalidateAll(queryClient, QueryKeyFactory.QUERIES.USERS);
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.USERS, variables.id);
      }
    }
  );
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['admin', 'users', 'delete'],
    (id: string) => adminService.deleteUser(id),
    {
      onSuccess: (_data, id) => {
        QueryKeyFactory.invalidateAll(queryClient, QueryKeyFactory.QUERIES.USERS);
        queryClient.removeQueries({
          queryKey: QueryKeyFactory.detail(QueryKeyFactory.QUERIES.USERS, id as unknown as string)
        });
      }
    }
  );
}

// Educational Requests Hooks
export function useAdminEducationalRequests(params?: QueryParams) {
  return usePaginatedQuery(
    QueryKeyFactory.list(QueryKeyFactory.QUERIES.EDUCATIONAL_REQUESTS, params),
    () => adminService.getEducationalRequests(params)
  );
}

export function useAdminEducationalRequest(id: string) {
  return useBaseQuery(
    QueryKeyFactory.detail(QueryKeyFactory.QUERIES.EDUCATIONAL_REQUESTS, id),
    () => adminService.getEducationalRequest(id),
    { enabled: !!id }
  );
}

export function useUpdateEducationalRequest() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['admin', 'educational-request', 'update'],
    ({ id, data }: { id: string; data: any }) =>
      adminService.updateEducationalRequest(id, data),
    {
      onSuccess: (_data, variables) => {
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.EDUCATIONAL_REQUESTS, variables.id);
        QueryKeyFactory.invalidateList(queryClient, QueryKeyFactory.QUERIES.EDUCATIONAL_REQUESTS);
      }
    }
  );
}

export function useChangeEducationalRequestStatus() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['admin', 'educational-request', 'change-status'],
    ({ id, type, status, reason }: { id: string; type: 'request' | 'payment' | 'fulfillment'; status: string; reason?: string }) =>
      adminService.changeEducationalRequestStatus(id, type, status, reason),
    {
      onSuccess: (_data, variables) => {
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.EDUCATIONAL_REQUESTS, variables.id);
        QueryKeyFactory.invalidateList(queryClient, QueryKeyFactory.QUERIES.EDUCATIONAL_REQUESTS);
      }
    }
  );
}

// Project Attachments Hooks
export function useProjectAttachments(projectId: string) {
  return useBaseQuery(
    QueryKeyFactory.related(QueryKeyFactory.QUERIES.PROJECTS, projectId, 'attachments'),
    () => adminService.getProjectAttachments(projectId),
    { enabled: !!projectId }
  );
}

export function useProjectDeliverables(projectId: string) {
  return useBaseQuery(
    QueryKeyFactory.related(QueryKeyFactory.QUERIES.PROJECTS, projectId, 'deliverables'),
    () => adminService.getProjectDeliverables(projectId),
    { enabled: !!projectId }
  );
}

export function useCreateProjectAttachment() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['admin', 'project', 'attachments', 'create'],
    ({ projectId, title, description, file }: { projectId: string; title: string; description?: string | null; file: File }) =>
      adminService.createProjectAttachment(projectId, { title, description: description ?? null, attachment: file }),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: QueryKeyFactory.related(QueryKeyFactory.QUERIES.PROJECTS, variables.projectId, 'attachments') });
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.PROJECTS, variables.projectId);
      }
    }
  );
}

export function useUpdateProjectAttachment() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['admin', 'project', 'attachments', 'update'],
    ({ projectId, attachmentId, title, description, file }: { projectId: string; attachmentId: string; title?: string; description?: string | null; file?: File }) =>
      adminService.updateProjectAttachment(projectId, attachmentId, { title, description: description ?? null, attachment: file as any }),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: QueryKeyFactory.related(QueryKeyFactory.QUERIES.PROJECTS, variables.projectId, 'attachments') });
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.PROJECTS, variables.projectId);
      }
    }
  );
}

export function useDeleteProjectAttachment() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['admin', 'project', 'attachments', 'delete'],
    ({ projectId, attachmentId }: { projectId: string; attachmentId: string }) =>
      adminService.deleteProjectAttachment(projectId, attachmentId),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: QueryKeyFactory.related(QueryKeyFactory.QUERIES.PROJECTS, variables.projectId, 'attachments') });
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.PROJECTS, variables.projectId);
      }
    }
  );
}

// Project Management Hooks
export function useAdminProjects(params: PaginatedRequestParams) {
  return usePaginatedQuery(
    QueryKeyFactory.list(QueryKeyFactory.QUERIES.PROJECTS, params),
    () => adminService.getProjects(params)
  );
}

export function useAdminProject(id: string) {
  return useBaseQuery(
    QueryKeyFactory.detail(QueryKeyFactory.QUERIES.PROJECTS, id),
    () => adminService.getProject(id),
    {
      enabled: !!id
    }
  );
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['admin', 'project', 'create'],
    (projectData: any) => adminService.createProject(projectData),
    {
      onSuccess: () => {
        QueryKeyFactory.invalidateList(queryClient, QueryKeyFactory.QUERIES.PROJECTS);
        QueryKeyFactory.invalidateAll(queryClient, 'dashboard');
      }
    }
  );
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['admin', 'project', 'update'],
    ({ id, data }: { id: string; data: any }) =>
      adminService.updateProject(id, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: [QueryKeyFactory.QUERIES.PROJECTS, 'list'], refetchType: 'all' });
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.PROJECTS, variables.id);
      }
    }
  );
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['admin', 'project', 'delete'],
    ({ id, reason }: { id: string; reason: string }) =>
      adminService.deleteProject(id, reason),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: [QueryKeyFactory.QUERIES.PROJECTS, 'list'], refetchType: 'all' });
        queryClient.removeQueries({
          queryKey: QueryKeyFactory.detail(QueryKeyFactory.QUERIES.PROJECTS, variables.id)
        });
      }
    }
  );
}

export function usePublishProject() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['admin', 'project', 'publish'],
    (id: string) => adminService.publishProject(id),
    {
      onSuccess: (data, id) => {
        queryClient.invalidateQueries({ queryKey: [QueryKeyFactory.QUERIES.PROJECTS, 'list'], refetchType: 'all' });
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.PROJECTS, id);
      }
    }
  );
}

export function useUnpublishProject() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['admin', 'project', 'unpublish'],
    ({ id, reason }: { id: string; reason: string }) =>
      adminService.unpublishProject({ id, reason }),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: [QueryKeyFactory.QUERIES.PROJECTS, 'list'], refetchType: 'all' });
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.PROJECTS, variables.id);
      }
    }
  );
}

// Project Status
export function useChangeProjectStatus() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['admin', 'project', 'change-status'],
    ({ projectId, status, reason }: { projectId: string; status: string; reason: string }) =>
      adminService.changeProjectStatus(projectId, status, reason),
    {
      onSuccess: (data, variables) => {
        // Force refetch even for inactive list queries (fixes refetchOnMount: false issue)
        queryClient.invalidateQueries({ queryKey: [QueryKeyFactory.QUERIES.PROJECTS, 'list'], refetchType: 'all' });

        // The status change also writes a "سجل الأحداث" entry, so the detail
        // must be refetched — patching only `status` left the activity tab stale.
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.PROJECTS, variables.projectId);
      }
    }
  );
}

// Single Task Detail
export function useAdminTask(id: string) {
  return useBaseQuery(
    QueryKeyFactory.detail(QueryKeyFactory.QUERIES.TASKS, id),
    () => adminService.getTask(id),
    { enabled: !!id }
  );
}

// Add a note to a task (persisted in task_notes)
export function useCreateTaskNote() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['admin', 'task', 'note', 'create'],
    ({ taskId, content }: { taskId: string; content: string }) =>
      adminService.createTaskNote(taskId, content),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: QueryKeyFactory.detail(QueryKeyFactory.QUERIES.TASKS, variables.taskId)
        });
      }
    }
  );
}

// Task Management Hooks
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['admin', 'task', 'create'],
    ({ projectId, taskData }: { projectId: string; taskData: any }) =>
      adminService.createTask(projectId, taskData),
    {
      onSuccess: (data, variables) => {
        const task = (data as any)?.data?.task ?? (data as any)?.task ?? data;
        if (task) {
          // set task detail
          queryClient.setQueryData(QueryKeyFactory.detail(QueryKeyFactory.QUERIES.TASKS, task.id), task);
          // append to project tasks cache
          const projectKey = QueryKeyFactory.detail(QueryKeyFactory.QUERIES.PROJECTS, variables.projectId);
          queryClient.setQueryData(projectKey, (old: any) => {
            if (!old) return old;
            const tasks = Array.isArray(old.tasks) ? [...old.tasks, task] : [task];
            return { ...old, tasks };
          });
        } else {
          QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.PROJECTS, variables.projectId);
        }
      }
    }
  );
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['admin', 'task', 'update'],
    ({ projectId, taskId, taskData }: { projectId: string; taskId: string; taskData: any }) =>
      adminService.updateTask(projectId, taskId, taskData),
    {
      onSuccess: (data, variables) => {
        const task = (data as any)?.data?.task ?? (data as any)?.task ?? data;
        if (task) {
          // Update task detail cache — shape: { status, message, data: { task } }
          queryClient.setQueryData(QueryKeyFactory.detail(QueryKeyFactory.QUERIES.TASKS, variables.taskId), (old: any) => {
            if (!old) return { data: { task } };
            return { ...old, data: { ...old.data, task } };
          });
          // Update project cache — shape: { status, message, data: { project: { ..., tasks } } }
          queryClient.setQueryData(QueryKeyFactory.detail(QueryKeyFactory.QUERIES.PROJECTS, variables.projectId), (old: any) => {
            if (!old) return old;
            const project = old?.data?.project ?? old?.project;
            if (project && Array.isArray(project.tasks)) {
              const updatedTasks = project.tasks.map((t: any) => t.id === task.id ? { ...t, ...task } : t);
              const updatedProject = { ...project, tasks: updatedTasks };
              if (old.data) {
                return { ...old, data: { ...old.data, project: updatedProject } };
              }
              return { ...old, project: updatedProject, tasks: undefined };
            }
            return old;
          });
        } else {
          QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.PROJECTS, variables.projectId);
          QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.TASKS, variables.taskId);
        }
      }
    }
  );
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['admin', 'task', 'delete'],
    ({ projectId, taskId, reason }: { projectId: string; taskId: string; reason: string }) =>
      adminService.deleteTask(projectId, taskId, reason),
    {
      onSuccess: (_data, variables) => {
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.PROJECTS, variables.projectId);
        queryClient.removeQueries({
          queryKey: QueryKeyFactory.detail(QueryKeyFactory.QUERIES.TASKS, variables.taskId)
        });
      }
    }
  );
}

export function useChangeTaskStatus() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['admin', 'task', 'change-status'],
    ({ projectId, taskId, status, reason }: { projectId: string; taskId: string; status: string; reason?: string }) =>
      adminService.changeTaskStatus(taskId, status, reason),
    {
      onSuccess: (data, variables) => {
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.PROJECTS, variables.projectId);
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.TASKS, variables.taskId);
        if (data) {
          const task = (data as any)?.data?.task ?? (data as any)?.task ?? data;
          queryClient.setQueryData(QueryKeyFactory.detail(QueryKeyFactory.QUERIES.TASKS, variables.taskId), task);
        }
      }
    }
  );
}

export function useAssignTaskEducators() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['admin', 'task', 'assign'],
    ({ projectId, taskId, educators, assigned_type, amount, bid_id, agreement_notes }: { projectId: string; taskId: string; educators: string[]; assigned_type: string; amount?: number; bid_id?: string | null; agreement_notes?: string | null; }) =>
      adminService.assignTaskEducators(taskId, { educators, assigned_type: assigned_type as any, amount, bid_id: bid_id ?? null, agreement_notes: agreement_notes ?? null }),
    {
      onSuccess: (data, variables) => {
        const task = (data as any)?.data?.task ?? (data as any)?.task ?? data;
        if (task) {
          queryClient.setQueryData(QueryKeyFactory.detail(QueryKeyFactory.QUERIES.TASKS, variables.taskId), task);
          const projectKey = QueryKeyFactory.detail(QueryKeyFactory.QUERIES.PROJECTS, variables.projectId);
          queryClient.setQueryData(projectKey, (old: any) => {
            if (!old) return old;
            const tasks = (old.tasks || []).map((t: any) => (t.id === task.id ? task : t));
            return { ...old, tasks };
          });
        } else {
          QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.PROJECTS, variables.projectId);
        }
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.TASKS, variables.taskId);
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.PROJECTS, variables.projectId);
      }
    }
  );
}

export function useCancelAssignment() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['admin', 'assignment', 'cancel'],
    ({ assignmentId, reason }: { assignmentId: string; reason: string }) =>
      adminService.cancelAssignment(assignmentId, reason),
    {
      onSuccess: (data, variables) => {
        // After cancelling, invalidate related task and project caches so UI updates
        QueryKeyFactory.invalidateAll(queryClient, 'projects');
        queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'projects' });
        // If API returned updated task, update it
        const task = (data as any)?.data?.task ?? (data as any)?.task ?? data;
        if (task) {
          queryClient.setQueryData(QueryKeyFactory.detail(QueryKeyFactory.QUERIES.TASKS, task.id), task);
          QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.PROJECTS, task.project?.id || '');
        }
      }
    }
  );
}

// Sub-task Hooks
export function useCreateSubTask() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['admin', 'sub-task', 'create'],
    ({ projectId, taskId, title }: { projectId: string; taskId: string; title: string }) =>
      adminService.createSubTask(taskId, title),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: QueryKeyFactory.detail(QueryKeyFactory.QUERIES.TASKS, variables.taskId), refetchType: 'all' });
        queryClient.invalidateQueries({ queryKey: QueryKeyFactory.detail(QueryKeyFactory.QUERIES.PROJECTS, variables.projectId), refetchType: 'all' });
        queryClient.invalidateQueries({ queryKey: [QueryKeyFactory.QUERIES.PROJECTS, 'list'], refetchType: 'all' });
      }
    }
  );
}

export function useUpdateSubTask() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['admin', 'sub-task', 'update'],
    ({ projectId, taskId, subTaskId, title }: { projectId: string; taskId: string; subTaskId: string; title: string }) =>
      adminService.updateSubTask(subTaskId, title),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: QueryKeyFactory.detail(QueryKeyFactory.QUERIES.TASKS, variables.taskId), refetchType: 'all' });
        queryClient.invalidateQueries({ queryKey: QueryKeyFactory.detail(QueryKeyFactory.QUERIES.PROJECTS, variables.projectId), refetchType: 'all' });
      }
    }
  );
}

export function useDeleteSubTask() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['admin', 'sub-task', 'delete'],
    ({ projectId, taskId, subTaskId }: { projectId: string; taskId: string; subTaskId: string }) =>
      adminService.deleteSubTask(subTaskId),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: QueryKeyFactory.detail(QueryKeyFactory.QUERIES.TASKS, variables.taskId), refetchType: 'all' });
        queryClient.invalidateQueries({ queryKey: QueryKeyFactory.detail(QueryKeyFactory.QUERIES.PROJECTS, variables.projectId), refetchType: 'all' });
      }
    }
  );
}

export function useUploadSubTaskAttachment() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['admin', 'sub-task', 'upload-attachment'],
    ({ projectId, taskId, subTaskId, file, title }: { projectId: string; taskId: string; subTaskId: string; file: File; title?: string }) =>
      adminService.uploadSubTaskAttachment(taskId, subTaskId, file, title || file?.name || 'attachment'),
    {
      onSuccess: (data, variables) => {
        // Extract attachments from the backend response
        // Backend returns: { status: true, data: { subTask: { ..., attachments: [...] } } }
        const backendAttachments = data?.data?.subTask?.attachments as any[] | undefined;
        const attachment = backendAttachments?.[backendAttachments.length - 1];
        if (attachment && attachment.id) {
          queryClient.setQueryData(QueryKeyFactory.detail(QueryKeyFactory.QUERIES.PROJECTS, variables.projectId), (oldData: any) => {
            if (!oldData) return oldData;
            const newData = { ...oldData };
            const project = newData?.data?.project || newData?.data || newData;
            if (project && Array.isArray(project.tasks)) {
              const task = project.tasks.find((t: any) => t.id === variables.taskId);
              if (task && Array.isArray(task.subTasks)) {
                const subTask = task.subTasks.find((st: any) => st.id === variables.subTaskId);
                if (subTask) {
                  if (!Array.isArray(subTask.attachments)) subTask.attachments = [];
                  if (!subTask.attachments.find((a: any) => a.id === attachment.id)) {
                    subTask.attachments.push(attachment);
                  }
                }
              }
            }
            return newData;
          });
        }
        
        queryClient.invalidateQueries({ queryKey: QueryKeyFactory.detail(QueryKeyFactory.QUERIES.TASKS, variables.taskId), refetchType: 'all' });
        queryClient.invalidateQueries({ queryKey: QueryKeyFactory.detail(QueryKeyFactory.QUERIES.PROJECTS, variables.projectId), refetchType: 'all' });
      }
    }
  );
}

export function useToggleSubTaskComplete() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['admin', 'sub-task', 'toggle-complete'],
    ({ projectId, taskId, subTaskId, is_complete }: { projectId: string; taskId: string; subTaskId: string; is_complete: boolean }) =>
      adminService.toggleSubTaskComplete(taskId, subTaskId, is_complete),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: QueryKeyFactory.detail(QueryKeyFactory.QUERIES.TASKS, variables.taskId), refetchType: 'all' });
        queryClient.invalidateQueries({ queryKey: QueryKeyFactory.detail(QueryKeyFactory.QUERIES.PROJECTS, variables.projectId), refetchType: 'all' });
      }
    }
  );
}

// Task Bidding Hooks (Open/Close)
export function useOpenTaskBidding() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['admin', 'task', 'open-bidding'],
    ({ projectId, taskId }: { projectId: string; taskId: string }) => adminService.openTaskBidding(taskId),
    {
      onSuccess: (data, variables) => {
        const task = (data as any)?.data?.task ?? (data as any)?.task ?? data;
        if (task) {
          queryClient.setQueryData(QueryKeyFactory.detail(QueryKeyFactory.QUERIES.TASKS, variables.taskId), task);
          QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.PROJECTS, variables.projectId);
        }
      }
    }
  );
}

export function useCloseTaskBidding() {
  const queryClient = useQueryClient();
  return useBaseMutation(
    ['admin', 'task', 'close-bidding'],
    ({ projectId, taskId }: { projectId: string; taskId: string }) => adminService.closeTaskBidding(taskId),
    {
      onSuccess: (data, variables) => {
        const task = (data as any)?.data?.task ?? (data as any)?.task ?? data;
        if (task) {
          queryClient.setQueryData(QueryKeyFactory.detail(QueryKeyFactory.QUERIES.TASKS, variables.taskId), task);
          QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.PROJECTS, variables.projectId);
        }
      }
    }
  );
}

// Bid Management Hooks
export function useAdminBids(params?: QueryParams) {
  return usePaginatedQuery(
    QueryKeyFactory.list(QueryKeyFactory.QUERIES.BIDS, params),
    () => adminService.getBids(params)
  );
}

export function useAdminBid(id: string) {
  return useBaseQuery(
    QueryKeyFactory.detail(QueryKeyFactory.QUERIES.BIDS, id),
    () => adminService.getBid(id),
    {
      enabled: !!id
    }
  );
}

export function useApproveBid() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['admin', 'bid', 'approve'],
    ({ id, message }: { id: string; message?: string }) =>
      adminService.approveBid(id, message),
    {
      onSuccess: (data, variables) => {
        QueryKeyFactory.invalidateList(queryClient, QueryKeyFactory.QUERIES.BIDS);
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.BIDS, variables.id);
        QueryKeyFactory.invalidateAll(queryClient, 'pending-approvals');
      }
    }
  );
}

export function useRejectBid() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['admin', 'bid', 'reject'],
    ({ id, reason }: { id: string; reason: string }) =>
      adminService.rejectBid(id, reason),
    {
      onSuccess: (data, variables) => {
        QueryKeyFactory.invalidateList(queryClient, QueryKeyFactory.QUERIES.BIDS);
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.BIDS, variables.id);
        QueryKeyFactory.invalidateAll(queryClient, 'pending-approvals');
      }
    }
  );
}

// Bid Task Hooks
export function useBidTasks(bidId: string) {
  return useBaseQuery(
    QueryKeyFactory.related(QueryKeyFactory.QUERIES.BIDS, bidId, 'tasks'),
    () => adminService.getBidTasks(bidId),
    {
      enabled: !!bidId
    }
  );
}

export function useApproveBidTask() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['admin', 'bid-task', 'approve'],
    ({ bidId, taskId, feedback }: { bidId: string; taskId: string; feedback?: string }) =>
      adminService.approveBidTask(bidId, taskId, feedback),
    {
      onSuccess: (data, variables) => {
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.BIDS, variables.bidId);
        queryClient.invalidateQueries({
          queryKey: QueryKeyFactory.related(QueryKeyFactory.QUERIES.BIDS, variables.bidId, 'tasks')
        });
      }
    }
  );
}

export function useRejectBidTask() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['admin', 'bid-task', 'reject'],
    ({ bidId, taskId, reason }: { bidId: string; taskId: string; reason: string }) =>
      adminService.rejectBidTask(bidId, taskId, reason),
    {
      onSuccess: (data, variables) => {
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.BIDS, variables.bidId);
        queryClient.invalidateQueries({
          queryKey: QueryKeyFactory.related(QueryKeyFactory.QUERIES.BIDS, variables.bidId, 'tasks')
        });
      }
    }
  );
}

export function useBulkApproveBidTasks() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['admin', 'bid-tasks', 'bulk-approve'],
    ({ bidId, taskIds, feedback }: { bidId: string; taskIds: string[]; feedback?: string }) =>
      adminService.bulkApproveBidTasks(bidId, taskIds, feedback),
    {
      onSuccess: (data, variables) => {
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.BIDS, variables.bidId);
        queryClient.invalidateQueries({
          queryKey: QueryKeyFactory.related(QueryKeyFactory.QUERIES.BIDS, variables.bidId, 'tasks')
        });
      }
    }
  );
}

export function useBulkRejectBidTasks() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['admin', 'bid-tasks', 'bulk-reject'],
    ({ bidId, taskIds, reason }: { bidId: string; taskIds: string[]; reason: string }) =>
      adminService.bulkRejectBidTasks(bidId, taskIds, reason),
    {
      onSuccess: (data, variables) => {
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.BIDS, variables.bidId);
        queryClient.invalidateQueries({
          queryKey: QueryKeyFactory.related(QueryKeyFactory.QUERIES.BIDS, variables.bidId, 'tasks')
        });
      }
    }
  );
}

// Support Management Hooks
export function useAdminSupportTickets(params?: QueryParams) {
  return usePaginatedQuery(
    QueryKeyFactory.list(QueryKeyFactory.QUERIES.SUPPORT_TICKETS, params),
    () => adminService.getSupportTickets(params)
  );
}

export function useAdminSupportTicket(id: string) {
  return useBaseQuery(
    QueryKeyFactory.detail(QueryKeyFactory.QUERIES.SUPPORT_TICKETS, id),
    () => adminService.getSupportTicket(id),
    {
      enabled: !!id
    }
  );
}

export function useAssignSupportTicket() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['admin', 'support-ticket', 'assign'],
    ({ id, assigneeId }: { id: string; assigneeId: string }) =>
      adminService.assignSupportTicket(id, assigneeId),
    {
      onSuccess: (data, variables) => {
        QueryKeyFactory.invalidateList(queryClient, QueryKeyFactory.QUERIES.SUPPORT_TICKETS);
        QueryKeyFactory.invalidateDetail(queryClient, QueryKeyFactory.QUERIES.SUPPORT_TICKETS, variables.id);
      }
    }
  );
}

// Managed Items Hooks
export function useManagedItems(type: 'skills' | 'services' | 'specializations') {
  return useBaseQuery(
    QueryKeyFactory.list(`managed-${type}`),
    () => adminService.getManagedItems(type)
  );
}

export function useCreateManagedItem() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['admin', 'managed-item', 'create'],
    ({ type, data }: { type: 'skills' | 'services' | 'specializations'; data: any }) =>
      adminService.createManagedItem(type, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({
          queryKey: QueryKeyFactory.list(`managed-${variables.type}`)
        });
      }
    }
  );
}

export function useUpdateManagedItem() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['admin', 'managed-item', 'update'],
    ({ type, id, data }: { type: 'skills' | 'services' | 'specializations'; id: string; data: any }) =>
      adminService.updateManagedItem(type, id, data),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({
          queryKey: QueryKeyFactory.list(`managed-${variables.type}`)
        });
      }
    }
  );
}

export function useDeleteManagedItem() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['admin', 'managed-item', 'delete'],
    ({ type, id }: { type: 'skills' | 'services' | 'specializations'; id: string }) =>
      adminService.deleteManagedItem(type, id),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({
          queryKey: QueryKeyFactory.list(`managed-${variables.type}`)
        });
      }
    }
  );
}

// Bulk Operations Hook
export function useBulkOperation() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['admin', 'bulk-operation'],
    (operation: BulkOperation) => adminService.executeBulkOperation(operation),
    {
      onSuccess: (data, operation) => {
        // Invalidate relevant queries based on entity type
        switch (operation.entity_type) {
          case 'educators':
            QueryKeyFactory.invalidateAll(queryClient, QueryKeyFactory.QUERIES.EDUCATORS);
            break;
          case 'projects':
            QueryKeyFactory.invalidateAll(queryClient, QueryKeyFactory.QUERIES.PROJECTS);
            break;
          case 'bids':
            QueryKeyFactory.invalidateAll(queryClient, QueryKeyFactory.QUERIES.BIDS);
            break;
          case 'users':
            QueryKeyFactory.invalidateAll(queryClient, QueryKeyFactory.QUERIES.USERS);
            break;
        }
        
        // Invalidate dashboard and pending approvals
        QueryKeyFactory.invalidateAll(queryClient, 'dashboard');
        QueryKeyFactory.invalidateAll(queryClient, 'pending-approvals');
      }
    }
  );
}

// Settings Hook
export function useAdminSettings() {
  return useBaseQuery(
    QueryKeyFactory.all('admin-settings'),
    () => adminService.getSettings(),
    {
      staleTime: 600000 // 10 minutes
    }
  );
}

export function useUpdateAdminSettings() {
  const queryClient = useQueryClient();

  return useBaseMutation(
    ['admin', 'settings', 'update'],
    (settings: any) => adminService.updateSettings(settings),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: QueryKeyFactory.all('admin-settings')
        });
      }
    }
  );
}

// Composite Hook for Admin Dashboard
export function useAdminDashboardData() {
  const dashboard = useAdminDashboard();
  const activityFeed = useAdminActivityFeed({ per_page: 10 });
  const pendingApprovals = usePendingApprovals();
  const systemHealth = useSystemHealth();

  return {
    dashboard,
    activityFeed,
    pendingApprovals,
    systemHealth,
    isLoading: dashboard.isLoading || activityFeed.isLoading || pendingApprovals.isLoading || systemHealth.isLoading,
    isError: dashboard.isError || activityFeed.isError || pendingApprovals.isError || systemHealth.isError,
    refetchAll: useCallback(() => {
      dashboard.refetch();
      activityFeed.refetch();
      pendingApprovals.refetch();
      systemHealth.refetch();
    }, [dashboard.refetch, activityFeed.refetch, pendingApprovals.refetch, systemHealth.refetch])
  };
}
