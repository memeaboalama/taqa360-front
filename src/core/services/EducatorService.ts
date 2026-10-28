import { EducatorService as BaseEducatorService, EducatorDashboardData } from '../../features/educators/services/EducatorService';
import type { 
  EducatorProfile,
  AcademicMajor,
  WorkExperience,
  Certification,
  Skill as EducatorSkill,
  Language as EducatorLanguage,
  PaymentInfo,
  SocialLink,
  WithdrawalRequest,
  Bid,
  AppNotification
} from '../../shared/types';

// Align type names expected by core hooks
export type { EducatorDashboardData, EducatorProfile, AcademicMajor, WorkExperience, Certification, EducatorSkill, EducatorLanguage, PaymentInfo };
export type SocialLinks = SocialLink[];

// Adapter object to match the API expected by core/hooks/useEducatorQueries.ts
export const educatorService = {
  getProfile: async () => {
    const r = await BaseEducatorService.getProfile();
    // BaseEducatorService.getProfile returns a mapped Educator object (not ApiResponse).
    // Wrap it into ApiResponse shape so useBaseQuery.select (which returns data.data) works correctly.
    return { status: true, message: null, data: r } as any;
  },
  updateProfile: async (profileData: Partial<any>) => {
    const r = await BaseEducatorService.updateProfile(profileData);
    return { status: true, message: null, data: r } as any;
  },
  uploadAvatar: (file: File) => BaseEducatorService.uploadAvatar(file),
  updateAvailabilityStatus: (status: 'available' | 'busy' | 'unavailable') => BaseEducatorService.updateAvailabilityStatus(status),

  getDashboard: async () => {
    const r = await BaseEducatorService.getDashboard();
    return { status: true, message: null, data: (r as any)?.data ?? r } as any;
  },

  getAcademicMajors: async () => {
    const r = await BaseEducatorService.getAcademicMajors();
    return { status: true, message: null, data: r } as any;
  },
  createAcademicMajor: async (data: Omit<AcademicMajor, 'id' | 'verification_status'>) => {
    const r = await BaseEducatorService.createAcademicMajor(data as any);
    return { status: true, message: null, data: r } as any;
  },
  updateAcademicMajor: async (id: string, data: Partial<AcademicMajor>) => {
    const r = await BaseEducatorService.updateAcademicMajor(id, data);
    return { status: true, message: null, data: r } as any;
  },
  deleteAcademicMajor: async (id: string) => {
    await BaseEducatorService.deleteAcademicMajor(id);
    return { status: true, message: null, data: null } as any;
  },

  getWorkExperience: async () => {
    const r = await BaseEducatorService.getWorkExperience();
    return { ...r, data: (r as any).data.items ?? (r as any).data } as any;
  },
  createWorkExperience: async (data: Omit<WorkExperience, 'id' | 'verification_status'>) => {
    const r = await BaseEducatorService.createWorkExperience(data as any);
    return { ...r, data: (r as any).data.items ?? (r as any).data } as any;
  },
  updateWorkExperience: async (id: string, data: Partial<WorkExperience>) => {
    const r = await BaseEducatorService.updateWorkExperience(id, data);
    return { ...r, data: (r as any).data.items ?? (r as any).data } as any;
  },
  deleteWorkExperience: async (id: string) => {
    const r = await BaseEducatorService.deleteWorkExperience(id);
    return { ...r, data: (r as any).data.items ?? (r as any).data } as any;
  },

  getCertifications: async () => {
    const r = await BaseEducatorService.getCertifications();
    return { ...r, data: (r as any).data.items ?? (r as any).data } as any;
  },
  createCertification: async (data: Omit<Certification, 'id' | 'verification_status'>) => {
    const r = await BaseEducatorService.createCertification(data as any);
    return { ...r, data: (r as any).data.items ?? (r as any).data } as any;
  },
  updateCertification: async (id: string, data: Partial<Certification>) => {
    const r = await BaseEducatorService.updateCertification(id, data);
    return { ...r, data: (r as any).data.items ?? (r as any).data } as any;
  },
  deleteCertification: async (id: string) => {
    const r = await BaseEducatorService.deleteCertification(id);
    return { ...r, data: (r as any).data.items ?? (r as any).data } as any;
  },

  getSkills: async () => {
    const r = await BaseEducatorService.getSkills();
    return { ...r, data: (r as any).data.items ?? (r as any).data } as any;
  },
  createSkill: async (data: any) => {
    const r = await BaseEducatorService.createSkill(data as any);
    return { status: true, message: null, data: (r as any)?.data ?? r } as any;
  },
  updateSkill: async (id: string, data: any) => {
    const r = await BaseEducatorService.updateSkill(id, data as any);
    return { status: true, message: null, data: (r as any)?.data ?? r } as any;
  },
  deleteSkill: async (id: string) => {
    const r = await BaseEducatorService.deleteSkill(id);
    return { status: true, message: null, data: (r as any)?.data ?? r } as any;
  },
  updateSkills: async (skills: EducatorSkill[]) => {
    const r = await BaseEducatorService.updateSkills(skills);
    return { ...r, data: (r as any).data.items ?? (r as any).data } as any;
  },
  getLanguages: async () => {
    const r = await BaseEducatorService.getLanguages();
    return { ...r, data: (r as any).data.items ?? (r as any).data } as any;
  },
  // New language endpoints
  createLanguage: async (data: { language_id: string; level: string; is_primary: boolean }) => {
    const r = await BaseEducatorService.createLanguage(data);
    return { status: true, message: null, data: (r as any)?.data ?? r } as any;
  },
  updateLanguage: async (id: string, data: { language_id: string; level: string; is_primary: boolean }) => {
    const r = await BaseEducatorService.updateLanguage(id, data);
    return { status: true, message: null, data: (r as any)?.data ?? r } as any;
  },
  deleteLanguage: async (id: string) => {
    const r = await BaseEducatorService.deleteLanguage(id);
    return { status: true, message: null, data: (r as any)?.data ?? r } as any;
  },
  getSupportedLanguages: async () => {
    const r = await BaseEducatorService.getSupportedLanguages();
    return { status: true, message: null, data: r } as any;
  },
  updateLanguages: async (languages: EducatorLanguage[]) => {
    const r = await BaseEducatorService.updateLanguages(languages);
    return { ...r, data: (r as any).data.items ?? (r as any).data } as any;
  },
  getServices: async () => {
    const r = await BaseEducatorService.getServices();
    return { ...r, data: (r as any).data.items ?? (r as any).data } as any;
  },
  createService: async (data: any) => {
    const r = await BaseEducatorService.createService(data as any);
    return { status: true, message: null, data: (r as any)?.data ?? r } as any;
  },
  updateService: async (id: string, data: any) => {
    const r = await BaseEducatorService.updateService(id, data as any);
    return { status: true, message: null, data: (r as any)?.data ?? r } as any;
  },
  deleteService: async (id: string) => {
    const r = await BaseEducatorService.deleteService(id);
    return { status: true, message: null, data: (r as any)?.data ?? r } as any;
  },
  updateServices: async (services: any[]) => {
    const r = await BaseEducatorService.updateServices(services as any);
    return { ...r, data: (r as any).data.items ?? (r as any).data } as any;
  },

  getSocialLinks: async () => {
    const r = await BaseEducatorService.getSocialLinks();
    return { ...r, data: (r as any).data.items ?? (r as any).data } as any;
  },
  updateSocialLinks: async (links: SocialLinks) => {
    const r = await BaseEducatorService.updateSocialLinks(links as any);
    return { ...r, data: (r as any).data.items ?? (r as any).data } as any;
  },
  getPaymentInfo: async () => {
    const r = await BaseEducatorService.getPaymentInfo();
    return { status: true, message: null, data: (r as any)?.data ?? r } as any;
  },
  updatePaymentInfo: async (info: PaymentInfo) => {
    const r = await BaseEducatorService.updatePaymentInfo(info);
    return { status: true, message: null, data: (r as any)?.data ?? r } as any;
  },
  deletePaymentInfo: async () => {
    const r = await BaseEducatorService.deletePaymentInfo();
    return { status: true, message: null, data: (r as any)?.data ?? r } as any;
  },

  getMyProjects: (params?: any) => BaseEducatorService.getMyProjects(params),
  getMyTasks: (params?: any) => BaseEducatorService.getMyTasks(params),

  // New educator endpoints
  getAssignments: async (params?: any) => {
    const r: any = await BaseEducatorService.getAssignments(params);
    // BaseEducatorService.getAssignments returns the raw axios response, so the
    // API envelope sits at r.data and the payload at r.data.data. Returning
    // r.data here nested the envelope inside `data` a second time, so the hook
    // read `data.assignments` (always undefined) and the screen was always
    // empty regardless of what the API returned.
    const envelope = r?.data ?? r;
    return {
      status: true,
      message: null,
      data: envelope?.data ?? envelope,
      pagination: envelope?.pagination ?? envelope?.data?.pagination,
    } as any;
  },
  getTasks: async (filters?: any) => {
    const r = await BaseEducatorService.getTasks(filters);
    return { status: true, message: null, data: (r as any)?.data ?? r } as any;
  },
  getTaskDetail: async (taskId: string) => {
    const r = await BaseEducatorService.getTaskDetail(taskId);
    return { status: true, message: null, data: (r as any)?.data ?? r } as any;
  },

  // Task operations
  createSubTask: (taskId: string, title: string) => BaseEducatorService.createSubTask(taskId, title),
  toggleSubTask: (taskId: string, subTaskId: string) => BaseEducatorService.toggleSubTask(taskId, subTaskId),
  uploadTaskAttachment: (taskId: string, file: File, title?: string) => BaseEducatorService.uploadTaskAttachment(taskId, file, title),
  uploadSubTaskAttachment: (taskId: string, subTaskId: string, file: File, title?: string) => BaseEducatorService.uploadSubTaskAttachment(taskId, subTaskId, file, title),
  uploadDeliverable: (taskId: string, file: File, title?: string) => BaseEducatorService.uploadDeliverable(taskId, file, title),
  deleteDeliverable: (taskId: string, deliverableId: string) => BaseEducatorService.deleteDeliverable(taskId, deliverableId),
  updateSubTask: (taskId: string, subTaskId: string, data: { title?: string }) => BaseEducatorService.updateSubTask(taskId, subTaskId, data),
  deleteSubTask: (taskId: string, subTaskId: string) => BaseEducatorService.deleteSubTask(taskId, subTaskId),
  updateTaskStatus: (taskId: string, status: 'PENDING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED') => BaseEducatorService.updateTaskStatus(taskId, status),
  completeTask: (taskId: string) => BaseEducatorService.completeTask(taskId),

  getEarnings: (params?: any) => BaseEducatorService.getEarnings(params),
  getTransactions: (params?: any) => BaseEducatorService.getTransactions(params),
  requestWithdrawal: (amount: number, notes?: string) => BaseEducatorService.requestWithdrawal(amount, notes),
  getWithdrawalRequests: (params?: any) => BaseEducatorService.getWithdrawalRequests(params),

  getBids: (params?: any) => BaseEducatorService.getBids(params),
  getBid: (id: string) => BaseEducatorService.getBid(id),
  createBid: (bidData: any) => BaseEducatorService.createBid(bidData),
  updateBid: (id: string, bidData: any) => BaseEducatorService.updateBid(id, bidData),
  deleteBid: (id: string) => BaseEducatorService.deleteBid(id),
  getBidTasks: (bidId: string) => BaseEducatorService.getBidTasks(bidId),
  updateBidTask: (bidId: string, taskId: string, data: any) => BaseEducatorService.updateBidTask(bidId, taskId, data),

  getSupportTickets: (params?: any) => BaseEducatorService.getSupportTickets(params),
  createSupportTicket: (ticketData: any) => BaseEducatorService.createSupportTicket(ticketData),
  getInboxMessages: (params?: any) => BaseEducatorService.getInboxMessages(params),
  markMessageAsRead: (id: string) => BaseEducatorService.markMessageAsRead(id),
  getNotifications: (params?: any) => BaseEducatorService.getNotifications(params),
  markNotificationAsRead: (id: string) => BaseEducatorService.markNotificationAsRead(id),
  markAllNotificationsAsRead: () => BaseEducatorService.markAllNotificationsAsRead(),

  // Assignments (invitations)
  acceptAssignment: async (assignmentId: string, note?: string) => {
    const r = await BaseEducatorService.acceptAssignment(assignmentId, note);
    return { status: true, message: null, data: (r as any)?.data ?? r } as any;
  },
  rejectAssignment: async (assignmentId: string, reason?: string, note?: string) => {
    const r = await BaseEducatorService.rejectAssignment(assignmentId, reason, note);
    return { status: true, message: null, data: (r as any)?.data ?? r } as any;
  },
};
