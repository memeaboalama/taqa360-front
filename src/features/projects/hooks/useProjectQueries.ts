import {
  useQuery, 
  useMutation, 
  useQueryClient, 
  UseQueryOptions,
  UseMutationOptions,
  UseQueryResult
} from '@tanstack/react-query';
import { QueryKeyFactory } from '../../../core/hooks/useBaseQuery';
import {
  ProjectService,
  ProjectFilters,
  TaskFilters,
  CreateTaskData,
  UpdateTaskData,
  CreateAssignmentData,
  AcceptAssignmentData
} from '../services/ProjectService';
import { PaginatedResponse } from '../../../shared/types';
import { ProjectsResponse } from '../../../core/api/types';
import {
  Project,
  Task,
  Bid,
  Assignment,
  Attachment,
  AssignmentStatus
} from '../../../shared/types';

// تعريف مفاتيح الاستعلام (Query Keys) لـ React Query
export const projectQueryKeys = {
  all: ['projects'] as const,
  lists: (filters: ProjectFilters = {}) => [...projectQueryKeys.all, 'list', filters] as const,
  detail: (id: string) => [...projectQueryKeys.all, 'detail', id] as const,
  tasks: ['tasks'] as const,
  tasksList: (filters: TaskFilters = {}) => [...projectQueryKeys.tasks, 'list', filters] as const,
  taskDetail: (id: string) => [...projectQueryKeys.tasks, 'detail', id] as const,
  projectTasks: (projectId: string, filters: Omit<TaskFilters, 'project_id'> = {}) => [...projectQueryKeys.all, 'detail', projectId, 'tasks', filters] as const,
  taskAssignments: (taskId: string) => [...projectQueryKeys.tasks, 'detail', taskId, 'assignments'] as const,
  taskBids: (taskId: string) => [...projectQueryKeys.tasks, 'detail', taskId, 'bids'] as const,
  bids: ['bids'] as const,
  bidDetail: (id: string) => [...projectQueryKeys.bids, 'detail', id] as const,
  opportunities: ['opportunities'] as const,
  opportunitiesList: (filters: TaskFilters = {}) => [...projectQueryKeys.opportunities, 'list', filters] as const,
  opportunityDetail: (id: string) => [...projectQueryKeys.opportunities, 'detail', id] as const,
  myProjects: ['my-projects'] as const,
  myProjectsList: (filters: ProjectFilters = {}) => [...projectQueryKeys.myProjects, 'list', filters] as const,
  myTasks: ['my-tasks'] as const,
  myTasksList: (filters: TaskFilters = {}) => [...projectQueryKeys.myTasks, 'list', filters] as const,
};

// Projects Hooks
export const useProjects = (
  filters?: ProjectFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<Project>, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<PaginatedResponse<Project>, Error>({
    queryKey: projectQueryKeys.lists(filters),
    queryFn: () => ProjectService.getProjects(filters),
    ...options,
  });
};

