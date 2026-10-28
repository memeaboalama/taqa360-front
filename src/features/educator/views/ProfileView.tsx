import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Educator, AcademicMajor, WorkExperience, Certification, VerificationStatus, SocialLink, EducatorStatus, Service, Achievement, Skill, Language } from '../../../shared/types';
import { BriefcaseIcon, AcademicCapIcon, StarIcon, XCircleIcon, UploadCloudIcon, PlusIcon, TrashIcon, LinkedinIcon, TwitterIcon, GithubIcon, WebsiteIcon, EditIcon, CheckBadgeIcon, WalletIcon, GlobeAltIcon, BuildingStorefrontIcon, UserCircleIcon, RectangleStackIcon, ShareIcon, LightBulbIcon, CheckCircleIcon } from '../../../shared/components/Icons';
import EditSocialLinksModal from '../../../shared/components/modals/EditSocialLinksModal';
import EditPaymentInfoModal from '../../../shared/components/modals/EditPaymentInfoModal';
import AddLanguageModal from '../../../shared/components/modals/AddLanguageModal';
import AddSkillModal from '../../../shared/components/modals/AddSkillModal';
import AddEditServiceModal from '../../../shared/components/modals/AddEditServiceModal';
import ConfirmationModal from '../../../shared/components/modals/ConfirmationModal';
import { useCreateEducatorSkill, useDeleteEducatorSkill, useUpdateEducatorSkill, useCreateEducatorService, useUpdateEducatorService, useDeleteEducatorService, useUpdatePaymentInfo, useDeletePaymentInfo, useCreateEducatorLanguage, useUpdateEducatorLanguage, useDeleteEducatorLanguage } from '../../../core/hooks/useEducatorQueries';
import { useCountries, useCountryCities, useNationalities, useUpdateBasicInfo, useUpdateBiography, useOfficialAcademicMajors, useCreateAcademicMajor as useCreateAcademicMajorMutation, useUpdateAcademicMajor as useUpdateAcademicMajorMutation, useDeleteAcademicMajor as useDeleteAcademicMajorMutation } from '../../educators/hooks/useEducatorQueries';
import CustomSelect from '../components/shared/CustomSelect';
import SelectWithCreate, { SelectWithCreateOption } from '../components/shared/SelectWithCreate';
import { ACHIEVEMENT_TYPES, createAchievement, updateAchievement, deleteAchievement, AchievementPayload } from '../../educators/services/EducatorProfileApi';
import { useData } from '../../../app/providers/DataProvider';
import LoadingButton from '../../../shared/components/LoadingButton';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface ProfileViewProps {
    educator: Educator;
    onUpdateProfile: (updatedProfile: Educator, options?: { showToast?: boolean }) => void;
    predefinedSkills: string[];
    predefinedMajors: string[];
}

const platformChipClass = (p: string) => {
    switch (String(p)) {
      case 'linkedin':
        return 'bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/15';
      case 'twitter':
        return 'bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/15';
      case 'github':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600';
      default:
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-200/80 dark:hover:bg-emerald-900/50';
    }
  };

// --- Brand-styled helpers ---
const BrandChip: React.FC<{ label: string; tone?: 'primary' | 'success' | 'warning' }>
= ({ label, tone = 'primary' }) => {
  const map: Record<string, string> = {
    primary: 'bg-brand-primary/15 text-brand-dark border-brand-primary/30',
    success: 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/30',
    warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
  };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${map[tone]}`}>{label}</span>;
};

// --- Reusable UI Components ---
const ProfileCompletenessBanner: React.FC<{ educator: Educator }> = ({ educator }) => {
  const { t } = useLanguage();
  const isProfileComplete = educator.profile.profileCompletion >= 95;
  const isVerified = educator.status === EducatorStatus.ACTIVE;
  if (isProfileComplete && isVerified) return null;
  return (
    <div className="rounded-2xl mb-4 border border-amber-200 bg-amber-50 dark:border-amber-700/50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-200 shadow-sm">
      <div className="p-4 md:p-5 flex items-center gap-3 flex-wrap">
        <CheckBadgeIcon className="w-6 h-6 text-amber-500" />
        <p className="font-bold text-sm md:text-base">{t('profileSection.bannerTitle')}</p>
        <span className="hidden sm:inline text-xs">{t('profileSection.bannerHint')}</span>
      </div>
    </div>
  );
};

const SectionHeader: React.FC<{ title: string; subtitle?: string; icon: React.ReactNode; action?: React.ReactNode }>
= ({ title, subtitle, icon, action }) => (
  <div className="flex items-start justify-between gap-4">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-brand-primary/15 text-brand-dark shadow-glow-primary"><span className="sr-only">{title}</span>{icon}</div>
      <div>
        <h3 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);

const MainCard: React.FC<{ title: string, icon: React.ReactNode, onAdd?: () => void, isFormOpen: boolean, subtitle?: string, actionText?: string, onSave?: () => void, onCancel?: () => void, children: React.ReactNode, loading?: boolean }>
= ({ title, icon, onAdd, isFormOpen, subtitle, actionText, onSave, onCancel, children, loading }) => {
  const { t } = useLanguage();
  const resolvedActionText = actionText || t('add');
  const isEditAction = resolvedActionText === t('edit');

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-brand-light/50 dark:border-slate-700/50">
      <div className="px-4 md:px-6 py-4 border-b dark:border-slate-700">
        <SectionHeader
          title={title}
          subtitle={subtitle}
          icon={icon}
          action={isFormOpen && onSave && onCancel ? (
            <div className="flex items-center gap-2">
              <button onClick={onCancel} disabled={Boolean(loading)} className={`px-3 py-1.5 text-xs font-bold bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed ${loading ? 'cursor-wait' : ''}`}>{t('cancel')}</button>
              <LoadingButton type="button" onClick={onSave} loading={Boolean(loading)} variant="brand" className="px-3 py-1 text-xs font-bold">{t('save')}</LoadingButton>
            </div>
          ) : (onAdd ? (
            <button onClick={onAdd} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-brand-primary rounded-lg hover:shadow-glow-primary">
              {isEditAction ? <EditIcon className="w-4 h-4"/> : <PlusIcon className="w-4 h-4"/>} {resolvedActionText}
            </button>
          ) : undefined)}
        />
      </div>
      <div className="p-4 md:p-6">{children}</div>
    </div>
  );
};

const TimelineItem: React.FC<{
  item: AcademicMajor | WorkExperience | Certification;
  icon: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  isActive?: boolean;
  tone?: 'primary' | 'success' | 'info' | 'warning' | 'purple';
}> = ({ item, icon, onEdit, onDelete, isActive = false, tone = 'primary' }) => {
  const { t } = useLanguage();
  const isWorkExperience = 'organization' in item;
  const isCertification = 'issuingAuthority' in item;
  const title = isCertification ? item.title : ('degree' in item) ? (item.degree || item.majorName) : item.title;
  const subtitle = isCertification
    ? item.issuingAuthority || item.organization
    : ('majorName' in item)
      ? `${item.majorName || t('profileSection.timeline.customSpecialization')}${item.institution ? ` • ${item.institution}` : ''}`
      : item.organization;
  const dateLabel = isCertification
    ? item.issueDate
    : isWorkExperience
      ? [item.startDate, item.endDate].filter(Boolean).join(' - ')
      : (item as AcademicMajor).graduationYear;
  const description = (item as any).description;
  const documentUrl = (item as any).documentUrl as string | undefined;
  const verificationStatus = (item as any).verificationStatus as VerificationStatus | string | undefined;
  const rejectionReason = (item as any).rejectionReason as string | undefined;
  const normalizedStatus = String(verificationStatus || '').toUpperCase();
  const statusLabel = normalizedStatus ? t(`status.${normalizedStatus}`) : undefined;
  const statusTone: 'primary' | 'warning' | 'success' = normalizedStatus === 'VERIFIED' ? 'success' : 'warning';

  const toneStyles: Record<string, string> = {
    primary: 'bg-brand-primary/15 text-brand-dark border-brand-primary/20',
    success: 'bg-green-500/10 text-green-600 dark:text-green-300 border-green-500/20',
    info: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20',
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl border transition-all duration-300 ${isActive ? 'border-brand-primary shadow-glow-primary ring-2 ring-brand-primary/20' : 'border-slate-200 dark:border-slate-700'}`}>
      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border ${documentUrl ? 'border-slate-200 dark:border-slate-700' : 'border-transparent'} bg-white dark:bg-slate-900/50 flex items-center justify-center`}>
            {documentUrl ? (
              <img src={documentUrl} alt={title || t('profileSection.timeline.attachmentAlt')} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center rounded-xl border ${toneStyles[tone]}`}>
                {icon}
              </div>
            )}
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base font-bold text-slate-800 dark:text-white truncate max-w-full">{title || t('profileSection.timeline.missingTitle')}</h4>
              {statusLabel && (
                <BrandChip
                  label={statusLabel}
                  tone={statusTone}
                />
              )}
            </div>
            {subtitle && <p className="text-sm text-slate-500 dark:text-slate-300 truncate max-w-full">{subtitle}</p>}
            {dateLabel && <p className="text-xs text-slate-400">{t('profileSection.timeline.dateLabel', { value: dateLabel })}</p>}
            {description && <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{description}</p>}
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2 self-start md:self-center">
          <button onClick={onEdit} className="p-2 rounded-full hover:bg-brand-light/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/40">
            <EditIcon className="w-4 h-4 text-slate-500" />
          </button>
          <button onClick={onDelete} className="p-2 rounded-full hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200">
            <TrashIcon className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
      {rejectionReason && normalizedStatus === 'REJECTED' && (
        <div className="px-4 sm:px-5 pb-4">
          <div className="mt-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-xs text-red-700 dark:text-red-300">
            <strong className="font-semibold">{t('profileSection.timeline.rejectionReason')}</strong> {rejectionReason}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sidebar & hero ---
const ProfileSidebar: React.FC<{ educator: Educator; setModalState: (state: any) => void; }>
= ({ educator, setModalState }) => {
  const { t } = useLanguage();
  const SocialIcon: React.FC<{ platform: SocialLink['platform'] }> = ({ platform }) => {
    const icons = { linkedin: <LinkedinIcon className="w-5 h-5"/>, twitter: <TwitterIcon className="w-5 h-5"/>, github: <GithubIcon className="w-5 h-5"/>, website: <WebsiteIcon className="w-5 h-5"/> };
    return icons[platform] || <WebsiteIcon className="w-5 h-5"/>;
  };
  const platformChipClass = (p: string) => {
    switch (String(p)) {
      case 'linkedin':
        return 'bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/15';
      case 'twitter':
        return 'bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/15';
      case 'github':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600';
      default:
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-200/80 dark:hover:bg-emerald-900/50';
    }
  };
  const availability = String(educator.availabilityStatus || '').toUpperCase();
  const isAvailable = availability === 'AVAILABLE';
  const notAvailableLabel = t('profileSection.common.notAvailable');
  const approvedLabel = t('profileSection.financial.approved');
  const pendingLabel = t('profileSection.financial.pending');
  const financialStatus = typeof educator.paymentInfo.isApproved === 'boolean'
    ? (educator.paymentInfo.isApproved ? approvedLabel : pendingLabel)
    : notAvailableLabel;

  return (
    <aside id="prof-sidebar" className="lg:col-span-4 space-y-6 lg:sticky lg:top-8 mt-6 lg:mt-16">
      {/* <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border dark:border-slate-700/50 p-6 text-center">
        <div className="relative w-24 h-24 mx-auto">
          <img src={educator.avatarUrl} alt={educator.name} className="w-24 h-24 rounded-full border-4 border-brand-light"/>
          <span className={`absolute bottom-1 right-1 block h-5 w-5 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-slate-400'} border-2 border-white dark:border-slate-800`} title={isAvailable ? t('availability.AVAILABLE') : t('availability.UNAVAILABLE')}></span>
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-4">{educator.name}</h2>
        <p className="text-brand-dark font-semibold">{educator.discipline}</p>
        <div className="mt-2 flex justify-center items-center gap-2 text-sm">
          <BrandChip label={educator.status === 'نشط' ? t('profile.verifiedAccount') : String(educator.status)} tone={educator.status === 'نشط' ? 'success' : 'warning'} />
        </div>
      </div> */}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border dark:border-slate-700/50 p-5">
        <h3 className="font-bold text-slate-800 dark:text-white mb-3">{t('profile.completeness')}</h3>
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path className="stroke-slate-200 dark:stroke-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3"></path>
              <path className="stroke-brand-primary" strokeDasharray={`${educator.profile.profileCompletion}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" strokeLinecap="round" transform="rotate(-90 18 18)"></path>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-bold text-brand-dark">{educator.profile.profileCompletion}%</div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('profileSection.sidebar.completenessHint')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border dark:border-slate-700/50 divide-y dark:divide-slate-700">
        <div className="p-5 hidden"></div>
        <div className="p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-slate-800 dark:text-white">{t('profile.financialInfo')}</h3>
            <button onClick={() => setModalState({ type: 'payment' })} title={t('profile.editFinancialInfo')}><EditIcon className="w-5 h-5 text-slate-400 hover:text-brand-dark"/></button>
          </div>
          <div className="text-sm space-y-2">
            <p><strong>{t('profile.bankName')}:</strong> {educator.paymentInfo.bankName || notAvailableLabel}</p>
            <p><strong>{t('profile.accountHolderName')}:</strong> {educator.paymentInfo.accountHolderName || educator.paymentInfo.name || notAvailableLabel}</p>
            <p><strong>{t('profile.iban')}:</strong> {educator.paymentInfo.iban ? `****${educator.paymentInfo.iban.slice(-4)}` : notAvailableLabel}</p>
            <p><strong>{t('profileSection.financial.bankAddress')}:</strong> {educator.paymentInfo.address || notAvailableLabel}</p>
            <p><strong>{t('profileSection.financial.bankCountry')}:</strong> {educator.paymentInfo.bankCountry || notAvailableLabel}</p>
            <p><strong>{t('profileSection.financial.bankCode')}:</strong> {educator.paymentInfo.bankCode || notAvailableLabel}</p>
            <p><strong>{t('profileSection.financial.approvalStatus')}:</strong> {financialStatus}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

// --- File Upload Component for Inline Forms ---
const FileUploadWithPreview: React.FC<{ preview: string | null; fileName: string | null; onFileChange: (file: File | null) => void; onRemove: () => void; placeholderText?: string }>
= ({ preview, fileName, onFileChange, onRemove, placeholderText }) => {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) { onFileChange(e.target.files[0]); } };
  return (
    <div>
      <input type="file" ref={inputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf" />
      {preview ? (
        <div className="relative group w-full h-24 border border-slate-300 dark:border-slate-600 rounded-lg">
          <img src={preview} alt={t('profileSection.common.previewAlt')} className="w-full h-full object-contain rounded-lg p-1"/>
          <button type="button" onClick={onRemove} className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <XCircleIcon className="w-4 h-4"/>
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-brand-light hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-700 border-brand-primary/40">
          <UploadCloudIcon className="w-6 h-6 text-slate-400"/>
          <p className="text-xs text-slate-500">{placeholderText || t('profileSection.common.attachmentPlaceholder')}</p>
        </button>
      )}
    </div>
  );
};

// --- Inline Forms ---
const InlineFormWrapper: React.FC<{ onSave: () => void; onCancel: () => void; children: React.ReactNode; showFooterControls?: boolean; loading?: boolean }>
= ({ onSave, onCancel, children, showFooterControls = false, loading = false }) => {
  const { t } = useLanguage();
  return (
    <div className="mt-4 animate-fade-in">
      <div className="space-y-4">{children}</div>
      {showFooterControls && (
        <div className="flex flex-wrap justify-end gap-2 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button onClick={onCancel} disabled={loading} className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500 transition disabled:opacity-60 disabled:cursor-not-allowed ${loading ? 'cursor-wait' : ''}`}>{t('cancel')}</button>
          <LoadingButton type="button" onClick={onSave} loading={loading} variant="brand" className="text-xs md:text-sm font-semibold">{t('save')}</LoadingButton>
        </div>
      )}
    </div>
  );
};

