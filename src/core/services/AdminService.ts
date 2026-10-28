import { AdminService as FeatureAdminService } from '../../features/admin/services/AdminService';
import { ProjectService } from '../../features/projects/services/ProjectService';
import { SystemService } from '../../shared/services/SystemService';

// Minimal adapter exposing the surface used by src/core/hooks/useAdminQueries.ts
export const adminService = {
  // Dashboard and system
  getDashboard: () => FeatureAdminService.getDashboardStats(),
  getDashboardStats: (period?: '7d' | '30d' | '90d') => FeatureAdminService.getDashboardStats(),
  getActivityFeed: (params?: any) => FeatureAdminService.getActivityFeed(params),
  getPendingApprovals: (type?: string) => FeatureAdminService.getEducatorApplications({ status: 'pending' as any }),
  getSystemHealth: () => SystemService.healthCheck(),

  // Educators
  getEducators: (params?: any) => FeatureAdminService.getEducators(params),
  getEducator: async (id: string) => {
    const r = await FeatureAdminService.getEducator(id);
    return { status: true, message: null, data: r } as any;
  },
  updateEducatorStatus: async (id: string, status: any, reason?: string) => {
    const r = await FeatureAdminService.updateEducatorStatus(id, status, reason);
    return { status: true, message: null, data: r } as any;
  },
  // Legacy application approval (kept for compatibility)
  approveEducator: (id: string, message?: string) => FeatureAdminService.approveEducatorApplication(id, message),
  rejectEducator: (id: string, reason: string) => FeatureAdminService.rejectEducatorApplication(id, reason),
  // New explicit educator account/document endpoints
  acceptEducatorAccount: (id: string) => FeatureAdminService.acceptEducatorAccount(id),
  rejectEducatorAccount: (id: string, rejection_reason: string) => FeatureAdminService.rejectEducatorAccount(id, rejection_reason),
  approveEducatorIdentity: (id: string) => FeatureAdminService.approveEducatorIdentity(id),
  rejectEducatorIdentity: (id: string, rejection_reason: string) => FeatureAdminService.rejectEducatorIdentity(id, rejection_reason),
  // Suspension controls
  suspendEducator: (id: string, suspension_reason: string) => FeatureAdminService.suspendEducator(id, suspension_reason),
  unsuspendEducator: (id: string) => FeatureAdminService.unsuspendEducator(id),
  approveAcademicMajor: (educatorId: string, majorId: string) => FeatureAdminService.approveAcademicMajor(educatorId, majorId),
  rejectAcademicMajor: (educatorId: string, majorId: string, rejection_reason: string) => FeatureAdminService.rejectAcademicMajor(educatorId, majorId, rejection_reason),
  deleteEducator: (id: string) => FeatureAdminService.deleteEducator(id),
  inviteEducator: (email: string) => FeatureAdminService.inviteEducator(email),
  completeRegistration: (data: { token: string; name: string; phone: string; password: string; password_confirmation: string }) => FeatureAdminService.completeRegistration(data),

  // Users
  getUsers: (params?: any) => FeatureAdminService.getUsers(params),
  getUser: (id: string) => FeatureAdminService.getUser(id),
  createUser: (data: any) => FeatureAdminService.createUser(data),
  updateUserStatus: (id: string, status: any, reason?: string) => FeatureAdminService.updateUserStatus(id, status, reason),
  updateUser: (id: string, data: any) => FeatureAdminService.updateUser(id, data),
  deleteUser: (id: string) => FeatureAdminService.deleteUser(id),

  // Educational Requests
  getEducationalRequests: (params?: any) => FeatureAdminService.getEducationalRequests(params),
  getEducationalRequest: (id: string) => FeatureAdminService.getEducationalRequest(id),
  updateEducationalRequest: (id: string, data: any) => FeatureAdminService.updateEducationalRequest(id, data),
  changeEducationalRequestStatus: (id: string, type: 'request' | 'payment' | 'fulfillment', status: string, reason?: string) => FeatureAdminService.changeEducationalRequestStatus(id, type, status, reason),

  // Projects (admin endpoints)
  getProjects: (params?: any) => FeatureAdminService.getProjects(params),
  getProject: (id: string) => FeatureAdminService.getProject(id),
  createProject: (projectData: any) => FeatureAdminService.createProject(projectData),
  updateProject: (id: string, data: any) => FeatureAdminService.updateProject(id, data),
  deleteProject: (id: string, _reason?: string) => FeatureAdminService.deleteProject(id),
  publishProject: (id: string) => FeatureAdminService.publishProject(id),
  unpublishProject: ({ id, reason }: { id: string; reason?: string }) => FeatureAdminService.unpublishProject(id),
  changeProjectStatus: (projectId: string, status: string, reason?: string) => FeatureAdminService.changeProjectStatus(projectId, status, reason),

  // Single Task detail
  getTask: (id: string) => FeatureAdminService.getTask ? FeatureAdminService.getTask(id) : ProjectService.getTask(id),
  createTaskNote: (taskId: string, content: string) => FeatureAdminService.createTaskNote
    ? FeatureAdminService.createTaskNote(taskId, content)
    : Promise.resolve({ status: 'queued' }),

  // Task bidding toggles (admin endpoints preferred)
  openTaskBidding: (taskId: string) => FeatureAdminService.openTaskBidding ? FeatureAdminService.openTaskBidding(taskId) : ProjectService.openBidding(taskId),
  closeTaskBidding: (taskId: string) => FeatureAdminService.closeTaskBidding ? FeatureAdminService.closeTaskBidding(taskId) : ProjectService.closeBidding(taskId),

  // Tasks (mapped to admin endpoints where available)
  createTask: (projectId: string, taskData: any) => FeatureAdminService.createTask(projectId, taskData),
  updateTask: (projectId: string, taskId: string, taskData: any) => FeatureAdminService.updateTask ? FeatureAdminService.updateTask(taskId, taskData) : ProjectService.updateTask(taskId, taskData),
  deleteTask: (projectId: string, taskId: string, _reason?: string) => ProjectService.deleteTask(taskId),
  changeTaskStatus: (taskId: string, status: string, _reason?: string) => FeatureAdminService.changeTaskStatus ? FeatureAdminService.changeTaskStatus(taskId, status, _reason) : ProjectService.updateTask(taskId, { status } as any),
  assignTaskEducators: (taskId: string, payload: { educators: string[]; assigned_type: any; amount?: number; bid_id?: string | null; agreement_notes?: string | null; }) =>
    FeatureAdminService.assignTaskEducators ? FeatureAdminService.assignTaskEducators(taskId, payload) : ProjectService.createAssignment(taskId, { educator_id: payload.educators[0], type: (payload.assigned_type || 'DIRECT').toString().toUpperCase() as any, amount: payload.amount, agreement_notes: payload.agreement_notes || undefined }),
  // Must hit the cancel endpoint. It used to delegate to
  // ProjectService.rejectAssignment, which posted to /admin/assignments/{id}/reject
  // and turned every "cancel" into a rejection the specialist never made.
  cancelAssignment: (assignmentId: string, reason?: string) => FeatureAdminService.cancelAssignment
    ? FeatureAdminService.cancelAssignment(assignmentId, reason)
    : Promise.resolve({ status: 'queued' }),

  // Sub-tasks and attachments
  createSubTask: (taskId: string, title: string) => FeatureAdminService.createSubTask ? FeatureAdminService.createSubTask(taskId, title) : Promise.resolve({ subTask: { id: `tmp-${Date.now()}`, title } }),
  updateSubTask: (subTaskId: string, title: string) => FeatureAdminService.updateSubTask ? FeatureAdminService.updateSubTask(subTaskId, title) : Promise.resolve({ subTask: { id: subTaskId, title } }),
  deleteSubTask: (subTaskId: string) => FeatureAdminService.deleteSubTask ? FeatureAdminService.deleteSubTask(subTaskId) : Promise.resolve({ success: true }),
  uploadSubTaskAttachment: (taskId: string, subTaskId: string, file: File, title?: string) => FeatureAdminService.uploadSubTaskAttachment ? FeatureAdminService.uploadSubTaskAttachment(taskId, subTaskId, file, title) : ProjectService.uploadTaskAttachment(taskId, file, title),
  toggleSubTaskComplete: (taskId: string, subTaskId: string, is_complete: boolean) => FeatureAdminService.toggleSubTaskComplete ? FeatureAdminService.toggleSubTaskComplete(taskId, subTaskId, is_complete) : Promise.resolve({ subTask: { id: subTaskId, is_complete } }),

  // Project Attachments
  getProjectAttachments: (projectId: string) => FeatureAdminService.getProjectAttachments(projectId),
  // Deliverables uploaded by specialists from educator/taskDetail. They live in
  // task_files, so the project attachments endpoint above never returns them.
  getProjectDeliverables: (projectId: string) => FeatureAdminService.getProjectDeliverables(projectId),
  createProjectAttachment: (projectId: string, payload: { title: string; description?: string | null; attachment: File; }) => FeatureAdminService.createProjectAttachment(projectId, payload),
  updateProjectAttachment: (projectId: string, attachmentId: string, payload: { title?: string; description?: string | null; attachment?: File; }) => FeatureAdminService.updateProjectAttachment(projectId, attachmentId, payload),
  deleteProjectAttachment: (projectId: string, attachmentId: string) => FeatureAdminService.deleteProjectAttachment(projectId, attachmentId),

  // Bids (admin endpoints)
  getBids: (params?: any) => Promise.resolve({ bids: [] }),
  getBid: async (id: string) => FeatureAdminService.getBid(id),
  approveBid: (id: string, message?: string) => ProjectService.approveBid(id, message),
  rejectBid: (id: string, reason: string) => ProjectService.rejectBid(id, reason),

  // Bid tasks (by bidId + taskId helpers)
  getBidTasks: async (bidId: string) => {
    const resp: any = await FeatureAdminService.getBid(bidId);
    const bidData = (resp && (resp as any).bid) ? (resp as any).bid : resp;
    return (bidData?.bidTasks || []).map((bt: any) => ({
      id: String(bt.id),
      taskId: String(bt.taskId || bt.task?.id),
      amount: Number(bt.amount || 0),
      status: String(bt.status || 'PENDING').toUpperCase(),
      task: bt.task || null
    }));
  },
  approveBidTask: async (bidId: string, taskId: string, feedback?: string) => {
    const resp: any = await FeatureAdminService.getBid(bidId);
    const bidData = (resp && (resp as any).bid) ? (resp as any).bid : resp;
    const bidTask = (bidData?.bidTasks || []).find((bt: any) => String(bt.taskId || bt.task?.id) === String(taskId));
    if (!bidTask?.id) throw new Error('Bid task not found');
    return FeatureAdminService.acceptBidTask(String(bidTask.id), feedback);
  },
  rejectBidTask: async (bidId: string, taskId: string, reason: string) => {
    const resp: any = await FeatureAdminService.getBid(bidId);
    const bidData = (resp && (resp as any).bid) ? (resp as any).bid : resp;
    const bidTask = (bidData?.bidTasks || []).find((bt: any) => String(bt.taskId || bt.task?.id) === String(taskId));
    if (!bidTask?.id) throw new Error('Bid task not found');
    return FeatureAdminService.rejectBidTask(String(bidTask.id), reason);
  },
  bulkApproveBidTasks: async (bidId: string, taskIds: string[], feedback?: string) => {
    const resp: any = await FeatureAdminService.getBid(bidId);
    const bidData = (resp && (resp as any).bid) ? (resp as any).bid : resp;
    const idMap = new Map<string, string>();
    (bidData?.bidTasks || []).forEach((bt: any) => idMap.set(String(bt.taskId || bt.task?.id), String(bt.id)));
    const promises = taskIds.map(tid => {
      const bidTaskId = idMap.get(String(tid));
      if (!bidTaskId) return Promise.resolve(null);
      return FeatureAdminService.acceptBidTask(bidTaskId, feedback);
    });
    return Promise.all(promises);
  },
  bulkRejectBidTasks: async (bidId: string, taskIds: string[], reason: string) => {
    const resp: any = await FeatureAdminService.getBid(bidId);
    const bidData = (resp && (resp as any).bid) ? (resp as any).bid : resp;
    const idMap = new Map<string, string>();
    (bidData?.bidTasks || []).forEach((bt: any) => idMap.set(String(bt.taskId || bt.task?.id), String(bt.id)));
    const promises = taskIds.map(tid => {
      const bidTaskId = idMap.get(String(tid));
      if (!bidTaskId) return Promise.resolve(null);
      return FeatureAdminService.rejectBidTask(bidTaskId, reason);
    });
    return Promise.all(promises);
  },

  // Bid-task operations by bidTaskId
  approveBidTaskById: (bidTaskId: string, approval_message?: string) => FeatureAdminService.acceptBidTask(bidTaskId, approval_message),
  rejectBidTaskById: (bidTaskId: string, rejection_reason?: string) => FeatureAdminService.rejectBidTask(bidTaskId, rejection_reason),
  assignBidTaskById: (bidTaskId: string, educator_id: string, agreement_notes?: string) => FeatureAdminService.assignBidTask(bidTaskId, educator_id, agreement_notes),

  // Support
  getSupportTickets: (params?: any) => FeatureAdminService.getSupportTickets(params),
  getSupportTicket: (id: string) => FeatureAdminService.getSupportTicket(id),
  assignSupportTicket: (id: string, assigneeId: string) => FeatureAdminService.assignSupportTicket(id, assigneeId as any),

  // Managed items
  getManagedItems: (type: 'skills' | 'services' | 'specializations') => FeatureAdminService.getManagedItems(type),
  createManagedItem: (type: 'skills' | 'services' | 'specializations', data: any) => FeatureAdminService.createManagedItem(type, data),
  updateManagedItem: (type: 'skills' | 'services' | 'specializations', id: string, data: any) => FeatureAdminService.updateManagedItem(type, id, data),
  deleteManagedItem: (type: 'skills' | 'services' | 'specializations', id: string) => FeatureAdminService.deleteManagedItem(type, id),

  // Settings / Bulk ops (fallback stubs)
  executeBulkOperation: (operation: any) => Promise.resolve({ operation, status: 'queued' }),
  getSettings: () => Promise.resolve({ settings: {} }),
  updateSettings: (settings: any) => Promise.resolve({ settings }),
};
