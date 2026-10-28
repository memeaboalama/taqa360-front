/**
 * Enterprise-grade Error Handling System
 * Inspired by error handling patterns from Netflix, Spotify, and Airbnb
 */

import { ApiError, ValidationError } from './types';

// Error Code Enums for better type safety
export enum ErrorCode {
  // Network Errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  
  // Authentication Errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  
  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  REQUIRED_FIELD_MISSING = 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Resource Errors
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_EXISTS = 'RESOURCE_EXISTS',
  RESOURCE_LOCKED = 'RESOURCE_LOCKED',
  
  // Business Logic Errors
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  
  // Server Errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  MAINTENANCE_MODE = 'MAINTENANCE_MODE',
  
  // Unknown Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Error Severity Levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Base Application Error Class
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;
  public readonly timestamp: string;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    statusCode: number = 500,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.code = code;
    this.severity = severity;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

// Specific Error Classes
export class ValidationAppError extends AppError {
  public readonly errors: ValidationError[];

  constructor(
    message: string,
    errors: ValidationError[],
    context?: Record<string, any>
  ) {
    super(
      message,
      ErrorCode.VALIDATION_ERROR,
      422,
      ErrorSeverity.LOW,
      true,
      context
    );
    
    this.errors = errors;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'غير مصرح لك بالوصول', context?: Record<string, any>) {
    super(
      message,
      ErrorCode.UNAUTHORIZED,
      401,
      ErrorSeverity.MEDIUM,
      true,
      context
    );
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'ليس لديك صلاحية للقيام بهذا الإجراء', context?: Record<string, any>) {
    super(
      message,
      ErrorCode.FORBIDDEN,
      403,
      ErrorSeverity.MEDIUM,
      true,
      context
    );
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'المورد المطلوب غير موجود', context?: Record<string, any>) {
    super(
      message,
      ErrorCode.NOT_FOUND,
      404,
      ErrorSeverity.LOW,
      true,
      context
    );
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'خطأ في الشبكة', context?: Record<string, any>) {
    super(
      message,
      ErrorCode.NETWORK_ERROR,
      0,
      ErrorSeverity.HIGH,
      true,
      context
    );
  }
}

export class TimeoutError extends AppError {
  constructor(message: string = 'انتهت مهلة الطلب', context?: Record<string, any>) {
    super(
      message,
      ErrorCode.TIMEOUT_ERROR,
      408,
      ErrorSeverity.MEDIUM,
      true,
      context
    );
  }
}

export class ServerError extends AppError {
  constructor(message: string = 'خطأ في الخادم', context?: Record<string, any>) {
    super(
      message,
      ErrorCode.INTERNAL_SERVER_ERROR,
      500,
      ErrorSeverity.HIGH,
      false,
      context
    );
  }
}

// Error Handler Interface
export interface ErrorHandler {
  handle(error: Error): void;
}

// Console Error Handler
export class ConsoleErrorHandler implements ErrorHandler {
  private static lastLogs: Map<string, number> = new Map();
  private static DEDUPE_WINDOW_MS = 3000;

  handle(error: Error): void {
    if (error instanceof AppError) {
      const url = (error.context as any)?.url || (error.context as any)?.originalError?.url;
      const key = `${error.code}|${url || ''}|${error.message}`;
      const now = Date.now();
      const last = ConsoleErrorHandler.lastLogs.get(key) || 0;
      if (now - last < ConsoleErrorHandler.DEDUPE_WINDOW_MS) return;
      ConsoleErrorHandler.lastLogs.set(key, now);

      console.error(`[${error.severity.toUpperCase()}] ${error.code}:`, {
        message: error.message,
        url,
        statusCode: error.statusCode,
        timestamp: error.timestamp
      });
    } else {
      console.error('Unexpected Error:', error);
    }
  }
}

// Remote Error Handler (for sending to error tracking services)
export class RemoteErrorHandler implements ErrorHandler {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async handle(error: Error): Promise<void> {
    try {
      if (error instanceof AppError && error.severity === ErrorSeverity.CRITICAL) {
        await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(error.toJSON())
        });
      }
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }
}

// Toast Error Handler (for user-facing errors)
export class ToastErrorHandler implements ErrorHandler {
  private showToast: (message: string, type: 'error' | 'warning' | 'info') => void;

  constructor(showToast: (message: string, type: 'error' | 'warning' | 'info') => void) {
    this.showToast = showToast;
  }

