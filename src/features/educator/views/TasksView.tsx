import React, { useMemo, useState } from 'react';
import { EducatorViewType } from '../../../shared/types';
import { BriefcaseIcon, CheckCircleIcon, ClockIcon, AlertCircleIcon, FilterIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../shared/components/Icons';
import { useEducatorTasksList } from '../../../core/hooks/useEducatorQueries';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface TasksViewProps {
  navigateTo: (view: EducatorViewType, ctx?: any) => void;
}

type ApiTaskItem = {
  id: string;
  title: string;
  description: string;
  status: string;
  budget: number | null;
  deadline: string;
  progress?: number;
  subTasksCount?: number;
  completedSubTasksCount?: number;
  assignedEducator?: {
    id: string;
    assigned_type: string;
    status: string;
    amount: number | null;
    assigned_at?: any;
  };
  project: { id: string; title: string };
};

type StatusFilter = 'ALL' | 'RECENT' | 'IN_PROGRESS' | 'OVERDUE' | 'COMPLETED';

const buildPageList = (current: number, last: number, maxVisible = 7) => {
    if (!last || last <= 1) return [];
    const pages: (number | string)[] = [];
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(last, current + half);
    if (end - start + 1 < maxVisible) {
        start = Math.max(1, Math.min(start, last - maxVisible + 1));
        end = Math.min(last, start + maxVisible - 1);
    }
    if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
    }
    for (let p = start; p <= end; p++) pages.push(p);
    if (end < last) {
        if (end < last - 1) pages.push('...');
        pages.push(last);
    }
    return pages;
};

