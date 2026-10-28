/**
 * Core API Types and Interfaces
 * Following enterprise-grade patterns for type safety and consistency
 */

// Base API Response Structure
export interface ApiResponse<T = any> {
  status: boolean;
  data: T;
  message: string | null;
  errors?: Record<string, string[]>;
  meta?: PaginationMeta;
  pagination?: {
    meta: {
      page: {
        current: number;
        first: number;
        last: number;
        next: number | null;
        previous: number | null;
        per: number;
        from: number;
        to: number;
        count: number;
        total: number;
        isFirst: boolean;
        isLast: boolean;
        isNext: boolean;
        isPrevious: boolean;
      };
    };
    links: {
      path: string;
      first: string;
      next: string | null;
      previous: string | null;
      last: string;
    };
  };
}

// Pagination Types - Updated to match the new structure
export interface PaginationMeta {
  page: {
    current: number;
    first: number;
    last: number;
    next: number | null;
    previous: number | null;
    per: number;
    from: number;
    to: number;
    count: number;
    total: number;
    isFirst: boolean;
    isLast: boolean;
    isNext: boolean;
    isPrevious: boolean;
  };
}

export interface PaginationLinks {
  path: string;
  first: string;
  next: string | null;
  previous: string | null;
  last: string;
}

export interface Pagination {
  meta: PaginationMeta;
  links: PaginationLinks;
}

// Updated response structures for different entities
export interface ProjectsResponse {
  projects: any[];
}

export interface EducatorsResponse {
  educators: any[];
}

export interface BidsResponse {
  bids: any[];
}

export interface UsersResponse {
  users: any[];
}

export interface EducationalRequestsResponse {
  educational_requests: any[];
}

export interface SupportTicketsResponse {
  support_tickets: any[];
}

export interface TasksResponse {
  tasks: any[];
}

// Response types based on pagination requirement
export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: Pagination;
}

export interface SimpleResponse<T> extends ApiResponse<T> {
  // No pagination field for simple responses
}

// Utility types for different request scenarios
export interface PaginatedRequestParams extends QueryParams {
  paginated: boolean;
  per_page: number;
}

export interface SimpleRequestParams extends QueryParams {
  paginated?: boolean | undefined;
  per_page?: never; // per_page should not be present in simple requests
}

// API Error Types
export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
}

// Request Parameters
export interface QueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface FilterParams {
  status?: string;
  created_at_from?: string;
  created_at_to?: string;
  updated_at_from?: string;
  updated_at_to?: string;
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Request Configuration
export interface RequestConfig {
  method: HttpMethod;
  url: string;
  data?: any;
  params?: QueryParams;
  headers?: Record<string, string>;
  timeout?: number;
}

// Authentication Types
export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'educator' | 'user';
  avatar_url?: string;
  permissions?: string[];
  email_verified_at?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Entity Base Types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface AuditableEntity extends BaseEntity {
  created_by?: string;
  updated_by?: string;
  deleted_at?: string;
}

// Status Types
export type EntityStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'archived';
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';

// File Upload Types
export interface FileUpload {
  file: File;
  path?: string;
  disk?: string;
}

export interface UploadedFile {
  id: string;
  original_name: string;
  file_name: string;
  mime_type: string;
  size: number;
  path: string;
  url: string;
  created_at: string;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface FormErrors {
  [field: string]: string | string[];
}

// Cache Types
export interface CacheConfig {
  key: string;
  ttl?: number; // Time to live in milliseconds
  staleWhileRevalidate?: boolean;
}

// Service Response Types
export interface ServiceResponse<T = any> {
  data: T;
  status: boolean;
  message?: string;
  errors?: FormErrors;
  meta?: any;
}

// Optimistic Update Types
export interface OptimisticUpdate<T> {
  type: 'create' | 'update' | 'delete';
  entity: T;
  rollback: () => void;
}

// Real-time Event Types
export interface RealtimeEvent<T = any> {
  event: string;
  data: T;
  timestamp: string;
  user_id?: string;
}

// API Client Configuration
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableLogging: boolean;
  enableCaching: boolean;
  authTokenKey: string;
}

// Resource CRUD Operations
export interface ResourceService<T, CreateData = Partial<T>, UpdateData = Partial<T>> {
  // Read Operations
  getAll(params?: QueryParams): Promise<PaginatedResponse<T>>;
  getById(id: string): Promise<ApiResponse<T>>;
  
  // Write Operations
  create(data: CreateData): Promise<ApiResponse<T>>;
  update(id: string, data: UpdateData): Promise<ApiResponse<T>>;
  delete(id: string): Promise<ApiResponse<void>>;
  
  // Bulk Operations
  bulkUpdate?(ids: string[], data: UpdateData): Promise<ApiResponse<T[]>>;
  bulkDelete?(ids: string[]): Promise<ApiResponse<void>>;
}

// Advanced Query Types
export interface QueryOptions {
  include?: string[];
  select?: string[];
  with_trashed?: boolean;
  only_trashed?: boolean;
}

export interface SearchParams extends QueryParams {
  query: string;
  fields?: string[];
  exact_match?: boolean;
}

// Event Sourcing Types (for audit logs)
export interface DomainEvent {
  id: string;
  aggregate_id: string;
  aggregate_type: string;
  event_type: string;
  event_data: Record<string, any>;
  user_id?: string;
  occurred_at: string;
  version: number;
}

// Notification Types
export interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  read_at?: string;
  created_at: string;
}

// Metrics and Analytics Types
export interface MetricData {
  name: string;
  value: number;
  unit?: string;
  timestamp: string;
  tags?: Record<string, string>;
}

export interface DashboardStats {
  [key: string]: {
    current: number;
    previous?: number;
    change_percentage?: number;
    trend: 'up' | 'down' | 'stable';
  };
}
