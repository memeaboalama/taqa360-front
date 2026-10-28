import { apiClient } from "../../core/api/client";
import {
  PaginatedResponse,
  SupportTicket,
  SupportTicketMessage,
  SupportCategory,
  FAQItem,
  ContactInfo,
  QuickHelpArticle,
  Feedback,
  Attachment,
} from "../types";

export interface SupportTicketFilters {
  status?: "open" | "closed" | "pending";
  priority?: "low" | "medium" | "high";
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateSupportTicketData {
  subject: string;
  category: string;
  content: string;
  attachments?: File[];
}

export interface ReplyToTicketData {
  content: string;
  attachments?: File[];
}

export interface TicketStats {
  total: number;
  open: number;
  closed: number;
  pending: number;
  high_priority: number;
  by_category: { [category: string]: number };
  by_priority: { [priority: string]: number };
  avg_response_time: number;
  avg_resolution_time: number;
}

export class SupportService {
  /**
   * Support Tickets - User/Educator Side
   */
  static async getMyTickets(
    filters?: SupportTicketFilters
  ): Promise<PaginatedResponse<SupportTicket>> {
    const response = await apiClient.get<PaginatedResponse<SupportTicket>>(
      "/support/tickets/my",
      filters
    );
    return response.data;
  }

  /**
   * جلب تذكرة دعم محددة
   */
  static async getTicket(id: string): Promise<SupportTicket> {
    const response = await apiClient.get<SupportTicket>(`/support/tickets/${id}`);
    return response.data;
  }

  /**
   * إنشاء تذكرة دعم جديدة
   */
  static async createTicket(
    ticketData: CreateSupportTicketData
  ): Promise<SupportTicket> {
    const formData = new FormData();
    
    // إضافة البيانات النصية
    formData.append("subject", ticketData.subject);
    formData.append("category", ticketData.category);
    formData.append("content", ticketData.content);

    // إضافة المرفقات
    if (ticketData.attachments?.length) {
      ticketData.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    const response = await apiClient.post<SupportTicket>("/support/tickets", formData);
    return response.data;
  }

  /**
   * الرد على تذكرة دعم
   */
  static async replyToTicket(
    ticketId: string,
    replyData: ReplyToTicketData
  ): Promise<SupportTicketMessage> {
    const formData = new FormData();
    
    formData.append("content", replyData.content);

    // إضافة المرفقات
    if (replyData.attachments?.length) {
      replyData.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    const response = await apiClient.post<SupportTicketMessage>(`/support/tickets/${ticketId}/reply`, formData);
    return response.data;
  }

  /**
   * إغلاق تذكرة دعم
   */
  static async closeTicket(ticketId: string): Promise<SupportTicket> {
    const response = await apiClient.post<SupportTicket>(
      `/support/tickets/${ticketId}/close`
    );
    return response.data;
  }

  /**
   * إعادة فتح تذكرة دعم
   */
  static async reopenTicket(ticketId: string): Promise<SupportTicket> {
    const response = await apiClient.post<SupportTicket>(
      `/support/tickets/${ticketId}/reopen`
    );
    return response.data;
  }

  /**
   * جلب فئات الدعم
   */
  static async getSupportCategories(): Promise<SupportCategory[]> {
    const response = await apiClient.get<SupportCategory[]>(
      "/support/categories"
    );
    return response.data;
  }

  /**
   * جلب الأسئلة الشائعة (FAQ)
   */
  static async getFAQ(category?: string): Promise<FAQItem[]> {
    const response = await apiClient.get<FAQItem[]>("/support/faq",
      category ? { category } : undefined
    );
    return response.data;
  }

  /**
   * البحث في الأسئلة الشائعة (FAQ)
   */
  static async searchFAQ(query: string): Promise<FAQItem[]> {
    const response = await apiClient.get<FAQItem[]>("/support/faq/search", {
      query,
    });
    return response.data;
  }

  /**
   * جلب معلومات الاتصال بالدعم
   */
  static async getContactInfo(): Promise<ContactInfo> {
    const response = await apiClient.get<ContactInfo>("/support/contact-info");
    return response.data;
  }

  /**
   * جلب مقالات المساعدة السريعة
   */
  static async getQuickHelp(topic?: string): Promise<QuickHelpArticle[]> {
    const response = await apiClient.get<QuickHelpArticle[]>(
      "/support/quick-help",
      topic ? { topic } : undefined
    );
    return response.data;
  }

  /**
   * الإبلاغ عن مشكلة
   */
  static async reportIssue(
    data: {
      type: "bug" | "feature_request" | "improvement" | "other";
      title: string;
      description: string;
      steps_to_reproduce?: string;
      expected_behavior?: string;
      actual_behavior?: string;
      browser_info?: string;
      attachments?: File[];
    }
  ): Promise<SupportTicket> {
    const formData = new FormData();
    
    // إضافة البيانات النصية
    Object.entries(data).forEach(([key, value]) => {
      if (key !== "attachments" && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    // إضافة المرفقات
    if (data.attachments?.length) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    const response = await apiClient.post<SupportTicket>("/support/report-issue", formData);
    return response.data;
  }

  /**
   * إرسال ملاحظات/اقتراحات
   */
  static async submitFeedback(
    data: Pick<Feedback, "subject" | "message" | "rating" | "category">
  ): Promise<Feedback> {
    const response = await apiClient.post<Feedback>(
      "/support/feedback",
      data
    );
    return response.data;
  }

  // Admin-specific support functions

  /**
   * جلب جميع تذاكر الدعم (للمسؤولين)
   */
  static async getAllTickets(
    filters?: SupportTicketFilters
  ): Promise<PaginatedResponse<SupportTicket>> {
    const response = await apiClient.get<PaginatedResponse<SupportTicket>>(
      "/admin/support/tickets",
      filters
    );
    return response.data;
  }

  /**
   * تعيين تذكرة دعم لموظف دعم (للمسؤولين)
   */
  static async assignTicketToAgent(
    ticketId: string,
    agentId: string
  ): Promise<SupportTicket> {
    const response = await apiClient.post<SupportTicket>(
      `/admin/support/tickets/${ticketId}/assign`,
      { agent_id: agentId }
    );
    return response.data;
  }

  /**
   * تحديث أولوية تذكرة دعم (للمسؤولين)
   */
  static async updateTicketPriority(
    ticketId: string,
    priority: "low" | "medium" | "high" | "urgent"
  ): Promise<SupportTicket> {
    const response = await apiClient.patch<SupportTicket>(
      `/admin/support/tickets/${ticketId}/priority`,
      { priority }
    );
    return response.data;
  }

  /**
   * إضافة ملاحظة داخلية لتذكرة دعم (للمسؤولين)
   */
  static async addInternalNote(
    ticketId: string,
    note: string
  ): Promise<SupportTicket> {
    const response = await apiClient.post<SupportTicket>(
      `/admin/support/tickets/${ticketId}/internal-note`,
      { note }
    );
    return response.data;
  }

  /**
   * جلب إحصائيات تذاكر الدعم (للمسؤولين)
   */
  static async getTicketStats(): Promise<TicketStats> {
    const response = await apiClient.get<TicketStats>(
      "/admin/support/ticket-stats"
    );
    return response.data;
  }
}
