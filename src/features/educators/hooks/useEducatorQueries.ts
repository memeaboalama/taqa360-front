import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';
import {
  EducatorService,
  EducatorDashboardData,
  EducatorFilters
} from '../services/EducatorService';
import {
  Educator,
  AcademicMajor,
  WorkExperience,
  Certification,
  Service,
  Skill,
  Language,
  PaymentInfo,
  SocialLink,
  SupportTicket,
  WithdrawalRequest,
  Transaction,
  InboxMessage,
  AppNotification,
  PaginatedResponse // Import PaginatedResponse from shared types
} from '../../../shared/types';

// تعريف مفاتيح الاستعلام (Query Keys) لـ React Query
export const educatorQueryKeys = {
  all: ["educator"] as const,
  educators: (filters: any = {}) => [...educatorQueryKeys.all, "educators", filters] as const,
  educator: (id: string) => [...educatorQueryKeys.all, "educators", id] as const,
  myProfile: () => [...educatorQueryKeys.all, "profile"] as const,
  academicMajors: () => [...educatorQueryKeys.all, "profile", "academicMajors"] as const,
  workExperience: () => [...educatorQueryKeys.all, "profile", "workExperience"] as const,
  certifications: () => [...educatorQueryKeys.all, "profile", "certifications"] as const,
  services: () => [...educatorQueryKeys.all, "profile", "services"] as const,
  skills: () => [...educatorQueryKeys.all, "profile", "skills"] as const,
  languages: () => [...educatorQueryKeys.all, "profile", "languages"] as const,
  paymentInfo: () => [...educatorQueryKeys.all, "profile", "paymentInfo"] as const,
  socialLinks: () => [...educatorQueryKeys.all, "profile", "socialLinks"] as const,
  nationalities: () => [...educatorQueryKeys.all, "lists", "nationalities"] as const,
  countries: () => [...educatorQueryKeys.all, "lists", "countries"] as const,
  countryCities: (countryId: string) => [...educatorQueryKeys.all, "lists", "cities", countryId] as const,
  dashboardStats: () => [...educatorQueryKeys.all, "dashboardStats"] as const,
  earnings: () => [...educatorQueryKeys.all, "earnings"] as const,
  transactions: (params: any = {}) => [...educatorQueryKeys.all, "transactions", params] as const,
  withdrawalRequests: () => [...educatorQueryKeys.all, "withdrawalRequests"] as const,
  supportTickets: () => [...educatorQueryKeys.all, "supportTickets"] as const,
  inboxMessages: () => [...educatorQueryKeys.all, "inboxMessages"] as const,
  notifications: () => [...educatorQueryKeys.all, "notifications"] as const,
};

// Hooks لجلب البيانات (Queries)

export const useEducators = (
  filters?: EducatorFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<Educator>, Error>, "queryKey" | "queryFn">
) => {
  return useQuery<PaginatedResponse<Educator>, Error>({
    queryKey: educatorQueryKeys.educators(filters),
    queryFn: () => EducatorService.getEducators(filters),
    ...options,
  });
};

export const useEducator = (id: string, options?: Omit<UseQueryOptions<Educator, Error>, "queryKey" | "queryFn">) => {
  return useQuery<Educator, Error>({
    queryKey: educatorQueryKeys.educator(id),
    queryFn: () => EducatorService.getEducator(id),
    enabled: !!id,
    ...options,
  });
};

export const useMyProfile = (options?: Omit<UseQueryOptions<Educator, Error>, "queryKey" | "queryFn">) => {
  return useQuery<Educator, Error>({
    queryKey: educatorQueryKeys.myProfile(),
    queryFn: EducatorService.getProfile,
    ...options,
  });
};

