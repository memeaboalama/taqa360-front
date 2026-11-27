/**
 * Admin Dashboard View - Refactored for Real APIs
 * Following enterprise patterns with proper error handling and loading states
 */

import React from 'react';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useAdminEducators, useAdminEducationalRequests, useAdminProjects, useAdminUsers, usePendingApprovals, usePendingProductOrdersCount } from '../../../core/hooks/useAdminQueries';
import { StatsCardSkeleton, ErrorState, EmptyState } from '../../../core/components/LoadingStates';
import { AdminViewType, EducationalRequest, Project } from '../../../shared/types';
import { useLanguage } from '../../../app/providers/LanguageProvider';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

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

const EyeIcon: React.FC = () => (
  <svg aria-hidden="true" focusable="false" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 12s3.5-6 9.75-6 9.75 6 9.75 6-3.5 6-9.75 6-9.75-6-9.75-6Z" />
    <circle cx="12" cy="12" r="2.5" strokeWidth={2} />
  </svg>
);

interface DashboardApproval {
  id?: string | number;
  type?: string;
  title?: string;
  name?: string;
  priority?: string;
  submitter?: { name?: string };
  educator?: { name?: string };
  educatorName?: string;
  educator_name?: string;
  educatorId?: string | number;
  educator_id?: string | number;
}

interface DashboardRequest extends Partial<EducationalRequest> {
  requester_name?: string;
  requester?: { name?: string };
  created_at?: string;
}

function findList<T>(value: unknown, collectionKeys: string[], depth = 0): T[] | undefined {
  if (Array.isArray(value)) return value as T[];
  if (!value || typeof value !== 'object' || depth >= 4) return undefined;

  const record = value as Record<string, unknown>;
  for (const key of [...collectionKeys, 'data']) {
    const nested = record[key];
    if (Array.isArray(nested)) return nested as T[];
    const result = findList<T>(nested, collectionKeys, depth + 1);
    if (result) return result;
  }
  return undefined;
}

function extractList<T>(value: unknown, collectionKeys: string[]): T[] {
  return findList<T>(value, collectionKeys) ?? [];
}