export const useProjectsForSelection = (
  filters?: ProjectFilters,
  options?: Omit<UseQueryOptions<Project[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Project[], Error>({
    queryKey: projectQueryKeys.lists(filters),
    queryFn: () => ProjectService.getProjectsForSelection(filters),
    ...options,
  });
};

export const useProject = (
  id: string,
  options?: Omit<UseQueryOptions<Project, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Project, Error>({
    queryKey: projectQueryKeys.detail(id),
    queryFn: () => ProjectService.getProject(id),
    enabled: !!id,
    ...options,
  });
};

export const useOpportunityProject = (
  id: string,
  options?: Omit<UseQueryOptions<Project, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Project, Error>({
    queryKey: projectQueryKeys.opportunityDetail(id),
    queryFn: () => ProjectService.getOpportunityProject(id),
    enabled: !!id,
    ...options,
  });
};

export const useCreateProject = (
  options?: UseMutationOptions<Project, Error, Partial<Project>>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<Project, Error, Partial<Project>>({
    mutationFn: ProjectService.createProject,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.lists() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateProject = (
  options?: UseMutationOptions<Project, Error, { id: string; data: Partial<Project> }>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<Project, Error, { id: string; data: Partial<Project> }>({
    mutationFn: ({ id, data }) => ProjectService.updateProject(id, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(variables.id) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useDeleteProject = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: ProjectService.deleteProject,
    onSuccess: (data, id, context) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.lists() });
      queryClient.removeQueries({ queryKey: projectQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.projectTasks(id) });
      options?.onSuccess?.(data, id, context);
    },
    ...options,
  });
};

// Tasks Hooks
export const useTasks = (
  filters?: TaskFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<Task>, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<PaginatedResponse<Task>, Error>({
    queryKey: projectQueryKeys.tasksList(filters),
    queryFn: () => ProjectService.getTasks(filters),
    ...options,
  });
};

export const useTask = (
  id: string,
  options?: Omit<UseQueryOptions<Task, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Task, Error>({
    queryKey: projectQueryKeys.taskDetail(id),
    queryFn: () => ProjectService.getTask(id),
    enabled: !!id,
    ...options,
  });
};

export const useProjectTasks = (
  projectId: string,
  filters?: Omit<TaskFilters, 'project_id'>,
  options?: Omit<UseQueryOptions<PaginatedResponse<Task>, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<PaginatedResponse<Task>, Error>({
    queryKey: projectQueryKeys.projectTasks(projectId, filters),
    queryFn: () => ProjectService.getProjectTasks(projectId, filters),
    enabled: !!projectId,
    ...options,
  });
};

export const useCreateTask = (
  options?: UseMutationOptions<Task, Error, { projectId: string; taskData: CreateTaskData }>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<Task, Error, { projectId: string; taskData: CreateTaskData }>({
    mutationFn: ({ projectId, taskData }) => ProjectService.createTask(projectId, taskData),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.tasksList() });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.projectTasks(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(variables.projectId) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateTask = (
  options?: UseMutationOptions<Task, Error, { id: string; taskData: UpdateTaskData }>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<Task, Error, { id: string; taskData: UpdateTaskData }>({
    mutationFn: ({ id, taskData }) => ProjectService.updateTask(id, taskData),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.tasksList() });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.taskDetail(variables.id) });
      // Invalidate project tasks if project ID is available
      // queryClient.invalidateQueries({ queryKey: projectQueryKeys.projectTasks(data.project_id) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useDeleteTask = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: ProjectService.deleteTask,
    onSuccess: (data, id, context) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.tasksList() });
      queryClient.removeQueries({ queryKey: projectQueryKeys.taskDetail(id) });
      // Invalidate all project tasks lists
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'projects' && 
          query.queryKey[2] === 'tasks'
      });
      options?.onSuccess?.(data, id, context);
    },
    ...options,
  });
};

// Task Bidding Hooks
export const useOpenBidding = (
  options?: UseMutationOptions<Task, Error, string>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<Task, Error, string>({
    mutationFn: ProjectService.openBidding,
    onSuccess: (data, id, context) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.taskDetail(id) });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.opportunitiesList() });
      options?.onSuccess?.(data, id, context);
    },
    ...options,
  });
};

export const useCloseBidding = (
  options?: UseMutationOptions<Task, Error, string>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<Task, Error, string>({
    mutationFn: ProjectService.closeBidding,
    onSuccess: (data, id, context) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.taskDetail(id) });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.opportunitiesList() });
      options?.onSuccess?.(data, id, context);
    },
    ...options,
  });
};

// Assignments Hooks
export const useTaskAssignments = (
  taskId: string,
  options?: Omit<UseQueryOptions<Assignment[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Assignment[], Error>({
    queryKey: projectQueryKeys.taskAssignments(taskId),
    queryFn: () => ProjectService.getTaskAssignments(taskId),
    enabled: !!taskId,
    ...options,
  });
};

export const useCreateAssignment = (
  options?: UseMutationOptions<Assignment, Error, { taskId: string; assignmentData: CreateAssignmentData }>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<Assignment, Error, { taskId: string; assignmentData: CreateAssignmentData }>({
    mutationFn: ({ taskId, assignmentData }) => ProjectService.createAssignment(taskId, assignmentData),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.taskAssignments(variables.taskId) });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.taskDetail(variables.taskId) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useAcceptAssignment = (
  options?: UseMutationOptions<Assignment, Error, AcceptAssignmentData>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<Assignment, Error, AcceptAssignmentData>({
    // ...options must come before onSuccess/mutationFn: spreading it afterwards
    // makes a caller-supplied onSuccess replace this one, which silently drops
    // the cache invalidation below.
    ...options,
    mutationFn: ProjectService.acceptAssignment,
    onSuccess: (data, variables, context) => {
      // The admin project screen (ProjectDetailContainer -> useAdminProject)
      // reads ['projects','detail',projectId], NOT the keys in this file, so
      // invalidating only those left the UI stale until a manual reload.
      const projectId = variables.projectId;
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: QueryKeyFactory.detail(QueryKeyFactory.QUERIES.PROJECTS, projectId) });
        queryClient.invalidateQueries({ queryKey: [QueryKeyFactory.QUERIES.PROJECTS, 'detail'] });
      }
      const taskId = variables.taskId ?? data?.task_id;
      if (taskId) {
        queryClient.invalidateQueries({ queryKey: projectQueryKeys.taskAssignments(taskId) });
        queryClient.invalidateQueries({ queryKey: projectQueryKeys.taskDetail(taskId) });
      }
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.myTasksList() });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.myProjectsList() });
      options?.onSuccess?.(data, variables, context);
    },
  });
};

