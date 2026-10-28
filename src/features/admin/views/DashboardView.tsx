/**
 * Admin Dashboard View - Refactored for Real APIs
 * Following enterprise patterns with proper error handling and loading states
 */

import React, { useState } from 'react';
import { useAdminDashboardData } from '../../../core/hooks/useAdminQueries';
import { 
  StatsCardSkeleton, 
  TableSkeleton, 
  ChartSkeleton,
  ErrorState,
  EmptyState 
} from '../../../core/components/LoadingStates';
import { useErrorHandler } from '../../../core/hooks/useErrorHandler';
import { AdminViewType } from '../../../shared/types';

// Icon mapping for activities - now dynamic based on API data
const ActivityIcon: React.FC<{ type: string; className?: string }> = ({ type, className = "h-5 w-5" }) => {
  const iconMap: Record<string, JSX.Element> = {
    user_registered: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    project_created: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    bid_submitted: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    payment_processed: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    support_ticket_created: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    default: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  return iconMap[type] || iconMap.default;
};

interface DashboardViewProps {
  navigateTo: (view: AdminViewType, context?: any) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ navigateTo }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const { handleError, clearError } = useErrorHandler();

  // Use the new API-based hooks
  const {
    dashboard,
    activityFeed,
    pendingApprovals,
    systemHealth,
    isLoading,
    isError,
    refetchAll
  } = useAdminDashboardData();

  // Handle retry for errors
  const handleRetry = () => {
    clearError();
    refetchAll();
  };

  // If there's a critical error, show error state
  if (isError && !isLoading) {
    return (
      <div className="p-6">
        <ErrorState
          title="فشل في تحميل لوحة التحكم"
          description="حدث خطأ أثناء تحميل بيانات لوحة التحكم. يرجى المحاولة مرة أخرى."
          onRetry={handleRetry}
          retryLabel="إعادة تحميل البيانات"
        />
      </div>
    );
  }

  // Extract stats from dashboard data with fallbacks
  const stats = dashboard.data?.stats || {
    total_projects: { current: 0, change_percentage: 0, trend: 'stable' as const },
    active_educators: { current: 0, change_percentage: 0, trend: 'stable' as const },
    pending_requests: { current: 0, change_percentage: 0, trend: 'stable' as const },
    total_revenue: { current: 0, change_percentage: 0, trend: 'stable' as const }
  };

  const activities = activityFeed.data || [];
  const approvals = pendingApprovals.data || [];
  const health = systemHealth.data || {
    status: 'healthy' as const,
    uptime: 0,
    cpu_usage: 0,
    memory_usage: 0,
    active_users: 0,
    response_time: 0,
    error_rate: 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            لوحة التحكم الرئيسية
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            نظرة شاملة على أداء المنصة
          </p>
        </div>
        
        {/* Period Selector */}
        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
          {(['7d', '30d', '90d'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedPeriod === period
                  ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {period === '7d' ? '7 أيام' : period === '30d' ? '30 يوم' : '90 يوم'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboard.isLoading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, index) => (
            <StatsCardSkeleton key={index} />
          ))
        ) : (
          // Real stats data
          <>
            <StatsCard
              title="إجمالي المشاريع"
              value={stats.total_projects.current}
              change={stats.total_projects.change_percentage}
              trend={stats.total_projects.trend}
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
              color="bg-[var(--primary-color)]"
              onClick={() => navigateTo('projects')}
            />

            <StatsCard
              title="المتخصصون النشطون"
              value={stats.active_educators.current}
              change={stats.active_educators.change_percentage}
              trend={stats.active_educators.trend}
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              }
              color="bg-green-500"
              onClick={() => navigateTo('educators')}
            />

            <StatsCard
              title="الطلبات المعلقة"
              value={stats.pending_requests.current}
              change={stats.pending_requests.change_percentage}
              trend={stats.pending_requests.trend}
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="bg-yellow-500"
              onClick={() => navigateTo('educatorApplications')}
            />

            <StatsCard
              title="إجمالي الإيرادات"
              value={`${stats.total_revenue.current.toLocaleString()} ر.س`}
              change={stats.total_revenue.change_percentage}
              trend={stats.total_revenue.trend}
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              }
              color="bg-purple-500"
              onClick={() => navigateTo('finance')}
            />
          </>
        )}
      </div>

      {/* System Health Status */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            حالة النظام
          </h2>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            health.status === 'healthy' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : health.status === 'warning'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {health.status === 'healthy' ? 'نظام سليم' : 
             health.status === 'warning' ? 'تحذير' : 'خطأ'}
          </div>
        </div>

        {systemHealth.isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 mb-2"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <HealthMetric label="وقت التشغيل" value={`${Math.floor(health.uptime / 3600)}ساعة`} />
            <HealthMetric label="استخدام المعالج" value={`${health.cpu_usage}%`} />
            <HealthMetric label="استخدام الذاكرة" value={`${health.memory_usage}%`} />
            <HealthMetric label="المستخدمون النشطون" value={health.active_users.toString()} />
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              الأنشطة الأخيرة
            </h2>
            <button
              onClick={() => navigateTo('reports')}
              className="text-sm font-medium hover:underline"
              style={{ color: 'var(--primary-color)' }}
            >
              عرض الكل
            </button>
          </div>

          {activityFeed.isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="animate-pulse flex items-center space-x-3 space-x-reverse">
                  <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <EmptyState
              icon={
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
              title="لا توجد أنشطة حديثة"
              description="لم يتم تسجيل أي أنشطة في الفترة الأخيرة"
            />
          ) : (
            <div className="space-y-4">
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 space-x-reverse">
                  <div className="h-8 w-8 bg-yellow-50 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                    <ActivityIcon type={activity.type} className="h-4 w-4" style={{ color: 'var(--primary-color)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 dark:text-white">
                      {activity.description}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {new Date(activity.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Approvals */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              الموافقات المعلقة
            </h2>
            <button
              onClick={() => navigateTo('educatorApplications')}
              className="text-sm font-medium hover:underline"
              style={{ color: 'var(--primary-color)' }}
            >
              عرض الكل
            </button>
          </div>

          {pendingApprovals.isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : approvals.length === 0 ? (
            <EmptyState
              icon={
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="لا توجد موافقات معلقة"
              description="جميع الطلبات تمت مراجعتها"
            />
          ) : (
            <div className="space-y-4">
              {approvals.slice(0, 5).map((approval) => (
                <div
                  key={approval.id}
                  className="p-3 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                  onClick={() => {
                    if (approval.type === 'educator_application') {
                      navigateTo('educatorApplicationDetail', approval.id);
                    } else if (approval.type === 'project_approval') {
                      navigateTo('projectDetail', approval.id);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                      {approval.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      approval.priority === 'urgent' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : approval.priority === 'high'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        : 'bg-yellow-50 text-yellow-800'
                    }`}>
                      {approval.priority === 'urgent' ? 'عاجل' : 
                       approval.priority === 'high' ? 'مهم' : 'عادي'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    من: {approval.submitter.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}> = ({ title, value, change, trend, icon, color, onClick }) => {
  return (
    <div 
      className={`bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 ${
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
      </div>
      
      {change !== undefined && (
        <div className="mt-4 flex items-center">
          <span className={`text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 
            'text-slate-500'
          }`}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {Math.abs(change)}%
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mr-2">
            مقارنة بالفترة السابقة
          </span>
        </div>
      )}
    </div>
  );
};

// Health Metric Component
const HealthMetric: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  return (
    <div>
      <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
      <p className="text-lg font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
};

export default DashboardView;
