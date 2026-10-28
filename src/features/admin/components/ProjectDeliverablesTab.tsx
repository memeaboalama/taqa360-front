import React from 'react';
import {
  PaperclipIcon,
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
} from '../../../shared/components/Icons';
import { useProjectDeliverables } from '../../../core/hooks/useAdminQueries';

interface Props {
  projectId: string;
}

const formatSize = (bytes: number | string | null | undefined): string => {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return '-';
  const units = ['بايت', 'ك.ب', 'م.ب', 'ج.ب'];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
};

const statusLabel = (status: string): { label: string; color: string } => {
  switch (String(status).toLowerCase()) {
    case 'completed':
      return { label: 'منجزة', color: 'bg-green-100 text-green-700' };
    case 'in_progress':
      return { label: 'قيد التنفيذ', color: 'bg-blue-100 text-blue-700' };
    case 'on_hold':
    case 'onhold':
      return { label: 'متوقفة', color: 'bg-yellow-100 text-yellow-700' };
    default:
      return { label: 'قيد الانتظار', color: 'bg-gray-100 text-gray-600' };
  }
};

/**
 * Read-only view of what the specialists delivered from educator/taskDetail.
 *
 * These files live in task_files (attached to the task) while the project's own
 * attachments live in project_files, so the "المرفقات" tab could not show them.
 */
const ProjectDeliverablesTab: React.FC<Props> = ({ projectId }) => {
  const query = useProjectDeliverables(projectId);

  const data: any = query.data;
  const groups: any[] = Array.isArray(data?.groups) ? data.groups : [];
  const withFiles = groups.filter((g) => g.files.length > 0);
  const totalFiles: number = Number(data?.counts?.files ?? withFiles.reduce((s, g) => s + g.files.length, 0));
  // useBaseQuery wraps useQuery, so the standard flags are available. Use
  // isFetching rather than isLoading: with `enabled: false` a query stays
  // "pending" in react-query v5 and isLoading never flips, which would leave the
  // tab spinning forever.
  const isLoading = (query as any).isFetching === true;
  // A failed request (e.g. the endpoint is not deployed yet) must not be shown
  // as "no deliverables", otherwise a 404 is indistinguishable from empty data.
  const error = (query as any).error as any;
  const isFetching = (query as any).isFetching;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-gray-500">
        <span className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-brand-primary rounded-full me-2" />
        جارٍ تحميل المخرجات...
      </div>
    );
  }

  if (error) {
    const status = error?.status ?? error?.response?.status;
    return (
      <div className="rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/25 p-4">
        <p className="text-sm font-semibold text-red-700 dark:text-red-300">
          تعذّر تحميل المخرجات{status ? ` (HTTP ${status})` : ''}
        </p>
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
          {status === 404
            ? 'المسار غير موجود على السيرفر. تأكد من رفع الملفين من الباك ثم تنفيذ: php artisan route:clear && php artisan optimize:clear'
            : error?.message || 'حدث خطأ غير متوقع.'}
        </p>
        <button
          onClick={() => (query as any).refetch?.()}
          className="mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (withFiles.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-gray-500 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
        {isFetching ? 'جارٍ التحقق من المخرجات...' : 'لم يرفع المتخصصون أي مخرجات لهذه المهام بعد.'}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          المخرجات التي رفعها المتخصصون من صفحة تفاصيل المهمة. هذه الملفات مرفقة بالمهمة، وليست مرفقات المشروع.
        </p>
        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-brand-primary/10 text-brand-primary whitespace-nowrap">
          {totalFiles} ملف
        </span>
      </div>

      {withFiles.map((group) => {
        const st = statusLabel(group.task?.status);
        return (
          <div key={group.task?.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gray-50 dark:bg-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <PaperclipIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="font-semibold text-sm text-gray-800 dark:text-white truncate">{group.task?.title}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${st.color}`}>
                  {st.label}
                </span>
              </div>
              <span className="text-xs text-gray-500 flex-shrink-0">{group.files.length} ملف</span>
            </div>

            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {group.files.map((f: any) => (
                <li key={f.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-brand-primary hover:underline truncate block"
                    >
                      {f.original_name || f.name}
                    </a>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500 flex-wrap">
                      {f.uploader?.name && (
                        <span className="inline-flex items-center gap-1">
                          <UsersIcon className="w-3 h-3" />
                          {f.uploader.name}
                        </span>
                      )}
                      {f.uploadedAt && (
                        <span className="inline-flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          {String(f.uploadedAt).slice(0, 16)}
                        </span>
                      )}
                      <span>{formatSize(f.size)}</span>
                    </div>
                  </div>
                  {f.url && (
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
                    >
                      <CheckCircleIcon className="w-3.5 h-3.5" />
                      عرض
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default ProjectDeliverablesTab;