export const useRejectAssignment = (
  options?: UseMutationOptions<Assignment, Error, { assignmentId: string; reason?: string; agreement_notes?: string; taskId?: string; projectId?: string }>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<Assignment, Error, { assignmentId: string; reason?: string; agreement_notes?: string; taskId?: string; projectId?: string }>({
    ...options, // keep before onSuccess so caller callbacks do not drop invalidation
    mutationFn: ({ assignmentId, reason, agreement_notes }) => ProjectService.rejectAssignment(assignmentId, reason, agreement_notes),
    onSuccess: (data, variables, context) => {
      if (variables.projectId) {
        queryClient.invalidateQueries({ queryKey: QueryKeyFactory.detail(QueryKeyFactory.QUERIES.PROJECTS, variables.projectId) });
        queryClient.invalidateQueries({ queryKey: [QueryKeyFactory.QUERIES.PROJECTS, 'detail'] });
      }
      const taskId = variables.taskId ?? data?.task_id;
      if (taskId) {
        queryClient.invalidateQueries({ queryKey: projectQueryKeys.taskAssignments(taskId) });
        queryClient.invalidateQueries({ queryKey: projectQueryKeys.taskDetail(taskId) });
      }
      options?.onSuccess?.(data, variables, context);
    },
  });
};

export const useUpdateAssignmentStatus = (
  options?: UseMutationOptions<Assignment, Error, { assignmentId: string; status: AssignmentStatus; taskId?: string; projectId?: string; agreement_notes?: string; rejection_reason?: string }>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<Assignment, Error, { assignmentId: string; status: AssignmentStatus; taskId?: string; projectId?: string; agreement_notes?: string; rejection_reason?: string }>({
    ...options, // keep before onSuccess so caller callbacks do not drop invalidation
    mutationFn: ({ assignmentId, status, agreement_notes, rejection_reason }) => ProjectService.updateAssignmentStatus(assignmentId, status, agreement_notes, rejection_reason),
    onSuccess: (data, variables, context) => {
      if (variables.projectId) {
        queryClient.invalidateQueries({ queryKey: QueryKeyFactory.detail(QueryKeyFactory.QUERIES.PROJECTS, variables.projectId) });
        queryClient.invalidateQueries({ queryKey: [QueryKeyFactory.QUERIES.PROJECTS, 'detail'] });
      }
      const taskId = variables.taskId ?? data?.task_id;
      if (taskId) {
        queryClient.invalidateQueries({ queryKey: projectQueryKeys.taskAssignments(taskId) });
        queryClient.invalidateQueries({ queryKey: projectQueryKeys.taskDetail(taskId) });
      }
      options?.onSuccess?.(data, variables, context);
    },
  });
};

