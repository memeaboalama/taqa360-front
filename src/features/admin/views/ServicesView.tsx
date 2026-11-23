import React, { useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, EditIcon, EyeIcon, PlusIcon, TrashIcon } from '../../../shared/components/Icons';
import ConfirmationModal from '../../../shared/components/modals/ConfirmationModal';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { useData } from '../../../app/providers/DataProvider';
import {
  useAdminService,
  useAdminServices,
  useCreateService,
  useDeleteService,
  useUpdateService,
} from '../hooks/useAdminQueries';
import type {
  AdminManagedService,
  AdminServicePayload,
  AdminServiceQuestion,
  AdminServiceRequestConfig,
  LocalizedServiceList,
  LocalizedServiceText,
  LocalizedServiceValue,
  ServicePricingMode,
} from '../services/AdminService';

type Locale = 'ar' | 'en';
type LocalizedLines = Record<Locale, string>;
type QuestionType = AdminServiceQuestion['type'];
type ServiceEditorTab = 'basics' | 'request';

interface QuestionForm {
  key: string;
  label: LocalizedServiceText;
  type: QuestionType;
  options: LocalizedLines;
  help: LocalizedServiceText;
  required: boolean;
}

interface ServiceEditorValues {
  name: LocalizedServiceText;
  description: LocalizedServiceText;
  scopeOfWork: LocalizedServiceText;
  deliverables: LocalizedLines;
  exclusions: LocalizedLines;
  requirements: LocalizedLines;
  duration: LocalizedServiceText;
  pricingMode: ServicePricingMode;
  price: string;
  requestMode: 'onsite' | 'remote' | 'both';
  solar: boolean;
  showUrgency: boolean;
  questions: QuestionForm[];
}

const emptyLocalizedText = (): LocalizedServiceText => ({ ar: '', en: '' });
const emptyLocalizedLines = (): LocalizedLines => ({ ar: '', en: '' });

const getLocalizedText = (value: LocalizedServiceValue, language: Locale): string => {
  if (typeof value === 'string') return value;
  return value?.[language] || value?.ar || value?.en || '';
};

const normalizeLocalizedText = (value: LocalizedServiceValue, fallbackLanguage: Locale): LocalizedServiceText => {
  if (typeof value === 'string') {
    return { ar: fallbackLanguage === 'ar' ? value : '', en: fallbackLanguage === 'en' ? value : '' };
  }
  return { ar: value?.ar || '', en: value?.en || '' };
};

const normalizeLocalizedLines = (value: LocalizedServiceList | null | undefined, fallbackLanguage: Locale): LocalizedLines => {
  if (Array.isArray(value)) {
    return { ar: fallbackLanguage === 'ar' ? value.join('\n') : '', en: fallbackLanguage === 'en' ? value.join('\n') : '' };
  }
  return {
    ar: Array.isArray(value?.ar) ? value.ar.join('\n') : '',
    en: Array.isArray(value?.en) ? value.en.join('\n') : '',
  };
};

const splitLines = (value: string): string[] => value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

const createEditorValues = (service: AdminManagedService | null, language: Locale): ServiceEditorValues => {
  const config: AdminServiceRequestConfig = service?.request_config ?? {};
  const name = service?.name_translations ?? service?.name;
  const description = service?.description_translations ?? service?.description;
  const scopeOfWork = service?.scope_of_work_translations ?? service?.scope_of_work;

  return {
    name: normalizeLocalizedText(name, language),
    description: normalizeLocalizedText(description, language),
    scopeOfWork: normalizeLocalizedText(scopeOfWork, language),
    deliverables: normalizeLocalizedLines(service?.deliverables, language),
    exclusions: normalizeLocalizedLines(service?.exclusions, language),
    requirements: normalizeLocalizedLines(service?.requirements, language),
    duration: normalizeLocalizedText(service?.duration_translations ?? service?.duration, language),
    pricingMode: service?.pricing_mode ?? 'quote',
    price: service?.price == null ? '' : String(service.price),
    requestMode: config.mode ?? 'both',
    solar: config.solar ?? false,
    showUrgency: config.show_urgency ?? true,
    questions: (config.fields ?? []).map((field) => ({
      key: field.key,
      label: normalizeLocalizedText(field.label, language),
      type: field.type,
      options: normalizeLocalizedLines(field.options, language),
      help: normalizeLocalizedText(field.help, language),
      required: field.required ?? false,
    })),
  };
};