// Lists
export const useNationalities = (options?: Omit<UseQueryOptions<{ id: string; title: string }[], Error>, "queryKey" | "queryFn">) => {
  return useQuery<{ id: string; title: string }[], Error>({
    queryKey: educatorQueryKeys.nationalities(),
    queryFn: EducatorService.getNationalities,
    ...options,
  });
};
export const useCountries = (options?: Omit<UseQueryOptions<{ id: string; title: string }[], Error>, "queryKey" | "queryFn">) => {
  return useQuery<{ id: string; title: string }[], Error>({
    queryKey: educatorQueryKeys.countries(),
    queryFn: EducatorService.getCountries,
    ...options,
  });
};
export const useCountryCities = (countryId?: string, options?: Omit<UseQueryOptions<{ id: string; title: string }[], Error>, "queryKey" | "queryFn">) => {
  return useQuery<{ id: string; title: string }[], Error>({
    queryKey: educatorQueryKeys.countryCities(countryId || 'none'),
    queryFn: () => EducatorService.getCountryCities(countryId as string),
    enabled: Boolean(countryId),
    ...options,
  });
};

export const useEducatorAcademicMajors = (options?: Omit<UseQueryOptions<AcademicMajor[], Error>, "queryKey" | "queryFn">) => {
  return useQuery<AcademicMajor[], Error>({
    queryKey: educatorQueryKeys.academicMajors(),
    queryFn: EducatorService.getAcademicMajors,
    ...options,
  });
};

export const useOfficialAcademicMajors = (options?: Omit<UseQueryOptions<{ id: string; name: string }[], Error>, "queryKey" | "queryFn">) => {
  return useQuery<{ id: string; name: string }[], Error>({
    queryKey: [...educatorQueryKeys.all, 'official-academic-majors'],
    queryFn: EducatorService.getOfficialAcademicMajors,
    ...options,
  });
};

export const useEducatorWorkExperience = (options?: Omit<UseQueryOptions<WorkExperience[], Error>, "queryKey" | "queryFn">) => {
  return useQuery<WorkExperience[], Error>({
    queryKey: educatorQueryKeys.workExperience(),
    queryFn: EducatorService.getWorkExperience,
    ...options,
  });
};

export const useEducatorCertifications = (options?: Omit<UseQueryOptions<Certification[], Error>, "queryKey" | "queryFn">) => {
  return useQuery<Certification[], Error>({
    queryKey: educatorQueryKeys.certifications(),
    queryFn: EducatorService.getCertifications,
    ...options,
  });
};

export const useEducatorServices = (options?: Omit<UseQueryOptions<Service[], Error>, "queryKey" | "queryFn">) => {
  return useQuery<Service[], Error>({
    queryKey: educatorQueryKeys.services(),
    queryFn: EducatorService.getServices,
    ...options,
  });
};

export const useEducatorSkills = (options?: Omit<UseQueryOptions<Skill[], Error>, "queryKey" | "queryFn">) => {
  return useQuery<Skill[], Error>({
    queryKey: educatorQueryKeys.skills(),
    queryFn: EducatorService.getSkills,
    ...options,
  });
};

export const useEducatorLanguages = (options?: Omit<UseQueryOptions<Language[], Error>, "queryKey" | "queryFn">) => {
  return useQuery<Language[], Error>({
    queryKey: educatorQueryKeys.languages(),
    queryFn: EducatorService.getLanguages,
    ...options,
  });
};

export const useEducatorPaymentInfo = (options?: Omit<UseQueryOptions<PaymentInfo, Error>, "queryKey" | "queryFn">) => {
  return useQuery<PaymentInfo, Error>({
    queryKey: educatorQueryKeys.paymentInfo(),
    queryFn: EducatorService.getPaymentInfo,
    ...options,
  });
};

export const useEducatorSocialLinks = (options?: Omit<UseQueryOptions<SocialLink[], Error>, "queryKey" | "queryFn">) => {
  return useQuery<SocialLink[], Error>({
    queryKey: educatorQueryKeys.socialLinks(),
    queryFn: EducatorService.getSocialLinks,
    ...options,
  });
};