interface DashboardViewProps {
  navigateTo: (view: AdminViewType, context?: any) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ navigateTo }) => {
  const { t, language } = useLanguage();
  const projectsQuery = useAdminProjects({ paginated: true, page: 1, per_page: 5 });
  const educatorsQuery = useAdminEducators({ page: 1, per_page: 1 });
  const usersQuery = useAdminUsers({ page: 1, per_page: 1 });
  const requestsQuery = useAdminEducationalRequests({ page: 1, per_page: 10 });
  const pendingApprovals = usePendingApprovals({ page: 1, per_page: 100 });
  const pendingProductOrdersQuery = usePendingProductOrdersCount();
  const isLoading = projectsQuery.isLoading || educatorsQuery.isLoading || usersQuery.isLoading || requestsQuery.isLoading || pendingApprovals.isLoading || pendingProductOrdersQuery.isLoading;
  const isError = projectsQuery.isError || educatorsQuery.isError || usersQuery.isError || requestsQuery.isError || pendingApprovals.isError;
  const recentProjects = extractList<Project>(projectsQuery.data, ['projects']);
  const latestRequests = extractList<DashboardRequest>(requestsQuery.data, ['educationalRequests', 'educational_requests', 'requests']);
  const educators = extractList(educatorsQuery.data, ['educators']);
  const users = extractList(usersQuery.data, ['users']);
  const approvals = extractList<DashboardApproval>(pendingApprovals.data, ['educators', 'applications']);
  const approvalPriorityCounts = approvals.reduce(
    (counts, approval) => {
      const priority = approval.priority?.toLowerCase();
      if (priority === 'urgent') counts.urgent += 1;
      else if (priority === 'high') counts.high += 1;
      else if (priority === 'normal' || priority === 'medium') counts.normal += 1;
      else counts.unspecified += 1;
      return counts;
    },
    { urgent: 0, high: 0, normal: 0, unspecified: 0 },
  );
  const approvalTypeCounts = approvals.reduce(
    (counts, approval) => {
      if (approval.type?.toLowerCase().includes('project')) counts.projects += 1;
      else counts.educatorApplications += 1;
      return counts;
    },
    { projects: 0, educatorApplications: 0 },
  );
  const chartLocale = language === 'ar' ? 'ar-u-nu-latn' : 'en-US';
  const priorityChartData: ChartData<'doughnut'> = {
    labels: [
      t('adminDashboard.approvalUrgent'),
      t('adminDashboard.approvalHigh'),
      t('adminDashboard.approvalNormal'),
      t('adminDashboard.approvalUnspecified'),
    ],
    datasets: [{
      data: [
        approvalPriorityCounts.urgent,
        approvalPriorityCounts.high,
        approvalPriorityCounts.normal,
        approvalPriorityCounts.unspecified,
      ],
      backgroundColor: ['#ef4444', '#f97316', '#f59e0b', '#94a3b8'],
      borderWidth: 0,
    }],
  };
  const typeChartData: ChartData<'bar'> = {
    labels: [
      t('adminDashboard.educatorApplications'),
      t('adminDashboard.projectApprovals'),
    ],
    datasets: [{
      label: t('adminDashboard.pendingApprovals'),
      data: [approvalTypeCounts.educatorApplications, approvalTypeCounts.projects],
      backgroundColor: ['#3b82f6', '#14b8a6'],
      borderRadius: 6,
    }],
  };
  const priorityChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    locale: chartLocale,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#64748b' } },
    },
  };
  const typeChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    locale: chartLocale,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0, color: '#64748b' } },
      x: { ticks: { color: '#64748b' } },
    },
  };

  if (isError && !isLoading) {
    return (
      <div className="p-6">
        <ErrorState
          title="فشل في تحميل لوحة التحكم"
          description="حدث خطأ أثناء تحميل بيانات لوحة التحكم. يرجى المحاولة مرة أخرى."
          onRetry={() => {
            projectsQuery.refetch();
            educatorsQuery.refetch();
            usersQuery.refetch();
            requestsQuery.refetch();
            pendingApprovals.refetch();
          }}
          retryLabel="إعادة تحميل البيانات"
        />
      </div>
    );
  }

  const stats = {
    total_projects: projectsQuery.totalItems || recentProjects.length,
    total_educators: educatorsQuery.totalItems || educators.length,
    pending_requests: pendingApprovals.totalItems || approvals.length,
    pending_product_orders: pendingProductOrdersQuery.data ?? 0,
    total_users: usersQuery.totalItems || users.length
  };
  const translateStatus = (status?: string | null) =>
    status ? t(`status.${status.toLowerCase()}`) : '—';
  const statusBadgeClass = (status?: string | null) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
      case 'canceled':
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };
  const formatDate = (date?: string | null) => {
    if (!date) return '—';
    const parsedDate = new Date(date);
    return Number.isNaN(parsedDate.getTime())
      ? '—'
      : new Intl.DateTimeFormat(
          language === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-US',
        ).format(parsedDate);
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
        
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <StatsCardSkeleton key={index} />
          ))
        ) : (
          <>
            <StatsCard
              title="إجمالي المشاريع"
              value={stats.total_projects}
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
              color="bg-[var(--primary-color)]"
              onClick={() => navigateTo('projects')}
            />

            <StatsCard
              title="المتخصصون المسجلون"
              value={stats.total_educators}
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              }
              color="bg-green-500"
              onClick={() => navigateTo('educators')}
            />

            <StatsCard
              title="طلبات التسجيل المعلقة"
              value={stats.pending_requests}
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="bg-yellow-500"
              onClick={() => navigateTo('educatorApplications')}
            />

            <StatsCard
              title="طلبات المنتجات المعلقة"
              value={stats.pending_product_orders}
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              }
              color="bg-orange-500"
            />

            <StatsCard
              title="إجمالي المستخدمين"
              value={stats.total_users}
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              }
              color="bg-purple-500"
              onClick={() => navigateTo('users')}
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              أحدث المشاريع
            </h2>
            <button
              onClick={() => navigateTo('projects')}
              className="text-sm font-medium hover:underline"
              style={{ color: 'var(--primary-color)' }}
            >
              عرض الكل
            </button>
          </div>

          {projectsQuery.isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="animate-pulse flex items-center gap-3">
                  <div className="h-9 w-9 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentProjects.length === 0 ? (
            <EmptyState
              icon={
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
              title="لا توجد مشاريع"
              description="ستظهر المشاريع هنا بعد إضافتها"
            />
          ) : (
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => navigateTo('projectDetail', project.id)}
                  className="w-full flex items-center justify-between gap-3 text-right p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                  title={t('adminDashboard.viewProjectDetails')}
                >
                  <span className="font-medium text-slate-900 dark:text-white truncate">{project.title || 'مشروع بدون عنوان'}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(project.status)}`}>
                      {translateStatus(project.status)}
                    </span>
                  </span>
                </button>
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
            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="h-64 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-700" />
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
            <div className="space-y-5">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('adminDashboard.chartScope', {
                  shown: approvals.length,
                  total: pendingApprovals.totalItems || approvals.length,
                })}
              </p>
              <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
                <section className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {t('adminDashboard.approvalsByPriority')}
                  </h3>
                  <div className="h-56">
                    <Doughnut data={priorityChartData} options={priorityChartOptions} />
                  </div>
                </section>
                <section className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                  <h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {t('adminDashboard.approvalsByType')}
                  </h3>
                  <div className="h-56">
                    <Bar data={typeChartData} options={typeChartOptions} />
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Latest Requests */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {t('adminDashboard.latestRequests')}
          </h2>
          <button
            onClick={() => navigateTo('educationalRequests')}
            className="text-sm font-medium hover:underline"
            style={{ color: 'var(--primary-color)' }}
          >
            {t('adminDashboard.viewAll')}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="px-6 py-3 text-right font-medium">{t('adminDashboard.request')}</th>
                <th className="px-6 py-3 text-right font-medium">{t('adminDashboard.requester')}</th>
                <th className="px-6 py-3 text-right font-medium">{t('adminDashboard.date')}</th>
                <th className="px-6 py-3 text-right font-medium">{t('adminDashboard.status')}</th>
                <th className="px-6 py-3 text-center font-medium">{t('adminDashboard.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {requestsQuery.isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    {Array.from({ length: 5 }).map((__, cellIndex) => (
                      <td key={cellIndex} className="px-6 py-4">
                        <div className="h-4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : latestRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    {t('adminDashboard.noRequests')}
                  </td>
                </tr>
              ) : (
                latestRequests.slice(0, 10).map((request, index) => (
                  <tr key={request.id ?? index} className="text-slate-700 dark:text-slate-200">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigateTo('requestDetail', request.id)}
                        className="font-medium hover:underline"
                        style={{ color: 'var(--primary-color)' }}
                      >
                        {request.title || request.code || '—'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {request.requesterName || request.requester_name || request.requester?.name || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(request.createdAt || request.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(request.status)}`}>
                        {translateStatus(request.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => navigateTo('requestDetail', request.id)}
                        className="inline-flex items-center justify-center rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
                        aria-label={t('adminDashboard.viewRequestDetails')}
                        title={t('adminDashboard.viewRequestDetails')}
                      >
                        <EyeIcon />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
  const { language } = useLanguage();

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
            {typeof value === 'number'
              ? value.toLocaleString(language === 'ar' ? 'ar-u-nu-latn' : 'en-US')
              : value}
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
