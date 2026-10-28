import React, { useState } from 'react';
import { EducatorViewType } from '../../../shared/types';
import { ArrowLeftIcon, CheckIcon, XCircleIcon, ClockIcon, DollarSignIcon, ClipboardListIcon } from '../../../shared/components/Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { useAcceptAssignment, useRejectAssignment } from '../../../core/hooks/useEducatorQueries';
import ConfirmationModal from '../../../shared/components/modals/ConfirmationModal';

export type AssignmentDetailAssignment = {
  id: string;
  assigned_type: string;
  status: string;
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
    description?: string;
    deadline?: string;
  };
};

interface AssignmentDetailViewProps {
  assignment?: AssignmentDetailAssignment | null;
  navigateTo: (view: EducatorViewType, ctx?: any) => void;
  addToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const chip = (label: string, tone: 'green' | 'red' | 'yellow' | 'purple') => {
  const tones = {
    green: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
    red: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
    yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
    purple: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
  };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${tones[tone]}`}>{label}</span>;
};

const statusChip = (status: string, t: (k: string) => string) => {
  switch ((status || '').toLowerCase()) {
    case 'accepted':
      return chip(t('assignments.accepted'), 'green');
    case 'rejected':
      return chip(t('assignments.rejected'), 'red');
    default:
      return chip(t('assignments.pending'), 'yellow');
  }
};

const typeChip = (type: string, t: (k: string) => string) => {
  switch ((type || '').toLowerCase()) {
    case 'invitation':
      return chip(t('assignments.invitation'), 'green');
    case 'direct':
      return chip(t('assignments.direct'), 'purple');
    case 'from_bid':
      return chip(t('assignments.from_bid'), 'yellow');
    default:
      return null;
  }
};

const validDate = (d?: string | null) => (d && /^\d{4}-\d{2}-\d{2}$/.test(d) && Number(d.slice(0, 4)) >= 1000) ? d : null;

const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{label}</span>
    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{value}</span>
  </div>
);

const AssignmentDetailView: React.FC<AssignmentDetailViewProps> = ({ assignment, navigateTo, addToast }) => {
  const { t } = useLanguage();
  const { mutateAsync: acceptAssign } = useAcceptAssignment();
  const { mutateAsync: rejectAssign } = useRejectAssignment();
  const [modalState, setModalState] = useState<{ open: boolean; mode: 'accept' | 'reject' }>({ open: false, mode: 'accept' });

  if (!assignment || !assignment.task) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{t('assignments.detail_title')}</h1>
        <p className="text-red-500 text-sm">{t('assignments.detail_not_found')}</p>
      </div>
    );
  }

  const isPending = String(assignment.status ?? '').toLowerCase() === 'pending';
  const isAccepted = String(assignment.status ?? '').toLowerCase() === 'accepted';
  const isRejected = String(assignment.status ?? '').toLowerCase() === 'rejected';

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <button
        onClick={() => navigateTo('assignments')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-primary"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        {t('assignments.back_to_assignments')}
      </button>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{t('assignments.detail_title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{assignment.projectTitle}</p>
      </div>

      {isPending && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 p-4">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">{t('assignments.pending_decision_notice')}</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-bold text-slate-900 dark:text-white">{assignment.task.title}</p>
          <div className="flex items-center gap-1">{statusChip(assignment.status, t)}{typeChip(assignment.assigned_type, t)}</div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <ClockIcon className="w-4 h-4" /> {t('assignments.deadline')}:
            <span className="font-semibold ms-1">{validDate(assignment.task.deadline) || '-'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <DollarSignIcon className="w-4 h-4" /> {t('assignments.amount')}:
            <span className="font-semibold ms-1">
              {assignment.amount ? assignment.amount.toLocaleString() + ' ' + t('currency') : t('assignments.not_set')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <ClipboardListIcon className="w-4 h-4" /> {t('assignments.task_status')}:
            <span className="font-semibold ms-1">{t(`status.${(assignment.task.status || '').toUpperCase()}`)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Field label={t('assignments.assignment_type')} value={typeChip(assignment.assigned_type, t) ?? '-'} />
          <Field label={t('assignments.assignment_status')} value={statusChip(assignment.status, t)} />
          <Field label={t('assignments.assigned_at')} value={validDate(assignment.assigned_at) || '-'} />
          <Field label={t('assignments.accepted_at')} value={validDate(assignment.accepted_at) || '-'} />
          <div className="sm:col-span-2">
            <Field label={t('assignments.agreement_notes')} value={assignment.agreementNotes || '-'} />
          </div>
          {isRejected && (
            <div className="sm:col-span-2">
              <Field label={t('assignments.rejection_reason')} value={assignment.rejectionReason || '-'} />
            </div>
          )}
        </div>
      </div>

      {/* The task stays out of reach until the assignment is accepted, which is
          what the notice above tells the specialist. */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
        {isPending && (
          <>
            <button
              onClick={() => setModalState({ open: true, mode: 'reject' })}
              className="px-4 py-2 text-xs font-semibold text-red-600 bg-red-100 dark:bg-red-900/50 rounded-lg hover:bg-red-200"
            >
              {t('assignments.reject')}
            </button>
            <button
              onClick={() => setModalState({ open: true, mode: 'accept' })}
              className="px-4 py-2 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              {t('assignments.accept')}
            </button>
          </>
        )}
        {isAccepted && (
          <button
            onClick={() => navigateTo('taskDetail', { taskId: assignment.task.id })}
            className="px-3 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            {t('assignments.view_task_details')}
          </button>
        )}
      </div>

      <ConfirmationModal
        isOpen={modalState.open}
        onClose={() => setModalState(s => ({ ...s, open: false }))}
        onConfirm={async (note) => {
          if (!assignment) return;
          try {
            if (modalState.mode === 'accept') {
              await acceptAssign({ assignmentId: assignment.id, note });
              addToast?.(t('toasts.invitationAccepted'), 'success');
            } else {
              await rejectAssign({ assignmentId: assignment.id, reason: note });
              addToast?.(t('toasts.invitationDeclined'), 'success');
            }
            setModalState({ open: false, mode: modalState.mode });
          } catch (e: any) {
            const msg = e?.response?.data?.message || e?.message || t('assignments.error_loading');
            addToast?.(String(msg), 'error');
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

export default AssignmentDetailView;
