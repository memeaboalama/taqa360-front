import React, { useState, useCallback } from 'react';
import { Project } from '../../../shared/types';
import { EducatorViewType } from '../../../shared/types';
import { SearchIcon, BriefcaseIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../shared/components/Icons';
import { useOpportunities } from '../../projects/hooks/useProjectQueries';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface OpportunitiesViewProps {
    navigateTo: (view: EducatorViewType, data?: any) => void;
}

// Pagination helper to render compact page list with ellipsis
const buildPageList = (current: number, last: number, maxVisible = 7) => {
    if (!last || last <= 1) return [];
    const pages: (number | string)[] = [];
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(last, current + half);
    if (end - start + 1 < maxVisible) {
        start = Math.max(1, Math.min(start, last - maxVisible + 1));
        end = Math.min(last, start + maxVisible - 1);
    }
    if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
    }
    for (let p = start; p <= end; p++) pages.push(p);
    if (end < last) {
        if (end < last - 1) pages.push('...');
        pages.push(last);
    }
    return pages;
};

const formatBudget = (value: any, t: (key: string) => string) => {
    if (value == null || value === '') return t('notSet') || 'غير محددة';
    const num = typeof value === 'number' ? value : (Number(value) || 0);
    return `${num.toLocaleString()} ${t('sarCurrency')}`;
};

const ProjectCard: React.FC<{ project: Project, onOpen: () => void }> = ({ project, onOpen }) => {
    const { t } = useLanguage();
    const isNew = (() => {
        const created = new Date(project.createdAt || (project as any).created_at || '');
        if (Number.isNaN(created.getTime())) return false;
        return Date.now() - created.getTime() <= 7 * 24 * 60 * 60 * 1000;
    })();
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:border-brand-primary dark:hover:border-brand-accent hover:shadow-lg group">
            <div className="flex justify-between items-start">
                {isNew && (
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300">
                        {t('new')}
                    </span>
                )}
                <div className="flex gap-2">
                    {(project.tags || []).slice(0, 2).map((tag: string) => (
                        <span key={tag} className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{tag}</span>
                    ))}
                </div>
            </div>
            <h3 className="font-extrabold text-md sm:text-lg text-slate-900 dark:text-white mt-4">{project.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 h-10 line-clamp-2">{project.description}</p>
            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('projectsView.budget')}</p>
                    <p className="text-md sm:text-lg font-bold text-green-600 dark:text-green-400">{formatBudget(project.budget, t)}</p>
                </div>
                <button onClick={onOpen} className="px-4 py-2 text-sm font-semibold bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-transform group-hover:scale-105">
                    {t('viewDetails')}
                </button>
            </div>
        </div>
    )
}

const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({ navigateTo }) => {
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [sortBy, setSortBy] = useState('created_at');

    const handleSearch = useCallback(() => {
        setSearchQuery(searchInput.trim());
        setPage(1);
    }, [searchInput]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
    }, [handleSearch]);

    const handlePerPageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setPerPage(Number(e.target.value));
        setPage(1);
    }, []);

    const { data, isLoading, error, pagination } = useOpportunities({ paginated: true, per_page: perPage, page, status: '', search: searchQuery, sort_by: sortBy });

    const projects = Array.isArray(data) ? data : [];

    const { t } = useLanguage();

    const pageMeta = pagination?.meta?.page;

    const goToPage = (p: number) => {
        const target = Math.max(1, Math.min(p, pageMeta?.last || p));
        setPage(target);
    };

    return (
        <div className="animate-fade-in space-y-6 sm:space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{t('proposals.goToMarketplace')}</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{t('proposals.proposalsSubtitle')}</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border dark:border-slate-700">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-2 flex-1">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={searchInput}
                                placeholder={t('proposals.search')}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full pl-10 pr-4 py-3 text-sm sm:text-base bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-primary text-slate-900 dark:text-white"
                            />
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        </div>
                        <button onClick={handleSearch} disabled={isLoading} className="px-4 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <SearchIcon className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{t('projectsView.perPage')}:</label>
                        <select
                            value={perPage}
                            onChange={handlePerPageChange}
                            className="bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded text-sm py-2 px-2"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-6 w-6" style={{ borderBottom: '2px solid var(--primary-color)' }}></div>
                        <span className="ms-2 text-sm text-slate-600 dark:text-slate-400">{t('loading')}</span>
                    </div>
                ) : error ? (
                    <div className="col-span-full text-center py-12 text-red-500">{t('profileSection.loadingError')}</div>
                ) : projects.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <BriefcaseIcon className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-600" />
                        <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-white">{t('projectsView.noProjectsTitle')}</h3>
                        <p className="mt-1 text-sm text-slate-500">{t('projectsView.noProjectsMessage')}</p>
                    </div>
                ) : (
                    projects.map((project: any) => (
                        <ProjectCard key={project.id} project={project} onOpen={() => navigateTo('opportunityDetail', { projectId: project.id })} />
                    ))
                )}
            </div>

            {!isLoading && pageMeta && pageMeta.total > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border dark:border-slate-700">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            {t('projectsView.showingResults', {
                                from: pageMeta.from,
                                to: pageMeta.to,
                                total: pageMeta.total
                            })}
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => goToPage(page - 1)}
                                disabled={!pageMeta.isPrevious}
                                className="p-3 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                                <ChevronRightIcon className="w-4 h-4" />
                            </button>
                            <div className="flex gap-2 items-center">
                                {buildPageList(pageMeta.current, pageMeta.last).map((p, idx) => {
                                    if (p === '...') return <div key={`dots-${idx}`} className="px-2">...</div>;
                                    const pg = Number(p);
                                    const isActive = pg === pageMeta.current;
                                    return (
                                        <button key={pg} onClick={() => goToPage(pg)} className={`px-3 py-2 text-sm rounded-lg ${isActive ? 'text-white' : 'border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`} style={isActive ? { backgroundColor: 'var(--primary-color)' } : {}}>
                                            {pg}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => goToPage(page + 1)}
                                disabled={!pageMeta.isNext}
                                className="p-3 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default OpportunitiesView;
