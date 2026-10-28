import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';
import {
  SupportService,
  SupportTicketFilters,
  CreateSupportTicketData,
  ReplyToTicketData,
  TicketStats
} from '../services/SupportService';
import {
  PaginatedResponse,
  SupportTicket,
  SupportTicketMessage,
  SupportCategory,
  FAQItem,
  ContactInfo,
  QuickHelpArticle,
  Feedback,
} from '../types';

// تعريف مفاتيح الاستعلام (Query Keys) لـ React Query
export const supportQueryKeys = {
  all: ['support'] as const,
  myTickets: (filters: SupportTicketFilters = {}) => [...supportQueryKeys.all, 'myTickets', filters] as const,
  ticket: (id: string) => [...supportQueryKeys.all, 'ticket', id] as const,
  categories: () => [...supportQueryKeys.all, 'categories'] as const,
  faq: (category?: string) => [...supportQueryKeys.all, 'faq', category] as const,
  searchFaq: (query: string) => [...supportQueryKeys.all, 'searchFaq', query] as const,
  contactInfo: () => [...supportQueryKeys.all, 'contactInfo'] as const,
  quickHelp: (topic?: string) => [...supportQueryKeys.all, 'quickHelp', topic] as const,
  allTickets: (filters: SupportTicketFilters = {}) => [...supportQueryKeys.all, 'allTickets', filters] as const,
  ticketStats: () => [...supportQueryKeys.all, 'ticketStats'] as const,
};

// Hooks لجلب البيانات (Queries)

export const useMySupportTickets = (
  filters?: SupportTicketFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<SupportTicket>, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<PaginatedResponse<SupportTicket>, Error>({
    queryKey: supportQueryKeys.myTickets(filters),
    queryFn: () => SupportService.getMyTickets(filters),
    ...options,
  });
};

export const useSupportTicket = (
  id: string,
  options?: Omit<UseQueryOptions<SupportTicket, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<SupportTicket, Error>({
    queryKey: supportQueryKeys.ticket(id),
    queryFn: () => SupportService.getTicket(id),
    enabled: !!id,
    ...options,
  });
};