function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);
  return debounced;
}

interface ServiceEditorProps {
  service: AdminManagedService | null;
  language: Locale;
  isSaving: boolean;
  onCancel: () => void;
  onBackToList: () => void;
  onSubmit: (payload: AdminServicePayload) => Promise<boolean>;
}

const ServiceEditor: React.FC<ServiceEditorProps> = ({ service, language, isSaving, onCancel, onBackToList, onSubmit }) => {
  const { t } = useLanguage();
  const [values, setValues] = useState(() => createEditorValues(service, language));
  const [isEditing, setIsEditing] = useState(!service);
  const [nameError, setNameError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [activeTab, setActiveTab] = useState<ServiceEditorTab>('basics');
  const tabs: { id: ServiceEditorTab; label: string }[] = [
    { id: 'basics', label: t('services.basicsTab') },
    { id: 'request', label: t('services.requestSection') },
  ];

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;
    if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      const direction = (event.key === 'ArrowRight' ? 1 : -1) * (language === 'ar' ? -1 : 1);
      nextIndex = (index + direction + tabs.length) % tabs.length;
    } else return;
    event.preventDefault();
    setActiveTab(tabs[nextIndex].id);
    document.getElementById(`service-tab-${tabs[nextIndex].id}`)?.focus();
  };

  const cancelEditing = () => {
    if (!service) {
      onCancel();
      return;
    }

    setValues(createEditorValues(service, language));
    setNameError('');
    setPriceError('');
    setIsEditing(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isEditing || isSaving) return;

    const name = { ar: values.name.ar.trim(), en: values.name.en.trim() };
    if (!name.ar || !name.en) {
      setActiveTab('basics');
      setNameError(t('services.nameRequiredBoth'));
      return;
    }

    if (values.pricingMode !== 'quote' && (!values.price.trim() || !Number.isFinite(Number(values.price)) || Number(values.price) < 0 || Number(values.price) > 9999999999.99)) {
      setActiveTab('request');
      setPriceError(t('services.priceInvalid'));
      return;
    }
    setNameError('');
    setPriceError('');
    const payload: AdminServicePayload = {
      name,
      description: { ar: values.description.ar.trim(), en: values.description.en.trim() },
      scope_of_work: { ar: values.scopeOfWork.ar.trim(), en: values.scopeOfWork.en.trim() },
      deliverables: { ar: splitLines(values.deliverables.ar), en: splitLines(values.deliverables.en) },
      exclusions: { ar: splitLines(values.exclusions.ar), en: splitLines(values.exclusions.en) },
      requirements: { ar: splitLines(values.requirements.ar), en: splitLines(values.requirements.en) },
      duration: { ar: values.duration.ar.trim(), en: values.duration.en.trim() },
      pricing_mode: values.pricingMode,
      price: values.pricingMode === 'quote' ? null : Number(values.price),
      request_config: {
        mode: values.requestMode,
        solar: values.solar,
        show_urgency: values.showUrgency,
        fields: values.questions
          .map((question) => ({
            key: question.key.trim(),
            label: question.label,
            type: question.type,
            options: { ar: splitLines(question.options.ar), en: splitLines(question.options.en) },
            help: question.help,
            required: question.required,
          }))
          .filter((question) => question.key && (question.label.ar.trim() || question.label.en.trim())),
      },
    };
    const saved = await onSubmit(payload);
    if (saved && service) setIsEditing(false);
  };

  const fieldClassName = 'w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-600 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-300';

  const renderLocalizedField = (
    label: string,
    value: LocalizedServiceText,
    onChange: (value: LocalizedServiceText) => void,
    options: { multiline?: boolean; rows?: number; maxLength?: number } = {},
  ) => {
    const Field = options.multiline ? 'textarea' : 'input';
    const change = (locale: Locale, nextValue: string) => onChange({ ...value, [locale]: nextValue });

    return (
      <div>
        <p className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</p>
        <div className="grid gap-3 md:grid-cols-2">
          {(['ar', 'en'] as const).map((locale) => (
            <label key={locale} className="block text-xs font-medium text-gray-500 dark:text-gray-400">
              {locale === 'ar' ? t('services.arabic') : t('services.english')}
              <Field
                {...(options.multiline ? { rows: options.rows ?? 3 } : {})}
                value={value[locale]}
                onChange={(event) => change(locale, event.target.value)}
                maxLength={options.maxLength}
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                disabled={!isEditing}
                className={`${fieldClassName} mt-1`}
              />
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderLocalizedLines = (label: string, value: LocalizedLines, onChange: (value: LocalizedLines) => void) => (
    <div>
      <p className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</p>
      <div className="grid gap-3 md:grid-cols-2">
        {(['ar', 'en'] as const).map((locale) => (
          <label key={locale} className="block text-xs font-medium text-gray-500 dark:text-gray-400">
            {locale === 'ar' ? t('services.arabic') : t('services.english')}
            <textarea
              value={value[locale]}
              onChange={(event) => onChange({ ...value, [locale]: event.target.value })}
              rows={3}
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
              disabled={!isEditing}
              className={`${fieldClassName} mt-1`}
            />
          </label>
        ))}
      </div>
    </div>
  );

  const updateQuestion = (index: number, patch: Partial<QuestionForm>) => {
    setValues((current) => ({
      ...current,
      questions: current.questions.map((question, questionIndex) => questionIndex === index ? { ...question, ...patch } : question),
    }));
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          {service && (
            <button type="button" onClick={onBackToList} className="mb-2 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
              {t('services.backToList')}
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {service ? (isEditing ? t('services.editTitle') : getLocalizedText(service.name_translations ?? service.name, language)) : t('services.addTitle')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{t('services.subtitle')}</p>
        </div>
        {service && !isEditing ? (
          <button type="button" onClick={() => setIsEditing(true)} className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white" style={{ backgroundColor: 'var(--primary-color)' }}>
            <EditIcon className="h-5 w-5" />
            {t('services.editTitle')}
          </button>
        ) : (
          <button type="button" onClick={cancelEditing} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
            {t('services.cancel')}
          </button>
        )}
      </div>

      <form noValidate onSubmit={handleSubmit} className="space-y-5 rounded-xl border bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
        <div role="tablist" aria-label={t('services.editorTabs')} className="flex gap-2 overflow-x-auto border-b border-gray-200 pb-2 dark:border-gray-700">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              id={`service-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`service-panel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={`shrink-0 rounded-lg px-4 py-3 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${activeTab === tab.id ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <section id="service-panel-basics" role="tabpanel" aria-labelledby="service-tab-basics" hidden={activeTab !== 'basics'} className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('services.basicsTab')}</h2>
          {renderLocalizedField(t('services.name'), values.name, (name) => {
            setValues((current) => ({ ...current, name }));
            if (name.ar.trim() && name.en.trim()) setNameError('');
          }, { maxLength: 255 })}
          {nameError && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{nameError}</p>}
          {renderLocalizedField(t('services.description'), values.description, (description) => setValues((current) => ({ ...current, description })), { multiline: true, rows: 3, maxLength: 500 })}
          {renderLocalizedField(t('services.scopeOfWork'), values.scopeOfWork, (scopeOfWork) => setValues((current) => ({ ...current, scopeOfWork })), { multiline: true, rows: 5, maxLength: 5000 })}
          {renderLocalizedLines(t('services.deliverables'), values.deliverables, (deliverables) => setValues((current) => ({ ...current, deliverables })))}
          {renderLocalizedLines(t('services.exclusions'), values.exclusions, (exclusions) => setValues((current) => ({ ...current, exclusions })))}
        </section>

        <section id="service-panel-request" role="tabpanel" aria-labelledby="service-tab-request" hidden={activeTab !== 'request'} className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('services.requestSection')}</h2>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
            {t('services.formMode')}
            <select value={values.requestMode} onChange={(event) => setValues((current) => ({ ...current, requestMode: event.target.value as ServiceEditorValues['requestMode'] }))} disabled={!isEditing} className={`${fieldClassName} mt-1`}>
              <option value="both">{t('services.bothModes')}</option>
              <option value="onsite">{t('services.onsiteMode')}</option>
              <option value="remote">{t('services.remoteMode')}</option>
            </select>
          </label>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
            {t('services.pricingMode')}
            <select value={values.pricingMode} onChange={(event) => {
              setValues((current) => ({ ...current, pricingMode: event.target.value as ServicePricingMode }));
              setPriceError('');
            }} disabled={!isEditing} className={`${fieldClassName} mt-1`}>
              <option value="quote">{t('services.priceQuote')}</option>
              <option value="fixed">{t('services.priceFixed')}</option>
              <option value="from">{t('services.priceFrom')}</option>
            </select>
          </label>
          {values.pricingMode !== 'quote' && (
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
              {t('services.displayPrice')}
              <input type="number" min="0" max="9999999999.99" step="0.01" required value={values.price}
                onChange={(event) => { setValues((current) => ({ ...current, price: event.target.value })); setPriceError(''); }}
                disabled={!isEditing} aria-invalid={Boolean(priceError)} className={`${fieldClassName} mt-1`} />
            </label>
          )}
          {priceError && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{priceError}</p>}
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('services.priceHelp')}</p>
          {renderLocalizedField(t('services.duration'), values.duration, (duration) => setValues((current) => ({ ...current, duration })), { maxLength: 500 })}
          {renderLocalizedLines(t('services.requirements'), values.requirements, (requirements) => setValues((current) => ({ ...current, requirements })))}
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
            <input type="checkbox" checked={values.solar} onChange={(event) => setValues((current) => ({ ...current, solar: event.target.checked }))} disabled={!isEditing} />
            {t('services.solarRequest')}
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
            <input type="checkbox" checked={values.showUrgency} onChange={(event) => setValues((current) => ({ ...current, showUrgency: event.target.checked }))} disabled={!isEditing} />
            {t('services.showUrgency')}
          </label>
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">{t('services.requestQuestions')}</h3>
            <button type="button" disabled={!isEditing} onClick={() => setValues((current) => ({
              ...current,
              questions: [...current.questions, {
                key: '',
                label: emptyLocalizedText(),
                type: 'text',
                options: emptyLocalizedLines(),
                help: emptyLocalizedText(),
                required: false,
              }],
            }))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-gray-600">
              {t('services.addQuestion')}
            </button>
          </div>
          {values.questions.map((question, index) => (
            <div key={`question-${index}`} className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {t('services.questionKey')}
                  <input value={question.key} onChange={(event) => updateQuestion(index, { key: event.target.value })} disabled={!isEditing} className={`${fieldClassName} mt-1`} />
                </label>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {t('services.questionType')}
                  <select value={question.type} onChange={(event) => updateQuestion(index, { type: event.target.value as QuestionType })} disabled={!isEditing} className={`${fieldClassName} mt-1`}>
                    <option value="text">{t('services.textField')}</option>
                    <option value="textarea">{t('services.textAreaField')}</option>
                    <option value="number">{t('services.numberField')}</option>
                    <option value="select">{t('services.selectField')}</option>
                  </select>
                </label>
              </div>
              {renderLocalizedField(t('services.questionLabel'), question.label, (label) => updateQuestion(index, { label }))}
              {question.type === 'select' && renderLocalizedLines(t('services.questionOptions'), question.options, (options) => updateQuestion(index, { options }))}
              {renderLocalizedField(t('services.questionHelp'), question.help, (help) => updateQuestion(index, { help }), { multiline: true })}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <input type="checkbox" checked={question.required} onChange={(event) => updateQuestion(index, { required: event.target.checked })} disabled={!isEditing} />
                  {t('services.requiredQuestion')}
                </label>
                <button type="button" disabled={!isEditing} onClick={() => setValues((current) => ({ ...current, questions: current.questions.filter((_, questionIndex) => questionIndex !== index) }))} className="text-sm text-red-600 disabled:opacity-50">
                  {t('services.remove')}
                </button>
              </div>
            </div>
          ))}
        </section>

        {isEditing && (
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
            <button type="submit" disabled={isSaving} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" style={{ backgroundColor: 'var(--primary-color)' }}>
              {isSaving ? t('services.saving') : t('services.save')}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

const ServicesView: React.FC = () => {
  const { t, language } = useLanguage();
  const { addToast } = useData();
  const [screen, setScreen] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<AdminManagedService | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm.trim());

  const servicesQuery = useAdminServices({
    page: currentPage,
    per_page: perPage,
    search: debouncedSearch || undefined,
  });
  const serviceQuery = useAdminService(selectedServiceId ?? '', {
    enabled: Boolean(selectedServiceId) && screen === 'detail',
  });
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();
  const items = servicesQuery.data?.data ?? [];
  const pageMeta = servicesQuery.data?.pagination?.meta.page;
  const selectedService = serviceQuery.data;

  useEffect(() => {
    if (pageMeta && currentPage > pageMeta.last && pageMeta.last > 0) {
      setCurrentPage(pageMeta.last);
    }
  }, [currentPage, pageMeta]);

  const handleCreate = async (payload: AdminServicePayload): Promise<boolean> => {
    const duplicate = items.some((item) =>
      getLocalizedText(item.name_translations ?? item.name, language).trim().toLowerCase() === payload.name[language].toLowerCase()
    );
    if (duplicate) {
      addToast(t('toasts.cannotAddDuplicate'), 'error');
      return false;
    }

    try {
      const createdService = await createMutation.mutateAsync(payload);
      addToast(t('services.addSuccess'));
      setSelectedServiceId(createdService.id);
      setScreen('detail');
      return true;
    } catch {
      addToast(t('services.addFailed'), 'error');
      return false;
    }
  };

  const handleUpdate = async (payload: AdminServicePayload): Promise<boolean> => {
    if (!selectedServiceId) return false;
    const duplicate = items.some((item) =>
      item.id !== selectedServiceId
      && getLocalizedText(item.name_translations ?? item.name, language).trim().toLowerCase() === payload.name[language].toLowerCase()
    );
    if (duplicate) {
      addToast(t('toasts.cannotAddDuplicate'), 'error');
      return false;
    }

    try {
      await updateMutation.mutateAsync({ id: selectedServiceId, payload });
      addToast(t('services.updateSuccess'));
      return true;
    } catch {
      addToast(t('services.updateFailed'), 'error');
      return false;
    }
  };

  const handleConfirmDelete = async () => {
    if (!toDelete) return;

    try {
      await deleteMutation.mutateAsync(toDelete.id);
      addToast(t('services.deleteSuccess'));
      setToDelete(null);
    } catch (error) {
      const message = (error as { message?: string })?.message === 'SERVICE_IN_USE'
        ? t('services.deleteInUse')
        : t('services.deleteFailed');
      addToast(message, 'error');
      throw new Error(message);
    }
  };

  const renderServiceList = () => (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t('services.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('services.subtitle')}</p>
        </div>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
            placeholder={t('services.searchPlaceholder')}
            aria-label={t('services.searchPlaceholder')}
            className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:w-64 sm:flex-none"
          />
          <button
            type="button"
            onClick={() => setScreen('create')}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            <PlusIcon className="h-5 w-5" />
            {t('services.addTitle')}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-300">
              <tr>
                <th scope="col" className="px-5 py-3 text-start">{t('services.name')}</th>
                <th scope="col" className="px-5 py-3 text-start">{t('services.description')}</th>
                <th scope="col" className="px-5 py-3 text-start">{t('services.scopeOfWork')}</th>
                <th scope="col" className="px-5 py-3 text-center">{t('action')}</th>
              </tr>
            </thead>
            <tbody>
              {servicesQuery.isLoading && (
                <tr>
                  <td className="px-5 py-8 text-center" colSpan={4}>{t('services.loading')}</td>
                </tr>
              )}
              {servicesQuery.isError && (
                <tr>
                  <td className="px-5 py-8 text-center" colSpan={4}>
                    <p role="alert" className="mb-2 text-red-600 dark:text-red-400">{t('services.loadFailed')}</p>
                    <button type="button" onClick={() => void servicesQuery.refetch()} className="font-semibold underline">
                      {t('services.retry')}
                    </button>
                  </td>
                </tr>
              )}
              {!servicesQuery.isLoading && !servicesQuery.isError && items.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/40">
                  <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">
                    {getLocalizedText(item.name, language) || '—'}
                  </td>
                  <td className="max-w-xs truncate px-5 py-4">
                    {getLocalizedText(item.description, language) || '—'}
                  </td>
                  <td className="max-w-sm truncate px-5 py-4">
                    {getLocalizedText(item.scope_of_work, language) || '—'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedServiceId(item.id);
                          setScreen('detail');
                        }}
                        className="rounded-full p-2 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                        title={t('services.view')}
                        aria-label={t('services.view')}
                      >
                        <EyeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setToDelete(item)}
                        className="rounded-full p-2 hover:bg-red-100 dark:hover:bg-red-900/40"
                        title={t('delete')}
                        aria-label={t('delete')}
                      >
                        <TrashIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!servicesQuery.isLoading && !servicesQuery.isError && items.length === 0 && (
                <tr>
                  <td className="px-5 py-8 text-center text-gray-500" colSpan={4}>{t('services.empty')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {t('projectsView.showingResults', {
            from: pageMeta?.from ?? 0,
            to: pageMeta?.to ?? 0,
            total: pageMeta?.total ?? 0,
          })}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <label htmlFor="services-per-page" className="text-sm text-gray-600 dark:text-gray-400">{t('projectsView.perPage')}:</label>
          <select
            id="services-per-page"
            value={perPage}
            onChange={(event) => {
              setPerPage(Number(event.target.value));
              setCurrentPage(1);
            }}
            className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
          <button
            type="button"
            onClick={() => pageMeta?.previous && setCurrentPage(pageMeta.previous)}
            disabled={!pageMeta?.isPrevious}
            aria-label={t('requestsView.previous')}
            className="rounded-lg border border-gray-300 p-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
          <span className="min-w-16 text-center text-sm text-gray-600 dark:text-gray-400">
            {(pageMeta?.current ?? currentPage)} / {(pageMeta?.last ?? 1)}
          </span>
          <button
            type="button"
            onClick={() => pageMeta?.next && setCurrentPage(pageMeta.next)}
            disabled={!pageMeta?.isNext}
            aria-label={t('requestsView.next')}
            className="rounded-lg border border-gray-300 p-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {toDelete && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setToDelete(null)}
          onConfirm={handleConfirmDelete}
          title={t('services.confirmDeleteTitle')}
          message={t('services.confirmDeleteMessage', { name: getLocalizedText(toDelete.name, language) })}
          icon={<TrashIcon className="h-8 w-8" />}
          isReasonRequired={false}
          confirmButtonClass="bg-red-600 hover:bg-red-700"
        />
      )}

      {screen === 'list' && renderServiceList()}
      {screen === 'create' && (
        <ServiceEditor
          service={null}
          language={language}
          isSaving={createMutation.isPending}
          onCancel={() => setScreen('list')}
          onBackToList={() => setScreen('list')}
          onSubmit={handleCreate}
        />
      )}
      {screen === 'detail' && (
        serviceQuery.isLoading ? (
          <div className="rounded-xl border bg-white p-8 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800">{t('services.loading')}</div>
        ) : serviceQuery.isError || !selectedService ? (
          <div className="rounded-xl border bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
            <p role="alert" className="mb-4 text-red-600 dark:text-red-400">{t('services.loadFailed')}</p>
            <button type="button" onClick={() => setScreen('list')} className="rounded-lg border px-4 py-2 text-sm dark:border-gray-600">
              {t('services.backToList')}
            </button>
          </div>
        ) : (
          <ServiceEditor
            key={`${selectedService.id}-${language}`}
            service={selectedService}
            language={language}
            isSaving={updateMutation.isPending}
            onCancel={() => setScreen('list')}
            onBackToList={() => setScreen('list')}
            onSubmit={handleUpdate}
          />
        )
      )}
    </div>
  );
};

export default ServicesView;
