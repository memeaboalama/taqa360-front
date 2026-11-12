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
import type { AdminManagedService, AdminServicePayload } from '../services/AdminService';

type ServiceText = AdminManagedService['name'] | AdminManagedService['description'] | AdminManagedService['scope_of_work'];

const getLocalizedText = (value: ServiceText, language: 'ar' | 'en'): string => {
  if (typeof value === 'string') return value;
  return value?.[language] || value?.ar || value?.en || '';
};

const toLocalizedText = (value: string) => ({ ar: value, en: value });

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
  language: 'ar' | 'en';
  isSaving: boolean;
  onCancel: () => void;
  onBackToList: () => void;
  onSubmit: (payload: AdminServicePayload) => Promise<boolean>;
}

const ServiceEditor: React.FC<ServiceEditorProps> = ({ service, language, isSaving, onCancel, onBackToList, onSubmit }) => {
  const { t } = useLanguage();
  const [name, setName] = useState(() => getLocalizedText(service?.name ?? null, language));
  const [description, setDescription] = useState(() => getLocalizedText(service?.description ?? null, language));
  const [scopeOfWork, setScopeOfWork] = useState(() => getLocalizedText(service?.scope_of_work ?? null, language));
  const [isEditing, setIsEditing] = useState(!service);
  const [nameError, setNameError] = useState('');

  const cancelEditing = () => {
    if (!service) {
      onCancel();
      return;
    }

    setName(getLocalizedText(service.name, language));
    setDescription(getLocalizedText(service.description, language));
    setScopeOfWork(getLocalizedText(service.scope_of_work, language));
    setNameError('');
    setIsEditing(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isEditing || isSaving) return;

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const trimmedScope = scopeOfWork.trim();
    if (!trimmedName) {
      setNameError(t('services.nameRequired'));
      return;
    }

    setNameError('');
    const saved = await onSubmit({
      name: toLocalizedText(trimmedName),
      description: toLocalizedText(trimmedDescription),
      scope_of_work: toLocalizedText(trimmedScope),
    });
    if (saved && service) setIsEditing(false);
  };

  const fieldClassName = 'w-full rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-600 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:disabled:bg-gray-800 dark:disabled:text-gray-300';

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
            {service ? (isEditing ? t('services.editTitle') : getLocalizedText(service.name, language)) : t('services.addTitle')}
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
        <div>
          <label htmlFor="service-name" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">
            {t('services.name')}
          </label>
          <input
            id="service-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (event.target.value.trim()) setNameError('');
            }}
            maxLength={255}
            disabled={!isEditing}
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? 'service-name-error' : undefined}
            className={fieldClassName}
          />
          {nameError && <p id="service-name-error" role="alert" className="mt-1.5 text-sm text-red-600 dark:text-red-400">{nameError}</p>}
        </div>
        <div>
          <label htmlFor="service-description" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">
            {t('services.description')}
          </label>
          <textarea
            id="service-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            maxLength={500}
            disabled={!isEditing}
            className={fieldClassName}
          />
        </div>
        <div>
          <label htmlFor="service-scope" className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">
            {t('services.scopeOfWork')}
          </label>
          <textarea
            id="service-scope"
            value={scopeOfWork}
            onChange={(event) => setScopeOfWork(event.target.value)}
            rows={5}
            maxLength={5000}
            disabled={!isEditing}
            className={fieldClassName}
          />
        </div>

        {isEditing && (
          <div className="flex justify-end gap-3">
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
      getLocalizedText(item.name, language).trim().toLowerCase() === payload.name[language].toLowerCase()
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
      && getLocalizedText(item.name, language).trim().toLowerCase() === payload.name[language].toLowerCase()
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
