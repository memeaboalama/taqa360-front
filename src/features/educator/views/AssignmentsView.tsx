import React, { useMemo, useState } from 'react';
import { EducatorViewType } from '../../../shared/types';
import { CheckIcon, XCircleIcon, ClockIcon, DollarSignIcon, ClipboardListIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../shared/components/Icons';
import { useAcceptAssignment, useRejectAssignment, useEducatorAssignments } from '../../../core/hooks/useEducatorQueries';
import ConfirmationModal from '../../../shared/components/modals/ConfirmationModal';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface AssignmentsViewProps {
  navigateTo: (view: EducatorViewType, ctx?: any) => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

type ApiAssignmentItem = {
  id: string;
  assigned_type: 'direct' | 'from_bid' | 'invitation' | string;
  status: 'pending' | 'accepted' | 'rejected' | string;
  amount: number | null;
  agreementNotes?: string | null;
  rejectionReason?: string | null;
  assigned_at?: string | null;
  accepted_at?: string | null;
  projectTitle: string;
  task: {
    id: string;
    title: string;
    status: string;
    tags?: string[] | null;
    description?: string;
    deadline?: string;
  };
};

const statusChip = (status: string, t: (k: string) => string) => {
  const base = 'text-[10px] font-semibold px-2 py-0.5 rounded';
  switch ((status || '').toLowerCase()) {
    case 'accepted':
      return <span className={`${base} bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300`}>{t('assignments.accepted')}</span>;
    case 'rejected':
      return <span className={`${base} bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300`}>{t('assignments.rejected')}</span>;
    default:
      return <span className={`${base} bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300`}>{t('assignments.pending')}</span>;
  }
};

const typeChip = (type: string, t: (k: string) => string) => {
  const base = 'text-[10px] font-semibold px-2 py-0.5 rounded';
  switch ((type || '').toLowerCase()) {
    case 'invitation':
      return <span className={`${base} bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300`}>{t('assignments.invitation')}</span>;
    case 'direct':
      return <span className={`${base} bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300`}>{t('assignments.direct')}</span>;
    case 'from_bid':
      return <span className={`${base} bg-yellow-50 text-yellow-800`}>{t('assignments.from_bid')}</span>;
    default:
      return null;
  }
};

const validDate = (d?: string | null) => (d && /^\d{4}-\d{2}-\d{2}$/.test(d) && Number(d.slice(0, 4)) >= 1000) ? d : null;

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

const Row: React.FC<{
  item: ApiAssignmentItem;
  onOpen: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
}> = ({ item, onOpen, onAccept, onDecline }) => {
  const { t } = useLanguage();
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-bold text-slate-900 dark:text-white">{item.task.title}</p>
          <div className="flex items-center gap-1">{statusChip(item.status, t)} {typeChip(item.assigned_type, t)}</div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{item.projectTitle}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><ClockIcon className="w-4 h-4" /> {t('assignments.deadline')}: <span className="font-semibold ms-1">{validDate(item.task.deadline) || '-'}</span></div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><DollarSignIcon className="w-4 h-4" /> {t('assignments.amount')}: <span className="font-semibold ms-1">{item.amount !== null && item.amount !== undefined ? Number(item.amount).toLocaleString() + ' ' + t('taskDetail.sarCurrency') : t('assignments.not_set')}</span></div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">{t('assignments.task_status')}: <span className="font-semibold ms-1">{t(`status.${(item.task.status || '').toUpperCase()}`)}</span></div>
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">{t('assignments.agreement_notes')}: <span className="font-semibold ms-1">{item.agreementNotes || '-'}</span></div>
      </div>
      {String(item.status || '').toLowerCase() === 'rejected' && item.rejectionReason && (
        <div className="mt-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-xs text-red-700 dark:text-red-300">
          <span className="font-semibold">{t('assignments.rejection_reason')}: </span>{item.rejectionReason}
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-500"><ClipboardListIcon className="w-4 h-4" /> {t('assignments.assigned_at')}: <span className="font-semibold">{validDate(item.assigned_at) || '-'}</span></div>
        <div className="flex items-center gap-2">
          {item.status === 'pending' && (
            <>
              <button onClick={onDecline} className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-100 dark:bg-red-900/50 rounded-lg hover:bg-red-200">{t('assignments.reject')}</button>
              <button onClick={onAccept} className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">{t('assignments.accept')}</button>
            </>
          )}
          <button onClick={onOpen} className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600">{t('assignments.view_details')}</button>
        </div>
      </div>
    </div>
  );
};

const AssignmentsView: React.FC<AssignmentsViewProps> = ({ navigateTo, addToast }) => {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'INVITATIONS' | 'ASSIGNMENTS'>('INVITATIONS');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const assignmentsQuery = useEducatorAssignments({ page, per_page: perPage, type: tab === 'INVITATIONS' ? 'invitation' : 'assignment' });
  const { mutateAsync: acceptAssign } = useAcceptAssignment();
  const { mutateAsync: rejectAssign } = useRejectAssignment();

  const [modalState, setModalState] = useState<{ open: boolean; mode: 'accept' | 'reject'; id: string | null }>({ open: false, mode: 'accept', id: null });

  const list: ApiAssignmentItem[] = useMemo(() => {
    const items = assignmentsQuery.data as ApiAssignmentItem[];
    if (!Array.isArray(items)) return [];
    // An accepted invitation is no longer an invitation, so it leaves this tab.
    // A rejected one stays listed exactly as before, and the direct assignments
    // tab is never filtered.
    return tab === 'INVITATIONS'
      ? items.filter((i) => String(i.status ?? '').toLowerCase() !== 'accepted')
      : items;
  }, [assignmentsQuery.data, tab]);

  const counts = assignmentsQuery.counts as any;
  const invitationsCount = Number(counts?.invitations ?? 0);
  const assignmentsCount = Number(counts?.assignments ?? 0);

  const pageMeta = assignmentsQuery.pagination?.meta?.page;

  const handleTabChange = (next: 'INVITATIONS' | 'ASSIGNMENTS') => {
    setTab(next);
    setPage(1);
  };

  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPerPage(Number(e.target.value));
    setPage(1);
  };

  const goToPage = (p: number) => {
    const target = Math.max(1, Math.min(p, pageMeta?.last || p));
    setPage(target);
  };

  // Before a decision the row is an assignment offer, so its details are shown
  // as such. A rejection is also kept on that screen because it is where the
  // specialist reads back the reason they gave. Once accepted, the specialist
  // works on the task itself.
  const handleOpen = (item: ApiAssignmentItem) => {
    const status = String(item.status ?? '').toLowerCase();
    if (status === 'pending' || status === 'rejected') {
      navigateTo('assignmentDetail', { assignment: item });
      return;
    }
    navigateTo('taskDetail', { taskId: item.task.id });
  };

  if (assignmentsQuery.isLoading) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{t('assignments.title')}</h1>
        <div className="flex items-center justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-6 w-6" style={{ borderBottom: '2px solid var(--primary-color)' }}></div>
          <span className="ms-2 text-sm text-slate-600 dark:text-slate-400">{t('loading')}</span>
        </div>
      </div>
    );
  }

  if (assignmentsQuery.error) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{t('assignments.title')}</h1>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-800 p-6 text-center space-y-3">
          <p className="text-red-500 text-sm">{t('assignments.error_loading')}</p>
          <button
            onClick={() => assignmentsQuery.refetch?.()}
            className="px-4 py-2 text-sm font-semibold text-white rounded-lg bg-brand-primary hover:opacity-90"
          >
            {t('retry') || 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{t('assignments.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('assignments.subtitle')}</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2 sm:p-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button onClick={() => handleTabChange('INVITATIONS')} className={`px-3 py-2 text-sm font-semibold rounded-lg ${tab === 'INVITATIONS' ? 'bg-brand-primary text-white' : 'text-slate-600 dark:text-slate-300'}`}>{t('assignments.tab_invitations', { count: invitationsCount })}</button>
            <button onClick={() => handleTabChange('ASSIGNMENTS')} className={`px-3 py-2 text-sm font-semibold rounded-lg ${tab === 'ASSIGNMENTS' ? 'bg-brand-primary text-white' : 'text-slate-600 dark:text-slate-300'}`}>{t('assignments.tab_assignments', { count: assignmentsCount })}</button>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {assignmentsQuery.isFetching && list.length > 0 && (
          <div className="col-span-full text-center text-xs text-slate-500 dark:text-slate-400">{t('loading')}</div>
        )}
        {list.map((item) => (
          <Row key={item.id}
            item={item}
            onOpen={() => handleOpen(item)}
            onAccept={() => setModalState({ open: true, mode: 'accept', id: item.id })}
            onDecline={() => setModalState({ open: true, mode: 'reject', id: item.id })}
          />
        ))}
        {list.length === 0 && !assignmentsQuery.isFetching && (
          <div className="col-span-full text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500">{t('assignments.empty')}</div>
        )}
      </div>

      {!assignmentsQuery.isLoading && pageMeta && pageMeta.total > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border dark:border-slate-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {t('projectsView.showingResults', {
                from: pageMeta.from,
                to: pageMeta.to,
                total: pageMeta.total
              })}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={!pageMeta.isPrevious}
                className="p-3 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
              <div className="flex gap-2 items-center">
                {buildPageList(pageMeta.current, pageMeta.last).map((p, idx) => {
                  if (p === '...') return <div key={`dots-${idx}`} className="px-2">...</div>;
                  const pg = Number(p);
                  const isActive = pg === pageMeta.current;
                  return (
                    <button key={pg} onClick={() => goToPage(pg)} className={`px-3 py-2 text-sm rounded-lg ${isActive ? 'text-white' : 'border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`} style={isActive ? { backgroundColor: 'var(--primary-color)' } : {}}>
                      {pg}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => goToPage(page + 1)}
                disabled={!pageMeta.isNext}
                className="p-3 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={modalState.open}
        onClose={() => setModalState(s => ({ ...s, open: false }))}
        onConfirm={async (note) => {
          const id = modalState.id;
          const mode = modalState.mode;
          if (!id) return;
          try {
            if (mode === 'accept') {
              await acceptAssign({ assignmentId: id, note });
              addToast(t('toasts.invitationAccepted'), 'success');
            } else {
              // The modal only renders the field when it is required, so for a
              // decline this is the reason the admin will read back.
              await rejectAssign({ assignmentId: id, reason: note });
              addToast(t('toasts.invitationDeclined'), 'success');
            }
            setModalState({ open: false, mode, id: null });
          } catch (e: any) {
            const msg = e?.response?.data?.message || e?.message || t('assignments.error_loading');
            addToast(String(msg), 'error');
            throw e;
          }
        }}
        title={modalState.mode === 'accept' ? t('assignments.modal_accept_title') : t('assignments.modal_reject_title')}
        message={modalState.mode === 'accept' ? t('assignments.modal_accept_message') : t('assignments.modal_reject_message')}
        confirmText={modalState.mode === 'accept' ? t('assignments.accept') : t('assignments.reject')}
        cancelText={t('assignments.cancel')}
        icon={modalState.mode === 'accept' ? <CheckIcon className="w-8 h-8" /> : <XCircleIcon className="w-8 h-8" />}
        isReasonRequired={modalState.mode === 'reject'}
        reasonLabel={modalState.mode === 'reject' ? t('assignments.rejection_reason') : t('assignments.note')}
        confirmButtonClass={modalState.mode === 'accept' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
      />
    </div>
  );
};

export default AssignmentsView;
