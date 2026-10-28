import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { AuthUser, LoginResponse, PaginatedResponse, ApiResponse } from '../../shared/types';
import { env } from '../config/env';

interface InternalAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

class ApiClient {
  private axiosInstance: AxiosInstance;
  private static instance: ApiClient;
  private isRefreshing = false;
  private failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void; config: InternalAxiosRequestConfig }[] = [];

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: env.API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: String((import.meta as any).env?.VITE_API_WITH_CREDENTIALS) === 'true',
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const accessToken = localStorage.getItem(env.TOKEN_STORAGE_KEY);
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse<any>>) => {
        // Assuming all successful API responses have a 'data' field that contains the actual payload
        // and 'status' field indicating success/failure from the backend perspective.
        // If the backend always returns 2xx for success and handles business logic errors within the response body,
        // we can simplify this.
        if (response.data && typeof response.data.status === 'boolean' && !response.data.status) {
          // This block handles cases where the HTTP status is 2xx but the backend reports a business error.
          // You might want to throw an error here or handle it based on your application's needs.
          // For now, we'll just return the response, but a more robust solution might involve
          // creating a custom error or rejecting the promise.
          return Promise.resolve(response);
        }
        return response;
      },
      async (error: AxiosError<ApiResponse<any>>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ config: originalRequest, resolve, reject });
            })
              .then(() => this.axiosInstance(originalRequest))
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
              this.clearAuthTokens();
              return Promise.reject(error);
            }

            const refreshResponse = await axios.post<LoginResponse>(
              `${env.API_BASE_URL}/auth/refresh`,
              { refreshToken }
            );

            // The API wraps every payload as { status, message, data }, and this is a
            // bare axios call (no interceptors), so the tokens live at data.data.tokens.
            const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data.tokens;
            this.setAuthTokens(accessToken, newRefreshToken);

            this.failedQueue.forEach((req) => req.resolve());
            this.failedQueue = [];

            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.failedQueue.forEach((req) => req.reject(refreshError));
            this.failedQueue = [];
            this.clearAuthTokens();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle other errors, including network errors or non-401 HTTP errors
        // You might want to normalize the error structure here
        const resp = error.response?.data as any;
        const inferredErrors = resp?.errors || (resp?.data && typeof resp.data === 'object' ? resp.data : undefined);
        const customError: ApiResponse<any> & { statusCode?: number } = {
          status: resp?.status ?? false,
          message: resp?.message || error.message || 'An unexpected error occurred',
          statusCode: error.response?.status,
          data: resp?.data ?? null,
          errors: inferredErrors,
        } as any;
        return Promise.reject(customError);
      }
    );
  }

  public setAuthTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(env.TOKEN_STORAGE_KEY, accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  public clearAuthTokens() {
    localStorage.removeItem(env.TOKEN_STORAGE_KEY);
    localStorage.removeItem('refresh_token');
    // Optionally, redirect to login page or trigger a global logout event
  }

  public async get<T>(url: string, params?: object, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.axiosInstance.get<ApiResponse<T>>(url, { params, ...config });
  }

  public async post<T>(url: string, data?: object, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.axiosInstance.post<ApiResponse<T>>(url, data, config);
  }

  public async put<T>(url: string, data?: object, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.axiosInstance.put<ApiResponse<T>>(url, data, config);
  }

  public async patch<T>(url: string, data?: object, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.axiosInstance.patch<ApiResponse<T>>(url, data, config);
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.axiosInstance.delete<ApiResponse<T>>(url, config);
  }

  public async upload<T>(url: string, file: File, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.axiosInstance.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    });
  }
}

export const apiClient = ApiClient.getInstance();
