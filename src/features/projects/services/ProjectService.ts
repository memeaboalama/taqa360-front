import { apiClient } from '../../../core/api/client';
import {
  Project,
  Task,
  Bid,
  Assignment,
  ProjectStatus,
  AssignmentStatus,
  Attachment,
  PaginatedResponse // Import PaginatedResponse from shared types
} from '../../../shared/types';

export interface TaskFilters {
  page?: number;
  per_page?: number;
  status?: ProjectStatus;
  is_public?: boolean;
  bidding_status?: 'OPEN' | 'CLOSED';
  search?: string;
  educator_id?: string;
}

export interface ProjectFilters {
  page?: number;
  per_page?: number;
  status?: ProjectStatus;
  is_published?: boolean;
  search?: string;
  tags?: string[];
  created_by?: string;
}

export interface CreateTaskData {
  title: string;
  description: string;
  budget?: number;
  deadline: string;
  is_public: boolean;
  attachments?: File[];
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  budget?: number;
  deadline?: string;
  is_public?: boolean;
  status?: ProjectStatus;
}

export interface CreateAssignmentData {
  educator_id: string;
  type: 'INVITATION' | 'DIRECT' | 'FROM_BID';
  amount?: number;
  agreement_notes?: string;
}

export interface AcceptAssignmentData {
  assignment_id: string;
  agreement_notes?: string;
  rejection_reason?: string;
  /** Task that owns the assignment. Used to invalidate the right caches. */
  taskId?: string;
  /** Project that owns the task. The admin screen reads ['projects','detail',id]. */
  projectId?: string;
}

export class ProjectService {
  /**
   * Both api clients hand back the full { status, message, data } envelope, so
   * `response.data` is the envelope and NOT the payload. Returning it directly
   * (as most methods here do) means callers get `{ status, message, data: {...} }`
   * typed as the payload, so any field they read - e.g. `task_id` - is undefined.
   * getTask() already unwrapped defensively; this does the same for the rest.
   */
  private static unwrap<T = any>(response: any): T {
    const payload = response?.data;
    return (payload?.data ?? payload) as T;
  }

  /**
   * Projects
   */

  static async getProjects(filters?: ProjectFilters): Promise<PaginatedResponse<Project>> {
    const response = await apiClient.get<PaginatedResponse<Project>>('/admin/projects', filters);
    return response.data;
  }

  static async getProjectsForSelection(filters?: ProjectFilters & { paginated?: boolean }): Promise<Project[]> {
    const response = await apiClient.get<PaginatedResponse<Project>>('/admin/projects', { ...filters, paginated: false });
    return response.data.data; // Assuming non-paginated response returns data directly in `data` field
  }

  static async getProject(id: string): Promise<Project> {
    const response = await apiClient.get<Project>(`/admin/projects/${id}`);
    return response.data;
  }