  handle(error: Error): void {
    if (error instanceof AppError && error.isOperational) {
      const toastType = error.severity === ErrorSeverity.CRITICAL ? 'error' : 
                       error.severity === ErrorSeverity.HIGH ? 'error' : 'warning';
      
      this.showToast(error.message, toastType);
    }
  }
}

// Centralized Error Manager
export class ErrorManager {
  private handlers: ErrorHandler[] = [];

  addHandler(handler: ErrorHandler): void {
    this.handlers.push(handler);
  }

  removeHandler(handler: ErrorHandler): void {
    const index = this.handlers.indexOf(handler);
    if (index > -1) {
      this.handlers.splice(index, 1);
    }
  }

  async handleError(error: Error): Promise<void> {
    // Handle all errors through registered handlers
    await Promise.all(
      this.handlers.map(handler => {
        try {
          return handler.handle(error);
        } catch (handlerError) {
          console.error('Error handler failed:', handlerError);
        }
      })
    );
  }
}

// Error Utilities
export class ErrorUtils {
  /**
   * Converts API error response to AppError
   */
  static fromApiError(apiError: ApiError, extraContext?: Record<string, any>): AppError {
    const errorCodeMap: Record<number, ErrorCode> = {
      400: ErrorCode.VALIDATION_ERROR,
      401: ErrorCode.UNAUTHORIZED,
      403: ErrorCode.FORBIDDEN,
      404: ErrorCode.NOT_FOUND,
      408: ErrorCode.TIMEOUT_ERROR,
      422: ErrorCode.VALIDATION_ERROR,
      429: ErrorCode.QUOTA_EXCEEDED,
      500: ErrorCode.INTERNAL_SERVER_ERROR,
      502: ErrorCode.SERVICE_UNAVAILABLE,
      503: ErrorCode.SERVICE_UNAVAILABLE,
      504: ErrorCode.TIMEOUT_ERROR
    };

    const code = errorCodeMap[apiError.status] || ErrorCode.UNKNOWN_ERROR;
    const severity = apiError.status >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM;

    if (apiError.status === 422 && apiError.errors) {
      const validationErrors: ValidationError[] = Object.entries(apiError.errors)
        .flatMap(([field, messages]) =>
          Array.isArray(messages)
            ? messages.map(message => ({ field, message }))
            : [{ field, message: messages }]
        );

      return new ValidationAppError(apiError.message, validationErrors, { status: apiError.status, ...extraContext });
    }

    return new AppError(
      apiError.message,
      code,
      apiError.status,
      severity,
      true,
      { originalError: apiError, ...extraContext }
    );
  }

  /**
   * Determines if error is retryable
   */
  static isRetryable(error: Error): boolean {
    if (error instanceof AppError) {
      // Retry only on transient transport/service issues
      return [
        ErrorCode.NETWORK_ERROR,
        ErrorCode.TIMEOUT_ERROR,
        ErrorCode.SERVICE_UNAVAILABLE
      ].includes(error.code);
    }
    return false;
  }

  /**
   * Creates a user-friendly error message
   */
  static getUserMessage(error: Error): string {
    if (error instanceof AppError) {
      switch (error.code) {
        case ErrorCode.NETWORK_ERROR:
          return 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.';
        case ErrorCode.TIMEOUT_ERROR:
          return 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.';
        case ErrorCode.UNAUTHORIZED:
          return 'يجب تسجيل الدخول أولاً.';
        case ErrorCode.FORBIDDEN:
          return 'ليس لديك صلاحية للقيام بهذا الإجراء.';
        case ErrorCode.NOT_FOUND:
          return 'العنصر المطلوب غير موجود.';
        case ErrorCode.SERVICE_UNAVAILABLE:
          return 'الخدمة غير متوفرة حالياً. يرجى المحاولة لاحقاً.';
        default:
          return error.message;
      }
    }
    return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
  }
}

// Create global error manager instance
export const errorManager = new ErrorManager();

// Add default handlers
errorManager.addHandler(new ConsoleErrorHandler());

// Error boundary helper for React components
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: AppError;
}

export class ErrorBoundaryHelper {
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const appError = error instanceof AppError ? error : new AppError(
      'حدث خطأ غير متوقع في التطبيق',
      ErrorCode.UNKNOWN_ERROR,
      500,
      ErrorSeverity.HIGH,
      false,
      { originalError: error }
    );

    return {
      hasError: true,
      error: appError
    };
  }

  static componentDidCatch(error: Error, errorInfo: any): void {
    errorManager.handleError(error);
  }
}
