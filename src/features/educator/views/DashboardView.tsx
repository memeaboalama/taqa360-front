import React, { useMemo, useState } from 'react';
import { EducatorViewType, Project, Educator, AdminMessage, AdminMessageType, EducatorStatus } from '../../../shared/types';
import { ClockIcon, EnvelopeIcon, AlertCircleIcon, LightBulbIcon, BriefcaseIcon, CheckIcon, DollarSignIcon, ZapIcon, XCircleIcon, EyeIcon, SparklesIcon } from '../../../shared/components/Icons';
import { useAcceptAssignment, useRejectAssignment, useEducatorDashboard, useEducatorNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '../../../core/hooks/useEducatorQueries';
import ConfirmationModal from '../../../shared/components/modals/ConfirmationModal';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface DashboardViewProps {
  navigateTo: (view: EducatorViewType, data?: any) => void;
  projects: Project[];
  educator: Educator;
  adminMessages: AdminMessage[];
  onAcceptInvitation: (projectId: string, taskId: string) => void;
  onDeclineInvitation: (projectId: string, taskId: string) => void;
  isApproved: boolean;
  bids?: any[];
}

const ApprovalStatusBanner: React.FC<{ status: EducatorStatus; navigateTo: (view: 'profile') => void }>=({ status, navigateTo })=>{
  const { t } = useLanguage();
  const bannerInfo = {
    [EducatorStatus.PENDING_REVIEW]: {
      icon: <ClockIcon className="w-5 h-5" />,
      title: t('educatorDashboard.pendingTitle'),
      message: t('educatorDashboard.pendingMessage'),
      color: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700',
    },
    [EducatorStatus.REJECTED]: {
      icon: <XCircleIcon className="w-5 h-5" />,
      title: t('educatorDashboard.rejectedTitle'),
      message: t('educatorDashboard.rejectedMessage'),
      color: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700',
    },
  }[status];
  if (!bannerInfo) return null;
  return (
    <div className={`p-4 rounded-xl border-2 flex items-start gap-4 ${bannerInfo.color} bg-black/5 dark:bg-black/40`}>
      <div className="flex-shrink-0 mt-1">{bannerInfo.icon}</div>
      <div className="flex-grow">
        <h3 className="font-bold">{bannerInfo.title}</h3>
        <p className="text-sm">{bannerInfo.message}</p>
      </div>
      <button onClick={() => navigateTo('profile')} className="flex-shrink-0 text-sm font-semibold hover:underline bg-white/50 dark:bg-black/20 px-3 py-1.5 rounded-md">
        {t('educatorDashboard.viewProfile')}
      </button>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }>=({ title, value, icon })=> (
  <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700">
    <div className="flex items-center">
      <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">{icon}</div>
      <div className="ms-4">
        <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{title}</p>
      </div>
    </div>
  </div>
);

const StatsCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse">
    <div className="flex items-center">
      <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg w-10 h-10" />
      <div className="ms-4 flex-1">
        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-600 rounded mb-2" />
        <div className="h-3 w-24 bg-slate-200 dark:bg-slate-600 rounded" />
      </div>
    </div>
  </div>
);

const TaskCard: React.FC<{
  taskItem: { project: { id?: string; title: string }; task: { id: string; title: string; deadline?: string; subTasks?: any[]; progress?: number } };
  navigateTo: (view: EducatorViewType, data?: any) => void;
  isOverdue?: boolean;
}>=({ taskItem, navigateTo, isOverdue = false })=>{
  const { project, task } = taskItem;
  const progress = useMemo(() => {
    if (typeof task.progress === 'number') {
      const p = Number(task.progress);
      return Math.max(0, Math.min(100, isFinite(p) ? p : 0));
    }
    if (!task.subTasks || task.subTasks.length === 0) return 0;
    const completed = task.subTasks.filter((st: any) => st.completed).length;
    return (completed / task.subTasks.length) * 100;
  }, [task]);

  return (
    <div className={`bg-white dark:bg-slate-800 p-4 rounded-xl border-2 transition-all duration-300 group ${isOverdue ? 'border-red-500/50 hover:border-red-500' : 'border-slate-200 dark:border-slate-700 hover:border-brand-primary'}`}>
      <p className={`text-xs font-semibold ${isOverdue ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>{project.title}</p>
      <h4 className="font-bold text-slate-800 dark:text-white mt-1">{task.title}</h4>
      <div className="my-3">
        <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
          <span>{useLanguage().t('educatorDashboard.progress')}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
          <div className={`${isOverdue ? 'bg-red-500' : 'bg-brand-primary'} h-1.5 rounded-full`} style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <ClockIcon className="w-4 h-4" /> {useLanguage().t('educatorDashboard.deadline')}: {task.deadline || '-'}
        </div>
        <button onClick={() => navigateTo('taskDetail', { taskId: task.id })} className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-all group-hover:bg-brand-primary group-hover:text-white">
          {useLanguage().t('viewDetails')}
        </button>
      </div>
    </div>
  );
};

const mapChannelToMessageType = (channel: any): AdminMessageType => {
  const c = String(channel ?? '').toLowerCase();
  if (c.includes('urgent') || c.includes('عاجل')) return 'urgent';
  if (c.includes('warn') || c.includes('تحذير') || c.includes('تنبيه')) return 'warning';
  return 'info';
};

const AdminMessageItem: React.FC<{ message: AdminMessage }>=({ message })=>{
  const typeInfo: Record<AdminMessageType, { icon: React.ReactNode; color: string }>= {
    urgent: { icon: <AlertCircleIcon className="w-5 h-5 text-red-500" />, color: 'border-red-500 bg-red-50 dark:bg-red-900/20' },
    warning: { icon: <AlertCircleIcon className="w-5 h-5 text-yellow-500" />, color: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' },
    info: { icon: <LightBulbIcon className="w-5 h-5 text-brand-primary" />, color: 'border-brand-primary bg-yellow-50 dark:bg-yellow-900/20' },
  };
  const info = typeInfo[message.type] || typeInfo.info;
  return (
    <div className={`p-3 rounded-lg border-s-4 ${info.color}`}>
      <div className="flex items-start gap-3">
        <div className="mt-1">{info.icon}</div>
        <div>
          <p className="font-bold text-sm text-slate-800 dark:text-white">{message.title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{message.content}</p>
          <p className="text-[10px] text-slate-400 mt-1">{message.timestamp}</p>
        </div>
      </div>
    </div>
  );
};

const DashboardView: React.FC<DashboardViewProps>=({ navigateTo, projects, educator, onAcceptInvitation, onDeclineInvitation, isApproved })=>{
  const { t } = useLanguage();
  const dashboard = useEducatorDashboard();
  const { mutate: acceptAssign } = useAcceptAssignment();
  const { mutate: rejectAssign } = useRejectAssignment();
  const [modalState, setModalState] = useState<{ open: boolean; mode: 'accept' | 'reject'; id: string | null }>({ open: false, mode: 'accept', id: null });

  // Stored educator notifications (notification_news for the logged-in educator).
  // This is the real source: user-scoped, with read/unread state and pagination.
  const [notifPage, setNotifPage] = useState(1);
  const storedNotifications = useEducatorNotifications({ page: notifPage, per_page: 10 });
  const markNotificationRead = useMarkNotificationAsRead();
  const markAllNotificationsRead = useMarkAllNotificationsAsRead();
  const [markingId, setMarkingId] = useState<string | null>(null);

  const storedItems: any[] = Array.isArray((storedNotifications as any)?.data) ? (storedNotifications as any).data : [];
  const storedNotificationsList = storedItems.map((n: any) => ({
    id: String(n?.id ?? ''),
    title: n?.title ?? '',
    message: n?.message ?? n?.body ?? '',
    channel: n?.channel ?? '',
    isRead: Boolean(n?.isRead ?? n?.is_read ?? false),
    timestamp: n?.timestamp ?? n?.created_at ?? '',
  })).filter((n: any) => n.id);
  const unreadCount = storedNotificationsList.filter((n: any) => !n.isRead).length;
  // "رسائل الإدارة" لها نفس المصدر الحقيقي في الباك-إند (notification_news عبر
  // GET /v1/educator/notifications)، ولا يوجد endpoint مستقل لها. لذا نعرض هنا
  // أحدث الإشعارات المخزنة بدل البيانات الوهمية الثابتة (adminMessages prop).
  const adminMessagesReal: AdminMessage[] = useMemo(() => storedNotificationsList.slice(0, 5).map((n: any) => ({
    id: n.id,
    type: mapChannelToMessageType(n.channel),
    title: n.title || t('dashboardView.messagesFromAdmin'),
    content: n.message || '',
    timestamp: n.timestamp || '',
    isRead: n.isRead,
  })), [storedNotificationsList, t]);
  const notifTotalPages = Number((storedNotifications as any)?.totalPages || 1);
  const notifCurrentPage = Number((storedNotifications as any)?.currentPage || notifPage);
  const notifHasNext = Boolean((storedNotifications as any)?.hasNextPage);
  const notifHasPrev = Boolean((storedNotifications as any)?.hasPreviousPage);

  const handleMarkNotificationRead = (id: string) => {
    if (!id || markingId) return;
    setMarkingId(id);
    markNotificationRead.mutate(id, {
      onSuccess: () => setMarkingId(null),
      onError: () => setMarkingId(null),
    } as any);
  };

  const handleMarkAllNotificationsRead = () => {
    if (unreadCount === 0 || markAllNotificationsRead.isPending) return;
    markAllNotificationsRead.mutate(undefined as any);
  };

  const stats = dashboard.data?.stats || {
    active_projects: 0,
    active_tasks: 0,
    overdue_tasks: 0,
    completed_tasks: 0,
    pending_invitations: 0,
    total_earnings: 0,
    success_rate: 0,
    average_rating: 0,
  };

  const recentAssignments = Array.isArray(dashboard.data?.recent_assignments) ? dashboard.data?.recent_assignments : [];
  const activeTasks = Array.isArray(dashboard.data?.active_tasks_list) ? dashboard.data?.active_tasks_list : [];
  const overdueTasks = Array.isArray(dashboard.data?.overdue_tasks_list) ? dashboard.data?.overdue_tasks_list : [];
  const lastBids = Array.isArray((dashboard.data as any)?.last_bids) ? (dashboard.data as any).last_bids : [];
  const pendingOpportunities = Array.isArray((dashboard.data as any)?.pending_opportunities) ? (dashboard.data as any).pending_opportunities.slice(0, 3) : [];

  const mappedActiveTasks = activeTasks.map((t: any) => ({ project: { title: t.project_title }, task: { id: String(t.id), title: t.title || t.task_title, deadline: t.deadline, subTasks: [], progress: typeof t.progress === 'number' ? t.progress : undefined } }));
  const mappedOverdueTasks = overdueTasks.map((t: any) => ({ project: { title: t.project_title }, task: { id: String(t.id), title: t.title || t.task_title, deadline: t.deadline, subTasks: [], progress: typeof t.progress === 'number' ? t.progress : undefined } }));
  const prioritizedTasks = [...mappedOverdueTasks, ...mappedActiveTasks].slice(0, 3);

  const isPending = (a: any) => String(a?.status ?? '').toLowerCase() === 'pending';

  // "New invitations" = invitations still awaiting a decision. Without the
  // status check an accepted or rejected invitation kept showing up here,
  // because the endpoint returns every assignment regardless of status.
  const invitationsOnly = recentAssignments.filter((a: any) => String(a.assigned_type).toLowerCase() === 'invitation' && isPending(a)).slice(0, 3);
  // Once a decision is made the invitation becomes a real assignment, so move it
  // into the second list instead of dropping it from the dashboard.
  const otherAssignments = recentAssignments.filter((a: any) => String(a.assigned_type).toLowerCase() !== 'invitation' || !isPending(a)).slice(0, 3);

  const formatSAR = (val: number | string | null | undefined) => {
    const n = typeof val === 'string' ? Number(val) : val || 0;
    if (!isFinite(n as number)) return `0${t('currency')}`;
    return `${Number(n).toLocaleString()} ${t('currency')}`;
  };

  return (
    <div className="animate-fade-in space-y-6 sm:space-y-8">
      {!isApproved && <ApprovalStatusBanner status={educator.status} navigateTo={navigateTo as any} />}

      <div className="sticky top-0 z-10 -mx-4 px-4 pt-2 pb-4 bg-gradient-to-b to-white/40 dark:from-black/90 dark:to-slate-900/60 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-black">{t('welcomeBack')}, {educator.name.split(' ')[0]}!</h1>
            <p className="text-brand-primary/90 font-semibold mt-1">{t('dashboardSubtitle')}</p>
          </div>
        </div>
        {Number(educator?.profile?.profileCompletion || 0) < 95 && (
          <div className="mt-3 p-3 rounded-xl border border-amber-300 bg-amber-50/90 text-amber-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <AlertCircleIcon className="w-4 h-4" />
              {t('profile.completenessMessage')}
            </div>
            <button onClick={() => navigateTo('profile')} className="px-3 py-1.5 text-xs font-bold bg-brand-primary text-white rounded-lg hover:shadow-glow-primary">{t('educatorDashboard.viewProfile')}</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          {dashboard.isLoading ? (
            <div id="db-stats" className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">{Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)}</div>
          ) : (
            <div id="db-stats" className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <StatCard title={t('activeTasks')} value={stats.active_tasks} icon={<BriefcaseIcon className="w-6 h-6 text-brand-primary" />} />
              <StatCard title={t('tasksView.overdue')} value={stats.overdue_tasks} icon={<ClockIcon className="w-6 h-6 text-brand-primary" />} />
              <StatCard title={t('newInvitations')} value={stats.pending_invitations} icon={<EnvelopeIcon className="w-6 h-6 text-brand-primary" />} />
              <StatCard title={t('educatorDashboard.totalEarnings')} value={formatSAR(stats.total_earnings)} icon={<DollarSignIcon className="w-6 h-6 text-brand-primary" />} />
            </div>
          )}

          <div id="db-invitations">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">{t('newInvitations')}</h2>
              <button onClick={() => navigateTo('assignments', { tab: 'INVITATIONS' })} className="text-sm text-brand-primary hover:underline">{t('all')}</button>
            </div>
            {invitationsOnly.length ? (
              <div className="space-y-3">
                {invitationsOnly.map((a: any) => (
                  <div key={a.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{a.project_title}</p>
                        <h4 className="font-bold text-slate-800 dark:text-white mt-1">{a.task_title}</h4>
                        <p className="text-[11px] text-slate-500 mt-1">{t('dashboardView.invitation')} • {a.assigned_at || ''}</p>
                      </div>
                      <span className="text-[11px] px-2 py-1 rounded bg-yellow-100 text-yellow-700">{a.status}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-bold text-green-600 dark:text-green-400">{t('dashboardView.amount')}: {a.amount ? formatSAR(a.amount) : t('dashboardView.notSpecified')}</p>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button onClick={() => setModalState({ open: true, mode: 'reject', id: a.id })} className="w-full sm:w-auto px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-100 dark:bg-red-900/50 rounded-lg hover:bg-red-200">{t('dashboardView.reject')}</button>
                        <button onClick={() => setModalState({ open: true, mode: 'accept', id: a.id })} className="w-full sm:w-auto px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">{t('dashboardView.accept')}</button>
                        <button onClick={() => { const tid = a.task_id || a.taskId || (a.task && a.task.id) || ''; if (tid) navigateTo('taskDetail', { taskId: tid }); else navigateTo('assignments', { tab: 'INVITATIONS' }); }} className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600">{t('dashboardView.viewDetails')}</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-white dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 text-sm text-slate-500">{t('dashboardView.noRecentInvitations')}</div>
            )}
          </div>

          <div id="db-assignments">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">{t('dashboardView.recentAssignments')}</h2>
              <button onClick={() => navigateTo('assignments', { tab: 'ASSIGNMENTS' })} className="text-sm text-brand-primary hover:underline">{t('dashboardView.viewAll')}</button>
            </div>
            {otherAssignments.length ? (
              <div className="space-y-3">
                {otherAssignments.map((a: any) => (
                  <div key={a.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{a.project_title}</p>
                        <h4 className="font-bold text-slate-800 dark:text-white mt-1">{a.task_title}</h4>
                        <p className="text-[11px] text-slate-500 mt-1">{a.assigned_type === 'from_bid' ? t('dashboardView.fromBid') : a.assigned_type === 'direct' ? t('dashboardView.direct') : t('dashboardView.invitation')}</p>
                      </div>
                      <span className={`text-[11px] px-2 py-1 rounded ${a.status === 'accepted' ? 'bg-green-100 text-green-700' : a.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{a.status}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-bold text-green-600 dark:text-green-400">{t('dashboardView.amount')}: {a.amount ? formatSAR(a.amount) : t('dashboardView.notSpecified')}</p>
                      <button onClick={() => { const tid = a.task_id || a.taskId || (a.task && a.task.id) || ''; if (tid) navigateTo('taskDetail', { taskId: tid }); else navigateTo('assignments', { tab: 'ASSIGNMENTS' }); }} className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600">{t('dashboardView.viewDetails')}</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-white dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 text-sm text-slate-500">{t('dashboardView.noRecentAssignments')}</div>
            )}
          </div>

          <div id="db-tasks">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">{t('dashboardView.tasksInProgress')}</h2>
              <button onClick={() => navigateTo('tasks')} className="text-sm text-brand-primary hover:underline">{t('dashboardView.viewAll')}</button>
            </div>
            {prioritizedTasks.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {prioritizedTasks.map((item, i) => (
                  <TaskCard key={`${item.task.id}-${i}`} taskItem={item} navigateTo={navigateTo} isOverdue={i < mappedOverdueTasks.length} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-white dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboardView.noActiveTasks')}</p>
                <button onClick={() => navigateTo('opportunities')} className="mt-4 text-sm font-semibold text-brand-primary hover:underline">{t('dashboardView.exploreOpportunities')}</button>
              </div>
            )}
          </div>

          <div id="db-opportunities">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">{t('dashboardView.availableOpportunities')}</h2>
              <button onClick={() => navigateTo('opportunities')} className="text-sm text-brand-primary hover:underline">{t('dashboardView.viewAll')}</button>
            </div>
            {pendingOpportunities.length ? (
              <div className="space-y-3">
                {pendingOpportunities.map((op: any) => (
                  <div key={op.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{t('dashboardView.deadline')}: {op.deadline || '-'}</p>
                        <h4 className="font-bold text-slate-800 dark:text-white mt-1">{op.title}</h4>
                        <p className="text-[12px] text-slate-500 mt-1 truncate">{op.description}</p>
                      </div>
                      <span className="text-[11px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">{t('dashboardView.openTasks')}: {op.open_tasks_count ?? 0}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-bold text-green-600 dark:text-green-400">{t('dashboardView.budget')}: {op.budget ? formatSAR(op.budget) : t('dashboardView.notSpecified')}</p>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button onClick={() => navigateTo('opportunityDetail', { projectId: op.id })} className="w-full sm:w-auto px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600">{t('dashboardView.viewDetails')}</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-white dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 text-sm text-slate-500">{t('dashboardView.noOpportunities')}</div>
            )}
          </div>

          <div id="db-bids">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">{t('dashboardView.myRecentBids')}</h2>
              <button onClick={() => navigateTo('proposals')} className="text-sm text-brand-primary hover:underline">{t('dashboardView.viewAll')}</button>
            </div>
            {lastBids.length ? (
              <div className="space-y-3">
                {lastBids.slice(0, 3).map((bid: any) => (
                  <div key={bid.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{bid.project_title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">الإجمالي: <span className="font-semibold">{Number(bid.totalAmount || 0).toLocaleString()} ريال</span></p>
                    </div>
                    <button onClick={() => navigateTo('bidDetail', { bidId: bid.id })} className="text-sm font-semibold text-brand-primary hover:underline flex items-center gap-1"><EyeIcon className="w-4 h-4" /> {t('dashboardView.view')}</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-white dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 text-sm text-slate-500">لا توجد عروض حديثة.</div>
            )}
          </div>

          {stats.pending_invitations > 0 && (
            <div>
              <h2 className="text-lg sm:text-xl font-bold mb-3 text-slate-800 dark:text-white flex items-center gap-2"><ZapIcon className="w-6 h-6 text-brand-primary" />{t('requiredActions')}</h2>
              <div className="p-4 rounded-xl border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 text-sm">{t('dashboardView.pendingInvitationsMessage', {count: stats.pending_invitations})}</div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div id="db-notifications">
            <div className="flex items-center justify-between mb-3 gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                {t('dashboardView.notifications')}
                {unreadCount > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-primary text-white">
                    {t('dashboardView.unreadNotifications', { count: unreadCount })}
                  </span>
                )}
              </h2>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllNotificationsRead}
                  disabled={markAllNotificationsRead.isPending}
                  className="text-xs font-semibold text-brand-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('dashboardView.markAllAsRead')}
                </button>
              )}
            </div>
            {storedNotifications.isLoading && storedNotificationsList.length === 0 ? (
              <div className="space-y-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 animate-pulse">
                    <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-600 rounded mb-2" />
                    <div className="h-3 w-full bg-slate-200 dark:bg-slate-600 rounded mb-1" />
                    <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-600 rounded" />
                  </div>
                ))}
                <p className="text-xs text-slate-400 text-center">{t('dashboardView.loadingNotifications')}</p>
              </div>
            ) : storedNotifications.isError ? (
              <div className="text-center py-8 bg-white dark:bg-slate-800/50 rounded-lg border border-dashed border-red-300 dark:border-red-700">
                <p className="text-sm text-red-500 dark:text-red-400">{t('dashboardView.failedToLoadNotifications')}</p>
                <button onClick={() => storedNotifications.refetch()} className="mt-3 text-xs font-semibold text-brand-primary hover:underline">
                  {t('dashboardView.retry')}
                </button>
              </div>
            ) : storedNotificationsList.length ? (
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="space-y-3">
                  {storedNotificationsList.map((n: any) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-lg border flex items-start gap-3 ${
                        n.isRead
                          ? 'border-slate-200 dark:border-slate-700'
                          : 'border-brand-primary/50 bg-brand-primary/5 dark:bg-brand-primary/10'
                      }`}
                    >
                      <div className="mt-1.5 flex-shrink-0">
                        <span className={`block w-2 h-2 rounded-full ${n.isRead ? 'bg-slate-300 dark:bg-slate-600' : 'bg-brand-primary'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{n.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 whitespace-pre-line">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{n.timestamp}{n.channel ? ` • ${n.channel}` : ''}</p>
                      </div>
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkNotificationRead(n.id)}
                          disabled={markingId === n.id || markNotificationRead.isPending}
                          className="flex-shrink-0 text-[11px] font-semibold text-brand-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {t('dashboardView.markAsRead')}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {notifTotalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setNotifPage((p) => Math.max(1, p - 1))}
                      disabled={!notifHasPrev || storedNotifications.isFetching}
                      className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {t('dashboardView.previous')}
                    </button>
                    <span className="text-[11px] text-slate-400">
                      {t('dashboardView.pageOf', { current: notifCurrentPage, total: notifTotalPages })}
                    </span>
                    <button
                      onClick={() => setNotifPage((p) => p + 1)}
                      disabled={!notifHasNext || storedNotifications.isFetching}
                      className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {t('dashboardView.next')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 bg-white dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboardView.noNewNotifications')}</p>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-bold mb-3 text-slate-800 dark:text-white">{t('dashboardView.messagesFromAdmin')}</h2>
            {storedNotifications.isLoading && adminMessagesReal.length === 0 ? (
              <div className="space-y-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse">
                {[0, 1].map((i) => (
                  <div key={i} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-600 rounded mb-2" />
                    <div className="h-3 w-full bg-slate-200 dark:bg-slate-600 rounded" />
                  </div>
                ))}
              </div>
            ) : storedNotifications.isError && adminMessagesReal.length === 0 ? (
              <div className="text-center py-8 bg-white dark:bg-slate-800/50 rounded-lg border border-dashed border-red-300 dark:border-red-700">
                <p className="text-sm text-red-500 dark:text-red-400">{t('dashboardView.failedToLoadNotifications')}</p>
                <button onClick={() => storedNotifications.refetch()} className="mt-3 text-xs font-semibold text-brand-primary hover:underline">
                  {t('dashboardView.retry')}
                </button>
              </div>
            ) : adminMessagesReal.length ? (
              <div className="space-y-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                {adminMessagesReal.map((msg) => (
                  <AdminMessageItem key={msg.id} message={msg} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-white dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboardView.noNewMessages')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={modalState.open}
        onClose={() => setModalState((s) => ({ ...s, open: false }))}
        onConfirm={(note) => {
          const id = modalState.id;
          const mode = modalState.mode;
          setModalState({ open: false, mode, id: null });
          if (id) {
            if (mode === 'accept') acceptAssign({ assignmentId: id, note });
            // Same dialog as the assignments screen: declining asks for a reason
            // and it is stored as the rejection reason.
            else rejectAssign({ assignmentId: id, reason: note });
          }
        }}
        title={modalState.mode === 'accept' ? 'تأكيد قبول التعيين' : 'تأكيد رفض التعيين'}
        message={modalState.mode === 'accept' ? 'يمكنك إضافة ملاحظة اختيارية للإدارة.' : 'يرجى كتابة سبب الرفض، وسيظهر للإدارة.'}
        confirmText={modalState.mode === 'accept' ? 'قبول' : 'رفض'}
        cancelText="إلغاء"
        icon={modalState.mode === 'accept' ? <CheckIcon className="w-8 h-8" /> : <XCircleIcon className="w-8 h-8" />}
        isReasonRequired={modalState.mode === 'reject'}
        reasonLabel="سبب الرفض"
        confirmButtonClass={modalState.mode === 'accept' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
      />

    </div>
  );
};

export default DashboardView;