  static async getOpportunityProject(id: string): Promise<Project> {
    const response = await apiClient.get<any>(`/educator/opportunities/${id}`);
    const payload: any = response.data;
    const projectNode: any = payload?.data?.project ?? payload?.project ?? payload?.data ?? payload;

    if (!projectNode || typeof projectNode !== 'object') {
      return projectNode as Project;
    }

    const toNumber = (v: any): number | null => {
      if (v === null || v === undefined || v === '') return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    const norm = (v: any, fallback: string) => (typeof v === 'string' && v)
      ? v.trim().toUpperCase().replace(/[-\s]+/g, '_')
      : fallback;

    const mapAttachment = (a: any) => ({
      id: String(a.id),
      title: a.title || a.name || '',
      name: a.original_name || a.name || a.title || '',
      url: a.url || '#',
      size: typeof a.size === 'number' ? a.size : (a.size ? Number(a.size) : undefined),
      uploadedAt: a.uploadedAt || a.uploaded_at || a.createdAt || a.created_at || undefined
    });

    const mappedTasks = Array.isArray(projectNode.tasks) ? projectNode.tasks.map((t: any) => ({
      id: t.id,
      projectId: projectNode.id,
      title: t.title,
      description: t.description,
      status: norm(t.status, 'PENDING'),
      assignments: t.assignments || [],
      budget: toNumber(t.budget),
      deadline: t.deadline || '',
      isPublic: !!t.isPublic,
      biddingStatus: norm(t.biddingStatus || t.bidding_status, 'OPEN'),
      // Keep existing optional arrays consistent with our types
      subTasks: [],
      attachments: Array.isArray(t.attachments) ? t.attachments.map(mapAttachment) : [],
      deliverables: [],
      notes: [],
      creationDate: t.createdAt || t.created_at || '',
      modifiedAt: undefined,
      activityLog: [],
      // Extra educator-centric fields
      hasEducatorBidForTask: !!t.hasEducatorBidForTask,
      bidDetailForTask: t.BidDetailForTask ? {
        id: String(t.BidDetailForTask.id),
        status: t.BidDetailForTask.status,
        status_label: t.BidDetailForTask.status_label,
        amount: t.BidDetailForTask.amount,
        rejection_reason: t.BidDetailForTask.rejection_reason,
        approval_message: t.BidDetailForTask.approval_message,
        created_at: t.BidDetailForTask.created_at,
        updated_at: t.BidDetailForTask.updated_at,
      } : (t.bidDetailForTask || t.BidDetailForTask || null),
      externalSubTasks: Array.isArray(t.subTasks) ? t.subTasks.map((st: any) => ({
        id: st.id,
        title: st.title,
        attachments: Array.isArray(st.attachments) ? st.attachments.map(mapAttachment) : []
      })) : []
    })) : [];

    const mappedProject: any = {
      id: projectNode.id,
      title: projectNode.title,
      description: projectNode.description,
      status: norm(projectNode.status, 'PENDING') as any,
      tags: Array.isArray(projectNode.tags) ? projectNode.tags : [],
      budget: toNumber(projectNode.budget),
      isPublished: !!projectNode.isPublished,
      tasks: mappedTasks,
      creationType: norm(projectNode.creationType || projectNode.creation_type, 'PUBLIC') as any,
      createdBy: projectNode.createdBy?.name || projectNode.created_by?.name || '',
      createdAt: projectNode.createdAt || projectNode.created_at || '',
      updatedAt: projectNode.updatedAt || projectNode.updated_at || '',
      activityLog: [],
      endDate: projectNode.deadline || null,
      requesterName: projectNode.requesterName,
      // Educator-specific additions
      hasEducatorBidForOpportunity: !!projectNode.hasEducatorBidForOpportunity,
    };

    if (projectNode.bid) {
      const bid = projectNode.bid;
      mappedProject.bid = {
        id: String(bid.id),
        projectId: projectNode.id,
        educatorId: String(bid.educatorId || bid.educator_id || ''),
        proposal: bid.proposal || '',
        deliveryDays: bid.deliveryDays ?? bid.delivery_days ?? 0,
        createdAt: bid.createdAt || bid.created_at || '',
        bidTasks: Array.isArray(bid.bidTasks)
          ? bid.bidTasks.map((bt: any) => ({ taskId: String(bt.taskId || bt.task_id), status: bt.status, amount: Number(bt.amount || 0) }))
          : [],
        attachments: Array.isArray(bid.attachments) ? bid.attachments.map(mapAttachment) : [],
        links: Array.isArray(bid.links) ? ((bid.links.flat?.() || bid.links).map((l: any, i: number) => ({ id: String(l.id || i), title: l.title, url: l.url }))) : [],
        totalAmount: bid.totalAmount ?? bid.total_amount ?? undefined,
        status: bid.status ?? undefined,
      };
    }

    // Include top-level attachments if any
    if (Array.isArray(projectNode.attachments)) {
      mappedProject.attachments = projectNode.attachments.map(mapAttachment);
    }

    return mappedProject as Project;
  }

  static async createProject(projectData: Partial<Project>): Promise<Project> {
    const response = await apiClient.post<Project>('/projects', projectData);
    return response.data;
  }

  static async updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
    const response = await apiClient.patch<Project>(`/projects/${id}`, projectData);
    return response.data;
  }

  static async deleteProject(id: string): Promise<void> {
    await apiClient.delete<null>(`/projects/${id}`);
  }

  /**
   * Tasks
   */
  static async getTasks(filters?: TaskFilters): Promise<PaginatedResponse<Task>> {
    const response = await apiClient.get<PaginatedResponse<Task>>('/admin/tasks', filters);
    return response.data;
  }

  static async getTask(id: string): Promise<Task> {
    const response = await apiClient.get<Task>(`/admin/tasks/${id}`);
    const payload: any = response.data;
    const dataNode = payload?.data ?? payload;
    return (dataNode && typeof dataNode === 'object' && 'task' in dataNode) ? dataNode.task : dataNode;
  }

  static async getProjectTasks(projectId: string, filters?: Omit<TaskFilters, 'project_id'>): Promise<PaginatedResponse<Task>> {
    const response = await apiClient.get<PaginatedResponse<Task>>(`/admin/projects/${projectId}/tasks`, filters);
    return response.data;
  }

