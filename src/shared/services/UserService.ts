import { apiClient } from "../../core/api/client";
import {
  User,
  EducationalRequest,
  Attachment,
  PaginatedResponse,
  EducationalRequestStatus,
  PaymentStatus,
  FulfillmentStatus,
  PricingType,
} from "../types";

export interface EducationalRequestFilters {
  page?: number;
  per_page?: number;
  status?: EducationalRequestStatus;
  subject?: string;
  education_level?: string;
  pricing_type?: PricingType;
  search?: string;
}

export interface CreateEducationalRequestData {
  title: string;
  description: string;
  subject: string;
  education_level: string;
  budget?: number;
  pricing_type: PricingType;
  expected_delivery_date?: string;
  attachments?: File[];
}

export interface UpdateEducationalRequestData {
  title?: string;
  description?: string;
  subject?: string;
  education_level?: string;
  budget?: number;
  pricing_type?: PricingType;
  expected_delivery_date?: string;
  final_agreement?: string;
}

import { apiClient } from '../../core/api/baseClient';

export class UserService {
  /**
   * User Profile
   */
  static async getProfile(): Promise<User> {
    const response = await apiClient.get<User>("/user/profile");
    return response.data;
  }

  static async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiClient.patch<User>("/user/profile", userData);
    return response.data;
  }

  static async uploadAvatar(file: File): Promise<User> {
    const response = await apiClient.upload<User>("/user/avatar", file);
    return response.data;
  }

  /**
   * Educational Requests
   */
  static async getEducationalRequests(
    filters?: EducationalRequestFilters
  ): Promise<PaginatedResponse<EducationalRequest>> {
    const response = await apiClient.get<PaginatedResponse<EducationalRequest>>(
      "/user/educational-requests",
      filters
    );
    return response.data;
  }

  static async getEducationalRequest(id: string): Promise<EducationalRequest> {
    const response = await apiClient.get<EducationalRequest>(
      `/user/educational-requests/${id}`
    );
    return response.data;
  }

  static async createEducationalRequest(
    requestData: CreateEducationalRequestData
  ): Promise<EducationalRequest> {
    const formData = new FormData();

    Object.entries(requestData).forEach(([key, value]) => {
      if (key !== "attachments" && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    if (requestData.attachments?.length) {
      requestData.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    const response = await apiClient.post<EducationalRequest>(
      "/user/educational-requests",
      formData
    );
    return response.data;
  }

  static async updateEducationalRequest(
    id: string,
    requestData: UpdateEducationalRequestData
  ): Promise<EducationalRequest> {
    const response = await apiClient.patch<EducationalRequest>(
      `/user/educational-requests/${id}`,
      requestData
    );
    return response.data;
  }

  static async deleteEducationalRequest(id: string): Promise<void> {
    await apiClient.delete<null>(`/user/educational-requests/${id}`);
  }

  static async cancelEducationalRequest(
    id: string,
    reason?: string
  ): Promise<EducationalRequest> {
    const response = await apiClient.post<EducationalRequest>(
      `/user/educational-requests/${id}/cancel`,
      {
        reason,
      }
    );
    return response.data;
  }

  /**
   * Educational Request Status Updates
   */
  static async acceptEducationalRequest(
    id: string,
    message?: string
  ): Promise<EducationalRequest> {
    const response = await apiClient.post<EducationalRequest>(
      `/user/educational-requests/${id}/accept`,
      {
        message,
      }
    );
    return response.data;
  }

  static async rejectEducationalRequest(
    id: string,
    reason: string
  ): Promise<EducationalRequest> {
    const response = await apiClient.post<EducationalRequest>(
      `/user/educational-requests/${id}/reject`,
      {
        reason,
      }
    );
    return response.data;
  }

  /**
   * Payment Management
   */
  static async updatePaymentStatus(
    requestId: string,
    status: PaymentStatus
  ): Promise<EducationalRequest> {
    const response = await apiClient.patch<EducationalRequest>(
      `/user/educational-requests/${requestId}/payment`,
      {
        payment_status: status,
      }
    );
    return response.data;
  }

  static async markRequestAsPaid(
    requestId: string,
    paymentDetails?: any
  ): Promise<EducationalRequest> {
    const response = await apiClient.post<EducationalRequest>(
      `/user/educational-requests/${requestId}/mark-paid`,
      {
        payment_details: paymentDetails,
      }
    );
    return response.data;
  }

  /**
   * Fulfillment Management
   */
  static async updateFulfillmentStatus(
    requestId: string,
    status: FulfillmentStatus
  ): Promise<EducationalRequest> {
    const response = await apiClient.patch<EducationalRequest>(
      `/user/educational-requests/${requestId}/fulfillment`,
      {
        fulfillment_status: status,
      }
    );
    return response.data;
  }

  static async markRequestAsCompleted(
    requestId: string,
    feedback?: string
  ): Promise<EducationalRequest> {
    const response = await apiClient.post<EducationalRequest>(
      `/user/educational-requests/${requestId}/complete`,
      {
        feedback,
      }
    );
    return response.data;
  }

  /**
   * Request Attachments
   */
  static async uploadRequestAttachment(
    requestId: string,
    file: File,
    title?: string
  ): Promise<Attachment> {
    const response = await apiClient.upload<Attachment>(
      `/user/educational-requests/${requestId}/attachments`,
      file
    );
    return response.data;
  }

  static async deleteRequestAttachment(
    requestId: string,
    attachmentId: string
  ): Promise<void> {
    await apiClient.delete<null>(
      `/user/educational-requests/${requestId}/attachments/${attachmentId}`
    );
  }

  /**
   * Request Activity & Notes
   */
  static async addRequestNote(requestId: string, content: string): Promise<void> {
    await apiClient.post<null>(`/user/educational-requests/${requestId}/notes`, {
      content,
    });
  }

  /**
   * Dashboard Stats
   */
  static async getDashboardStats(): Promise<any> {
    const response = await apiClient.get("/user/dashboard/stats");
    return response.data;
  }

  /**
   * Notifications
   */
  static async getNotifications(): Promise<any[]> {
    const response = await apiClient.get("/user/notifications");
    return response.data;
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    await apiClient.patch<null>(`/user/notifications/${notificationId}/read`);
  }

  /**
   * Support
   */
  static async createSupportRequest(data: {
    subject: string;
    message: string;
    category?: string;
  }): Promise<any> {
    const response = await apiClient.post("/user/support", data);
    return response.data;
  }
}
