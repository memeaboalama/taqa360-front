import React, { useEffect, useMemo, useState } from 'react';
import { Assignment, AssignmentStatus } from '../../../../shared/types';
import { XIcon, CheckCircleIcon } from '../../../../shared/components/Icons';
import { useAcceptAssignment, useRejectAssignment, useUpdateAssignmentStatus } from '../../../projects/hooks/useProjectQueries';

interface EditAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Task that owns the assignment, so the list can be refreshed on save. */
  taskId?: string;
  /** Project that owns the task; the admin screen is keyed by it. */
  projectId?: string;
  assignment: Assignment & { assignedAt?: string | null; acceptedAt?: string | null } & { educator?: { id: string; name: string; avatarUrl?: string | null } | null };
}

/**
 * The API stores the status lowercase ('accepted') while the enum is uppercase.
 * ProjectDetailView already normalises it, but this component should not depend
 * on that, so it maps defensively.
 */
const toStatusEnum = (value: string | null | undefined): AssignmentStatus => {
  const upper = String(value ?? '').toUpperCase();
  return (Object.values(AssignmentStatus) as string[]).includes(upper)
    ? (upper as AssignmentStatus)
    : AssignmentStatus.PENDING;
};

const EditAssignmentModal: React.FC<EditAssignmentModalProps> = ({ isOpen, onClose, taskId, projectId, assignment }) => {
  const [status, setStatus] = useState<AssignmentStatus>(AssignmentStatus.PENDING);
  const [reason, setReason] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSuccess = () => {
    setError('');
    onClose();
  };
  const handleError = (e: Error) => {
    setError(e?.message || 'تعذّر حفظ التغييرات، حاول مرة أخرى.');
  };

  const acceptMutation = useAcceptAssignment({ onSuccess: handleSuccess, onError: handleError });
  const rejectMutation = useRejectAssignment({ onSuccess: handleSuccess, onError: handleError });
  const updateStatusMutation = useUpdateAssignmentStatus({ onSuccess: handleSuccess, onError: handleError });

  const isSubmitting = useMemo(() => acceptMutation.isPending || rejectMutation.isPending || updateStatusMutation.isPending, [acceptMutation.isPending, rejectMutation.isPending, updateStatusMutation.isPending]);

  // Re-seed the form every time the modal opens (or the assignment changes).
  useEffect(() => {
    if (!isOpen) return;

    setStatus(toStatusEnum(assignment?.status));

    // Each field now has its own column (agreement_notes / rejection_reason), so
    // they round-trip independently instead of overwriting each other.
    setReason(assignment?.rejectionReason ?? '');
    setMessage(assignment?.agreementNotes ?? '');
    setError('');
  }, [isOpen, assignment?.id, assignment?.status, assignment?.agreementNotes, assignment?.rejectionReason]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignment?.id) return;

    const trimmedReason = reason.trim();
    const trimmedMessage = message.trim();

    // Both boxes are editable for every status, so BOTH must be sent on every
    // branch. Sending only the field that matches the status silently dropped
    // the other one.
    if (status === AssignmentStatus.REJECTED) {
      rejectMutation.mutate({
        assignmentId: assignment.id,
        reason: trimmedReason || undefined,
        agreement_notes: trimmedMessage || undefined,
        taskId,
        projectId,
      });
    } else if (status === AssignmentStatus.ACCEPTED) {
      acceptMutation.mutate({
        assignment_id: assignment.id,
        agreement_notes: trimmedMessage || undefined,
        rejection_reason: trimmedReason || undefined,
        taskId,
        projectId,
      });
    } else {
      updateStatusMutation.mutate({
        assignmentId: assignment.id,
        status,
        agreement_notes: trimmedMessage || undefined,
        rejection_reason: trimmedReason || undefined,
        taskId,
        projectId,
      });
    }
  };

  const educatorName = assignment?.educator ? assignment.educator.name : '';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg p-6 border dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">تعديل التعيين</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="w-5 h-5 text-gray-400"/></button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">يمكنك تغيير حالة التعيين وإضافة سبب اختياري أو رسالة للمتخصص.</p>

        {educatorName && (
          <div className="mb-4 text-sm text-gray-700 dark:text-gray-300"><span className="font-semibold">المتخصص: </span>{educatorName}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/30 px-3 py-2 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">الحالة الجديدة</label>
            <div className="grid grid-cols-3 gap-2">
              {[AssignmentStatus.ACCEPTED, AssignmentStatus.PENDING, AssignmentStatus.REJECTED].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`px-3 py-2 text-sm font-semibold rounded-lg border dark:border-gray-600 ${status === s ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">السبب (اختياري)</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              placeholder="اكتب سبب تغيير الحالة إن رغبت"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">رسالة للمتخصص (اختيارية)</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-900 text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              placeholder="اكتب رسالة ستُحفظ ضمن ملاحظات الاتفاق عند القبول"
            />
            <p className="text-[11px] text-gray-500 mt-1">يتم حفظ الرسالة كـ "ملاحظات اتفاق" عند اختيار حالة "مقبول".</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">إلغاء</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircleIcon className="w-4 h-4" /> {isSubmitting ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAssignmentModal;
