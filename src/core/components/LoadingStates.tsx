/**
 * Professional Loading States System
 * Following UX patterns from Google, Apple, and Stripe
 */

import React from 'react';

// Loading Spinner Component
export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}> = ({ size = 'md', color = 'text-[var(--primary-color)]', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <div className={`${className}`}>
      <svg
        className={`animate-spin ${sizeClasses[size]} ${color}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

// Page Loading Component
export const PageLoadingSpinner: React.FC<{
  message?: string;
  fullScreen?: boolean;
}> = ({ message = 'جاري التحميل...', fullScreen = true }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${fullScreen ? 'min-h-screen' : 'min-h-96'}`}>
      <LoadingSpinner size="xl" />
      <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
        {message}
      </p>
    </div>
  );
};

// Card Skeleton Component
export const CardSkeleton: React.FC<{
  lines?: number;
  showAvatar?: boolean;
  className?: string;
}> = ({ lines = 3, showAvatar = false, className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-start space-x-4 space-x-reverse">
          {showAvatar && (
            <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
          )}
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
            {Array.from({ length: lines }).map((_, index) => (
              <div 
                key={index}
                className={`h-3 bg-slate-200 dark:bg-slate-700 rounded ${
                  index === lines - 1 ? 'w-1/2' : 'w-full'
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Table Skeleton Component
export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}> = ({ rows = 5, columns = 4, showHeader = true }) => {
  return (
    <div className="animate-pulse">
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        {showHeader && (
          <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <div className="grid grid-cols-4 gap-4 p-4">
              {Array.from({ length: columns }).map((_, index) => (
                <div key={index} className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        )}
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-4 gap-4 p-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div 
                  key={colIndex} 
                  className={`h-4 bg-slate-200 dark:bg-slate-700 rounded ${
                    colIndex === 0 ? 'w-3/4' : 'w-full'
                  }`}
                ></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Button Loading State
export const LoadingButton: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}> = ({ 
  loading, 
  children, 
  loadingText = 'جاري التحميل...', 
  disabled = false,
  className = '',
  onClick,
  type = 'button'
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative inline-flex items-center justify-center ${className} ${
        loading || disabled ? 'opacity-75 cursor-not-allowed' : ''
      }`}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" color="text-current" className="mr-2" />
          {loadingText}
        </span>
      )}
      {!loading && <span>{children}</span>}
    </button>
  );
};

// Stats Card Skeleton
export const StatsCardSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
          </div>
          <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
        <div className="mt-4 flex items-center">
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-8 ml-2"></div>
        </div>
      </div>
    </div>
  );
};

// Chart Skeleton
export const ChartSkeleton: React.FC<{
  height?: string;
  type?: 'line' | 'bar' | 'pie';
}> = ({ height = 'h-64', type = 'line' }) => {
  return (
    <div className="animate-pulse">
      <div className={`bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 ${height}`}>
        <div className="space-y-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
          <div className="flex items-end space-x-2 space-x-reverse h-32">
            {type === 'bar' && Array.from({ length: 7 }).map((_, index) => (
              <div 
                key={index}
                className="bg-slate-200 dark:bg-slate-700 w-8 rounded-t"
                style={{ height: `${Math.random() * 80 + 20}%` }}
              ></div>
            ))}
            {type === 'line' && (
              <div className="w-full h-full bg-slate-200 dark:bg-slate-700 rounded relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              </div>
            )}
            {type === 'pie' && (
              <div className="w-32 h-32 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Form Skeleton
export const FormSkeleton: React.FC<{
  fields?: number;
  showButtons?: boolean;
}> = ({ fields = 4, showButtons = true }) => {
  return (
    <div className="animate-pulse space-y-6">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
      ))}
      {showButtons && (
        <div className="flex justify-end space-x-3 space-x-reverse pt-4">
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-20"></div>
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-24"></div>
        </div>
      )}
    </div>
  );
};

// List Skeleton
export const ListSkeleton: React.FC<{
  items?: number;
  showAvatar?: boolean;
  showActions?: boolean;
}> = ({ items = 5, showAvatar = true, showActions = true }) => {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-4 space-x-reverse">
            {showAvatar && (
              <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            )}
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
            </div>
          </div>
          {showActions && (
            <div className="flex space-x-2 space-x-reverse">
              <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Empty State Component
export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}> = ({ icon, title, description, action, className = '' }) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)]"
          style={{ backgroundColor: 'var(--primary-color)' }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

// Error State Component
export const ErrorState: React.FC<{
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}> = ({ 
  title = 'حدث خطأ',
  description = 'فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.',
  onRetry,
  retryLabel = 'إعادة المحاولة',
  className = ''
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="mx-auto h-12 w-12 text-red-400 mb-4">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
        {description}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
};

// Progress Bar Component
export const ProgressBar: React.FC<{
  progress: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}> = ({ 
  progress, 
  showPercentage = true, 
  size = 'md',
  color = 'bg-[var(--primary-color)]',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={className}>
      {showPercentage && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            التقدم
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
      <div className={`w-full bg-slate-200 dark:bg-slate-700 rounded-full ${sizeClasses[size]}`}>
        <div
          className={`${color} ${sizeClasses[size]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        ></div>
      </div>
    </div>
  );
};

// Pulse Animation Component
export const PulseAnimation: React.FC<{
  children: React.ReactNode;
  isActive?: boolean;
}> = ({ children, isActive = true }) => {
  return (
    <div className={isActive ? 'animate-pulse' : ''}>
      {children}
    </div>
  );
};

// Loading Overlay Component
export const LoadingOverlay: React.FC<{
  isVisible: boolean;
  message?: string;
  backdrop?: boolean;
}> = ({ isVisible, message = 'جاري التحميل...', backdrop = true }) => {
  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${
      backdrop ? 'bg-black bg-opacity-50' : ''
    }`}>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl">
        <div className="flex items-center space-x-3 space-x-reverse">
          <LoadingSpinner size="md" />
          <span className="text-slate-700 dark:text-slate-300">{message}</span>
        </div>
      </div>
    </div>
  );
};

export default {
  LoadingSpinner,
  PageLoadingSpinner,
  CardSkeleton,
  TableSkeleton,
  LoadingButton,
  StatsCardSkeleton,
  ChartSkeleton,
  FormSkeleton,
  ListSkeleton,
  EmptyState,
  ErrorState,
  ProgressBar,
  PulseAnimation,
  LoadingOverlay
};
