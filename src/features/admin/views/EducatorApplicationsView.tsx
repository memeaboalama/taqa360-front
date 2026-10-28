import React, { useMemo, useState } from 'react';
import { EducatorApplication, Educator, EducatorStatus, ViewType } from '../../../shared/types';
import { EyeIcon, SearchIcon, ViewGridIcon, ViewListIcon } from '../../../shared/components/Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import Avatar from '../../../shared/components/Avatar';

interface EducatorApplicationsViewProps {
    applications: EducatorApplication[];
    educators: Educator[];
    navigateTo: (view: ViewType, id: string) => void;
}

const ApplicationRow: React.FC<{
    application: EducatorApplication,
    educator: Educator,
    onView: () => void,
}> = ({ application, educator, onView }) => {
    const { t } = useLanguage();
    return (
        <tr className="bg-white border-b dark:bg-slate-800 dark:border-gray-700 hover:bg-brand-light/40 transition-colors">
            <td className="px-4 py-4">
                <div className="flex items-center">
                    <Avatar src={educator.avatarUrl} name={educator.name} size={40} className="rounded-full me-3 ring-2 ring-white" />
                    <div>
                        <p className="font-semibold text-brand-dark dark:text-white">{educator.name}</p>
                        <p className="text-xs text-slate-500">{educator.email}</p>
                    </div>
                </div>
            </td>
            <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{educator.discipline}</td>
            <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{educator.country}</td>
            <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{application.applicationDate}</td>
            <td className="px-4 py-4 text-left">
                 <button onClick={onView} className="p-2 text-slate-600 bg-brand-light/60 rounded-lg hover:shadow-glow-primary" title={t('viewApplication')}>
                    <EyeIcon className="w-5 h-5" />
                </button>
            </td>
        </tr>
    );
}

const EducatorApplicationsView: React.FC<EducatorApplicationsViewProps> = ({ applications, educators, navigateTo }) => {
    const { t } = useLanguage();
    const [query, setQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    const pendingApplications = useMemo(() => applications.filter(app => app.status === EducatorStatus.PENDING_REVIEW), [applications]);

    const filtered = useMemo(() => {
        if (!query.trim()) return pendingApplications;
        const q = query.trim().toLowerCase();
        return pendingApplications.filter(a => {
            const ed = educators.find(e => e.id === a.educatorId);
            if (!ed) return false;
            return [ed.name, ed.email, ed.discipline, ed.country].filter(Boolean).join(' ').toLowerCase().includes(q);
        });
    }, [query, pendingApplications, educators]);

    return (
        <div className="animate-fade-in">
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">{t('registrationRequests')}</h1>
                <p className="text-sm text-slate-500">{t('pendingApplicationsSubtitle', { count: pendingApplications.length })}</p>
            </div>

            <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center bg-white dark:bg-slate-800 border rounded-lg px-3 py-2 shadow-sm w-full max-w-xl">
                    <SearchIcon className="w-4 h-4 text-slate-400 me-2" />
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('modals.searchByNameOrEmail')} className="w-full bg-transparent text-sm outline-none text-slate-700 dark:text-slate-200" />
                </div>
                <div className="inline-flex items-center gap-2">
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-brand-primary text-white' : 'bg-white dark:bg-slate-800'}`} aria-label="Grid view"><ViewGridIcon className="w-5 h-5" /></button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-brand-primary text-white' : 'bg-white dark:bg-slate-800'}`} aria-label="List view"><ViewListIcon className="w-5 h-5" /></button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.length === 0 && (
                        <div className="col-span-full text-center py-10 text-slate-500">{t('noNewApplications')}</div>
                    )}
                    {filtered.map(app => {
                        const ed = educators.find(e => e.id === app.educatorId);
                        if (!ed) return null;
                        return (
                            <div key={app.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 border dark:border-gray-700 flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <Avatar src={ed.avatarUrl} name={ed.name} size={56} className="rounded-full ring-2 ring-white" />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-brand-dark dark:text-white">{ed.name}</h3>
                                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">{t('status.PENDING_REVIEW')}</span>
                                        </div>
                                        <p className="text-sm text-slate-500">{ed.discipline} • {ed.country}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-auto">
                                    <button onClick={() => navigateTo('educatorApplicationDetail', app.id)} className="ml-auto inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg font-semibold hover:shadow-glow-primary">{t('viewProfile') || 'عرض الملف'} <EyeIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="relative overflow-x-auto shadow-sm sm:rounded-lg bg-white dark:bg-slate-800 border dark:border-gray-700">
                    <table className="w-full text-sm text-right text-slate-700 dark:text-slate-300">
                        <thead className="text-xs text-slate-600 bg-brand-light/40 dark:bg-slate-700 dark:text-slate-300">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-left">{t('applicant')}</th>
                                <th scope="col" className="px-4 py-3">{t('specialization')}</th>
                                <th scope="col" className="px-4 py-3">{t('country')}</th>
                                <th scope="col" className="px-4 py-3">{t('applicationDate')}</th>
                                <th scope="col" className="px-4 py-3">{t('action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(app => {
                                const educator = educators.find(e => e.id === app.educatorId);
                                if (!educator) return null;
                                return <ApplicationRow key={app.id} application={app} educator={educator} onView={() => navigateTo('educatorApplicationDetail', app.id)} />
                            })}
                            {filtered.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-10 text-slate-500">{t('noNewApplications')}</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default EducatorApplicationsView;