const TasksView: React.FC<TasksViewProps> = ({ navigateTo }) => {
  const { t } = useLanguage();
  const [active, setActive] = useState<StatusFilter>('ALL');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const tasksQuery = useEducatorTasksList({});

  const allTasks: ApiTaskItem[] = useMemo(() => {
    const payload: any = tasksQuery.data as any;
    const items: ApiTaskItem[] = (payload?.data?.tasks || payload?.tasks || payload || []) as ApiTaskItem[];
    return Array.isArray(items) ? items : [];
  }, [tasksQuery.data]);

  const filtered = useMemo(() => {
    const now = new Date().toISOString().split('T')[0];
    let list = [...allTasks];

    if (active === 'RECENT') {
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      list = list.filter((t) => (t as any).created_at ? String((t as any).created_at).slice(0,10) >= twoWeeksAgo : true);
    } else if (active === 'IN_PROGRESS') {
      list = list.filter((t) => (t.status || '').toUpperCase() === 'IN_PROGRESS');
    } else if (active === 'OVERDUE') {
      list = list.filter((t) => (t.status || '').toUpperCase() === 'IN_PROGRESS' && t.deadline && t.deadline < now);
    } else if (active === 'COMPLETED') {
      list = list.filter((t) => (t.status || '').toUpperCase() === 'COMPLETED');
    }

    if (from) list = list.filter((t) => (t as any).created_at ? String((t as any).created_at).slice(0,10) >= from : true);
    if (to) list = list.filter((t) => (t as any).created_at ? String((t as any).created_at).slice(0,10) <= to : true);
    if (search.trim()) list = list.filter((t) => t.title.includes(search) || t.project.title.includes(search));
    return list;
  }, [allTasks, active, from, to, search]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const safePage = Math.min(page, totalPages);
  const paginatedTasks = useMemo(() => {
    const start = (safePage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, safePage, perPage]);

  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPerPage(Number(e.target.value));
    setPage(1);
  };

  const goToPage = (p: number) => {
    setPage(Math.max(1, Math.min(p, totalPages)));
  };

  const statusLabel: Record<StatusFilter, string> = {
    ALL: t('tasksView.allTasks'),
    RECENT: t('tasksView.recentlyAdded'),
    IN_PROGRESS: t('tasksView.inProgress'),
    OVERDUE: t('tasksView.overdue'),
    COMPLETED: t('tasksView.completed'),
  };

  const badgeForStatus = (status: string) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'IN_PROGRESS':
        return <span className="text-[10px] font-semibold text-yellow-800 bg-yellow-50 px-1.5 py-0.5 rounded">{t('tasksView.inProgress')}</span>;
      case 'COMPLETED':
        return <span className="text-[10px] font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900 px-1.5 py-0.5 rounded">{t('tasksView.completed')}</span>;
      case 'CANCELED':
        return <span className="text-[10px] font-semibold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 px-1.5 py-0.5 rounded">{t('tasksView.canceled')}</span>;
      default:
        return <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{t('tasksView.pendingStart')}</span>;
    }
  };

  const TaskRow: React.FC<{ task: ApiTaskItem; onOpen: () => void; }> = ({ task, onOpen }) => {
    const progress = Math.max(0, Math.min(100, Math.round(task.progress ?? 0)));
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-slate-900 dark:text-white">{task.title}</p>
            <div className="flex items-center gap-1">{badgeForStatus(task.status)}</div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{task.project.title}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><ClockIcon className="w-4 h-4"/> {t('tasksView.deadline')}: <span className="font-semibold ms-1">{task.deadline || '-'}</span></div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><BriefcaseIcon className="w-4 h-4"/> {t('tasksView.budget')}: <span className="font-semibold ms-1">{task.budget ? task.budget.toLocaleString() + ' ' + t('tasksView.sarCurrency') : t('tasksView.notSet')}</span></div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><CheckCircleIcon className="w-4 h-4"/> {t('tasksView.progress')}: <span className="font-semibold ms-1">{progress}%</span></div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><AlertCircleIcon className="w-4 h-4"/> {t('tasksView.status')}: <span className="font-semibold ms-1">{task.status}</span></div>
        </div>
        <div className="mt-3">
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
            <div className="bg-brand-primary h-1.5 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
          <span className="text-xs text-slate-500">{t('tasksView.agreedAmount')}: <strong>{task.assignedEducator?.amount ? task.assignedEducator.amount.toLocaleString() + ' ' + t('tasksView.sarCurrency') : t('tasksView.notSet')}</strong></span>
          <button onClick={onOpen} className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600">{t('tasksView.viewDetails')}</button>
        </div>
      </div>
    );
  };

  if (tasksQuery.isLoading) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{t('tasksView.allTasks')}</h1>
        <p className="text-slate-500 dark:text-slate-400">{t('tasksView.manageTasksFilterByStatusAndDate')}</p>
        <div className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-6 w-6" style={{ borderBottom: '2px solid var(--primary-color)' }}></div>
          <span className="ms-2 text-sm text-slate-600 dark:text-slate-400">{t('loading')}</span>
        </div>
      </div>
    );
  }

  if (tasksQuery.error) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{t('tasksView.allTasks')}</h1>
        <p className="text-red-500 text-sm">{t('tasksView.failedToLoadData')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{t('tasksView.allTasks')}</h1>
      <p className="text-slate-500 dark:text-slate-400 -mt-4">{t('tasksView.manageTasksFilterByStatusAndDate')}</p>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(statusLabel) as StatusFilter[]).map(key => (
              <button key={key} onClick={() => { setActive(key); setPage(1); }} className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${active === key ? 'bg-brand-primary text-white border-brand-primary' : 'text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600'}`}>{statusLabel[key]}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{t('projectsView.perPage')}:</label>
            <select value={perPage} onChange={handlePerPageChange} className="bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded text-sm py-2 px-2">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4">
          <input placeholder={t('tasksView.searchTaskOrProject')} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="px-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600" />
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-2 text-xs"><FilterIcon className="w-4 h-4"/> {t('tasksView.filterByDate')}</div>
          <input type="date" value={from} onChange={e => { setFrom(e.target.value); setPage(1); }} className="px-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600" />
          <input type="date" value={to} onChange={e => { setTo(e.target.value); setPage(1); }} className="px-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {paginatedTasks.map((task) => (
          <TaskRow key={task.id} task={task} onOpen={() => navigateTo('taskDetail', { taskId: task.id })} />
        ))}
        {paginatedTasks.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500">{t('tasksView.noTasksMatchSearch')}</div>
        )}
      </div>

      {totalItems > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {t('projectsView.showingResults', {
                from: (safePage - 1) * perPage + 1,
                to: Math.min(safePage * perPage, totalItems),
                total: totalItems
              })}
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => goToPage(page - 1)} disabled={page <= 1} className="p-3 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700">
                <ChevronRightIcon className="w-4 h-4" />
              </button>
              <div className="flex gap-2 items-center">
                {buildPageList(safePage, totalPages).map((p, idx) => {
                  if (p === '...') return <div key={`dots-${idx}`} className="px-2">...</div>;
                  const pg = Number(p);
                  const isActive = pg === safePage;
                  return (
                    <button key={pg} onClick={() => goToPage(pg)} className={`px-3 py-2 text-sm rounded-lg ${isActive ? 'text-white' : 'border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`} style={isActive ? { backgroundColor: 'var(--primary-color)' } : {}}>
                      {pg}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages} className="p-3 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700">
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksView;
