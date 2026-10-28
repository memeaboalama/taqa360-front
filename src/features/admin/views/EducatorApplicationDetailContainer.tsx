import React, { useMemo, useState } from 'react';
import {
  useAdminEducator,
  useAcceptEducatorAccount,
  useRejectEducatorAccount,
  useApproveEducatorIdentity,
  useRejectEducatorIdentity,
  useApproveAcademicMajor,
  useRejectAcademicMajor,
  useUpdateEducatorStatus,
  useSuspendEducator,
  useUnsuspendEducator,
} from '../../../core/hooks/useAdminQueries';
import { useUpdateEducatorDocumentStatus } from '../hooks/useAdminQueries';
import { AcademicMajor, Educator, EducatorStatus, VerificationStatus, ViewType } from '../../../shared/types';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { useData } from '../../../app/providers/DataProvider';
import Avatar from '../../../shared/components/Avatar';
import ConfirmationModal from '../../../shared/components/modals/ConfirmationModal';
import {
  AcademicCapIcon,
  AlertCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon,
  DocumentTextIcon,
  EditIcon,
  EnvelopeIcon,
  IdentificationIcon,
  LinkIcon,
  MapPinIcon,
  PaperclipIcon,
  PhoneIcon,
  StarIcon,
  UserCheckIcon,
  UserMinusIcon,
  XCircleIcon,
} from '../../../shared/components/Icons';

interface Props {
  educatorId: string;
  navigateTo: (view: ViewType, context?: any) => void;
  mode?: 'application' | 'profile';
  backTarget?: ViewType;
}

const statusOptions = (Object.values(EducatorStatus) as EducatorStatus[]).filter(
  (status) => status !== EducatorStatus.PENDING_REVIEW && status !== EducatorStatus.REJECTED,
);

type DocumentSection = 'experience' | 'certification';

const getStatusChip = (status?: string) => {
  const s = String(status || '').toUpperCase();
  if (s.includes('VERIFIED') || s === 'APPROVED') {
    return {
      label: 'موثق',
      cls: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
      icon: <CheckCircleIcon className="w-4 h-4" />,
    };
  }
  if (s.includes('REJECT')) {
    return {
      label: 'مرفوض',
      cls: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
      icon: <XCircleIcon className="w-4 h-4" />,
    };
  }
  return {
    label: 'قيد المراجعة',
    cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
    icon: <ClockIcon className="w-4 h-4" />,
  };
};

const normalizeVerificationStatus = (value?: string | null): VerificationStatus => {
  const normalized = String(value || '').toUpperCase();
  if (normalized === VerificationStatus.VERIFIED) return VerificationStatus.VERIFIED;
  if (normalized === VerificationStatus.REJECTED) return VerificationStatus.REJECTED;
  return VerificationStatus.PENDING;
};

const isImageUrl = (url: string) => /\.(png|jpe?g|gif|webp|svg)$/i.test(url);
const isPdfUrl = (url: string) => /\.(pdf)$/i.test(url);