// Bids Hooks
export const useTaskBids = (
  taskId: string,
  options?: Omit<UseQueryOptions<Bid[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Bid[], Error>({
    queryKey: projectQueryKeys.taskBids(taskId),
    queryFn: () => ProjectService.getTaskBids(taskId),
    enabled: !!taskId,
    ...options,
  });
};

export const useBid = (
  id: string,
  options?: Omit<UseQueryOptions<Bid, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Bid, Error>({
    queryKey: projectQueryKeys.bidDetail(id),
    queryFn: () => ProjectService.getBid(id),
    enabled: !!id,
    ...options,
  });
};

export const useCreateBid = (
  options?: UseMutationOptions<Bid, Error, { taskId: string; bidData: Partial<Bid> }>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<Bid, Error, { taskId: string; bidData: Partial<Bid> }>({
    mutationFn: ({ taskId, bidData }) => ProjectService.createBid(taskId, bidData),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.taskBids(variables.taskId) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateBid = (
  options?: UseMutationOptions<Bid, Error, { id: string; bidData: Partial<Bid> }>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<Bid, Error, { id: string; bidData: Partial<Bid> }>({
    mutationFn: ({ id, bidData }) => ProjectService.updateBid(id, bidData),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.bidDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.taskBids(data.task_id) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useDeleteBid = (options?: UseMutationOptions<void, Error, string>) => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: ProjectService.deleteBid,
    onSuccess: (data, id, context) => {
      // We don't know the task id here, so we invalidate all bids
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.bids });
      queryClient.removeQueries({ queryKey: projectQueryKeys.bidDetail(id) });
      options?.onSuccess?.(data, id, context);
    },
    ...options,
  });
};

export const useApproveBid = (options?: UseMutationOptions<Bid, Error, { id: string; message?: string }>) => {
  const queryClient = useQueryClient();
  
  return useMutation<Bid, Error, { id: string; message?: string }>({
    mutationFn: ({ id, message }) => ProjectService.approveBid(id, message),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.bidDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.taskBids(data.task_id) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useRejectBid = (options?: UseMutationOptions<Bid, Error, { id: string; reason: string }>) => {
  const queryClient = useQueryClient();
  
  return useMutation<Bid, Error, { id: string; reason: string }>({
    mutationFn: ({ id, reason }) => ProjectService.rejectBid(id, reason),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.bidDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.taskBids(data.task_id) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUploadTaskAttachment = (options?: UseMutationOptions<Attachment, Error, { taskId: string; file: File; title?: string }>) => {
  const queryClient = useQueryClient();
  return useMutation<Attachment, Error, { taskId: string; file: File; title?: string }>({
    mutationFn: ({ taskId, file, title }) => ProjectService.uploadTaskAttachment(taskId, file, title),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.taskDetail(variables.taskId) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useDeleteTaskAttachment = (options?: UseMutationOptions<void, Error, { taskId: string; attachmentId: string }>) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { taskId: string; attachmentId: string }>({
    mutationFn: ({ taskId, attachmentId }) => ProjectService.deleteTaskAttachment(taskId, attachmentId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.taskDetail(variables.taskId) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUploadTaskDeliverable = (options?: UseMutationOptions<Attachment, Error, { taskId: string; file: File; title?: string }>) => {
  const queryClient = useQueryClient();
  return useMutation<Attachment, Error, { taskId: string; file: File; title?: string }>({
    mutationFn: ({ taskId, file, title }) => ProjectService.uploadTaskDeliverable(taskId, file, title),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.taskDetail(variables.taskId) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useAddTaskNote = (options?: UseMutationOptions<void, Error, { taskId: string; content: string }>) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { taskId: string; content: string }>({
    mutationFn: ({ taskId, content }) => ProjectService.addTaskNote(taskId, content),
    onSuccess: (data, variables, context) => {
      // Task notes are not directly fetched, so we invalidate the task to refetch everything
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.taskDetail(variables.taskId) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

// Opportunities (for Educators)
export const useOpportunities = (
  filters?: TaskFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<ProjectsResponse>, Error>, 'queryKey' | 'queryFn'>
) => {
  const query = useQuery<PaginatedResponse<ProjectsResponse>, Error>({
    queryKey: projectQueryKeys.opportunitiesList(filters),
    queryFn: () => ProjectService.getOpportunities(filters),
    ...options,
  });

  const pagePayload = (query.data?.data || {}) as any;
  const projects = Array.isArray(pagePayload?.projects) ? pagePayload.projects : [];
  const pagination = query.data?.pagination as any;

  return {
    ...query,
    data: projects,
    pagination,
    totalItems: pagination?.meta?.page?.total || 0,
    currentPage: pagination?.meta?.page?.current || 1,
    totalPages: pagination?.meta?.page?.last || 1,
    hasNextPage: pagination?.meta?.page?.isNext || false,
    hasPreviousPage: pagination?.meta?.page?.isPrevious || false,
  } as UseQueryResult<any, Error> & {
    data: any[];
    pagination: any;
    totalItems: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export const useOpportunity = (
  id: string,
  options?: Omit<UseQueryOptions<Task, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Task, Error>({
    queryKey: projectQueryKeys.taskDetail(id),
    queryFn: () => ProjectService.getOpportunity(id),
    enabled: !!id,
    ...options,
  });
};

// My Projects & Tasks (for Educators)
export const useMyProjects = (
  filters?: ProjectFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<Project>, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<PaginatedResponse<Project>, Error>({
    queryKey: projectQueryKeys.myProjectsList(filters),
    queryFn: () => ProjectService.getMyProjects(filters),
    ...options,
  });
};

export const useMyTasks = (
  filters?: TaskFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<Task>, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<PaginatedResponse<Task>, Error>({
    queryKey: projectQueryKeys.myTasksList(filters),
    queryFn: () => ProjectService.getMyTasks(filters),
    ...options,
  });
};