export const useEducatorDashboardStats = (options?: Omit<UseQueryOptions<EducatorDashboardData, Error>, "queryKey" | "queryFn">) => {
  return useQuery<EducatorDashboardData, Error>({
    queryKey: educatorQueryKeys.dashboardStats(),
    queryFn: EducatorService.getDashboard,
    ...options,
  });
};

export const useEducatorEarnings = (
  params?: Parameters<typeof EducatorService.getEarnings>[0],
  options?: Omit<UseQueryOptions<PaginatedResponse<Transaction>, Error>, "queryKey" | "queryFn">
) => {
  return useQuery<PaginatedResponse<Transaction>, Error>({
    queryKey: educatorQueryKeys.earnings(),
    queryFn: () => EducatorService.getEarnings(params),
    ...options,
  });
};

export const useEducatorTransactions = (
  params?: Parameters<typeof EducatorService.getTransactions>[0],
  options?: Omit<UseQueryOptions<PaginatedResponse<Transaction>, Error>, "queryKey" | "queryFn">
) => {
  return useQuery<PaginatedResponse<Transaction>, Error>({
    queryKey: educatorQueryKeys.transactions(params),
    queryFn: () => EducatorService.getTransactions(params),
    ...options,
  });
};

export const useEducatorWithdrawalRequests = (
  params?: Parameters<typeof EducatorService.getWithdrawalRequests>[0],
  options?: Omit<UseQueryOptions<PaginatedResponse<WithdrawalRequest>, Error>, "queryKey" | "queryFn">
) => {
  return useQuery<PaginatedResponse<WithdrawalRequest>, Error>({
    queryKey: educatorQueryKeys.withdrawalRequests(),
    queryFn: () => EducatorService.getWithdrawalRequests(params),
    ...options,
  });
};

export const useEducatorSupportTickets = (
  params?: Parameters<typeof EducatorService.getSupportTickets>[0],
  options?: Omit<UseQueryOptions<PaginatedResponse<SupportTicket>, Error>, "queryKey" | "queryFn">
) => {
  return useQuery<PaginatedResponse<SupportTicket>, Error>({
    queryKey: educatorQueryKeys.supportTickets(),
    queryFn: () => EducatorService.getSupportTickets(params),
    ...options,
  });
};

export const useEducatorInboxMessages = (
  params?: Parameters<typeof EducatorService.getInboxMessages>[0],
  options?: Omit<UseQueryOptions<PaginatedResponse<InboxMessage>, Error>, "queryKey" | "queryFn">
) => {
  return useQuery<PaginatedResponse<InboxMessage>, Error>({
    queryKey: educatorQueryKeys.inboxMessages(),
    queryFn: () => EducatorService.getInboxMessages(params),
    ...options,
  });
};

export const useEducatorNotifications = (
  params?: Parameters<typeof EducatorService.getNotifications>[0],
  options?: Omit<UseQueryOptions<PaginatedResponse<AppNotification>, Error>, "queryKey" | "queryFn">
) => {
  return useQuery<PaginatedResponse<AppNotification>, Error>({
    queryKey: educatorQueryKeys.notifications(),
    queryFn: () => EducatorService.getNotifications(params),
    ...options,
  });
};

// Hooks لتعديل البيانات (Mutations)