const AcademicMajorForm: React.FC<{
  initialData?: AcademicMajor | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  registerSave?: (fn: () => void) => void;
}>
= ({ initialData, onSubmit, onCancel, registerSave }) => {
  const { data: officialMajors = [] } = useOfficialAcademicMajors();
  const [createdCustomOptions, setCreatedCustomOptions] = useState<SelectWithCreateOption[]>([]);
  const options: SelectWithCreateOption[] = useMemo(() => {
    const base = (officialMajors || []).map(m => ({ value: m.id, label: m.name }));
    const combined = [...base];
    createdCustomOptions.forEach(custom => {
      if (!combined.some(o => o.label.toLowerCase() === custom.label.toLowerCase())) {
        combined.push(custom);
      }
    });
    return combined;
  }, [officialMajors, createdCustomOptions]);

  const [formData, setFormData] = useState({
    degree: initialData?.degree || '',
    majorName: initialData?.majorName || '',
    institution: initialData?.institution || '',
    graduationYear: initialData?.graduationYear || '',
  });
  const [selected, setSelected] = useState<SelectWithCreateOption[]>([]);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialData?.documentUrl || null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialData) {
      setSelected((prev) => (prev.length === 0 ? prev : []));
      return;
    }
    const match = options.find(o => o.label === (initialData.majorName || ''));
    const nextSelection = match
      ? [match]
      : initialData.majorName
        ? [{ value: `custom:${initialData.majorName}`, label: initialData.majorName }]
        : [];
    setSelected((prev) => {
      const isSameLength = prev.length === nextSelection.length;
      const isSame = isSameLength && prev.every((item, index) => item.value === nextSelection[index]?.value && item.label === nextSelection[index]?.label);
      return isSame ? prev : nextSelection;
    });
  }, [initialData, options]);

  const handleFileChange = (file: File | null) => {
    setDocumentFile(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSelectChange = (vals: SelectWithCreateOption[]) => {
    const last = vals[vals.length - 1];
    setSelected(last ? [last] : []);
    setFormData(data => ({ ...data, majorName: last?.label || '' }));
  };

  const handleCreateOption = (label: string) => {
    const newOpt = { value: `custom:${label}`, label };
    setCreatedCustomOptions(prev => [...prev, newOpt]);
    setSelected([newOpt]);
    setFormData(data => ({ ...data, majorName: label }));
  };

  const initialId = initialData?.id;
  const [saving, setSaving] = useState(false);

  const { t } = useLanguage();
  const handleSave = useCallback(async () => {
    setError(null);
    const errors: string[] = [];
    const sel = selected[0];
    const degree = (formData.degree || '').trim();
    const institution = (formData.institution || '').trim();
    const gradYear = String(formData.graduationYear || '').trim();
    const majorName = (sel?.label || formData.majorName || '').trim();

    if (!degree) errors.push(t('profile.degreePlaceholder'));
    if (!majorName) errors.push(t('profile.selectOrAddDiscipline'));
    if (!institution) errors.push(t('profile.institutionPlaceholder'));
    if (!gradYear || !/^\d{4}$/.test(gradYear)) errors.push(t('profile.graduationYear'));
    const hasAttachment = Boolean(documentFile || preview);
    if (!hasAttachment) errors.push(t('profile.attachCertificate'));

    if (errors.length) {
      setError(errors.slice(0, 3).join(' | '));
      return;
    }

    const isCustom = !sel || !options.some(o => o.value === sel.value) || String(sel.value || '').startsWith('custom:');
    const payload: any = {
      id: initialId,
      degree,
      is_custom: isCustom ? 1 : 0,
      graduation_institution: institution,
      graduation_year: gradYear,
      certificate: documentFile || undefined,
    };
    if (isCustom) payload.custom_name = majorName;
    else if (sel) payload.academic_major_id = sel.value;

    try {
      setSaving(true);
      await Promise.resolve(onSubmit(payload));
    } finally {
      setSaving(false);
    }
  }, [selected, options, formData, documentFile, initialId, onSubmit]);

  useEffect(() => {
    if (registerSave) {
      registerSave(handleSave);
    }
  }, [registerSave, handleSave]);

  const labelClass = 'text-sm font-semibold text-slate-600 dark:text-slate-300';
  const inputClass = 'w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/70 px-3 py-2 text-sm text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary placeholder:text-slate-400 dark:placeholder:text-slate-500 transition';

  return (
    <InlineFormWrapper onSave={handleSave} onCancel={onCancel} showFooterControls loading={saving}>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800/60 dark:bg-red-900/20 dark:text-red-300">{error}</div>
      )}
      <div className="bg-white dark:bg-slate-800 border-2 border-brand-primary/30 rounded-2xl shadow-sm p-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <div className="space-y-1">
            <label className={labelClass}>{t('profile.degreePlaceholder')} <span className="text-red-500">*</span></label>
            <select
              value={formData.degree}
              onChange={e => setFormData(data => ({ ...data, degree: e.target.value }))}
              className={inputClass}
            >
              <option value="">{t('common.selectPlaceholder')}</option>
              <option value="diploma">دبلوم</option>
              <option value="bachelor">بكالوريوس</option>
              <option value="master">ماجستير</option>
              <option value="phd">دكتوراه</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className={labelClass}>{t('profile.selectOrAddDiscipline')} <span className="text-red-500">*</span></label>
            <SelectWithCreate
              options={options}
              value={selected}
              onChange={handleSelectChange}
              onCreate={handleCreateOption}
              placeholder={t('profile.selectOrAddDiscipline')}
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>{t('profile.institutionPlaceholder')} <span className="text-red-500">*</span></label>
            <input
              value={formData.institution}
              onChange={e => setFormData(data => ({ ...data, institution: e.target.value }))}
              placeholder={t('profile.institutionPlaceholder')}
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>{t('profile.graduationYear')} <span className="text-red-500">*</span></label>
            <input
              value={formData.graduationYear}
              onChange={e => setFormData(data => ({ ...data, graduationYear: e.target.value }))}
              placeholder="مثال: 2022"
              className={inputClass}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className={labelClass}>{t('profile.attachCertificate')} <span className="text-red-500">*</span></label>
            <FileUploadWithPreview preview={preview} fileName={documentFile?.name || null} onFileChange={handleFileChange} onRemove={() => handleFileChange(null)} placeholderText={t('profile.attachCertificate')} />
          </div>
        </div>
      </div>
    </InlineFormWrapper>
  );
};

