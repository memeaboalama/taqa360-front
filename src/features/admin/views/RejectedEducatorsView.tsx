import React, { useState } from 'react';
import Avatar from '../../../shared/components/Avatar';
import { EyeIcon, SearchIcon, AlertCircleIcon } from '../../../shared/components/Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { LoadingSpinner } from '../../../core/components/LoadingStates';

export interface RejectedEducatorRecord {
  id: string;
  applicationId: string;
  name: string;
  email?: string;
  discipline?: string;
  country?: string;
  avatarUrl?: string;
  rejectionReason?: string;
  applicationDate?: string;
}

interface RejectedEducatorsViewProps {
  records: RejectedEducatorRecord[];
  totalCount: number;
  query: string;
  onQueryChange: (value: string) => void;
  onView: (record: RejectedEducatorRecord) => void;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  onRetry?: () => void;
}

const RejectedEducatorsView: React.FC<RejectedEducatorsViewProps> = ({
  records,
  totalCount,
  query,
  onQueryChange,
  onView,
  isLoading,
  isFetching,
  isError,
  onRetry
}) => {
  const { t, language } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid'|'list'|'compact'>('compact');
  const errorText = language === 'ar' ? 'حدث خطأ أثناء جلب البيانات.' : 'An error occurred while fetching data.';
  const retryLabel = language === 'ar' ? 'إعادة المحاولة' : 'Retry';
  const normalizedQuery = query.trim();
  const emptyMessage = normalizedQuery ? t('modals.noResultsForSearch') : t('rejectedEducators.noRejected');

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-dark dark:text-white">{t('rejectedEducators.title')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('rejectedEducators.subtitle')}
            <span className="ms-1 text-brand-primary font-semibold">({totalCount})</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-sm w-full sm:w-72">
            <SearchIcon className="w-4 h-4 text-slate-400 me-2" />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={t('modals.searchByNameOrEmail')}
              className="w-full bg-transparent text-sm outline-none text-slate-700 dark:text-slate-200"
            />
          </div>
          <div className="inline-flex items-center gap-2">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-brand-primary text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}`} aria-label="Grid view"><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z"/></svg></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-brand-primary text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}`} aria-label="List view"><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/></svg></button>
            <button onClick={() => setViewMode('compact')} className={`p-2 rounded-lg ${viewMode === 'compact' ? 'bg-brand-primary text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'}`} aria-label="Compact view"><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h8v2H3V6zm0 5h12v2H3v-2zm0 5h8v2H3v-2z"/></svg></button>
          </div>
          {isFetching && !isLoading && (
            <LoadingSpinner size="sm" color="text-brand-primary" />
          )}
        </div>
      </div>

      {isError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3 text-red-700 dark:text-red-300">
          <AlertCircleIcon className="w-5 h-5 mt-1" />
          <div className="space-y-2">
            <p className="text-sm">{errorText}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-1.5 text-sm font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 dark:bg-red-800/40 dark:text-red-200 dark:hover:bg-red-700/40 transition-colors"
              >
                {retryLabel}
              </button>
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-6 w-6" style={{ borderBottom: '2px solid var(--primary-color)' }}></div>
          <span className="me-2 text-sm text-slate-600 dark:text-slate-400">{t('loading')}</span>
        </div>
      ) : (
        <>
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {records.map((record) => (
                <div key={`${record.applicationId}-${record.id}`} className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700 flex flex-col">
                  <div className="text-center mb-3">
                    <Avatar src={record.avatarUrl} name={record.name} size={64} className="mx-auto mb-2 rounded-full border-4 border-gray-200 dark:border-gray-700" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{record.name}</h3>
                    <p className="text-sm text-slate-500 truncate">{record.discipline || '—'}</p>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 mb-3">
                    {record.email && <p className="truncate">{record.email}</p>}
                    <p>{record.country || '—'} • {record.applicationDate || '—'}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 mb-3 flex-1">
                    <p className="text-xs text-red-700 dark:text-red-300 line-clamp-3 leading-relaxed">
                      {record.rejectionReason || (language === 'ar' ? 'لا يوجد سبب مذكور.' : 'No reason provided.')}
                    </p>
                  </div>
                  <button onClick={() => onView(record)} className="w-full px-3 py-2 text-sm font-semibold bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-all shadow-md shadow-brand-primary/20 hover:shadow-lg">
                    <EyeIcon className="w-4 h-4 inline me-1" />
                    {t('rejectedEducators.viewApplication')}
                  </button>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="space-y-3">
              {records.map((record) => (
                <div key={`${record.applicationId}-${record.id}`} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-4">
                    <Avatar src={record.avatarUrl} name={record.name} size={48} className="rounded-full flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <p className="font-semibold text-brand-dark dark:text-white truncate">{record.name}</p>
                          <p className="text-xs text-slate-500 truncate">{record.email || record.discipline || '—'}</p>
                        </div>
                        <button onClick={() => onView(record)} className="inline-flex items-center px-3 py-1.5 text-sm font-semibold bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors">
                          <EyeIcon className="w-4 h-4 me-1" />
                          {t('rejectedEducators.viewApplication')}
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>{record.discipline || '—'}</span>
                        <span>•</span>
                        <span>{record.country || '—'}</span>
                        <span>•</span>
                        <span>{record.applicationDate || '—'}</span>
                      </div>
                      <div className="mt-2 bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
                        <p className="text-xs text-red-600 dark:text-red-300 line-clamp-2 leading-relaxed">
                          {record.rejectionReason || (language === 'ar' ? 'لا يوجد سبب مذكور.' : 'No reason provided.')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'compact' && (
            <div className="space-y-2">
              {records.map((record) => (
                <button key={`${record.applicationId}-${record.id}`} onClick={() => onView(record)} className="w-full text-start bg-white dark:bg-slate-800 border dark:border-gray-700 rounded-xl p-3 flex items-center gap-3 hover:shadow-sm active:scale-[.995] transition">
                  <Avatar src={record.avatarUrl} name={record.name} size={44} className="rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-brand-dark dark:text-white truncate">{record.name}</div>
                        <div className="text-xs text-slate-500 truncate">{record.discipline || record.email || '—'}</div>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 text-[11px] rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 whitespace-nowrap">
                        {record.applicationDate || '—'}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {records.length === 0 && !isFetching && (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              {emptyMessage}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RejectedEducatorsView;