const PreviewModal: React.FC<{ url: string; name?: string; onClose: () => void }> = ({ url, name, onClose }) => {
  const img = isImageUrl(url);
  const pdf = isPdfUrl(url);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl h-[80vh] bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="flex items-center justify-between p-3 border-b dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <PaperclipIcon className="w-4 h-4" /> {name}
          </div>
          <button onClick={onClose} className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-700 rounded-md">
            إغلاق
          </button>
        </div>
        <div className="p-3 h-full">
          {img && <img src={url} alt={name} className="w-full h-full object-contain" />}
          {pdf && <iframe src={url} title={name} className="w-full h-full rounded-md" />}
          {!img && !pdf && (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-600">
              <div>لا يمكن المعاينة داخل التطبيق.</div>
              <a href={url} target="_blank" rel="noreferrer" className="px-3 py-1 text-sm rounded-md bg-slate-100 dark:bg-slate-700">فتح في تبويب جديد</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FileLink: React.FC<{ url?: string | null; name: string; onPreview?: (url: string, name?: string) => void }> = ({
  url,
  name,
  onPreview,
}) => {
  if (!url) return <span className="text-xs text-slate-500">لا يوجد ملف</span>;
  return (
    <button
      type="button"
      onClick={() => onPreview?.(url, name)}
      className="inline-flex items-center gap-1 text-sm text-brand-primary hover:underline"
    >
      <PaperclipIcon className="w-4 h-4" /> {name}
    </button>
  );
};

const InfoRow: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
  <div>
    <p className="text-xs text-slate-500">{label}</p>
    <p className="text-sm font-semibold text-slate-800 dark:text-white">{value ?? '-'}</p>
  </div>
);

const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="px-2 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full">
    {children}
  </span>
);

const MajorCard: React.FC<{
  educator: Educator;
  major: AcademicMajor;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onPreview: (url: string, name?: string) => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}> = ({ educator, major, onApprove, onReject, onPreview, addToast }) => {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const currentStatus = localStatus ?? String(major.verificationStatus);
  const statusChip = getStatusChip(currentStatus);
  const normalizedStatus = normalizeVerificationStatus(currentStatus);
  const isVerified = normalizedStatus === VerificationStatus.VERIFIED;

  return (
    <div className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-sm transition">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="font-semibold text-slate-800 dark:text-white">
            {major.degree} • {major.majorName}
          </div>
          <div className="text-xs text-slate-500">
            {major.institution} • {major.graduationYear}
          </div>
          <div className="mt-2">
            <FileLink
              url={major.documentUrl || undefined}
              name="المؤهل"
              onPreview={(url, name) => onPreview(url, name)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full ${statusChip.cls}`}
          >
            {statusChip.icon}
            {statusChip.label}
          </span>
          <div className="flex items-center gap-2">
            {isVerified ? (
              <button
                onClick={() => setRejectOpen(true)}
                className="px-3 py-1 text-xs font-bold text-red-600 border border-red-300 hover:bg-red-50 rounded-lg"
              >
                رفض بعد التحقق
              </button>
            ) : normalizedStatus === VerificationStatus.REJECTED ? null : (
              <>
                <button
                  onClick={() => setRejectOpen(true)}
                  className="px-3 py-1 text-xs font-bold text-red-600 bg-red-100 hover:bg-red-200 rounded-lg"
                >
                  رفض
                </button>
                <button
                  onClick={async () => { try { await onApprove(major.id); setLocalStatus(VerificationStatus.VERIFIED); addToast('تم توثيق المؤهل', 'success'); } catch (e: any) { addToast(e?.response?.data?.message || e?.message || 'فشل توثيق المؤهل', 'error'); } }}
                  className="px-3 py-1 text-xs font-bold text-green-600 bg-green-100 hover:bg-green-200 rounded-lg"
                >
                  تحقق
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {rejectOpen && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setRejectOpen(false)}
          onConfirm={async (reason) => {
            try {
              await onReject(major.id, reason);
              setLocalStatus(VerificationStatus.REJECTED);
              setRejectOpen(false);
              addToast('تم رفض المؤهل', 'success');
            } catch (e: any) {
              addToast(e?.response?.data?.message || e?.message || 'فشل رفض المؤهل', 'error');
            }
          }}
          title={isVerified ? 'رفض مؤهل بعد التحقق' : 'تأكيد رفض المؤهل'}
          message={`يرجى كتابة سبب الرفض لمؤهل ${educator.name}`}
          icon={<XCircleIcon className="w-8 h-8" />}
          isReasonRequired={true}
          reasonLabel="سبب الرفض"
        />
      )}
      {major.rejectionReason && !localStatus && <p className="text-xs text-red-500 mt-2">سبب الرفض: {major.rejectionReason}</p>}
    </div>
  );
};

const DocumentReviewCard: React.FC<{
  title: string;
  docUrl?: string | null;
  status?: VerificationStatus;
  rejectionReason?: string | null;
  onVerify?: () => void;
  onReject?: () => void;
  onPreview?: (url: string, name?: string) => void;
  showStatus?: boolean;
  showActions?: boolean;
}> = ({ title, docUrl, status = VerificationStatus.PENDING, rejectionReason, onVerify, onReject, onPreview, showStatus = true, showActions = true }) => {
  const statusInfo = {
    [VerificationStatus.VERIFIED]: {
      text: 'موثق',
      color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
      icon: <CheckCircleIcon className="w-4 h-4" />,
    },
    [VerificationStatus.REJECTED]: {
      text: 'مرفوض',
      color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
      icon: <XCircleIcon className="w-4 h-4" />,
    },
    [VerificationStatus.PENDING]: {
      text: 'قيد المراجعة',
      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
      icon: <ClockIcon className="w-4 h-4" />,
    },
  }[status];

  return (
    <div className="border dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-slate-800 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h4 className="font-semibold text-brand-dark dark:text-white">{title}</h4>
          <div className="mt-1 flex items-center gap-2 text-sm">
            {docUrl ? (
              <button
                type="button"
                onClick={() => onPreview?.(docUrl, title)}
                className="inline-flex items-center gap-1 text-brand-primary hover:underline"
              >
                <PaperclipIcon className="w-4 h-4" /> معاينة المستند
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                <DocumentTextIcon className="w-4 h-4" /> لا يوجد ملف
              </span>
            )}
          </div>
        </div>
        {showStatus && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}
          >
            {statusInfo.icon}
            {statusInfo.text}
          </span>
        )}
      </div>
      {rejectionReason && <p className="text-xs text-red-500 mt-2">سبب الرفض: {rejectionReason}</p>}
      {showActions && (onReject || onVerify) && (
        <div className="flex items-center justify-end gap-2 mt-3">
          {onReject && (
            <button
              type="button"
              onClick={onReject}
              disabled={status === VerificationStatus.REJECTED}
              className="px-3 py-1 text-xs font-bold text-red-600 bg-red-100 hover:bg-red-200 rounded-lg disabled:opacity-60"
            >
              رفض
            </button>
          )}
          {onVerify && (
            <button
              type="button"
              onClick={onVerify}
              disabled={status === VerificationStatus.VERIFIED}
              className="px-3 py-1 text-xs font-bold text-green-600 bg-green-100 hover:bg-green-200 rounded-lg disabled:opacity-60"
            >
              تحقق
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const EducatorApplicationDetailContainer: React.FC<Props> = ({
  educatorId,
  navigateTo,
  mode = 'application',
  backTarget,
}) => {
  const { t, language } = useLanguage();
  const { addToast } = useData();
  const educatorQuery = useAdminEducator(educatorId);
  const acceptAccount = useAcceptEducatorAccount();
  const rejectAccount = useRejectEducatorAccount();
  const approveIdentity = useApproveEducatorIdentity();
  const rejectIdentity = useRejectEducatorIdentity();
  const approveMajor = useApproveAcademicMajor();
  const rejectMajor = useRejectAcademicMajor();
  const updateStatus = useUpdateEducatorStatus();
  const updateDocumentStatus = useUpdateEducatorDocumentStatus();
  const suspendEducator = useSuspendEducator();
  const unsuspendEducator = useUnsuspendEducator();

  const [accountAction, setAccountAction] = useState<'accept' | 'reject' | null>(null);
  const [rejectIdOpen, setRejectIdOpen] = useState(false);
  const [tab, setTab] = useState<'profile' | 'identity' | 'education' | 'experience' | 'skills'>('profile');
  const [preview, setPreview] = useState<{ url: string; name?: string } | null>(null);
  const [statusChange, setStatusChange] = useState<EducatorStatus | null>(null);
  const [docRejection, setDocRejection] = useState<{ type: DocumentSection; id: string } | null>(null);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [unsuspendOpen, setUnsuspendOpen] = useState(false);
  const [identityApproved, setIdentityApproved] = useState(false);
  const [identityRejected, setIdentityRejected] = useState(false);

  const educator = educatorQuery.data as Educator | undefined;
  const identityStatus = useMemo(() => getStatusChip(String(educator?.profile?.identityStatus)), [educator]);
  const isIdentityVerified = identityApproved || String(educator?.profile?.identityStatus || '').toUpperCase() === 'VERIFIED';
  const isIdentityRejected = identityRejected || String(educator?.profile?.identityStatus || '').toUpperCase() === 'REJECTED';

  const computedBackTarget = backTarget ?? (mode === 'profile' ? 'educators' : 'educatorApplications');
  const backLabel = useMemo(() => {
    switch (computedBackTarget) {
      case 'educators':
        return 'العودة إلى قائمة المتخصصين';
      case 'rejectedEducators':
        return 'العودة إلى المتخصصين المرفوضين';
      default:
        return 'العودة لطلبات التسجيل';
    }
  }, [computedBackTarget]);

  const hasUnverifiedInfo = useMemo(() => {
    if (!educator) return false;
    return (
      String(educator.profile?.identityStatus || '').toUpperCase() !== 'VERIFIED' ||
      educator.academicMajors.some((m) => normalizeVerificationStatus(String(m.verificationStatus)) !== VerificationStatus.VERIFIED) ||
      educator.workExperience.some((exp) => normalizeVerificationStatus(String(exp.verificationStatus)) !== VerificationStatus.VERIFIED) ||
      educator.certifications.some((cert) => normalizeVerificationStatus(String(cert.verificationStatus)) !== VerificationStatus.VERIFIED)
    );
  }, [educator]);

  if (educatorQuery.isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="inline-block animate-spin rounded-full h-12 w-12 mb-4" style={{ borderBottom: '3px solid var(--primary-color)' }}></div>
      <span className="text-base font-medium text-slate-600 dark:text-slate-400">جارِ التحميل...</span>
    </div>
  );
  if (educatorQuery.isError) return <div className="p-6 text-red-600">حدث خطأ أثناء جلب البيانات.</div>;
  if (!educator) return <div className="p-6 text-center text-slate-500">المتخصص غير موجود</div>;

  const handleStatusConfirm = async (reason: string) => {
    if (!statusChange) return;
    try {
      await updateStatus.mutateAsync({ id: educator.id, status: statusChange, reason });
      addToast(`تم تغيير حالة الحساب إلى ${t(`status.${statusChange}`)}`);
      setStatusChange(null);
    } catch (e: any) {
      addToast(e?.response?.data?.message || e?.message || 'فشل تغيير الحالة', 'error');
    }
  };

  const handleDocReject = async (reason: string) => {
    if (!docRejection) return;
    try {
      await updateDocumentStatus.mutateAsync({
        educatorId: educator.id,
        type: docRejection.type,
        docId: docRejection.id,
        status: 'REJECTED',
        reason,
      });
      addToast('تم رفض المستند', 'success');
      setDocRejection(null);
    } catch (e: any) {
      addToast(e?.response?.data?.message || e?.message || 'فشل رفض المستند', 'error');
    }
  };

  const handleDocVerify = async (type: DocumentSection, id: string) => {
    try {
      await updateDocumentStatus.mutateAsync({
        educatorId: educator.id,
        type,
        docId: id,
        status: 'VERIFIED',
      });
      addToast('تم توثيق المستند', 'success');
    } catch (e: any) {
      addToast(e?.response?.data?.message || e?.message || 'فشل توثيق المستند', 'error');
    }
  };

  const statusDisplay = t(`status.${String(educator.status || '').toUpperCase()}`) || educator.status;

  return (
    <div className="animate-fade-in space-y-6 pb-16">
      {accountAction && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setAccountAction(null)}
          onConfirm={async (reason) => {
            try {
              if (accountAction === 'accept') {
                await acceptAccount.mutateAsync(educator.id);
                addToast('تم قبول الحساب', 'success');
                navigateTo('educators');
              } else {
                await rejectAccount.mutateAsync({ id: educator.id, reason });
                addToast('تم رفض الحساب', 'success');
              }
              setAccountAction(null);
            } catch (e: any) {
              addToast(e?.response?.data?.message || e?.message || 'فشل العملية', 'error');
            }
          }}
          title={accountAction === 'accept' ? 'تأكيد قبول الحساب' : 'تأكيد رفض الحساب'}
          message={accountAction === 'accept' ? `قبول حساب ${educator.name}` : `رفض حساب ${educator.name}`}
          icon={accountAction === 'accept' ? <UserCheckIcon className="w-8 h-8" /> : <UserMinusIcon className="w-8 h-8" />}
          isReasonRequired={accountAction === 'reject'}
          reasonLabel="سبب الرفض"
          confirmButtonClass={accountAction === 'accept' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
        />
      )}

      {statusChange && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setStatusChange(null)}
          onConfirm={handleStatusConfirm}
          title={`تغيير حالة المتخصص إلى "${
            t(`status.${String(statusChange).toUpperCase()}`) || statusChange
          }"`}
          message={`هل أنت متأكد من تغيير حالة ${educator.name}؟ سيتم توثيق هذا الإجراء.`}
          icon={<EditIcon className="w-8 h-8" />}
          isReasonRequired={true}
          reasonLabel="سبب التغيير"
        />
      )}

      {docRejection && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setDocRejection(null)}
          onConfirm={handleDocReject}
          title="تأكيد رفض المستند"
          message="يرجى كتابة سبب الرفض ليتمكن المتخصص من تصحيح الخطأ."
          icon={<XCircleIcon className="w-8 h-8" />}
          isReasonRequired={true}
          reasonLabel="سبب رفض المستند"
        />
      )}

      {rejectIdOpen && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setRejectIdOpen(false)}
          onConfirm={async (reason) => {
            try {
              await rejectIdentity.mutateAsync({ id: educator.id, reason });
              addToast('تم رفض الهوية', 'success');
              setIdentityApproved(false);
              setIdentityRejected(true);
              setRejectIdOpen(false);
            } catch (e: any) {
              addToast(e?.response?.data?.message || e?.message || 'فشل رفض الهوية', 'error');
            }
          }}
          title={isIdentityVerified ? 'رفض الهوية بعد التحقق' : 'تأكيد رفض الهوية'}
          message={`يرجى كتابة سبب رفض هوية ${educator.name}`}
          icon={<XCircleIcon className="w-8 h-8" />}
          isReasonRequired={true}
          reasonLabel="سبب رفض الهوية"
        />
      )}

      {preview && <PreviewModal url={preview.url} name={preview.name} onClose={() => setPreview(null)} />}

      {suspendOpen && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setSuspendOpen(false)}
          onConfirm={async (reason) => {
            try {
              await suspendEducator.mutateAsync({ id: educator.id, reason });
              addToast('تم إيقاف الحساب', 'success');
              setSuspendOpen(false);
            } catch (e: any) {
              addToast(e?.response?.data?.message || e?.message || 'فشل إيقاف الحساب', 'error');
            }
          }}
          title="إيقاف حساب المتخصص"
          message={`يرجى ذكر سبب إيقاف ${educator.name}`}
          icon={<XCircleIcon className="w-8 h-8" />}
          isReasonRequired={true}
          reasonLabel="سبب الإيقاف"
        />
      )}

      {unsuspendOpen && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setUnsuspendOpen(false)}
          onConfirm={async () => {
            try {
              await unsuspendEducator.mutateAsync(educator.id);
              addToast('تم إعادة فتح الحساب', 'success');
              setUnsuspendOpen(false);
            } catch (e: any) {
              addToast(e?.response?.data?.message || e?.message || 'فشل إعادة فتح الحساب', 'error');
            }
          }}
          title="إلغاء إيقاف الحساب"
          message={`هل تريد إعادة فتح حساب ${educator.name}؟`}
          icon={<UserCheckIcon className="w-8 h-8" />}
          isReasonRequired={false}
        />
      )}

      <button
        onClick={() => navigateTo(computedBackTarget)}
        className="flex items-center text-sm hover:underline"
          style={{ color: 'var(--primary-color)' }}
      >
        {language === 'ar' ? <ArrowRightIcon className="w-4 h-4 me-1" /> : <ArrowLeftIcon className="w-4 h-4 me-1" />} {backLabel}
      </button>

      {mode === 'profile' && hasUnverifiedInfo && (
        <div className="rounded-xl p-4 flex items-center justify-between text-white shadow-lg"
          style={{ background: 'linear-gradient(to right, var(--primary-color), var(--accent-color, #8B5CF6))' }}>
          <div className="flex items-center gap-3">
            <AlertCircleIcon className="w-6 h-6" />
            <div>
              <h3 className="font-bold">{educator.name} لديه معلومات غير موثقة.</h3>
              <p className="text-sm opacity-90">قم بإخطار المتخصص للتحقق من معلوماتك عن طريق إرسال إشعار.</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden shadow-md border dark:border-gray-700">
        <div className="bg-gradient-to-l from-amber-100 to-white dark:from-slate-700 dark:to-slate-800 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <Avatar src={educator.avatarUrl} name={educator.name} size={84} className="rounded-2xl ring-4 ring-white dark:ring-slate-800" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-extrabold text-brand-dark dark:text-white truncate">{educator.name}</h1>
                  <Tag>{educator.discipline || (educator as any).specialization || 'تخصص غير محدد'}</Tag>
                  <Tag>{statusDisplay}</Tag>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{educator.bio}</p>
                <div className="mt-3 flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300 flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <EnvelopeIcon className="w-4 h-4" />
                    {educator.email}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <PhoneIcon className="w-4 h-4" />
                    {educator.phone}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    {[educator.country, educator.city].filter(Boolean).join('، ')}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <StarIcon className="w-4 h-4 text-yellow-500" /> {Number(educator.rating || 0).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
            <div className="w-full sm:w-auto flex flex-col gap-3">
              {mode === 'application' ? (
                <>
                  <button
                    onClick={() => setAccountAction('accept')}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 active:scale-[.98] transition"
                  >
                    قبول الحساب
                  </button>
                  <button
                    onClick={() => setAccountAction('reject')}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 active:scale-[.98] transition"
                  >
                    رفض الحساب
                  </button>
                </>
              ) : (
                <div className="bg-white/70 dark:bg-slate-900/60 border border-white/40 dark:border-slate-700 rounded-xl p-3 shadow-sm">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">تغيير حالة الحساب</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {statusOptions.map((status) => {
                      const isCurrent = String(educator.status || '').toUpperCase() === String(status).toUpperCase();
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => !isCurrent && setStatusChange(status)}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                            isCurrent
                              ? 'text-black cursor-default'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                          }`}
                          style={isCurrent ? { backgroundColor: 'var(--primary-color)' } : {}}
                        >
                          {t(`status.${String(status).toUpperCase()}`) || status}
                        </button>
                      );
                    })}
                    <span className="inline-block w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
                    {String(educator.status || '').toUpperCase() === 'SUSPENDED' ? (
                      <button
                        type="button"
                        onClick={() => setUnsuspendOpen(true)}
                        className="px-3 py-1 text-xs font-bold rounded-md bg-green-600 text-white hover:bg-green-700"
                      >
                        إعادة فتح الحساب
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSuspendOpen(true)}
                        className="px-3 py-1 text-xs font-bold rounded-md bg-red-600 text-white hover:bg-red-700"
                      >
                        إيقاف الحساب
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800">
          <nav className="flex gap-2 p-3 border-t dark:border-gray-700 overflow-x-auto">
            {(
              [
                { id: 'profile', label: 'الملف' },
                { id: 'identity', label: 'الهوية' },
                { id: 'education', label: 'المؤهلات' },
                { id: 'experience', label: 'الخبرات والشهادات' },
                { id: 'skills', label: 'المهارات والخدمات' },
              ] as const
            ).map((tItem) => (
              <button
                key={tItem.id}
                onClick={() => setTab(tItem.id)}
                className={`px-3 py-1.5 text-sm font-semibold rounded-lg border ${
                  tab === tItem.id
                    ? 'bg-brand-primary text-white border-brand-primary'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                {tItem.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {tab === 'profile' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border dark:border-gray-700">
            <h3 className="text-lg font-bold mb-4">البيانات الأساسية</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              <InfoRow label="الاسم" value={educator.name} />
              <InfoRow label="البريد الإلكتروني" value={educator.email} />
              <InfoRow label="الجنسية" value={educator.profile.nationality} />
              <InfoRow label="النوع" value={String(educator.profile.gender || '')} />
              <InfoRow label="رقم الهاتف" value={educator.phone} />
              <InfoRow label="العنوان" value={[educator.country, educator.city].filter(Boolean).join('، ')} />
              <InfoRow label="سنوات الخبرة" value={educator.profile.experienceYears} />
            </div>
            <div className="mt-6">
              <h4 className="font-semibold mb-2">اللغات</h4>
              <div className="flex flex-wrap gap-2">
                {educator.languages.length > 0 ? (
                  educator.languages.map((lang) => (
                    <Tag key={lang.id}>
                      {lang.name} • {lang.level}
                    </Tag>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">لا توجد بيانات</span>
                )}
              </div>
            </div>
            <div className="mt-6">
              <h4 className="font-semibold mb-2">روابط اجتماعية</h4>
              <div className="flex flex-wrap gap-3">
                {educator.socialLinks.length > 0 ? (
                  educator.socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm hover:underline"
                      style={{ color: 'var(--primary-color)' }}
                    >
                      <LinkIcon className="w-4 h-4" />
                      {link.platform}
                    </a>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">لا توجد بيانات</span>
                )}
              </div>
            </div>
          </section>
          <aside className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md border dark:border-gray-700">
              <h3 className="font-bold mb-3 text-brand-dark dark:text-white">معلومات الدفع</h3>
              {educator.bankInfo ? (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CreditCardIcon className="w-4 h-4" />
                    <span className="font-semibold">{educator.bankInfo.bankName}</span>
                  </div>
                  <div>
                    IBAN: <span className="font-semibold">{educator.bankInfo.iban}</span>
                  </div>
                  <div>
                    الاسم: <span className="font-semibold">{educator.bankInfo.name}</span>
                  </div>
                  <div>
                    الدولة: <span className="font-semibold">{educator.bankInfo.bankCountry}</span>
                  </div>
                  <div>
                    الكود: <span className="font-semibold">{educator.bankInfo.bankCode}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">لا توجد بيانات</p>
              )}
            </div>
          </aside>
        </div>
      )}

      {tab === 'identity' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">الهوية الشخصية</h3>
              <span className={`px-2 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full ${identityStatus.cls}`}>
                {identityStatus.icon}
                {identityStatus.label}
              </span>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <InfoRow label="نوع الهوية" value={educator.profile.idType || ''} />
              <InfoRow label="رقم الهوية" value={educator.profile.idNumber || ''} />
              <InfoRow label="انتهاء الهوية" value={educator.profile.idExpiry || ''} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border dark:border-gray-700 bg-slate-50 dark:bg-slate-900/40">
                <FileLink
                  url={educator.profile.idDocumentUrl || undefined}
                  name="وجه الهوية"
                  onPreview={(url, name) => setPreview({ url, name })}
                />
              </div>
              <div className="p-3 rounded-lg border dark:border-gray-700 bg-slate-50 dark:bg-slate-900/40">
                <FileLink
                  url={educator.profile.idDocumentBackUrl || undefined}
                  name="ظهر الهوية"
                  onPreview={(url, name) => setPreview({ url, name })}
                />
              </div>
            </div>
          </section>
          <aside className="space-y-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md border dark:border-gray-700">
              <h3 className="font-bold mb-3 text-brand-dark dark:text-white">التحقق</h3>
              <div className="flex items-center gap-2">
                {isIdentityRejected ? null : isIdentityVerified ? (
                  <button
                    onClick={() => setRejectIdOpen(true)}
                    className="px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 font-semibold"
                  >
                    رفض بعد التحقق
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setRejectIdOpen(true)}
                      className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
                    >
                      رفض الهوية
                    </button>
                    <button
                      onClick={async () => { try { await approveIdentity.mutateAsync(educator.id); setIdentityApproved(true); setIdentityRejected(false); addToast('تم توثيق الهوية', 'success'); } catch (e: any) { addToast(e?.response?.data?.message || e?.message || 'فشل توثيق الهوية', 'error'); } }}
                      className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
                    >
                      تأكيد التحقق
                    </button>
                  </>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}

      {tab === 'education' && (
        <section className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border dark:border-gray-700">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-full bg-brand-light/40">
              <AcademicCapIcon className="w-5 h-5 text-yellow-800" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-brand-dark dark:text-white">المؤهلات الأكاديمية</h3>
              <div className="mt-3 space-y-3">
                {educator.academicMajors.length === 0 && <p className="text-sm text-slate-500">لا توجد بيانات</p>}
                {educator.academicMajors.map((major) => (
                  <MajorCard
                    key={major.id}
                    educator={educator}
                    major={major}
                    onApprove={(id) => approveMajor.mutateAsync({ educatorId: educator.id, majorId: id })}
                    onReject={(id, reason) => rejectMajor.mutateAsync({ educatorId: educator.id, majorId: id, reason })}
                    onPreview={(url, name) => setPreview({ url, name })}
                    addToast={addToast}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {tab === 'experience' && (
        <section className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BriefcaseIcon className="w-5 h-5" /> الخبرات والشهادات
          </h3>
          <div className="space-y-3">
            {educator.workExperience.map((exp) => (
              <DocumentReviewCard
                key={`exp-${exp.id}`}
                title={`${exp.title} • ${exp.organization}`}
                docUrl={exp.documentUrl}
                showStatus={false}
                showActions={false}
                onPreview={(url, name) => setPreview({ url, name })}
              />
            ))}
            {educator.certifications.map((cert) => (
              <DocumentReviewCard
                key={`cert-${cert.id}`}
                title={`${cert.title} • ${cert.organization || cert.issuingAuthority || ''}`}
                docUrl={cert.documentUrl}
                showStatus={false}
                showActions={false}
                onPreview={(url, name) => setPreview({ url, name })}
              />
            ))}
            {educator.workExperience.length === 0 && educator.certifications.length === 0 && (
              <p className="text-sm text-slate-500">لا توجد بيانات</p>
            )}
          </div>
        </section>
      )}

      {tab === 'skills' && (
        <div className="grid md:grid-cols-2 gap-6">
          <section className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border dark:border-gray-700">
            <h4 className="font-semibold mb-2">المهارات</h4>
            <div className="flex flex-wrap gap-2">
              {educator.skills.length > 0 ? (
                educator.skills.map((skill) => (
                  <Tag key={skill.id}>
                    {skill.name} ({skill.level})
                  </Tag>
                ))
              ) : (
                <span className="text-sm text-slate-500">لا توجد بيانات</span>
              )}
            </div>
          </section>
          <section className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border dark:border-gray-700">
            <h4 className="font-semibold mb-2">الخدمات</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {educator.services.length > 0 ? (
                educator.services.map((service) => <li key={service.id}>{service.name}</li>)
              ) : (
                <span className="text-sm text-slate-500">لا توجد بيانات</span>
              )}
            </ul>
          </section>
        </div>
      )}

      {mode === 'application' && (
        <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 border-t dark:border-gray-700 backdrop-blur supports-[backdrop-filter]:bg-white/70 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)] flex items-center gap-3">
          <button
            onClick={() => setAccountAction('reject')}
            className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold active:scale-[.99] transition"
          >
            رفض
          </button>
          <button
            onClick={() => setAccountAction('accept')}
            className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold active:scale-[.99] transition"
          >
            قبول
          </button>
        </div>
      )}
    </div>
  );
};

export default EducatorApplicationDetailContainer;
