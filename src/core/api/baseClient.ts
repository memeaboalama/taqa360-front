/**
 * Enterprise-grade API Client
 * Following patterns from Google, Netflix, and Stripe API clients
 */

import { 
  ApiResponse, 
  RequestConfig, 
  ApiClientConfig, 
  QueryParams,
  HttpMethod 
} from './types';
import { 
  AppError, 
  NetworkError, 
  TimeoutError, 
  ErrorUtils, 
  errorManager,
  ErrorCode 
} from './errors';
import { env } from '../config/env';
import { useAuthStore } from '../../features/auth/stores/authStore';

// Request/Response Interceptor Types
export interface RequestInterceptor {
  onRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
  onRequestError?: (error: Error) => Promise<Error>;
}

export interface ResponseInterceptor {
  onResponse?: <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
  onResponseError?: (error: Error) => Promise<Error>;
}

// Cache Interface
export interface CacheAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Simple Memory Cache Implementation
class MemoryCache implements CacheAdapter {
  private cache = new Map<string, { value: any; expires: number }>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  async set<T>(key: string, value: T, ttl: number = 300000): Promise<void> {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}

// Retry Configuration
interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryCondition?: (error: Error) => boolean;
}

// Base API Client Class
export class BaseApiClient {
  private config: ApiClientConfig;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private cache: CacheAdapter;
  private retryConfig: RetryConfig;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = {
      baseURL: env.API_BASE_URL || 'http://localhost:8000/api',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      enableLogging: env.NODE_ENV === 'development',
      enableCaching: false,
      authTokenKey: 'auth_token',
      ...config
    };

    this.cache = new MemoryCache();
    this.retryConfig = {
      maxAttempts: this.config.retryAttempts,
      baseDelay: this.config.retryDelay,
      maxDelay: 10000,
      backoffFactor: 2,
      retryCondition: ErrorUtils.isRetryable
    };