export const useUpdateEducatorProfile = (options?: UseMutationOptions<Educator, Error, Partial<Educator>>) => {
  const queryClient = useQueryClient();
  return useMutation<Educator, Error, Partial<Educator>>({
    mutationFn: EducatorService.updateProfile,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.myProfile() });
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.educator(data.id) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateBasicInfo = (options?: UseMutationOptions<Educator, Error, Parameters<typeof EducatorService.updateBasicInfo>[0]>) => {
  const queryClient = useQueryClient();
  return useMutation<Educator, Error, Parameters<typeof EducatorService.updateBasicInfo>[0]>({
    mutationFn: EducatorService.updateBasicInfo,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.myProfile() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateBiography = (options?: UseMutationOptions<Educator, Error, Parameters<typeof EducatorService.updateBiography>[0]>) => {
  const queryClient = useQueryClient();
  return useMutation<Educator, Error, Parameters<typeof EducatorService.updateBiography>[0]>({
    mutationFn: EducatorService.updateBiography,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.myProfile() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUploadEducatorAvatar = (options?: UseMutationOptions<Attachment, Error, File>) => {
  const queryClient = useQueryClient();
  return useMutation<Attachment, Error, File>({
    mutationFn: EducatorService.uploadAvatar,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.myProfile() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateEducatorAvailabilityStatus = (options?: UseMutationOptions<Educator, Error, Parameters<typeof EducatorService.updateAvailabilityStatus>[0]>) => {
  const queryClient = useQueryClient();
  return useMutation<Educator, Error, Parameters<typeof EducatorService.updateAvailabilityStatus>[0]>({
    mutationFn: EducatorService.updateAvailabilityStatus,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.myProfile() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useCreateAcademicMajor = (options?: UseMutationOptions<AcademicMajor, Error, Omit<AcademicMajor, 'id' | 'verificationStatus'>>) => {
  const queryClient = useQueryClient();
  return useMutation<AcademicMajor, Error, Omit<AcademicMajor, 'id' | 'verificationStatus'>>({
    mutationFn: EducatorService.createAcademicMajor,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.academicMajors() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateAcademicMajor = (options?: UseMutationOptions<AcademicMajor, Error, { id: string; data: Partial<AcademicMajor> }>) => {
  const queryClient = useQueryClient();
  return useMutation<AcademicMajor, Error, { id: string; data: Partial<AcademicMajor> }>({
    mutationFn: ({ id, data }) => EducatorService.updateAcademicMajor(id, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.academicMajors() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useDeleteAcademicMajor = (options?: UseMutationOptions<void, Error, string>) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: EducatorService.deleteAcademicMajor,
    onSuccess: (data, id, context) => {
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.academicMajors() });
      options?.onSuccess?.(data, id, context);
    },
    ...options,
  });
};

export const useCreateWorkExperience = (options?: UseMutationOptions<WorkExperience, Error, Omit<WorkExperience, 'id' | 'verificationStatus'>>) => {
  const queryClient = useQueryClient();
  return useMutation<WorkExperience, Error, Omit<WorkExperience, 'id' | 'verificationStatus'>>({
    mutationFn: EducatorService.createWorkExperience,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.workExperience() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateWorkExperience = (options?: UseMutationOptions<WorkExperience, Error, { id: string; data: Partial<WorkExperience> }>) => {
  const queryClient = useQueryClient();
  return useMutation<WorkExperience, Error, { id: string; data: Partial<WorkExperience> }>({
    mutationFn: ({ id, data }) => EducatorService.updateWorkExperience(id, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.workExperience() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useDeleteWorkExperience = (options?: UseMutationOptions<void, Error, string>) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: EducatorService.deleteWorkExperience,
    onSuccess: (data, id, context) => {
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.workExperience() });
      options?.onSuccess?.(data, id, context);
    },
    ...options,
  });
};

export const useCreateCertification = (options?: UseMutationOptions<Certification, Error, Omit<Certification, 'id' | 'verificationStatus'>>) => {
  const queryClient = useQueryClient();
  return useMutation<Certification, Error, Omit<Certification, 'id' | 'verificationStatus'>>({
    mutationFn: EducatorService.createCertification,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.certifications() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateCertification = (options?: UseMutationOptions<Certification, Error, { id: string; data: Partial<Certification> }>) => {
  const queryClient = useQueryClient();
  return useMutation<Certification, Error, { id: string; data: Partial<Certification> }>({
    mutationFn: ({ id, data }) => EducatorService.updateCertification(id, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.certifications() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useDeleteCertification = (options?: UseMutationOptions<void, Error, string>) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: EducatorService.deleteCertification,
    onSuccess: (data, id, context) => {
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.certifications() });
      options?.onSuccess?.(data, id, context);
    },
    ...options,
  });
};

export const useUpdateEducatorServices = (options?: UseMutationOptions<Service[], Error, Service[]>) => {
  const queryClient = useQueryClient();
  return useMutation<Service[], Error, Service[]>({
    mutationFn: EducatorService.updateServices,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.services() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateEducatorSkills = (options?: UseMutationOptions<Skill[], Error, Skill[]>) => {
  const queryClient = useQueryClient();
  return useMutation<Skill[], Error, Skill[]>({
    mutationFn: EducatorService.updateSkills,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.skills() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateEducatorLanguages = (options?: UseMutationOptions<Language[], Error, Language[]>) => {
  const queryClient = useQueryClient();
  return useMutation<Language[], Error, Language[]>({
    mutationFn: EducatorService.updateLanguages,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.languages() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateEducatorPaymentInfo = (options?: UseMutationOptions<PaymentInfo, Error, PaymentInfo>) => {
  const queryClient = useQueryClient();
  return useMutation<PaymentInfo, Error, PaymentInfo>({
    mutationFn: EducatorService.updatePaymentInfo,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.paymentInfo() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateEducatorSocialLinks = (options?: UseMutationOptions<SocialLink[], Error, SocialLink[]>) => {
  const queryClient = useQueryClient();
  return useMutation<SocialLink[], Error, SocialLink[]>({
    mutationFn: EducatorService.updateSocialLinks,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.socialLinks() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useRequestWithdrawal = (options?: UseMutationOptions<WithdrawalRequest, Error, { amount: number; notes?: string }>) => {
  const queryClient = useQueryClient();
  return useMutation<WithdrawalRequest, Error, { amount: number; notes?: string }>({
    mutationFn: EducatorService.requestWithdrawal,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.withdrawalRequests() });
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.earnings() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useCreateEducatorSupportTicket = (options?: UseMutationOptions<SupportTicket, Error, Parameters<typeof EducatorService.createSupportTicket>[0]>) => {
  const queryClient = useQueryClient();
  return useMutation<SupportTicket, Error, Parameters<typeof EducatorService.createSupportTicket>[0]>({
    mutationFn: EducatorService.createSupportTicket,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.supportTickets() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useMarkMessageAsRead = (options?: UseMutationOptions<void, Error, string>) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: EducatorService.markMessageAsRead,
    onSuccess: (data, id, context) => {
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.inboxMessages() });
      options?.onSuccess?.(data, id, context);
    },
    ...options,
  });
};

export const useMarkNotificationAsRead = (options?: UseMutationOptions<void, Error, string>) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: EducatorService.markNotificationAsRead,
    onSuccess: (data, id, context) => {
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.notifications() });
      options?.onSuccess?.(data, id, context);
    },
    ...options,
  });
};

export const useMarkAllNotificationsAsRead = (options?: UseMutationOptions<void, Error>) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error>({
    mutationFn: EducatorService.markAllNotificationsAsRead,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.notifications() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useSubmitEducatorApplication = (options?: UseMutationOptions<any, Error>) => {
  const queryClient = useQueryClient();
  return useMutation<any, Error>({
    mutationFn: EducatorService.submitApplication,
    onSuccess: (data, variables, context) => {
      // Invalidate relevant queries if needed, e.g., application status
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useGetEducatorApplicationStatus = (options?: Omit<UseQueryOptions<any, Error>, "queryKey" | "queryFn">) => {
  return useQuery<any, Error>({
    queryKey: [...educatorQueryKeys.all, "applicationStatus"],
    queryFn: EducatorService.getApplicationStatus,
    ...options,
  });
};

export const useUploadEducatorDocument = (options?: UseMutationOptions<Attachment, Error, Parameters<typeof EducatorService.uploadDocument>[0]>) => {
  const queryClient = useQueryClient();
  return useMutation<Attachment, Error, Parameters<typeof EducatorService.uploadDocument>[0]>({
    mutationFn: (data) => EducatorService.uploadDocument(data.type, data.file, data.metadata),
    onSuccess: (data, variables, context) => {
      // Invalidate relevant queries if needed, e.g., documents list
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useCreateBid = (options?: UseMutationOptions<Bid, Error, Parameters<typeof EducatorService.createBid>[0]>) => {
  const queryClient = useQueryClient();
  return useMutation<Bid, Error, Parameters<typeof EducatorService.createBid>[0]>({
    mutationFn: EducatorService.createBid,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.myProjects() }); // Assuming myProjects might show bids
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.myTasks() }); // Assuming myTasks might show bids
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.educators() }); // Invalidate general educators list
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateBid = (options?: UseMutationOptions<Bid, Error, { id: string; bidData: Parameters<typeof EducatorService.updateBid>[1] }>) => {
  const queryClient = useQueryClient();
  return useMutation<Bid, Error, { id: string; bidData: Parameters<typeof EducatorService.updateBid>[1] }>({
    mutationFn: ({ id, bidData }) => EducatorService.updateBid(id, bidData),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.myProjects() });
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.myTasks() });
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.educators() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useDeleteBid = (options?: UseMutationOptions<void, Error, string>) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: EducatorService.deleteBid,
    onSuccess: (data, id, context) => {
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.myProjects() });
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.myTasks() });
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.educators() });
      options?.onSuccess?.(data, id, context);
    },
    ...options,
  });
};

export const useUpdateBidTask = (options?: UseMutationOptions<any, Error, Parameters<typeof EducatorService.updateBidTask>[0]>) => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, Parameters<typeof EducatorService.updateBidTask>[0]>({
    mutationFn: ({ bidId, taskId, data }) => EducatorService.updateBidTask(bidId, taskId, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.myTasks() });
      queryClient.invalidateQueries({ queryKey: educatorQueryKeys.myProjects() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useGetEducatorProjects = (
  filters?: Parameters<typeof EducatorService.getMyProjects>[0],
  options?: Omit<UseQueryOptions<PaginatedResponse<any>, Error>, "queryKey" | "queryFn">
) => {
  return useQuery<PaginatedResponse<any>, Error>({
    queryKey: [...educatorQueryKeys.all, "myProjects", filters],
    queryFn: () => EducatorService.getMyProjects(filters),
    ...options,
  });
};

export const useGetEducatorTasks = (
  filters?: Parameters<typeof EducatorService.getMyTasks>[0],
  options?: Omit<UseQueryOptions<PaginatedResponse<any>, Error>, "queryKey" | "queryFn">
) => {
  return useQuery<PaginatedResponse<any>, Error>({
    queryKey: [...educatorQueryKeys.all, "myTasks", filters],
    queryFn: () => EducatorService.getMyTasks(filters),
    ...options,
  });
};

export const useGetEducatorBids = (
  filters?: Parameters<typeof EducatorService.getBids>[0],
  options?: Omit<UseQueryOptions<PaginatedResponse<Bid>, Error>, "queryKey" | "queryFn">
) => {
  return useQuery<PaginatedResponse<Bid>, Error>({
    queryKey: [...educatorQueryKeys.all, "bids", filters],
    queryFn: () => EducatorService.getBids(filters),
    ...options,
  });
};

export const useGetEducatorBid = (
  id: string,
  options?: Omit<UseQueryOptions<Bid, Error>, "queryKey" | "queryFn">
) => {
  return useQuery<Bid, Error>({
    queryKey: [...educatorQueryKeys.all, "bid", id],
    queryFn: () => EducatorService.getBid(id),
    enabled: !!id,
    ...options,
  });
};

export const useGetEducatorBidTasks = (
  bidId: string,
  options?: Omit<UseQueryOptions<any[], Error>, "queryKey" | "queryFn">
) => {
  return useQuery<any[], Error>({
    queryKey: [...educatorQueryKeys.all, "bidTasks", bidId],
    queryFn: () => EducatorService.getBidTasks(bidId),
    enabled: !!bidId,
    ...options,
  });
};
