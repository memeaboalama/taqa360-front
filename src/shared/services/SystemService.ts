import { apiClient } from '../../core/api/client';
import { ManagedItem } from '../types';

export interface SystemSettings {
  app_name: string;
  app_version: string;
  maintenance_mode: boolean;
  maintenance_message?: string;
  max_file_size: number;
  allowed_file_types: string[];
  default_language: string;
  supported_languages: string[];
  currency: string;
  timezone: string;
}

export interface SystemStats {
  total_users: number;
  total_educators: number;
  total_projects: number;
  total_tasks: number;
  total_earnings: number;
  active_users_today: number;
  active_users_this_month: number;
  popular_skills: { name: string; count: number }[];
  popular_services: { name: string; count: number }[];
}

import { apiClient } from '../../core/api/baseClient';

export class SystemService {
  /**
   * System Settings
   */
  static async getSystemSettings(): Promise<SystemSettings> {
    const response = await apiClient.get<SystemSettings>(
      '/system/settings'
    );
    return response.data;
  }

  /**
   * System Statistics
   */
  static async getSystemStats(): Promise<SystemStats> {
    const response = await apiClient.get<SystemStats>(
      '/system/stats'
    );
    return response.data;
  }

  /**
   * Skills Management
   */
  static async getSkills(search?: string): Promise<ManagedItem[]> {
    const response = await apiClient.get<ManagedItem[]>(
      '/system/skills',
      search ? { search } : undefined
    );
    return response.data;
  }

  static async getPopularSkills(limit: number = 10): Promise<{ id: string; name: string; usage_count: number }[]> {
    const response = await apiClient.get(
      '/system/skills/popular',
      { limit }
    );
    return response.data;
  }

  /**
   * Services Management
   */
  static async getServices(search?: string): Promise<ManagedItem[]> {
    const response = await apiClient.get<ManagedItem[]>(
      '/system/services',
      search ? { search } : undefined
    );
    return response.data;
  }

  static async getPopularServices(limit: number = 10): Promise<{ id: string; name: string; usage_count: number }[]> {
    const response = await apiClient.get(
      '/system/services/popular',
      { limit }
    );
    return response.data;
  }

  /**
   * Specializations/Disciplines
   */
  static async getSpecializations(search?: string): Promise<ManagedItem[]> {
    const response = await apiClient.get<ManagedItem[]>(
      '/system/specializations',
      search ? { search } : undefined
    );
    return response.data;
  }

  /**
   * Countries & Cities
   */
  static async getCountries(): Promise<{ code: string; name: string }[]> {
    const response = await apiClient.get(
      '/system/countries'
    );
    return response.data;
  }

  static async getCities(countryCode?: string): Promise<{ id: string; name: string; country_code: string }[]> {
    const response = await apiClient.get(
      '/system/cities',
      countryCode ? { country: countryCode } : undefined
    );
    return response.data;
  }

  /**
   * Education Levels
   */
  static async getEducationLevels(): Promise<{ id: string; name: string; order: number }[]> {
    const response = await apiClient.get(
      '/system/education-levels'
    );
    return response.data;
  }

  /**
   * Subjects
   */
  static async getSubjects(educationLevel?: string): Promise<{ id: string; name: string; education_level?: string }[]> {
    const response = await apiClient.get(
      '/system/subjects',
      educationLevel ? { education_level: educationLevel } : undefined
    );
    return response.data;
  }

  /**
   * Languages
   */
  static async getLanguages(): Promise<{ code: string; name: string; native_name: string }[]> {
    const response = await apiClient.get(
      '/system/languages'
    );
    return response.data;
  }

  /**
   * System Health Check
   */
  static async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: {
      database: 'ok' | 'error';
      storage: 'ok' | 'error';
      cache: 'ok' | 'error';
      queue: 'ok' | 'error';
    };
    timestamp: string;
  }> {
    const response = await apiClient.get(
      '/system/health'
    );
    return response.data;
  }

  /**
   * System Version Info
   */
  static async getVersionInfo(): Promise<{
    app_version: string;
    api_version: string;
    php_version: string;
    laravel_version: string;
    database_version: string;
    last_update: string;
  }> {
    const response = await apiClient.get(
      '/system/version'
    );
    return response.data;
  }

  /**
   * Cache Management
   */
  static async clearCache(types?: string[]): Promise<{ cleared: string[]; message: string }> {
    const response = await apiClient.post(
      '/system/cache/clear',
      types ? { types } : undefined
    );
    return response.data;
  }

  /**
   * Search across multiple entities
   */
  static async globalSearch(query: string, types?: string[]): Promise<{
    projects: any[];
    tasks: any[];
    educators: any[];
    users: any[];
    educational_requests: any[];
  }> {
    const response = await apiClient.get(
      '/system/search',
      { 
        query, 
        types: types?.join(',') 
      }
    );
    return response.data;
  }

  /**
   * System Notifications (for admins)
   */
  static async getSystemNotifications(): Promise<{
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    timestamp: string;
    is_dismissible: boolean;
  }[]> {
    const response = await apiClient.get(
      '/system/notifications'
    );
    return response.data;
  }

  /**
   * Feature Flags
   */
  static async getFeatureFlags(): Promise<{ [feature: string]: boolean }> {
    const response = await apiClient.get(
      '/system/feature-flags'
    );
    return response.data;
  }

  /**
   * System Analytics
   */
  static async getAnalytics(timeframe: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    visitors: { date: string; count: number }[];
    registrations: { date: string; count: number }[];
    projects_created: { date: string; count: number }[];
    revenue: { date: string; amount: number }[];
    top_pages: { page: string; views: number }[];
    user_retention: { period: string; percentage: number }[];
  }> {
    const response = await apiClient.get(
      '/system/analytics',
      { timeframe }
    );
    return response.data;
  }
}
