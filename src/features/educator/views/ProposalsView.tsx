import React, { useMemo, useState, useCallback } from 'react';
import { EducatorViewType, Project, Bid, BidStatus } from '../../../shared/types';
import { FileTextIcon, EyeIcon, EditIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../shared/components/Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { useEducatorBids } from '../../../core/hooks/useEducatorQueries';
import { isBidUpdatable } from '../../../shared/utils';

/**
 * The API returns bidTasks[].status lower-cased ("approved"), while BidStatus is
 * upper-cased ("APPROVED"). Comparing them directly always failed, so every offer
 * fell through to PENDING and the list showed the wrong status. Normalise before
 * comparing - same helper the rest of the app uses.
 */
const normStatus = (value: unknown): string =>
    typeof value === 'string' ? value.trim().toUpperCase().replace(/[-\s]+/g, '_') : '';

interface ProposalsViewProps {
    navigateTo: (view: EducatorViewType, data?: any) => void;
    projects: Project[];
}

const getStatusInfo = (status: BidStatus, t: (key: string) => string) => {
    const statusText = t(`status.${status}`);
    switch (status) {
        case BidStatus.ASSIGNED: return { text: statusText, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
        case BidStatus.APPROVED: return { text: statusText, color: 'bg-yellow-50 text-yellow-800' };
        case BidStatus.REJECTED: return { text: statusText, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' };
        default: return { text: statusText, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' };
    }
}

// Pagination helper
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

const ProposalCard: React.FC<{ bid: any, project?: Project, onNavigate: () => void, onEdit: () => void }> = ({ bid, project, onNavigate, onEdit }) => {
    const { t } = useLanguage();

    const bidTasksArr: any[] = Array.isArray(bid.bidTasks) ? bid.bidTasks : [];
    const totalAmount = bidTasksArr.length > 0
        ? bidTasksArr.reduce((sum: number, t: any) => sum + (t.amount || 0), 0)
        : (typeof (bid as any).totalAmount === 'number' ? (bid as any).totalAmount : 0);

    const overallStatus = useMemo(() => {
        const statuses = bidTasksArr.map(bt => normStatus(bt.status));
        if (statuses.length === 0) return BidStatus.PENDING;
        if (statuses.every(s => s === BidStatus.ASSIGNED)) return BidStatus.ASSIGNED;
        if (statuses.every(s => s === BidStatus.REJECTED)) return BidStatus.REJECTED;
        if (statuses.some(s => s === BidStatus.ASSIGNED || s === BidStatus.APPROVED)) return BidStatus.APPROVED;
        return BidStatus.PENDING;
    }, [bidTasksArr]);

    const statusInfo = getStatusInfo(overallStatus, t);
    const canEdit = isBidUpdatable(bidTasksArr);
    const projectTitle = project?.title || bid.project_title || bid.projectTitle || '';

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:border-brand-primary dark:hover:border-brand-accent hover:shadow-lg group">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('proposals.project')}:</p>
                    <h3 className="font-bold text-slate-900 dark:text-white mt-1">{projectTitle}</h3>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>{statusInfo.text}</span>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('proposals.bidValue')}</p>
                    <p className="font-bold text-lg text-green-600 dark:text-green-400">{totalAmount.toLocaleString()} {t('sarCurrency')}</p>
                </div>
                <div className="flex items-center gap-2">
                    {canEdit && (
                    <button onClick={onEdit} className="p-2 rounded-lg text-slate-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-transform group-hover:scale-105" title={t('common.edit') || 'تعديل'}>
                        <EditIcon className="w-5 h-5"/>
                    </button>
                    )}
                    <button onClick={onNavigate} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-transform group-hover:scale-105">
                        <EyeIcon className="w-5 h-5"/>
                        {t('viewDetails')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ProposalsView: React.FC<ProposalsViewProps> = ({ navigateTo, projects }) => {
    const { t } = useLanguage();
    
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

    // refetchOnMount is opt-in here: the app-wide default is false, which left the
    // list showing the pre-edit amount until a manual F5. Scoped to this list only.
    const { data, isLoading, error, pagination } = useEducatorBids({ 
        paginated: true, 
        per_page: perPage, 
        page, 
        status: '', 
        search: searchQuery, 
        sort_by: sortBy 
    }, { refetchOnMount: true });

    const bids = Array.isArray(data) ? data : (data?.data?.bids ?? data?.bids ?? []);
    const pageMeta = pagination?.meta?.page || pagination;

    const goToPage = (p: number) => {
        const target = Math.max(1, Math.min(p, pageMeta?.last || p));
        setPage(target);
    };

    return (
        <div className="animate-fade-in space-y-6 sm:space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{t('proposals')}</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{t('proposals.subtitle')}</p>
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
                    <div className="col-span-full text-center py-12 text-red-500">{t('profileSection.loadingError') || 'حدث خطأ أثناء التحميل'}</div>
                ) : bids.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <FileTextIcon className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-600" />
                        <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-white">{t('proposals.noProposalsTitle')}</h3>
                        <p className="mt-1 text-sm text-slate-500">{t('proposals.noProposalsMessage')}</p>
                        <button onClick={() => navigateTo('opportunities')} className="mt-4 text-sm font-semibold text-brand-primary hover:underline">
                            {t('proposals.goToMarketplace')}
                        </button>
                    </div>
                ) : (
                    bids.map((bid: any) => (
                        <ProposalCard 
                            key={bid.id}
                            bid={bid}
                            project={projects.find(p => p.id === bid.projectId)}
                            onNavigate={() => navigateTo('bidDetail', { bidId: bid.id })}
                            onEdit={() => navigateTo('createBid', { projectId: bid.projectId, bidId: bid.id })}
                        />
                    ))
                )}
            </div>
            
            {!isLoading && pageMeta && pageMeta.total > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border dark:border-slate-700 mt-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            {t('projectsView.showingResults', {
                                from: pageMeta.from || ((page - 1) * perPage + 1),
                                to: pageMeta.to || Math.min(page * perPage, pageMeta.total),
                                total: pageMeta.total
                            })}
                        </div>
                        <div className="flex items-center gap-4" dir="rtl">
                            <button
                                onClick={() => goToPage(page - 1)}
                                disabled={!pageMeta.isPrevious && page <= 1}
                                className="p-3 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                                <ChevronRightIcon className="w-4 h-4" />
                            </button>
                            <div className="flex gap-2 items-center">
                                {buildPageList(pageMeta.current || page, pageMeta.last || Math.ceil(pageMeta.total / perPage)).map((p, idx) => {
                                    if (p === '...') return <div key={`dots-${idx}`} className="px-2">...</div>;
                                    const pg = Number(p);
                                    const isActive = pg === (pageMeta.current || page);
                                    return (
                                        <button key={pg} onClick={() => goToPage(pg)} className={`px-3 py-2 text-sm rounded-lg ${isActive ? 'text-white' : 'border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`} style={isActive ? { backgroundColor: 'var(--primary-color)' } : {}}>
                                            {pg}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => goToPage(page + 1)}
                                disabled={!pageMeta.isNext && page >= (pageMeta.last || Math.ceil(pageMeta.total / perPage))}
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