  static async createTask(projectId: string, taskData: CreateTaskData): Promise<Task> {
    const formData = new FormData();
    Object.entries(taskData).forEach(([key, value]) => {
      if (key !== 'attachments' && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    if (taskData.attachments?.length) {
      taskData.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }
    const response = await apiClient.post<Task>(`/projects/${projectId}/tasks`, formData);
    return response.data;
  }

  static async updateTask(id: string, taskData: UpdateTaskData): Promise<Task> {
    const response = await apiClient.patch<Task>(`/admin/tasks/${id}`, taskData);
    return response.data;
  }

  static async deleteTask(id: string): Promise<void> {
    await apiClient.delete<null>(`/admin/tasks/${id}`);
  }

  /**
   * Task Bidding
   */
  static async openBidding(taskId: string): Promise<Task> {
    const response = await apiClient.post<Task>(`/admin/tasks/${taskId}/open-bidding`);
    return response.data;
  }

  static async closeBidding(taskId: string): Promise<Task> {
    const response = await apiClient.post<Task>(`/admin/tasks/${taskId}/close-bidding`);
    return response.data;
  }

  /**
   * Assignments
   */
  static async getTaskAssignments(taskId: string): Promise<Assignment[]> {
    const response = await apiClient.get<Assignment[]>(`/admin/tasks/${taskId}/assignments`);
    return response.data;
  }

  static async createAssignment(taskId: string, assignmentData: CreateAssignmentData): Promise<Assignment> {
    const response = await apiClient.post<Assignment>(`/admin/tasks/${taskId}/assignments`, assignmentData);
    return response.data;
  }

  static async acceptAssignment(data: AcceptAssignmentData): Promise<Assignment> {
    const response = await apiClient.post<Assignment>(`/admin/assignments/${data.assignment_id}/accept`, {
      agreement_notes: data.agreement_notes,
      rejection_reason: data.rejection_reason,
    });
    return ProjectService.unwrap<Assignment>(response);
  }

  static async rejectAssignment(assignmentId: string, reason?: string, agreementNotes?: string): Promise<Assignment> {
    const response = await apiClient.post<Assignment>(`/admin/assignments/${assignmentId}/reject`, {
      reason,
      agreement_notes: agreementNotes,
    });
    return ProjectService.unwrap<Assignment>(response);
  }

  static async updateAssignmentStatus(assignmentId: string, status: AssignmentStatus, agreementNotes?: string, rejectionReason?: string): Promise<Assignment> {
    const response = await apiClient.patch<Assignment>(`/admin/assignments/${assignmentId}/status`, {
      status,
      agreement_notes: agreementNotes,
      rejection_reason: rejectionReason,
    });
    return ProjectService.unwrap<Assignment>(response);
  }

  /**
   * Bids
   */
  static async getTaskBids(taskId: string): Promise<Bid[]> {
    const response = await apiClient.get<Bid[]>(`/tasks/${taskId}/bids`);
    return response.data;
  }

  static async getBid(id: string): Promise<Bid> {
    const response = await apiClient.get<Bid>(`/bids/${id}`);
    return response.data;
  }

  static async createBid(taskId: string, bidData: Partial<Bid>): Promise<Bid> {
    const response = await apiClient.post<Bid>(`/tasks/${taskId}/bids`, bidData);
    return response.data;
  }

  static async updateBid(id: string, bidData: Partial<Bid>): Promise<Bid> {
    const response = await apiClient.put<Bid>(`/educator/bids/${id}`, bidData);
    return response.data;
  }

  static async deleteBid(id: string): Promise<void> {
    await apiClient.delete<null>(`educator/bids/${id}`);
  }

  static async approveBid(id: string, message?: string): Promise<Bid> {
    const response = await apiClient.post<Bid>(`educator/bids/${id}/approve`, { message });
    return response.data;
  }

  static async rejectBid(id: string, reason: string): Promise<Bid> {
    const response = await apiClient.post<Bid>(`educator/bids/${id}/reject`, { reason });
    return response.data;
  }

  /**
   * Task Attachments & Deliverables
   */
  static async uploadTaskAttachment(taskId: string, file: File, title?: string): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    const response = await apiClient.upload<Attachment>(`/tasks/${taskId}/attachments`, formData);
    return response.data;
  }

  static async deleteTaskAttachment(taskId: string, attachmentId: string): Promise<void> {
    await apiClient.delete<null>(`/tasks/${taskId}/attachments/${attachmentId}`);
  }

  static async uploadTaskDeliverable(taskId: string, file: File, title?: string): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    const response = await apiClient.upload<Attachment>(`/tasks/${taskId}/deliverables`, formData);
    return response.data;
  }

  /**
   * Task Notes
   */
  static async addTaskNote(taskId: string, content: string): Promise<void> {
    await apiClient.post<null>(`/tasks/${taskId}/notes`, { content });
  }

  /**
   * Opportunities (Public Tasks for Educators)
   */
  static async getOpportunities(filters?: TaskFilters & { paginated?: boolean | string; status?: string; search?: string; sort_by?: string }): Promise<PaginatedResponse<any>> {
    const body = {
      paginated: (filters as any)?.paginated ?? true,
      per_page: (filters as any)?.per_page ?? 5,
      status: (filters as any)?.status ?? '',
      search: (filters as any)?.search ?? '',
      sort_by: (filters as any)?.sort_by ?? 'created_at',
      ...filters,
    } as any;

    // Some backends require GET with body; our client supports this with method override
    const response = await apiClient.get<PaginatedResponse<any>>('/educator/opportunities', body, { sendParamsInBody: true });
    return response.data;
  }

  /**
   * My Projects & Tasks (for Educators)
   */
  static async getMyProjects(filters?: ProjectFilters): Promise<PaginatedResponse<Project>> {
    const response = await apiClient.get<PaginatedResponse<Project>>('/educator/my-projects', filters);
    return response.data;
  }

  static async getMyTasks(filters?: TaskFilters): Promise<PaginatedResponse<Task>> {
    const response = await apiClient.get<PaginatedResponse<Task>>('/educator/my-tasks', filters);
    return response.data;
  }
}
