import React, { useState, useMemo } from 'react';
import { Educator, EducatorStatus, ViewType } from '../../../shared/types';
import { StarIcon, PlusIcon, SearchIcon } from '../../../shared/components/Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import Avatar from '../../../shared/components/Avatar';
import { useAdminEducators } from '../../../core/hooks/useAdminQueries';
import { env } from '../../../core/config/env';

interface EducatorsViewProps {
    onInvite: () => void;
    navigateTo: (view: ViewType, id: string) => void;
}

const RatingStars: React.FC<{ rating: number }> = ({ rating }) => {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className={`w-4 h-4 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} filled={i < Math.round(rating)} />
            ))}
            <span className="text-xs text-gray-500 dark:text-gray-400 ms-1.5 font-medium">({rating.toFixed(1)})</span>
        </div>
    );
};

const getStatusInfo = (status: EducatorStatus, t: (key: string) => string) => {
    const statusText = t(`status.${status}`) || status;
    switch (status) {
        case EducatorStatus.ACTIVE: return { text: statusText, class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
        case EducatorStatus.INACTIVE: return { text: statusText, class: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
        case EducatorStatus.SUSPENDED: return { text: statusText, class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' };
        case EducatorStatus.BANNED: return { text: statusText, class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' };
        default: return { text: statusText, class: 'bg-gray-100 text-gray-800' };
    }
};

const EducatorCard: React.FC<{ educator: Educator, navigateTo: (view: ViewType, id: string) => void; }> = ({ educator, navigateTo }) => {
    const { t } = useLanguage();
    const statusInfo = getStatusInfo(educator.status, t);
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-5 text-center transition-transform transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700 flex flex-col">
            <Avatar src={educator.avatarUrl} name={educator.name} size={80} className="mx-auto mb-3 rounded-full border-4 border-gray-200 dark:border-gray-700" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{educator.name}</h3>
            <p className="text-sm text-brand-primary flex-grow">{educator.discipline}</p>
            <div className="my-3 flex justify-center">
                <RatingStars rating={educator.rating} />
            </div>
            <div className="mt-auto pt-4 border-t dark:border-gray-700 flex flex-col gap-2">
                 <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.class}`}>
                    {statusInfo.text}
                </span>
                <button onClick={() => navigateTo('educatorDetail', educator.id)} className="w-full px-3 py-2 text-sm font-semibold bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-all shadow-md shadow-brand-primary/20 hover:shadow-lg hover:shadow-brand-primary/30">
                    {t('educatorsView.viewProfile')}
                </button>
            </div>
        </div>
    );
};

const EducatorsView: React.FC<EducatorsViewProps> = ({ onInvite, navigateTo }) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid'|'list'|'compact'>('compact');

    const educatorsQuery = useAdminEducators({ paginated: "true" as const, per_page: env.DEFAULT_PAGE_SIZE });
    const educators = Array.isArray(educatorsQuery.data) ? (educatorsQuery.data as Educator[]) : ((educatorsQuery.data as any)?.educators || []) as Educator[];

    const filteredEducators = useMemo(() => {
        const list = (educators || []).map((e: any) => ({
            ...e,
            status: (e.status || '').toString().toUpperCase(),
            discipline: e.discipline || '',
            name: e.name || ''
        }));
        const visible = list.filter((e: any) => e.status === 'ACTIVE');
        return visible.filter((e: any) =>
            (searchTerm === '' || e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.discipline.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [educators, searchTerm]);

    return (
        <div className="animate-fade-in">
             <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('educators')}</h1>
                <p className="text-gray-500 dark:text-gray-400">{t('educatorsView.subtitle')}</p>
              </div>
                 <button onClick={onInvite} className="flex items-center px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors shadow-md hover:shadow-lg">
                    <PlusIcon className="w-5 h-5 me-2" />
                    {t('educatorsView.invite')}
                </button>
            </div>

            <div className="relative mb-6 flex gap-3 flex-col sm:flex-row items-start sm:items-center">
                 <div className="flex-1 w-full relative">
                   <input
                      type="text"
                      placeholder={t('educatorsView.searchPlaceholder')}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-700 rounded-lg p-3 ps-10"
                  />
                  <SearchIcon className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-gray-400"/>
                 </div>
                 <div className="inline-flex items-center gap-2">
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-brand-primary text-white' : 'bg-white dark:bg-slate-800'}`} aria-label="Grid view"><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z"/></svg></button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-brand-primary text-white' : 'bg-white dark:bg-slate-800'}`} aria-label="List view"><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/></svg></button>
                    <button onClick={() => setViewMode('compact')} className={`p-2 rounded-lg ${viewMode === 'compact' ? 'bg-brand-primary text-white' : 'bg-white dark:bg-slate-800'}`} aria-label="Compact view"><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h8v2H3V6zm0 5h12v2H3v-2zm0 5h8v2H3v-2z"/></svg></button>
                 </div>
            </div>

            {educatorsQuery.isLoading ? (
              <div className="text-center py-10 col-span-full">
                <div className="inline-block animate-spin rounded-full h-6 w-6" style={{ borderBottom: '2px solid var(--primary-color)' }}></div>
                <span className="me-2 text-sm text-slate-600 dark:text-slate-400">{t('loading')}</span>
              </div>
            ) : (
              <>
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredEducators.map(educator => <EducatorCard key={educator.id} educator={educator} navigateTo={navigateTo} />)}
                  </div>
                )}

                {viewMode === 'list' && (
                  <div className="space-y-3">
                    {filteredEducators.map(ed => (
                      <div key={ed.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-3 flex items-center justify-between border dark:border-gray-700">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar src={ed.avatarUrl} name={ed.name} size={48} className="rounded-full" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-brand-dark dark:text-white truncate">{ed.name}</span>
                              <span className="text-xs text-slate-500">{ed.discipline}</span>
                            </div>
                            <div className="text-sm text-slate-500 truncate">{ed.email} • {ed.country}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => navigateTo('educatorDetail', ed.id)} className="px-3 py-2 bg-brand-primary text-white rounded-lg">{t('educatorsView.viewProfile')}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {viewMode === 'compact' && (
                  <div className="space-y-2">
                    {filteredEducators.map(ed => (
                      <button key={ed.id} onClick={() => navigateTo('educatorDetail', ed.id)} className="w-full text-start bg-white dark:bg-slate-800 border dark:border-gray-700 rounded-xl p-3 flex items-center gap-3 hover:shadow-sm active:scale-[.995] transition">
                        <Avatar src={ed.avatarUrl} name={ed.name} size={44} className="rounded-full" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-semibold text-sm text-brand-dark dark:text-white truncate">{ed.name}</div>
                              <div className="text-xs text-slate-500 truncate">{ed.discipline}</div>
                            </div>
                            <span className={`px-2 py-0.5 text-[11px] rounded-full ${getStatusInfo(ed.status as EducatorStatus, t).class}`}>{getStatusInfo(ed.status as EducatorStatus, t).text}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {filteredEducators.length === 0 && (
                    <div className="text-center py-10 col-span-full">
                        <p className="text-gray-500">{t('educatorsView.noResults')}</p>
                    </div>
                )}
              </>
            )}
        </div>
    )
};

export default EducatorsView;