    this.setupDefaultInterceptors();
  }

  /**
   * Setup default request/response interceptors
   */
  private setupDefaultInterceptors(): void {
    // Auth Token Interceptor
    // Single source of truth: the persisted auth store. The raw localStorage
    // key is kept for compatibility, but if it is missing (desynced session:
    // UI rehydrated as logged-in while the key is gone) fall back to the
    // store's token and re-sync the key so later reads stay consistent.
    this.addRequestInterceptor({
      onRequest: (config) => {
        let token: string | null = null;
        try {
          token = localStorage.getItem(this.config.authTokenKey);
        } catch { token = null; }
        if (!token) {
          try {
            const storeToken = useAuthStore.getState().tokens?.accessToken ?? null;
            if (storeToken) {
              token = storeToken;
              try { localStorage.setItem(this.config.authTokenKey, storeToken); } catch { /* storage may be read-only; header still sent */ }
            }
          } catch { /* never block the request on store access */ }
        }
        if (token && !config.headers?.Authorization) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`
          };
        }
        return config;
      }
    });

    // Logging Interceptor
    if (this.config.enableLogging) {
      this.addRequestInterceptor({
        onRequest: (config) => {
          console.log(`[API] ${config.method} ${config.url}`, {
            params: config.params,
            data: config.data
          });
          return config;
        }
      });

      this.addResponseInterceptor({
        onResponse: (response) => {
          console.log(`[API] Response:`, response);
          return response;
        },
        onResponseError: async (error) => {
          console.error(`[API] Error:`, error);
          return Promise.reject(error);
        }
      });
    }
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Build full URL with query parameters
   */
  private buildUrl(endpoint: string, params?: QueryParams): string {
    const base = (this.config.baseURL || '').replace(/\/+$/, '');
    const path = (endpoint || '').replace(/^\/+/, '');
    let url = `${base}/${path}`;

    if (params && Object.keys(params).length > 0) {
      const search = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object') {
            search.append(key, JSON.stringify(value));
          } else {
            search.append(key, String(value));
          }
        }
      });
      const qs = search.toString();
      if (qs) url += `?${qs}`;
    }

    return url;
  }

  /**
   * Execute request with retry logic
   */
  private async executeRequest<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
      try {
        return await this.makeRequest<T>(config);
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry if it's the last attempt or error is not retryable
        if (attempt === this.retryConfig.maxAttempts || 
            !this.retryConfig.retryCondition?.(lastError)) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, attempt - 1),
          this.retryConfig.maxDelay
        );

        // Add jitter to prevent thundering herd
        const jitter = Math.random() * 0.1 * delay;
        await this.sleep(delay + jitter);
      }
    }

    throw lastError;
  }

  /**
   * Make actual HTTP request
   */
  private async makeRequest<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    // Apply request interceptors
    let processedConfig = config;
    for (const interceptor of this.requestInterceptors) {
      if (interceptor.onRequest) {
        processedConfig = await interceptor.onRequest(processedConfig);
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      // Support FormData and JSON bodies correctly
      const isFormData = typeof FormData !== 'undefined' && processedConfig.data instanceof FormData;

      const headers: Record<string, string> = {
        'Accept': 'application/json',
        ...processedConfig.headers
      };

      // DO NOT set Content-Type when sending FormData - browser will set the multipart boundary
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      const requestInit: RequestInit = {
        method: processedConfig.method,
        headers,
        body: processedConfig.data ? (isFormData ? processedConfig.data as any : JSON.stringify(processedConfig.data)) : undefined,
        signal: controller.signal
      };

      const url = this.buildUrl(processedConfig.url, processedConfig.params);
      const response = await fetch(url, requestInit);

      clearTimeout(timeoutId);

      // Handle non-2xx responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const apiError = ErrorUtils.fromApiError({
          status: response.status,
          message: errorData.message || response.statusText,
          errors: errorData.errors
        }, { url });
        
        // Apply response error interceptors
        let processedError: Error = apiError;
        for (const interceptor of this.responseInterceptors) {
          if (interceptor.onResponseError) {
            try {
              processedError = await interceptor.onResponseError(processedError);
            } catch (interceptorError) {
              processedError = interceptorError as Error;
            }
          }
        }

        throw processedError;
      }

      // Parse successful response
      const responseData: ApiResponse<T> = await response.json();
      
      // Apply response interceptors
      let processedResponse = responseData;
      for (const interceptor of this.responseInterceptors) {
        if (interceptor.onResponse) {
          processedResponse = await interceptor.onResponse(processedResponse);
        }
      }

      // Clear cache after any successful write operation (POST/PUT/PATCH/DELETE)
      try {
        const isWriteMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes((processedConfig.method || '').toUpperCase());
        const overrideHeaderEntry = Object.entries(processedConfig.headers || {}).find(([k]) => k.toLowerCase() === 'x-http-method-override');
        const overrideMethod = (overrideHeaderEntry?.[1] || '').toString().toUpperCase();
        const isGetOverride = overrideMethod === 'GET';

        if (isWriteMethod && !isGetOverride) {
          await this.clearCache();
        }
      } catch {
        // ignore cache clearing errors
      }

      return processedResponse;

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        // Handle specific error types
        if (error.name === 'AbortError') {
          throw new TimeoutError('انتهت مهلة الطلب', { url: processedConfig.url });
        }
        
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new NetworkError('فشل في الأتصال بالخادم', { 
            url: processedConfig.url,
            originalError: error.message 
          });
        }

        // If it's already an AppError, just re-throw
        if (error instanceof AppError) {
          throw error;
        }
      }

      // Wrap unknown errors
      throw new AppError(
        'حدث خطأ غير متوقع',
        ErrorCode.UNKNOWN_ERROR,
        500,
        undefined,
        false,
        { originalError: error, url: processedConfig.url }
      );
    }
  }

  /**
   * Get cached response or make request
   */
  private async getCachedOrFetch<T>(
    config: RequestConfig, 
    cacheKey?: string,
    cacheTtl?: number
  ): Promise<ApiResponse<T>> {
    // Only cache GET requests
    if (this.config.enableCaching && config.method === 'GET' && cacheKey) {
      const cached = await this.cache.get<ApiResponse<T>>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const response = await this.executeRequest<T>(config);

    // Cache successful GET responses
    if (this.config.enableCaching && config.method === 'GET' && cacheKey) {
      await this.cache.set(cacheKey, response, cacheTtl);
    }

    return response;
  }

  /**
   * Generate cache key from config
   */
  private generateCacheKey(config: RequestConfig): string {
    const params = config.params ? JSON.stringify(config.params) : '';
    return `${config.method}:${config.url}:${params}`;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public HTTP Methods

  async get<T>(
    endpoint: string,
    params?: QueryParams,
    options?: { cache?: boolean; cacheTtl?: number; sendParamsInBody?: boolean }
  ): Promise<ApiResponse<T>> {
    console.log('[API] GET called with:', {
      endpoint,
      params,
      hasParams: !!params,
      sendParamsInBody: options?.sendParamsInBody
    });

    // استخدم POST override فقط عند الحاجة الصريحة لإرسال المعايير في body
    if (options?.sendParamsInBody && params && Object.keys(params).length > 0) {
      console.log('[API] Using POST override for GET with body params (explicit)');
      const config: RequestConfig = {
        method: 'POST',
        url: endpoint,
        data: params,
        headers: { 'X-HTTP-Method-Override': 'GET' }
      };
      return this.executeRequest<T>(config);
    }

    // استخدم GET عادي مع باراميترات في URL لتفعيل الكاش وتقليل الطلبات المكررة
    const config: RequestConfig = {
      method: 'GET',
      url: endpoint,
      params
    };

    const cacheKey = options?.cache === false ? undefined : this.generateCacheKey(config);
    return this.getCachedOrFetch<T>(config, cacheKey, options?.cacheTtl);
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const config: RequestConfig = {
      method: 'POST',
      url: endpoint,
      data
    };

    return this.executeRequest<T>(config);
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const config: RequestConfig = {
      method: 'PUT',
      url: endpoint,
      data
    };

    return this.executeRequest<T>(config);
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const config: RequestConfig = {
      method: 'PATCH',
      url: endpoint,
      data
    };

    return this.executeRequest<T>(config);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const config: RequestConfig = {
      method: 'DELETE',
      url: endpoint
    };

    return this.executeRequest<T>(config);
  }

  /**
   * Upload file with progress tracking
   */
  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    onProgress?: (progress: number) => void,
    fileKey: string = 'file'
  ): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append(fileKey, file);
      
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, String(value));
        });
      }

      const xhr = new XMLHttpRequest();
      
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', async () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response: ApiResponse<T> = JSON.parse(xhr.responseText);
            try { await this.clearCache(); } catch {}
            resolve(response);
          } else {
            const errorData = JSON.parse(xhr.responseText);
            const error = ErrorUtils.fromApiError({
              status: xhr.status,
              message: errorData.message || xhr.statusText,
              errors: errorData.errors
            });
            reject(error);
          }
        } catch (parseError) {
          reject(new AppError('فشل في تحليل الاستجابة', ErrorCode.UNKNOWN_ERROR));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new NetworkError('فشل في رفع الملف'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new TimeoutError('انتهت مهلة رفع الملف'));
      });

      xhr.open('POST', `${this.config.baseURL}${endpoint}`);
      xhr.timeout = this.config.timeout;

      xhr.setRequestHeader('Accept', 'application/json');

      const token = localStorage.getItem(this.config.authTokenKey);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);
    });
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    await this.cache.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): ApiClientConfig {
    return { ...this.config };
  }
}

// Create singleton instance
export const apiClient = new BaseApiClient();

// Setup global error handling
apiClient.addResponseInterceptor({
  onResponseError: async (error) => {
    await errorManager.handleError(error);
    return Promise.reject(error);
  }
});

export default apiClient;