const AchievementForm: React.FC<{
  initialData?: Achievement | null;
  defaultType?: 'work_experience' | 'certificate' | 'course' | 'workshop';
  onSaved: (a: Achievement) => void;
  onCancel: () => void;
  registerSave?: (fn: () => void) => void;
}>
= ({ initialData, defaultType = 'work_experience', onSaved, onCancel, registerSave }) => {
  const [type, setType] = useState<'work_experience' | 'certificate' | 'course' | 'workshop'>(
    (initialData?.type as any) || defaultType
  );
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    organization: initialData?.organization || '',
    start_date: initialData?.startDate || '',
    end_date: initialData?.endDate || '',
    issue_date: (initialData as any)?.date || '',
    description: initialData?.description || '',
  });
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialData?.documentUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleFileChange = (file: File | null) => {
    setDocumentFile(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const { t } = useLanguage();
  const handleSave = useCallback(async () => {
    setError(null);
    const errs: string[] = [];
    const title = (formData.title || '').trim();
    const org = (formData.organization || '').trim();

    if (!title) errs.push(t('profile.jobTitle'));
    if (!org) errs.push(t('profile.company'));
    if (type === 'work_experience') {
      if (!formData.start_date) errs.push(t('profile.workExperience'));
    } else {
      if (!formData.issue_date) errs.push(t('profile.issuingAuthority'));
    }

    if (errs.length) {
      setError(errs.slice(0, 3).join(' | '));
      return;
    }

    try {
      setSaving(true);
      const payload: AchievementPayload = {
        title,
        type,
        description: formData.description || undefined,
        organization: org || undefined,
        start_date: type === 'work_experience' ? (formData.start_date || null) : undefined,
        end_date: type === 'work_experience' ? (formData.end_date || null) : undefined,
        issue_date: type !== 'work_experience' ? (formData.issue_date || null) : undefined,
        attachment: documentFile || undefined,
      };
      const saved = initialData?.id
        ? await updateAchievement(String(initialData.id), payload)
        : await createAchievement(payload);
      onSaved(saved);
    } catch (e: any) {
      const msg = e?.message || t('modals.errorOccurred');
      setError(msg);
    } finally {
      setSaving(false);
    }
  }, [initialData?.id, formData, type, documentFile, onSaved]);

  useEffect(() => {
    if (registerSave) {
      registerSave(handleSave);
    }
  }, [registerSave, handleSave]);

  const labelClass = 'text-sm font-semibold text-slate-600 dark:text-slate-300';
  const inputClass = 'w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/70 px-3 py-2 text-sm text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary placeholder:text-slate-400 dark:placeholder:text-slate-500 transition';

  return (
    <InlineFormWrapper onSave={handleSave} onCancel={onCancel} showFooterControls loading={saving}>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800/60 dark:bg-red-900/20 dark:text-red-300">{error}</div>
      )}
      <div className="bg-white dark:bg-slate-800 border-2 border-brand-primary/30 rounded-2xl shadow-sm p-5 space-y-5">
        <div className="space-y-5">
          {/* Row 1: Type & Title side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div className="space-y-1">
              <label className={labelClass}>{t('modals.assignmentType')} <span className="text-red-500">*</span></label>
              <select value={type} onChange={e => setType(e.target.value as any)} className={inputClass}>
                {ACHIEVEMENT_TYPES.map((achieveType) => (
                  <option key={achieveType} value={achieveType}>
                    {achieveType === 'work_experience' ? t('profile.workExperience') : achieveType === 'certificate' ? t('profile.certificateCourse') : achieveType === 'course' ? 'دورة تدريبية' : 'ورشة عمل'}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>{type === 'work_experience' ? t('profile.jobTitle') : t('profile.certificateName')} <span className="text-red-500">*</span></label>
              <input
                value={formData.title}
                onChange={e => setFormData(data => ({ ...data, title: e.target.value }))}
                placeholder={type === 'work_experience' ? 'مثل: معلم لغة عربية' : 'مثل: شهادة تدريب المدربين'}
                className={inputClass}
              />
            </div>
          </div>

          {/* Row 2: Organization & Dates in 1 line */}
          {type === 'work_experience' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-5">
              <div className="space-y-1">
                <label className={labelClass}>{t('profile.company')} <span className="text-red-500">*</span></label>
                <input
                  value={formData.organization}
                  onChange={e => setFormData(data => ({ ...data, organization: e.target.value }))}
                  placeholder={t('profile.company')}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>{t('profile.startDate')} <span className="text-red-500">*</span></label>
                <input type="date" value={formData.start_date} onChange={e => setFormData(d => ({ ...d, start_date: e.target.value }))} className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>{t('profile.endDate')}</label>
                <input type="date" value={formData.end_date} onChange={e => setFormData(d => ({ ...d, end_date: e.target.value }))} className={inputClass} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div className="space-y-1">
                <label className={labelClass}>{t('profile.issuingAuthority')} <span className="text-red-500">*</span></label>
                <input
                  value={formData.organization}
                  onChange={e => setFormData(data => ({ ...data, organization: e.target.value }))}
                  placeholder={t('profile.issuingAuthority')}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>{t('profile.issueDate')} <span className="text-red-500">*</span></label>
                <input type="date" value={formData.issue_date} onChange={e => setFormData(d => ({ ...d, issue_date: e.target.value }))} className={inputClass} />
              </div>
            </div>
          )}

          {/* Row 3: Description with asterisk */}
          <div className="space-y-1">
            <label className={labelClass}>{t('modals.description')} <span className="text-red-500">*</span></label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(data => ({ ...data, description: e.target.value }))}
              placeholder={t('modals.descriptionPlaceholder')}
              rows={3}
              className={`${inputClass} min-h-[96px]`}
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className={labelClass}>{t('profile.attachProof')}</label>
            <FileUploadWithPreview preview={preview} fileName={documentFile?.name || null} onFileChange={handleFileChange} onRemove={() => handleFileChange(null)} />
          </div>
        </div>
      </div>
    </InlineFormWrapper>
  );
};