export const useSupportCategories = (
  options?: Omit<UseQueryOptions<SupportCategory[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<SupportCategory[], Error>({
    queryKey: supportQueryKeys.categories(),
    queryFn: SupportService.getSupportCategories,
    ...options,
  });
};

export const useFAQ = (
  category?: string,
  options?: Omit<UseQueryOptions<FAQItem[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<FAQItem[], Error>({
    queryKey: supportQueryKeys.faq(category),
    queryFn: () => SupportService.getFAQ(category),
    ...options,
  });
};

export const useSearchFAQ = (
  query: string,
  options?: Omit<UseQueryOptions<FAQItem[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<FAQItem[], Error>({
    queryKey: supportQueryKeys.searchFaq(query),
    queryFn: () => SupportService.searchFAQ(query),
    enabled: !!query,
    ...options,
  });
};

export const useContactInfo = (
  options?: Omit<UseQueryOptions<ContactInfo, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ContactInfo, Error>({
    queryKey: supportQueryKeys.contactInfo(),
    queryFn: SupportService.getContactInfo,
    ...options,
  });
};

export const useQuickHelp = (
  topic?: string,
  options?: Omit<UseQueryOptions<QuickHelpArticle[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<QuickHelpArticle[], Error>({
    queryKey: supportQueryKeys.quickHelp(topic),
    queryFn: () => SupportService.getQuickHelp(topic),
    ...options,
  });
};

// Hooks لتعديل البيانات (Mutations)

export const useCreateSupportTicket = (
  options?: UseMutationOptions<SupportTicket, Error, CreateSupportTicketData>
) => {
  const queryClient = useQueryClient();
  return useMutation<SupportTicket, Error, CreateSupportTicketData>({
    mutationFn: SupportService.createTicket,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: supportQueryKeys.myTickets() });
      queryClient.invalidateQueries({ queryKey: supportQueryKeys.allTickets() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useReplyToSupportTicket = (
  options?: UseMutationOptions<SupportTicketMessage, Error, { ticketId: string; replyData: ReplyToTicketData }>
) => {
  const queryClient = useQueryClient();
  return useMutation<SupportTicketMessage, Error, { ticketId: string; replyData: ReplyToTicketData }>({
    mutationFn: ({ ticketId, replyData }) => SupportService.replyToTicket(ticketId, replyData),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: supportQueryKeys.ticket(variables.ticketId) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useCloseSupportTicket = (
  options?: UseMutationOptions<SupportTicket, Error, string>
) => {
  const queryClient = useQueryClient();
  return useMutation<SupportTicket, Error, string>({
    mutationFn: SupportService.closeTicket,
    onSuccess: (data, ticketId, context) => {
      queryClient.invalidateQueries({ queryKey: supportQueryKeys.ticket(ticketId) });
      queryClient.invalidateQueries({ queryKey: supportQueryKeys.myTickets() });
      queryClient.invalidateQueries({ queryKey: supportQueryKeys.allTickets() });
      queryClient.invalidateQueries({ queryKey: supportQueryKeys.ticketStats() });
      options?.onSuccess?.(data, ticketId, context);
    },
    ...options,
  });
};

export const useReopenSupportTicket = (
  options?: UseMutationOptions<SupportTicket, Error, string>
) => {
  const queryClient = useQueryClient();
  return useMutation<SupportTicket, Error, string>({
    mutationFn: SupportService.reopenTicket,
    onSuccess: (data, ticketId, context) => {
      queryClient.invalidateQueries({ queryKey: supportQueryKeys.ticket(ticketId) });
      queryClient.invalidateQueries({ queryKey: supportQueryKeys.myTickets() });
      queryClient.invalidateQueries({ queryKey: supportQueryKeys.allTickets() });
      queryClient.invalidateQueries({ queryKey: supportQueryKeys.ticketStats() });
      options?.onSuccess?.(data, ticketId, context);
    },
    ...options,
  });
};

export const useReportIssue = (
  options?: UseMutationOptions<SupportTicket, Error, Parameters<typeof SupportService.reportIssue>[0]>
) => {
  const queryClient = useQueryClient();
  return useMutation<SupportTicket, Error, Parameters<typeof SupportService.reportIssue>[0]>({
    mutationFn: SupportService.reportIssue,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: supportQueryKeys.myTickets() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useSubmitFeedback = (
  options?: UseMutationOptions<Feedback, Error, Parameters<typeof SupportService.submitFeedback>[0]>
) => {
  return useMutation<Feedback, Error, Parameters<typeof SupportService.submitFeedback>[0]>({
    mutationFn: SupportService.submitFeedback,
    ...options,
  });
};

// Admin Hooks

export const useAllSupportTickets = (
  filters?: SupportTicketFilters,
  options?: Omit<UseQueryOptions<PaginatedResponse<SupportTicket>, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<PaginatedResponse<SupportTicket>, Error>({
    queryKey: supportQueryKeys.allTickets(filters),
    queryFn: () => SupportService.getAllTickets(filters),
    ...options,
  });
};

export const useAssignTicketToAgent = (
  options?: UseMutationOptions<SupportTicket, Error, { ticketId: string; agentId: string }>
) => {
  const queryClient = useQueryClient();
  return useMutation<SupportTicket, Error, { ticketId: string; agentId: string }>({
    mutationFn: ({ ticketId, agentId }) => SupportService.assignTicketToAgent(ticketId, agentId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: supportQueryKeys.ticket(variables.ticketId) });
      queryClient.invalidateQueries({ queryKey: supportQueryKeys.allTickets() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useUpdateTicketPriority = (
  options?: UseMutationOptions<SupportTicket, Error, { ticketId: string; priority: 'low' | 'medium' | 'high' | 'urgent' }>
) => {
  const queryClient = useQueryClient();
  return useMutation<SupportTicket, Error, { ticketId: string; priority: 'low' | 'medium' | 'high' | 'urgent' }>({
    mutationFn: ({ ticketId, priority }) => SupportService.updateTicketPriority(ticketId, priority),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: supportQueryKeys.ticket(variables.ticketId) });
      queryClient.invalidateQueries({ queryKey: supportQueryKeys.allTickets() });
      queryClient.invalidateQueries({ queryKey: supportQueryKeys.ticketStats() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useAddInternalNote = (
  options?: UseMutationOptions<SupportTicket, Error, { ticketId: string; note: string }>
) => {
  const queryClient = useQueryClient();
  return useMutation<SupportTicket, Error, { ticketId: string; note: string }>({
    mutationFn: ({ ticketId, note }) => SupportService.addInternalNote(ticketId, note),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: supportQueryKeys.ticket(variables.ticketId) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
};

export const useTicketStats = (
  options?: Omit<UseQueryOptions<TicketStats, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<TicketStats, Error>({
    queryKey: supportQueryKeys.ticketStats(),
    queryFn: SupportService.getTicketStats,
    ...options,
  });
};