// Inline Basic Info Form
const BasicInfoForm: React.FC<{ educator: Educator; onSaved: (u: Educator) => void; onCancel: () => void; registerSave?: (fn: () => void) => void; onSavingChange?: (s: boolean) => void }>
= ({ educator, onSaved, onCancel, registerSave, onSavingChange }) => {
  const [name, setName] = useState(educator.name || '');
  const [email, setEmail] = useState(educator.email || '');
  const [phone, setPhone] = useState(educator.phone || '');
  const [gender, setGender] = useState<'male' | 'female'>((educator.profile.gender as any) || 'male');
  const [experienceYears, setExperienceYears] = useState<number>(Number(educator.profile.experienceYears || 0));
  const [idType, setIdType] = useState<'national_id' | 'passport'>(((educator.profile as any).idType as any) || 'national_id');
  const [idNumber, setIdNumber] = useState<string>(educator.profile.idNumber || '');
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(educator.profile.idDocumentUrl || null);
  const [backPreview, setBackPreview] = useState<string | null>(educator.profile.idDocumentBackUrl || null);
  const [frontRemoved, setFrontRemoved] = useState<boolean>(false);
  const [backRemoved, setBackRemoved] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const nationalities = useNationalities();
  const countries = useCountries();
  const [countryId, setCountryId] = useState<string | undefined>(undefined);
  const [cityId, setCityId] = useState<string | undefined>(undefined);
  const [nationalityId, setNationalityId] = useState<string | undefined>(undefined);
  const cities = useCountryCities(countryId);

  useEffect(() => {
    if (countries.data && !countryId) {
      const match = countries.data.find(c => c.title === (educator.country || ''));
      if (match) setCountryId(match.id);
    }
  }, [countries.data, educator.country, countryId]);

  useEffect(() => {
    if (nationalities.data && !nationalityId) {
      const match = nationalities.data.find(n => n.title === (educator.profile.nationality || ''));
      if (match) setNationalityId(match.id);
    }
  }, [nationalities.data, educator.profile.nationality, nationalityId]);

  useEffect(() => {
    if (cities.data && !cityId) {
      const match = cities.data.find(c => c.title === (educator.city || ''));
      if (match) setCityId(match.id);
    }
  }, [cities.data, educator.city, cityId]);

  useEffect(() => {
    if (frontFile) {
      setFrontPreview(URL.createObjectURL(frontFile));
      setFrontRemoved(false);
    } else if (!frontRemoved) {
      setFrontPreview(educator.profile.idDocumentUrl || null);
    }
  }, [frontFile, educator.profile.idDocumentUrl, frontRemoved]);

  useEffect(() => {
    if (backFile) {
      setBackPreview(URL.createObjectURL(backFile));
      setBackRemoved(false);
    } else if (!backRemoved) {
      setBackPreview(educator.profile.idDocumentBackUrl || null);
    }
  }, [backFile, educator.profile.idDocumentBackUrl, backRemoved]);

  const updateBasicMutation = useUpdateBasicInfo({});

  const sectionTitleClass = 'text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2';
  const helperTextClass = 'text-xs text-slate-500 dark:text-slate-400';
  const labelClass = 'text-sm font-semibold text-slate-600 dark:text-slate-300';
  const inputClass = 'w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/70 px-3 py-2 text-sm text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary placeholder:text-slate-400 dark:placeholder:text-slate-500 transition';
  const radioLabelClass = 'flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-200';
  const radioInputClass = 'h-4 w-4 text-brand-primary focus:ring-brand-primary border-slate-300';
  const errorTextClass = 'text-xs text-red-600 dark:text-red-400';

  const { t } = useLanguage();
  const collectValidationErrors = () => {
    const errors: string[] = [];
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedId = idNumber.trim();
    if (!trimmedName) errors.push(t('profile.fullName'));
    if (!trimmedEmail) errors.push(t('profile.email'));
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) errors.push(t('profile.email'));
    const numericPhone = trimmedPhone.replace(/\D+/g, '');
    if (!numericPhone) errors.push(t('profile.phone'));
    else if (numericPhone.length < 8) errors.push(t('profile.phone'));
    if (!nationalityId) errors.push(t('profile.nationality'));
    if (!countryId) errors.push(t('profile.country'));
    if (!cityId) errors.push(t('profile.city'));
    if (!idType) errors.push(t('profile.idType'));
    if (!trimmedId) errors.push(t('profile.idNumber'));
    if (!Number.isFinite(experienceYears) || experienceYears < 0) errors.push('سنوات الخبرة');
    return errors;
  };

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const validationErrors = collectValidationErrors();
    if (validationErrors.length) {
      setFormError(validationErrors.slice(0, 3).join(' | '));
      return;
    }
    setFormError(null);
    try {
      setSaving(true);
      onSavingChange && onSavingChange(true);
      const payload: any = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        nationality_id: nationalityId as string,
        gender,
        country_id: countryId as string,
        city_id: cityId as string,
        identity_type: idType,
        identity_id: idNumber.trim(),
        experience_years: Math.max(0, Number(experienceYears) || 0),
      };
      if (frontRemoved) {
        (payload as any).delete_identity_front = '1';
      }
      if (backRemoved) {
        (payload as any).delete_identity_back = '1';
      }
      if (frontFile instanceof File) {
        payload.identityImageFront = frontFile;
      }
      if (backFile instanceof File && idType !== 'passport') {
        payload.identityImageBack = backFile;
      }
      const updated = await updateBasicMutation.mutateAsync(payload);
      onSaved(updated);
      onCancel();
    } catch (e: any) {
      const rawErrors = e?.errors && typeof e.errors === 'object' ? Object.values(e.errors) : (e?.data && typeof e.data === 'object' ? Object.values(e.data) : []);
      const flatErrors = Array.isArray(rawErrors) ? rawErrors.flat().filter(Boolean) : [];
      setFormError(flatErrors.length ? flatErrors.slice(0, 3).join(' | ') : (e?.message || t('modals.errorOccurred')));
    } finally {
      setSaving(false);
      onSavingChange && onSavingChange(false);
    }
  };

  useEffect(() => {
    if (registerSave) registerSave(handleSave);
  }, [registerSave, name, email, phone, gender, experienceYears, idType, idNumber, frontFile, backFile, nationalityId, countryId, cityId]);

  return (
    <InlineFormWrapper onSave={handleSave} onCancel={onCancel} loading={saving}>
      {formError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800/60 dark:bg-red-900/20 dark:text-red-300">
          {formError}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12 gap-y-8">
        <div className="space-y-6">
          <div>
            <h3 className={sectionTitleClass}>{t('profile.fullName')}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
            <div className="space-y-1 sm:col-span-2">
              <label className={labelClass}>{t('profile.fullName')} <span className="text-red-500">*</span></label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder={t('profile.fullName')} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>{t('profile.nationality')} <span className="text-red-500">*</span></label>
              <CustomSelect
                value={nationalityId || ''}
                onChange={(value) => setNationalityId(value)}
                options={(nationalities.data || []).map(n => ({ value: n.id, label: n.title }))}
                placeholder={t('common.selectPlaceholder')}
              />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>{t('profile.gender')} <span className="text-red-500">*</span></label>
              <div className="flex gap-6 pt-1.5">
                <label className={radioLabelClass}>
                  <input type="radio" value="male" checked={gender === 'male'} onChange={() => setGender('male')} className={radioInputClass} />
                  <span>{t('gender.MALE')}</span>
                </label>
                <label className={radioLabelClass}>
                  <input type="radio" value="female" checked={gender === 'female'} onChange={() => setGender('female')} className={radioInputClass} />
                  <span>{t('gender.FEMALE')}</span>
                </label>
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>{t('profile.country')} <span className="text-red-500">*</span></label>
              <CustomSelect
                value={countryId || ''}
                onChange={(value) => { setCountryId(value); setCityId(undefined); }}
                options={(countries.data || []).map(c => ({ value: c.id, label: c.title }))}
                placeholder={t('common.selectPlaceholder')}
              />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>{t('profile.city')} <span className="text-red-500">*</span></label>
              <CustomSelect
                value={cityId || ''}
                onChange={(value) => setCityId(value)}
                options={(cities.data || []).map(c => ({ value: c.id, label: c.title }))}
                placeholder={t('common.selectPlaceholder')}
              />
              {!cityId && countryId && (cities.data?.length === 0) && (
                <p className={errorTextClass}>{t('noResults')}</p>
              )}
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className={labelClass}>{t('modals.experienceLevel')} <span className="text-red-500">*</span></label>
              <input
                type="number"
                min={0}
                value={experienceYears}
                onChange={e => setExperienceYears(Number(e.target.value || 0))}
                placeholder="5"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className={sectionTitleClass}>{t('profile.email')}</h3>
          </div>
          <div className="space-y-5">
            <div className="space-y-1">
              <label className={labelClass}>{t('profile.email')} <span className="text-red-500">*</span></label>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="example@mail.com" className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>{t('profile.phone')} <span className="text-red-500">*</span></label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="05xxxxxxxx" className={inputClass} />
            </div>
          </div>
          <div className="space-y-5 border-t border-slate-200 dark:border-slate-700 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <div className="space-y-1">
                <label className={labelClass}>{t('profile.idType')} <span className="text-red-500">*</span></label>
                <CustomSelect
                  value={idType}
                  onChange={(value) => setIdType(value as 'national_id' | 'passport')}
                  options={[{ value: 'national_id', label: t('idType.NATIONAL_ID') }, { value: 'passport', label: t('idType.PASSPORT') }]}
                  placeholder={t('common.selectPlaceholder')}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>{t('profile.idNumber')} <span className="text-red-500">*</span></label>
                <input value={idNumber} onChange={e => setIdNumber(e.target.value)} placeholder={t('profile.idNumber')} className={inputClass} />
              </div>
            </div>
            {idType === 'passport' ? (
              <div className="grid grid-cols-1 gap-y-5">
                <div className="space-y-1">
                  <label className={labelClass}>{t('profile.idPhoto')}</label>
                  <FileUploadWithPreview
                    preview={frontPreview}
                    fileName={frontFile?.name || null}
                    onFileChange={(f) => { setFrontFile(f); setFrontRemoved(false); }}
                    onRemove={() => { setFrontFile(null); setFrontRemoved(true); setFrontPreview(null); }}
                  />
                  {frontPreview && (
                    <button type="button" onClick={() => { setFrontFile(null); setFrontRemoved(true); setFrontPreview(null); }} className="mt-2 text-xs text-red-600">{t('delete')}</button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div className="space-y-1">
                  <label className={labelClass}>{t('profile.idPreview')}</label>
                  <FileUploadWithPreview
                    preview={frontPreview}
                    fileName={frontFile?.name || null}
                    onFileChange={(f) => { setFrontFile(f); setFrontRemoved(false); }}
                    onRemove={() => { setFrontFile(null); setFrontRemoved(true); setFrontPreview(null); }}
                  />
                  {frontPreview && (
                    <button type="button" onClick={() => { setFrontFile(null); setFrontRemoved(true); setFrontPreview(null); }} className="mt-2 text-xs text-red-600">{t('delete')}</button>
                  )}
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>{t('profile.idPreview')}</label>
                  <FileUploadWithPreview
                    preview={backPreview}
                    fileName={backFile?.name || null}
                    onFileChange={(f) => { setBackFile(f); setBackRemoved(false); }}
                    onRemove={() => { setBackFile(null); setBackRemoved(true); setBackPreview(null); }}
                  />
                  {backPreview && (
                    <button type="button" onClick={() => { setBackFile(null); setBackRemoved(true); setBackPreview(null); }} className="mt-2 text-xs text-red-600">{t('delete')}</button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </InlineFormWrapper>
  );
};

// Inline Biography Form
const BiographyForm: React.FC<{ educator: Educator; onSaved: (u: Educator) => void; onCancel: () => void; registerSave?: (fn: () => void) => void; onSavingChange?: (s: boolean) => void }>
= ({ educator, onSaved, onCancel, registerSave, onSavingChange }) => {
  const [title, setTitle] = useState<string>((educator as any).bioTitle || '');
  const [description, setDescription] = useState<string>(educator.bio || '');
  const [links, setLinks] = useState<SocialLink[]>([...educator.socialLinks]);
  const updateBioMutation = useUpdateBiography({});
  const [bioError, setBioError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    setBioError(null);
    try {
      setSaving(true);
      onSavingChange && onSavingChange(true);
      const updated = await updateBioMutation.mutateAsync({ bio: { title, description }, social_links: links.map(l => ({ platform: l.platform, url: l.url })) } as any);
      const mergedEducator = {
        ...educator,
        ...(updated || {}),
        bio: description,
        bioTitle: title || null,
        socialLinks: links,
      };
      onSaved(mergedEducator as any);
      onCancel();
    } catch (e: any) {
      const rawErrors = e?.errors && typeof e.errors === 'object' ? Object.values(e.errors) : (e?.data && typeof e.data === 'object' ? Object.values(e.data) : []);
      const flatErrors = Array.isArray(rawErrors) ? rawErrors.flat().filter(Boolean) : [];
      setBioError(flatErrors.length ? flatErrors.slice(0, 3).join(' | ') : (e?.message || t('modals.errorOccurred')));
    } finally {
      setSaving(false);
      onSavingChange && onSavingChange(false);
    }
  };

  useEffect(() => {
    if (registerSave) registerSave(handleSave);
  }, [registerSave, title, description, links]);
  const updateLink = (index: number, field: 'platform' | 'url', value: string) => {
    setLinks(prev => prev.map((l, i) => i === index ? { ...l, [field]: value } as any : l));
  };
  const addLink = () => setLinks(prev => [...prev, { platform: 'linkedin', url: '' } as any]);
  const removeLink = (index: number) => setLinks(prev => prev.filter((_, i) => i !== index));
  // Translation helper using the useLanguage hook
  const { t } = useLanguage();
  return (
    <InlineFormWrapper onSave={handleSave} onCancel={onCancel} loading={saving}>
      {bioError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-800/60 dark:bg-red-900/20 dark:text-red-300">
          {bioError}
        </div>
      )}
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder={t('optional')} className="w-full bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md text-sm p-2"/>
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder={t('profile.bioPlaceholder')} rows={6} className="w-full bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md text-sm p-2"/>
      <div>
        <div className="flex items-center justify-between mb-2"><h4 className="font-bold text-slate-800 dark:text-white">{t('profile.socialLinks')}</h4><button onClick={addLink} type="button" className="px-2 py-1 text-xs rounded bg-brand-primary text-white">{t('profile.addAnotherLink')}</button></div>
        <div className="space-y-3">
          {links.map((l, idx) => (
            <div key={idx} className="p-3 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/70">
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-center">
                <div className="sm:col-span-2 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-brand-primary/15 text-brand-dark">
                    {l.platform === 'linkedin' ? <LinkedinIcon className="w-5 h-5"/> : l.platform === 'twitter' ? <TwitterIcon className="w-5 h-5"/> : l.platform === 'github' ? <GithubIcon className="w-5 h-5"/> : <WebsiteIcon className="w-5 h-5"/>}
                  </span>
                  <select value={l.platform} onChange={e => updateLink(idx, 'platform', e.target.value)} className="flex-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-sm p-2">
                    <option value="linkedin">{t('social.linkedin')}</option>
                    <option value="twitter">{t('social.twitter')}</option>
                    <option value="github">{t('social.github')}</option>
                    <option value="website">{t('social.website')}</option>
                  </select>
                </div>
                <div className="sm:col-span-4">
                  <div className="flex items-stretch rounded-md overflow-hidden border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700">
                    <span className="px-2.5 text-slate-400 flex items-center text-xs">https://</span>
                    <input
                      value={l.url}
                      onChange={e => {
                        const value = e.target.value.trim();
                        updateLink(idx, 'url', value);
                      }}
                      placeholder="example.com/username"
                      className="flex-1 bg-transparent text-sm p-2 outline-none"
                    />
                    {l.url && (
                      <span className="hidden sm:inline px-2 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 border-s-l border-slate-300 dark:border-slate-600 truncate max-w-[40%]">
                        {(() => { try { return new URL(l.url.startsWith('http') ? l.url : `https://${l.url}`).hostname.replace('www.',''); } catch { return l.url; } })()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">{t('profile.editSocialLinks')}</span>
                <button onClick={() => removeLink(idx)} type="button" className="text-xs text-red-600 hover:text-red-700">{t('delete')}</button>
              </div>
            </div>
          ))}
          {links.length === 0 && <div className="text-xs text-slate-500">{t('noResults')}</div>}
        </div>
      </div>
    </InlineFormWrapper>
  );
};

// --- Onboarding Journey (compact & horizontal)
const OnboardingJourney: React.FC<{ missing: { key: string; label: string; action: () => void; done: boolean; }[] }>
= ({ missing }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-brand-light/50 dark:border-slate-700/50 p-3 md:p-4 mb-4">
    <div className="flex flex-wrap gap-2">
      {missing.map((s) => (
        <button key={s.key} onClick={!s.done ? s.action : undefined} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition ${s.done ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' : 'bg-brand-light text-brand-dark border-brand-primary/30 hover:shadow-glow-primary'}`}>
          {s.done ? <CheckCircleIcon className="w-4 h-4"/> : <span className="w-2.5 h-2.5 rounded-full bg-brand-primary inline-block"/>}
          <span className="truncate max-w-[220px] text-right">{s.label}</span>
        </button>
      ))}
    </div>
  </div>
);

const ProfileView: React.FC<ProfileViewProps> = ({ educator, onUpdateProfile, predefinedSkills }) => {
  const [modalState, setModalState] = useState<{ type: string; data?: any } | null>(null);
  const { t } = useLanguage();
  const [formState, setFormState] = useState<{ mode: 'add' | 'edit'; section: string; id?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'academic' | 'experience' | 'services'>('info');
  const [editingBasic, setEditingBasic] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [experienceAddCategory, setExperienceAddCategory] = useState<'experience' | 'certificate' | 'course' | 'workshop'>('experience');
  const basicSaveRef = useRef<(() => void) | null>(null);
  const bioSaveRef = useRef<(() => void) | null>(null);
  const academicSaveRef = useRef<(() => void) | null>(null);
  const experienceSaveRef = useRef<(() => void) | null>(null);
  const [savingBasic, setSavingBasic] = useState(false);
  const [savingBio, setSavingBio] = useState(false);

  const readOnlyValueClass = 'w-full rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white bg-brand-light/40 dark:bg-slate-900/30 shadow-sm';
  const formatDisplayValue = (value: string | number | null | undefined) => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length ? trimmed : '—';
    }
    return value;
  };

  const enterBasicEditing = () => {
    basicSaveRef.current = null;
    setEditingBasic(true);
  };

  const exitBasicEditing = () => {
    basicSaveRef.current = null;
    setEditingBasic(false);
  };

  const enterBioEditing = () => {
    bioSaveRef.current = null;
    setEditingBio(true);
  };

  const exitBioEditing = () => {
    bioSaveRef.current = null;
    setEditingBio(false);
  };

  const openInlineEditor = (payload: { mode: 'add' | 'edit'; section: string; id?: string }) => {
    if (payload.section === 'academic') {
      academicSaveRef.current = null;
    }
    if (payload.section === 'experience' || payload.section === 'certification') {
      experienceSaveRef.current = null;
    }
    setFormState(payload);
  };

  const resetInlineEditor = () => {
    setFormState(null);
    academicSaveRef.current = null;
    experienceSaveRef.current = null;
    setExperienceAddCategory('experience');
  };

  const isAcademicInlineActive = formState?.section === 'academic';
  const isTimelineInlineActive =
    formState?.section === 'experience' || (formState?.section === 'certification' && formState?.mode === 'add');
  const isCertificationInlineActive = formState?.section === 'certification' && formState?.mode === 'edit';

  // API mutations
  const { addToast } = useData();
  const createSkillMutation = useCreateEducatorSkill();
  const updateSkillMutation = useUpdateEducatorSkill();
  const deleteSkillMutation = useDeleteEducatorSkill();
  const createLanguageMutation = useCreateEducatorLanguage();
  const updateLanguageMutation = useUpdateEducatorLanguage();
  const deleteLanguageMutation = useDeleteEducatorLanguage();
  const createServiceMutation = useCreateEducatorService();
  const updateServiceMutation = useUpdateEducatorService();
  const deleteServiceMutation = useDeleteEducatorService();
  const updatePaymentInfoMutation = useUpdatePaymentInfo();
  const deletePaymentInfoMutation = useDeletePaymentInfo();
  const createAcademicMajorMutation = useCreateAcademicMajorMutation();
  const updateAcademicMajorMutation = useUpdateAcademicMajorMutation();
  const deleteAcademicMajorMutation = useDeleteAcademicMajorMutation();

  const handleListUpdate = <T extends {id: string}>(section: keyof Educator, newList: T[]) => { onUpdateProfile({ ...educator, [section]: newList } as any); };

  const handleItemSubmit = async (data: any, section: string) => {
    const isEditing = formState?.mode === 'edit';
    const sectionMap: Record<string, keyof Educator> = { 'academic': 'academicMajors', 'experience': 'workExperience', 'certification': 'certifications', 'service': 'services' };
    const sectionKey = sectionMap[section];
    if (sectionKey === 'academicMajors') {
      try {
        if (isEditing && data?.id) {
          const resp = await updateAcademicMajorMutation.mutateAsync({ id: data.id, data });
          const updated = (resp as any)?.data ?? resp;
          const list = (educator.academicMajors as any[]) || [];
          handleListUpdate('academicMajors', list.map((item: any) => item.id === data.id ? { ...item, ...updated } : item));
        } else {
          const resp = await createAcademicMajorMutation.mutateAsync(data);
          const created = (resp as any)?.data ?? resp;
          handleListUpdate('academicMajors', [created as any, ...(educator.academicMajors || [])]);
        }
        setFormState(null);
      } catch (e: any) {
        const rawErrors = e?.errors && typeof e.errors === 'object' ? Object.values(e.errors) : (e?.data && typeof e.data === 'object' ? Object.values(e.data) : []);
        const flatErrors = Array.isArray(rawErrors) ? rawErrors.flat().filter(Boolean) : [];
        const errorMsg = flatErrors.length ? flatErrors.join(' | ') : (e?.message || 'حدث خطأ في حفظ المؤهل العلمي');
        addToast && addToast(errorMsg, 'error');
        return;
      }
      return;
    }

    if (sectionKey) {
      const list = (educator[sectionKey] as any[]) || [];
      if ((data as any).file) { (data as any).documentUrl = URL.createObjectURL((data as any).file); }
      delete (data as any).file;
      if (isEditing) {
        handleListUpdate(sectionKey, list.map(item => (item as any).id === formState?.id ? { ...item, ...data, verificationStatus: VerificationStatus.PENDING } : item));
      } else {
        handleListUpdate(sectionKey, [...list, { ...data, id: `new-${Date.now()}`, verificationStatus: VerificationStatus.PENDING } as any]);
      }
    }
    setFormState(null);
  };

  const [confirmState, setConfirmState] = useState<{ open: boolean; title?: string; message?: string; confirmText?: string; onConfirm?: (reason?: string) => void }>({ open: false });

  const openConfirm = (opts: { title?: string; message?: string; confirmText?: string; onConfirm?: (reason?: string) => void }) => {
    setConfirmState({ open: true, ...opts });
  };

  const closeConfirm = () => setConfirmState({ open: false });

  const handleDeleteItem = async (section: keyof Educator, itemId: string) => {
    openConfirm({
      title: t('profileSection.deleteConfirm.item'),
      message: t('profileSection.deleteConfirm.itemMsg'),
      confirmText: t('delete'),
      onConfirm: async () => {
        try {
          if (section === 'academicMajors') {
            await deleteAcademicMajorMutation.mutateAsync(itemId);
          }
          const list = (educator[section] as any[]) || [];
          handleListUpdate(section, list.filter((item: any) => item.id !== itemId));
        } catch (e) {}
        closeConfirm();
      }
    });
  };

  const isFormOpen = formState !== null;

  const missingSteps = useMemo(() => {
    return [
      { key: 'bio', label: 'أضف نبذة تعريفية احترافية', done: Boolean(educator.bio || (educator as any).bioTitle), action: () => setEditingBio(true) },
      { key: 'academic', label: 'أضف مؤهل علمي واحد على الأقل', done: educator.academicMajors.length > 0, action: () => setFormState({ mode: 'add', section: 'academic' }) },
      { key: 'experience', label: 'أضف خبرة عملية موثّقة', done: educator.workExperience.length > 0, action: () => setFormState({ mode: 'add', section: 'experience' }) },
      { key: 'certifications', label: 'أرفق شهادة أو دورة مهمة', done: educator.certifications.length > 0, action: () => setFormState({ mode: 'add', section: 'certification' }) },
      { key: 'skills', label: 'أضف مهارات ولغات', done: educator.skills.length > 0 && educator.languages.length > 0, action: () => setModalState({ type: 'skillLanguage' }) },
      { key: 'socials', label: 'أضف روابط تواصل احترافية', done: educator.socialLinks.length > 0, action: () => setModalState({ type: 'socialLinks' }) },
      { key: 'payment', label: 'أكمل معلوماتك المالية للسحب', done: Boolean(educator.paymentInfo?.iban), action: () => setModalState({ type: 'payment' }) },
    ];
  }, [educator]);

  const computedCompletion = useMemo(() => {
    const backendVal = Number(educator?.profile?.profileCompletion ?? 0);
    let score = 0;
    if (educator.name && educator.email && educator.phone) score += 20;
    if (educator.bio || (educator as any).bioTitle) score += 10;
    if (educator.socialLinks && educator.socialLinks.length > 0) score += 5;
    if (educator.profile?.nationality && educator.profile?.idNumber) score += 15;
    if (educator.academicMajors && educator.academicMajors.length > 0) score += 15;
    if ((educator.workExperience && educator.workExperience.length > 0) || (educator.achievements && educator.achievements.length > 0) || (educator.certifications && educator.certifications.length > 0)) score += 15;
    if ((educator.services && educator.services.length > 0) || (educator.skills && educator.skills.length > 0)) score += 10;
    if (educator.languages && educator.languages.length > 0) score += 10;
    return backendVal > 0 ? Math.max(backendVal, score) : score;
  }, [educator]);

  const educatorWithComputedCompletion = useMemo(() => ({
    ...educator,
    profile: {
      ...educator.profile,
      profileCompletion: computedCompletion,
    }
  }), [educator, computedCompletion]);

  const handleShareProfile = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: educator.name, url: shareUrl });
        addToast && addToast(t('profileSection.toast.linkCopied'), 'success');
        return;
      } catch {}
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      addToast && addToast(t('profileSection.toast.linkCopied'), 'success');
    }
  };

  const isNewProfile = !educator.bio && !(educator as any).bioTitle && educator.academicMajors.length === 0 && educator.workExperience.length === 0 && educator.certifications.length === 0;

  return (
    <div className="animate-fade-in">
      <div id="prof-hero" className="relative overflow-hidden rounded-2xl mb-4 bg-white text-brand-dark border border-brand-light/60">
        <div className="p-5 md:p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={educator.avatarUrl} alt={educator.name} className="w-16 h-16 rounded-full ring-4 ring-brand-light"/>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-extrabold text-brand-dark">{educator.name}</h1>
                {educator.discipline && <BrandChip label={educator.discipline} />}
                {educator.schoolName && <BrandChip label={educator.schoolName} />}
                <BrandChip label={t(`status.${String(educator.status || '').toUpperCase()}`)} tone={String(educator.status).toLowerCase() === 'active' ? 'success' : 'warning'} />
                <BrandChip label={`${t('availability')} :${t(`availability.${String(educator.availabilityStatus || '').toUpperCase()}`)}`} tone={String(educator.availabilityStatus || '').toLowerCase() === 'available' ? 'success' : 'warning'} />
              </div>
              {(educator as any).bioTitle ? (
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{(educator as any).bioTitle}</div>
              ) : null}
              <div className="mt-1 flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} className={`w-4 h-4 ${i < Math.round(educator.rating || 0) ? 'fill-current' : ''}`} />
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleShareProfile} className="px-3 py-2 text-xs md:text-sm font-bold bg-brand-primary/20 text-brand-dark rounded-lg hover:shadow-glow-primary flex items-center gap-1">
              <ShareIcon className="w-4 h-4"/> {t('profileSection.button.share')}
            </button>
          </div>
        </div>
      </div>

      <ProfileCompletenessBanner educator={educatorWithComputedCompletion} />
      {isNewProfile && <OnboardingJourney missing={missingSteps} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8">
        <main className="lg:col-span-8 space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-700 mb-4">
            <nav className="flex space-x-2 rtl:space-x-reverse -mb-px overflow-x-auto" aria-label="Tabs">
              <button onClick={() => setActiveTab('info')} className={`px-3 py-2 font-bold text-sm rounded-t-lg ${activeTab === 'info' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>{t('profileSection.tabs.basicInfo')}</button>
              <button onClick={() => setActiveTab('academic')} className={`px-3 py-2 font-bold text-sm rounded-t-lg ${activeTab === 'academic' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>{t('profile.qualifications')}</button>
              <button onClick={() => setActiveTab('experience')} className={`px-3 py-2 font-bold text-sm rounded-t-lg ${activeTab === 'experience' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>{t('profile.experienceAndCerts')}</button>
              <button onClick={() => setActiveTab('services')} className={`px-3 py-2 font-bold text-sm rounded-t-lg ${activeTab === 'services' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>{t('profileSection.tabs.servicesSkills')}</button>
            </nav>
          </div>

          {activeTab === 'info' ? (
            <>
              <div id="prof-bio-inline">
                <MainCard
                  title={t('profile.editBio')}
                  subtitle={t('profileSection.bioSubtitle')}
                  icon={<UserCircleIcon className="w-6 h-6 text-brand-dark"/>}
                  onAdd={() => setEditingBio(true)}
                  isFormOpen={editingBio}
                  actionText={t('edit')}
                  onSave={() => bioSaveRef.current && bioSaveRef.current()}
                  onCancel={() => setEditingBio(false)}
                  loading={savingBio}
                >
                  {!editingBio ? (
                    <>
                      <div className="space-y-4">
                        <div className="flex-1 space-y-2">
                          {(educator as any).bioTitle && educator.bio ? (
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">{(educator as any).bioTitle}</h4>
                          ) : null}
                          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed bg-brand-light/40 dark:bg-slate-900/40 p-4 rounded-lg border border-brand-light/60">{educator.bio || (educator as any).bioTitle || t('profileSection.noBio')}</p>
                        </div>
                        <div className="w-full">
                          <h4 className="font-bold text-slate-800 dark:text-white mb-2">{t('profile.socialLinks')}</h4>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                            {educator.socialLinks.map((link) => (
                              <a key={(link as any).id || link.platform} href={link.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 hover:shadow-glow-primary text-sm min-w-0">
                                {link.platform === 'linkedin' ? <LinkedinIcon className="w-4 h-4"/> : link.platform === 'twitter' ? <TwitterIcon className="w-4 h-4"/> : link.platform === 'github' ? <GithubIcon className="w-4 h-4"/> : <WebsiteIcon className="w-4 h-4"/>}
                                <span className="truncate">{(() => { try { return new URL(link.url.startsWith('http') ? link.url : `https://${link.url}`).hostname.replace('www.', ''); } catch { return link.url; } })()}</span>
                              </a>
                            ))}
                            {educator.socialLinks.length === 0 && <span className="text-xs text-slate-500">{t('profileSection.noLinksAdded')}</span>}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <BiographyForm educator={educator} onSaved={onUpdateProfile} onCancel={() => setEditingBio(false)} registerSave={(fn) => { bioSaveRef.current = fn; }} onSavingChange={(s) => setSavingBio(s)} />
                  )}
                </MainCard>
              </div>

              <div id="prof-basic">
                <MainCard
                  title={t('profileSection.basicInfo')}
                  subtitle={t('profileSection.basicInfoSubtitle')}
                  icon={<UserCircleIcon className="w-6 h-6 text-brand-dark"/>}
                  onAdd={enterBasicEditing}
                  isFormOpen={editingBasic}
                  actionText={t('edit')}
                  onSave={() => basicSaveRef.current?.()}
                  onCancel={exitBasicEditing}
                  loading={savingBasic}
                >
                  {!editingBasic ? (
                    <>
                      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12 gap-y-8">
                        <div className="space-y-6">
                          <div>
                            {/* <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">المعلوما�� الشخصية والمهنية</h3> */}
                            {/* <p className="text-xs text-slate-500 dark:text-slate-400">عرض لبياناتك الأساسية كما في النموذج.</p> */}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t('profile.fullName')}</label>
                              <div className={readOnlyValueClass}>{formatDisplayValue(educator.name)}</div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t('profile.nationality')}</label>
                              <div className={readOnlyValueClass}>{formatDisplayValue(educator.profile.nationality)}</div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t('profile.gender')}</label>
                              <div className="w-full rounded-lg bg-transparent px-3 py-2 text-sm font-bold text-slate-900 dark:text-white">{String(educator.profile.gender || '') === 'male' ? t('gender.MALE') : String(educator.profile.gender || '') === 'female' ? t('gender.FEMALE') : ''}</div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t('profile.country')}</label>
                              <div className="w-full rounded-lg bg-transparent px-3 py-2 text-sm font-bold text-slate-900 dark:text-white">{educator.country}</div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t('profile.city')}</label>
                              <div className="w-full rounded-lg bg-transparent px-3 py-2 text-sm font-bold text-slate-900 dark:text-white">{educator.city}</div>
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t('modals.experienceLevel')}</label>
                              <div className="w-full rounded-lg bg-transparent px-3 py-2 text-sm font-bold text-slate-900 dark:text-white">{String(educator.profile.experienceYears || 0)}</div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-6">
                          <div>
                            {/* <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 pb-2">معلومات التواصل والهوية</h3> */}
                            {/* <p className="text-xs text-slate-500 dark:text-slate-400">عرض البريد والهاتف والهوية.</p> */}
                          </div>
                          <div className="space-y-5">
                            <div className="space-y-1">
                              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t('profile.email')}</label>
                              <div className="w-full rounded-lg bg-transparent px-3 py-2 text-sm font-bold text-slate-900 dark:text-white">{educator.email}</div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t('profile.phone')}</label>
                              <div className="w-full rounded-lg bg-transparent px-3 py-2 text-sm font-bold text-slate-900 dark:text-white">{educator.phone}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 border-t border-slate-200 dark:border-slate-700 pt-6">
                            <div className="space-y-1">
                              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t('profile.idType')}</label>
                              <div className="w-full rounded-lg bg-transparent px-3 py-2 text-sm font-bold text-slate-900 dark:text-white">{String((educator.profile as any).idType || '') === 'national_id' ? t('idType.NATIONAL_ID') : String((educator.profile as any).idType || '') === 'passport' ? t('idType.PASSPORT') : ''}</div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t('profile.idNumber')}</label>
                              <div className="w-full rounded-lg bg-transparent px-3 py-2 text-sm font-bold text-slate-900 dark:text-white">{educator.profile.idNumber || ''}</div>
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">{t('profile.idPhoto')}</label>
                              <div className={`grid ${educator.profile.idType === 'passport' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-3`}>
                                <div>
                                  <span className="block text-xs text-slate-500 mb-1">{t('profileSection.idFront')}</span>
                                  {educator.profile.idDocumentUrl ? (
                                    <img src={educator.profile.idDocumentUrl} alt={t('profileSection.idFrontAlt')} className="w-full h-28 object-contain rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30"/>
                                  ) : (
                                    <span className="text-xs text-slate-400">{t('profileSection.notUploaded')}</span>
                                  )}
                                </div>
                                {educator.profile.idType !== 'passport' && (
                                  <div>
                                    <span className="block text-xs text-slate-500 mb-1">{t('profileSection.idBack')}</span>
                                    {educator.profile.idDocumentBackUrl ? (
                                      <img src={educator.profile.idDocumentBackUrl} alt={t('profileSection.idBackAlt')} className="w-full h-28 object-contain rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30"/>
                                    ) : (
                                      <span className="text-xs text-slate-400">{t('profileSection.notUploaded')}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <BasicInfoForm educator={educator} onSaved={onUpdateProfile} onCancel={exitBasicEditing} registerSave={(fn) => { basicSaveRef.current = fn; }} onSavingChange={(s) => setSavingBasic(s)} />
                  )}
                </MainCard>
              </div>

              {/* <div id="prof-bio-inline">
                <MainCard
                  title="النبذة التعريفية"
                  subtitle="عرّف نفسك بإيجاز واحترافية. قدّم خبراتك وأهم إنجازاتك."
                  icon={<UserCircleIcon className="w-6 h-6 text-brand-dark"/>}
                  onAdd={() => setEditingBio(true)}
                  isFormOpen={editingBio}
                  actionText="تعديل"
                  onSave={() => bioSaveRef.current && bioSaveRef.current()}
                  onCancel={() => setEditingBio(false)}
                  loading={savingBio}
                >
                  {!editingBio ? (
                    <>
                      <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">{educator.bio || 'لم تقم بإضافة نبذة تعريفية بعد.'}</p>
                      <div className="mt-4">
                        <h4 className="font-bold text-slate-800 dark:text-white mb-2"> التواصل</h4>
                        <div className="flex items-center gap-3 flex-wrap">
                          {educator.socialLinks.map((link) => (
                            <a key={(link as any).id || link.platform} href={link.url} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full text-sm font-semibold transition ${platformChipClass(link.platform)}`}>
                              {link.platform === 'linkedin' ? <LinkedinIcon className="w-5 h-5"/> : link.platform === 'twitter' ? <TwitterIcon className="w-5 h-5"/> : link.platform === 'github' ? <GithubIcon className="w-5 h-5"/> : <WebsiteIcon className="w-5 h-5"/>}
                            </a>
                          ))}
                          {educator.socialLinks.length === 0 && <span className="text-xs text-slate-500">لا توجد روابط مضافة.</span>}
                        </div>
                      </div>
                    </>
                  ) : (
                    <BiographyForm educator={educator} onSaved={onUpdateProfile} onCancel={() => setEditingBio(false)} registerSave={(fn) => { bioSaveRef.current = fn; }} onSavingChange={(s) => setSavingBio(s)} />
                  )}
                </MainCard>
              </div> */}
            </>
          ) : (
            <>
          <div id="prof-skills-languages" className={activeTab === 'services' ? '' : 'hidden'}>
            <MainCard
              title={t('profileSection.skillsLanguagesTitle')}
              subtitle={t('profileSection.skillsLanguagesSubtitle')}
              icon={<GlobeAltIcon className="w-6 h-6 text-brand-dark"/>}
              onAdd={() => setModalState({ type: 'skill' })}
              isFormOpen={!!modalState}
            >
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-800 dark:text-white">{t('profileSection.skillsTitle')}</h4>
                    <button onClick={() => setModalState({ type: 'skill' })} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-brand-primary rounded-lg hover:shadow-glow-primary"><PlusIcon className="w-4 h-4"/> {t('profile.addSkill')}</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {educator.skills.map(s => (
                      <span key={s.id} className="inline-flex items-center gap-1 bg-brand-primary/15 text-brand-dark text-xs font-semibold px-2.5 py-1.5 rounded-full">
                        {s.name} • {s.level}
                        {s.isCustom && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-brand-primary/30 text-[10px]">{t('profileSection.customTag')}</span>}
                        <button onClick={() => setModalState({ type: 'skill', data: { skill: s } })} className="ml-1 text-slate-500 hover:text-brand-dark"><EditIcon className="w-3 h-3"/></button>
                        <button onClick={() => openConfirm({ title: t('skills.confirmDeleteTitle'), message: t('skills.confirmDeleteMessage', {name:s.name}), confirmText: t('delete'), onConfirm: async () => { try { await deleteSkillMutation.mutateAsync(s.id); const list = educator.skills.filter(x => x.id !== s.id); onUpdateProfile({ ...educator, skills: list } as any); } catch {} closeConfirm(); } })} className="text-slate-500 hover:text-red-600"><TrashIcon className="w-3 h-3"/></button>
                      </span>
                    ))}
                    {educator.skills.length === 0 && <span className="text-xs text-slate-500">{t('profileSection.noSkillsAdded')}</span>}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-800 dark:text-white">{t('profileSection.languagesTitle')}</h4>
                    <button onClick={() => setModalState({ type: 'language' })} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-brand-primary rounded-lg hover:shadow-glow-primary"><PlusIcon className="w-4 h-4"/> {t('profile.addLanguage')}</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {educator.languages.map(l => (
                      <span key={l.id} className="bg-brand-light text-brand-dark text-xs font-semibold px-2.5 py-1.5 rounded-full">
                        {l.name} • {l.level}
                        <button onClick={() => setModalState({ type: 'language', data: { language: l } })} className="ml-1 text-slate-500 hover:text-brand-dark"><EditIcon className="w-3 h-3"/></button>
                        <button onClick={() => openConfirm({ title: t('profileSection.deleteConfirm.language'), message: t('profileSection.deleteConfirm.languageMsg'), confirmText: t('delete'), onConfirm: async () => { try { await deleteLanguageMutation.mutateAsync((l as any).id); const list = educator.languages.filter(x => x.id !== l.id); onUpdateProfile({ ...educator, languages: list } as any); addToast && addToast('تم حذف اللغة', 'info'); } catch {} closeConfirm(); } })} className="text-slate-500 hover:text-red-600"><TrashIcon className="w-3 h-3"/></button>
                      </span>
                    ))}
                    {educator.languages.length === 0 && <span className="text-xs text-slate-500">{t('profileSection.noLanguagesAdded')}</span>}
                  </div>
                </div>
              </div>
            </MainCard>
          </div>

          <div id="prof-services" className={activeTab === 'services' ? '' : 'hidden'}>
            <MainCard
              title={t('profileSection.servicesTitle')}
              subtitle={t('profileSection.servicesSubtitle')}
              icon={<WalletIcon className="w-6 h-6 text-brand-dark"/>}
              onAdd={() => setModalState({ type: 'service' })}
              isFormOpen={!!modalState}
            >
              <div className="flex flex-col gap-2">
                {educator.services.map((s) => (
                  <div key={s.id} className="flex items-start justify-between gap-2 p-3 rounded-lg border bg-brand-light/40 dark:bg-slate-900/40">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-white text-sm">{s.name}</div>
                      {s.description && <div className="text-xs text-slate-500 mt-1 whitespace-pre-line">{s.description}</div>}
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        {s.isCustom && <BrandChip label={t('profileSection.customTag')} />}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-60 hover:opacity-100">
                      <button onClick={() => setModalState({ type: 'service', data: { service: s } })} className="p-1 rounded hover:bg-brand-light"><EditIcon className="w-4 h-4"/></button>
                      <button onClick={() => openConfirm({ title: t('profileSection.deleteConfirm.service'), message: t('profileSection.deleteConfirm.serviceMsg'), confirmText: t('profileSection.button.delete'), onConfirm: async () => { try { await deleteServiceMutation.mutateAsync(s.id); handleListUpdate('services', educator.services.filter(x => x.id !== s.id)); } catch {} closeConfirm(); } })} className="p-1 rounded hover:bg-brand-light"><TrashIcon className="w-4 h-4"/></button>
                    </div>
                  </div>
                ))}
                {educator.services.length === 0 && <span className="text-xs text-slate-500">{t('profileSection.noServicesAdded')}</span>}
              </div>
            </MainCard>
          </div>

          <div id="prof-academic" className={activeTab === 'academic' ? '' : 'hidden'}>
          <MainCard
            title={t('profileSection.academicQualifications')}
            subtitle={t('profileSection.academicQualificationsSubtitle')}
            icon={<AcademicCapIcon className="w-6 h-6 text-brand-dark"/>}
            onAdd={() => setFormState({mode: 'add', section: 'academic'})}
            isFormOpen={isFormOpen}
          >
            <div className="space-y-6">
              {formState?.mode === 'add' && formState?.section === 'academic' && (
                <AcademicMajorForm onSubmit={(data) => handleItemSubmit(data, 'academic')} onCancel={() => setFormState(null)} registerSave={(fn) => { academicSaveRef.current = fn; }} />
              )}
              {educator.academicMajors.map(m => formState?.mode === 'edit' && formState?.section === 'academic' && formState.id === m.id ? (
                <AcademicMajorForm key={m.id} initialData={m} onSubmit={(data) => handleItemSubmit(data, 'academic')} onCancel={() => setFormState(null)} registerSave={(fn) => { academicSaveRef.current = fn; }} />
              ) : (
                <TimelineItem
                  key={m.id}
                  item={m}
                  icon={<AcademicCapIcon className="w-5 h-5" />}
                  tone="primary"
                  isActive={formState?.mode === 'edit' && formState?.section === 'academic' && formState.id === m.id}
                  onEdit={() => setFormState({ mode: 'edit', section: 'academic', id: m.id })}
                  onDelete={() => handleDeleteItem('academicMajors', m.id)}
                />
              ))}
              {educator.academicMajors.length === 0 && !formState && (
                <div className="text-sm text-center text-slate-500 bg-brand-light/40 p-4 rounded-lg">{t('profileSection.noQualificationsAdded')}</div>
              )}
            </div>
          </MainCard>
          </div>

          <div id="prof-achievements-unified" className={activeTab === 'experience' ? '' : 'hidden'}>
          <MainCard
            title={t('profileSection.achievementsTitle')}
            subtitle={t('profileSection.achievementsSubtitle')}
            icon={<BriefcaseIcon className="w-6 h-6 text-brand-dark"/>}
            onAdd={() => setFormState({mode: 'add', section: 'achievement'})}
            isFormOpen={isFormOpen}
            // onSave={() => experienceSaveRef.current?.()}
            onCancel={() => resetInlineEditor()}
          >
            <div className="space-y-6">
              {formState?.mode === 'add' && formState?.section === 'achievement' && (
                <AchievementForm
                  defaultType={experienceAddCategory === 'experience' ? 'work_experience' : experienceAddCategory}
                  onSaved={(saved) => {
                    const next = [saved, ...((educator.achievements || []).filter(a => a.id !== saved.id))];
                    onUpdateProfile({ ...educator, achievements: next } as any);
                    setFormState(null);
                  }}
                  onCancel={() => setFormState(null)}
                  registerSave={(fn) => { experienceSaveRef.current = fn; }}
                />
              )}

              {educator.achievements.map((a: Achievement) => (
                formState?.mode === 'edit' && formState?.section === 'achievement' && formState.id === a.id ? (
                  <AchievementForm
                    key={a.id}
                    initialData={a}
                    onSaved={(saved) => {
                      const list = (educator.achievements || []).map(x => x.id === saved.id ? saved : x);
                      onUpdateProfile({ ...educator, achievements: list } as any);
                      setFormState(null);
                    }}
                    onCancel={() => setFormState(null)}
                    registerSave={(fn) => { experienceSaveRef.current = fn; }}
                  />
                ) : (
                  <TimelineItem
                    key={a.id}
                    item={{
                      ...(a as any),
                      organization: a.organization || undefined,
                      issuingAuthority: undefined,
                      startDate: a.startDate || undefined,
                      endDate: a.endDate || undefined,
                      issueDate: a.date || undefined,
                    } as any}
                    icon={a.type === 'work_experience' ? <BuildingStorefrontIcon className="w-5 h-5" /> : <CheckBadgeIcon className="w-5 h-5" />}
                    tone={a.type === 'work_experience' ? 'success' : 'purple'}
                    isActive={formState?.mode === 'edit' && formState?.section === 'achievement' && formState.id === a.id}
                    onEdit={() => setFormState({ mode: 'edit', section: 'achievement', id: a.id })}
                    onDelete={async () => {
                      openConfirm({ title: t('profileSection.deleteConfirm.item'), message: t('profileSection.deleteConfirm.itemMsg'), confirmText: 'حذف', onConfirm: async () => { try { await deleteAchievement(a.id); const list = (educator.achievements || []).filter(x => x.id !== a.id); onUpdateProfile({ ...educator, achievements: list } as any); } catch (e) {} closeConfirm(); } });
                    }}
                  />
                )
              ))}
              {educator.achievements.length === 0 && !formState && (
                <div className="text-sm text-center text-slate-500 bg-brand-light/40 p-4 rounded-lg">{t('profileSection.noItemsAdded')}</div>
              )}
            </div>
          </MainCard>
          </div>
            </>
          )}
        </main>

        <ProfileSidebar educator={educatorWithComputedCompletion} setModalState={setModalState} />
      </div>

      {modalState?.type === 'socialLinks' && <EditSocialLinksModal isOpen={true} onClose={() => setModalState(null)} onSubmit={(links) => onUpdateProfile({ ...educator, socialLinks: links })} currentLinks={educator.socialLinks} />}
      {modalState?.type === 'payment' && <EditPaymentInfoModal isOpen={true} onClose={() => setModalState(null)} onSubmit={async (info) => {
        try {
          const payload = { ...info, bank_country: (info as any).bankCountry || (info as any).bank_country || '', bank_code: (info as any).bankCode || (info as any).bank_code || '' } as any;
          const resp = await updatePaymentInfoMutation.mutateAsync(payload);
          const updated = (resp as any) ?? resp;
          onUpdateProfile({ ...educator, paymentInfo: updated } as any);
        } catch (e: any) {
          addToast && addToast(t('profileSection.toast.bankInfoFailed'), 'error');
        }
        setModalState(null);
      }} currentInfo={educator.paymentInfo || educator.bankInfo || { bankName: '', accountHolderName: '', iban: '' }} />}

      <ConfirmationModal
        isOpen={confirmState.open}
        onClose={closeConfirm}
        onConfirm={async (reason: string) => { if (confirmState.onConfirm) await confirmState.onConfirm(reason); }}
        title={confirmState.title || ''}
        message={confirmState.message || ''}
        confirmText={confirmState.confirmText}
        icon={<XCircleIcon className="w-8 h-8" />}
      />
      {modalState?.type === 'skill' && (
        <AddSkillModal
          isOpen={true}
          onClose={() => setModalState(null)}
          existing={modalState.data?.skill}
          currentSkills={educator.skills}
          addToast={addToast}
          onSubmit={async (payload) => {
            try {
              if (payload.id) {
                await updateSkillMutation.mutateAsync({ id: payload.id, data: { skill_id: payload.skill_id, custom_name: payload.custom_name, is_custom: payload.is_custom, level: payload.level } });
                const list = educator.skills.map(s => s.id === payload.id ? { ...s, name: payload.custom_name || (s as any).name, level: payload.level, isCustom: Boolean(payload.is_custom), skillId: payload.skill_id || null } as any : s);
                onUpdateProfile({ ...educator, skills: list } as any, { showToast: false });
                addToast && addToast(t('profileSection.toast.skillUpdated'));
              } else {
                await createSkillMutation.mutateAsync({ skill_id: payload.skill_id, custom_name: payload.custom_name, is_custom: payload.is_custom, level: payload.level });
                const name = payload.custom_name || (educator.skills.find(s => (s as any).skillId === payload.skill_id)?.name) || '';
                const newItem: Skill = { id: `skill-${Date.now()}`, name, level: payload.level, isCustom: Boolean(payload.is_custom), skillId: payload.skill_id || null } as any;
                onUpdateProfile({ ...educator, skills: [...educator.skills, newItem] } as any, { showToast: false });
                addToast && addToast(t('profileSection.toast.skillAdded'));
              }
            } catch {
              addToast && addToast(t('profileSection.toast.failedToSave'));
            }
            setModalState(null);
          }}
        />
      )}

      {modalState?.type === 'language' && (
        <AddLanguageModal
          isOpen={true}
          onClose={() => setModalState(null)}
          existing={modalState.data?.language}
          currentLanguages={educator.languages}
          addToast={addToast}
          onSubmit={async (payload) => {
            try {
              if (payload.id) {
                await updateLanguageMutation.mutateAsync({ id: payload.id, data: { language_id: payload.language_id, level: payload.level, is_primary: payload.is_primary } });
                const list = educator.languages.map(l => l.id === payload.id ? { ...l, name: (modalState.data?.language?.name || l.name), level: payload.level.toUpperCase(), isPrimary: payload.is_primary } as any : l);
                onUpdateProfile({ ...educator, languages: list } as any, { showToast: false });
                addToast && addToast(t('profileSection.toast.languageUpdated'));
              } else {
                await createLanguageMutation.mutateAsync({ language_id: payload.language_id, level: payload.level, is_primary: payload.is_primary });
                const newItem: Language = { id: `lang-${Date.now()}`, name: payload.language_name, level: payload.level.toUpperCase(), isPrimary: payload.is_primary } as any;
                onUpdateProfile({ ...educator, languages: [...educator.languages, newItem] } as any, { showToast: false });
                addToast && addToast(t('profileSection.toast.languageAdded'));
              }
            } catch {
              addToast && addToast(t('profileSection.toast.failedToSave'));
            }
            setModalState(null);
          }}
        />
      )}

      {modalState?.type === 'service' && (
        <AddEditServiceModal
          isOpen={true}
          onClose={() => setModalState(null)}
          service={modalState.data?.service}
          onSubmit={async (payload) => {
            try {
              if (payload.id) {
                await updateServiceMutation.mutateAsync({ id: payload.id, data: { service_id: payload.service_id, custom_name: payload.custom_name, custom_description: payload.custom_description, is_custom: payload.is_custom } as any });
                const updated = educator.services.map(s => s.id === payload.id ? ({
                  ...s,
                  name: payload.is_custom ? (payload.custom_name || s.name) : (payload.service_name || s.name),
                  description: payload.custom_description || s.description || null,
                  isCustom: Boolean(payload.is_custom),
                  serviceId: payload.service_id || null,
                } as Service) : s);
                onUpdateProfile({ ...educator, services: updated } as any, { showToast: false });
                addToast && addToast(t('profileSection.toast.serviceUpdated'));
              } else {
                await createServiceMutation.mutateAsync({ service_id: payload.service_id, custom_name: payload.custom_name, custom_description: payload.custom_description, is_custom: payload.is_custom } as any);
                const newItem: Service = {
                  id: `svc-${Date.now()}`,
                  name: payload.is_custom ? (payload.custom_name || '') : (payload.service_name || ''),
                  description: payload.custom_description || null,
                  isCustom: Boolean(payload.is_custom),
                  serviceId: payload.service_id || null
                } as any;
                onUpdateProfile({ ...educator, services: [...educator.services, newItem] } as any, { showToast: false });
                addToast && addToast(t('profileSection.toast.serviceAdded'));
              }
            } catch {
              addToast && addToast(t('profileSection.toast.failedToSave'));
            }
            setModalState(null);
          }}
        />
      )}

    </div>
  );
};

export default ProfileView;
