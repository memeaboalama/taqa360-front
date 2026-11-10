import React, { useMemo, useState, useEffect } from 'react';
import { EducationalRequest, EducationalRequestStatus, Project, PaymentStatus, FulfillmentStatus, User, ViewType } from '../../../shared/types';
import { EyeIcon, SearchIcon, ViewGridIcon, ViewListIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../shared/components/Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import type { Pagination } from '../../../core/api/types';

const buildPageList = (current: number, last: number, maxVisible = 7) => {
    if (!last || last < 1) return [];
    if (last === 1) return [1];
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
    for (let page = start; page <= end; page++) pages.push(page);
    if (end < last) {
        if (end < last - 1) pages.push('...');
        pages.push(last);
    }
    return pages;
};

const getStatusChipClass = (status: any, t: (key: string) => string) => {
    if (!status) return "bg-gray-100 text-gray-800";
    const sUpper = status.toString().toUpperCase();
    if (Object.values(EducationalRequestStatus).includes(sUpper as any) || sUpper === 'PENDING' || sUpper === 'ACCEPTED' || sUpper === 'REJECTED') {
        switch (sUpper) {
            case EducationalRequestStatus.ACCEPTED:
            case 'ACCEPTED':
                return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
            case EducationalRequestStatus.REJECTED:
            case 'REJECTED':
                return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";
            default:
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
        }
    }
    if (Object.values(PaymentStatus).includes(sUpper as any) || sUpper === 'PAID' || sUpper === 'PARTIALLY_PAID' || sUpper === 'UNPAID') {
         switch (sUpper) {
            case PaymentStatus.PAID:
            case 'PAID':
                return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
            case PaymentStatus.PARTIALLY_PAID:
            case 'PARTIALLY_PAID':
                return "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300";
            default:
                return "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
        }
    }
    if (Object.values(FulfillmentStatus).includes(sUpper as any) || sUpper === 'COMPLETED' || sUpper === 'IN_PROGRESS') {
         switch (sUpper) {
            case FulfillmentStatus.COMPLETED:
            case 'COMPLETED':
                return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
            case FulfillmentStatus.IN_PROGRESS:
            case 'IN_PROGRESS':
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300";
            default:
                return "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
        }
    }
    return "bg-gray-100 text-gray-800";
};

const StatusBadge: React.FC<{status: string; label?: string}> = ({ status, label }) => {
    const { t } = useLanguage();
    if (!status) return null;

    const getTranslation = (st: string) => {
        const key = `status.${st}`;
        const tr = t(key);
        if (tr && tr !== key) return tr;

        const upperKey = `status.${st.toString().toUpperCase()}`;
        const upperTr = t(upperKey);
        if (upperTr && upperTr !== upperKey) return upperTr;

        const lowerKey = `status.${st.toString().toLowerCase()}`;
        const lowerTr = t(lowerKey);
        if (lowerTr && lowerTr !== lowerKey) return lowerTr;

        return st;
    };

    const text = getTranslation(status);

    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs whitespace-nowrap font-semibold rounded-full ${getStatusChipClass(status, t)}`}>
            {label && <span className="opacity-75 font-normal me-0.5">{label}:</span>}
            {text}
        </span>
    );
}

interface EducationalRequestsViewProps {
    requests: EducationalRequest[];
    projects: Project[];
    users: User[];
    navigateTo: (view: ViewType, id: string) => void;
    searchTerm?: string;
    statusFilter?: string;
    paymentFilter?: string;
    perPage?: number;
    isLoading?: boolean;
    isFetching?: boolean;
    isError?: boolean;
    onRetry?: () => void;
    pagination?: Pagination;
    onPageChange?: (page: number) => void;
    onSearchChange?: (v: string) => void;
    onStatusFilterChange?: (v: string) => void;
    onPaymentFilterChange?: (v: string) => void;
    onPerPageChange?: (v: number) => void;
}

const RequestCard: React.FC<Omit<RequestRowProps, 'onViewDetails'>> = ({ request, requesterName, linkedProject, navigateTo }) => {
    const { t } = useLanguage();
     return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border dark:border-gray-700 p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between">
                <div>
                    <button onClick={() => navigateTo('requestDetail', request.id)} className="font-bold text-gray-900 dark:text-white hover:text-brand-primary text-start">{request.title}</button>
                    <p className="text-xs text-gray-500 mt-1">{t('by')}: {requesterName}</p>
                </div>
                <button onClick={() => navigateTo('requestDetail', request.id)} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700" title={t('viewDetails')}>
                    <EyeIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                <StatusBadge status={request.status} label="الطلب" />
                <StatusBadge status={request.paymentStatus} label="الدفع" />
                <StatusBadge status={request.fulfillmentStatus} label="التنفيذ" />
            </div>
             <div className="text-sm space-y-2 pt-3 border-t dark:border-gray-700">
                <div className="flex justify-between">
                    <span className="text-gray-500">{t('projectsView.budget')}:</span>
                    <span className="font-mono font-bold text-green-600">{request.budget?.toLocaleString() || 'N/A'} {t('sarCurrency')}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-gray-500">{t('modals.deadline')}:</span>
                    <span className="font-semibold">{request.expectedDeliveryDate || 'N/A'}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-gray-500">{t('userDetail.linkedProject')}:</span>
                    {(linkedProject || request.project) ? (
                        <button onClick={() => navigateTo('projectDetail', (linkedProject || request.project!).id)} className="font-semibold text-brand-primary hover:underline truncate max-w-[150px]">{(linkedProject || request.project!).title}</button>
                    ) : <span className="text-gray-400">{t('no')}</span>}
                </div>
            </div>
        </div>
    );
};

interface RequestRowProps {
    request: EducationalRequest;
    requesterName: string;
    linkedProject: Project | null;
    onViewDetails: () => void;
    navigateTo: (view: ViewType, id: string) => void;
};
const RequestRow: React.FC<RequestRowProps> = ({ request, requesterName, linkedProject, onViewDetails, navigateTo }) => {
    const { t } = useLanguage();

    const calculateRemainingDays = (deadline: string | null): string => {
        if (!deadline) return t('projectsView.notSet');
        const today = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return t('educatorDashboard.overdue', { days: -diffDays });
        if (diffDays === 0) return t('educatorDashboard.today');
        return t('educatorDashboard.daysRemaining', { days: diffDays });
    }

    return (
        <tr className="bg-white border-b dark:bg-slate-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/30">
            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                <p className="font-bold">{request.title}</p>
                <p className="text-xs text-gray-500">{requesterName}</p>
            </td>
            <td className="px-6 py-4"><StatusBadge status={request.status} /></td>
            <td className="px-6 py-4">
                <div className="flex flex-col gap-1 items-start">
                   <StatusBadge status={request.paymentStatus} />
                   <div className="font-mono text-xs text-green-600 dark:text-green-400 pt-1">{request.budget?.toLocaleString()} {t('sarCurrency')}</div>
                </div>
            </td>
            <td className="px-6 py-4"><StatusBadge status={request.fulfillmentStatus} /></td>
            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
                {calculateRemainingDays(request.expectedDeliveryDate)}
            </td>
            <td className="px-6 py-4 text-sm text-brand-primary dark:text-brand-accent font-semibold">
                 {(linkedProject || request.project) ? (
                    <button onClick={() => navigateTo('projectDetail', (linkedProject || request.project!).id)} className="hover:underline">{(linkedProject || request.project!).title}</button>
                ) : <span className="text-gray-400 dark:text-gray-500">{t('no')}</span>}
            </td>
            <td className="px-6 py-4">
                <button onClick={onViewDetails} className="p-2 text-gray-500 rounded-full hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600" title={t('viewDetails')}>
                    <EyeIcon className="w-5 h-5" />
                </button>
            </td>
        </tr>
    );
};

const EducationalRequestsView: React.FC<EducationalRequestsViewProps> = ({ requests, projects, users, navigateTo, searchTerm: sTermProp, statusFilter: sFilterProp, paymentFilter: pFilterProp, perPage, isLoading, isFetching, isError, onRetry, pagination, onPageChange, onSearchChange, onStatusFilterChange, onPaymentFilterChange, onPerPageChange }) => {
    const { t } = useLanguage();
    const [searchTermInternal, setSearchTermInternal] = useState('');
    const [statusFilterInternal, setStatusFilterInternal] = useState('all');
    const [paymentFilterInternal, setPaymentFilterInternal] = useState('all');
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

    const searchTerm = sTermProp ?? searchTermInternal;
    const statusFilter = sFilterProp ?? statusFilterInternal;
    const paymentFilter = pFilterProp ?? paymentFilterInternal;

    const [tempSearchInput, setTempSearchInput] = useState(searchTerm);

    useEffect(() => {
        setTempSearchInput(searchTerm);
    }, [searchTerm]);

    const handleSearchSubmit = () => {
        if (onSearchChange) {
            onSearchChange(tempSearchInput);
        } else {
            setSearchTermInternal(tempSearchInput);
        }
    };

    const filteredRequests = useMemo(() => requests.map(req => {
            const requester = users.find(u => u.id === req.requesterId);
            return { ...req, requesterName: requester?.name || t('finance.unknown') };
        }), [requests, users, t]);
    const totalRequests = pagination?.meta.page.total ?? filteredRequests.length;

    return (
            <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('requests')}</h1>
                        <p className="text-gray-500 dark:text-gray-400">{t('requestsView.subtitle', { count: totalRequests })}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 mb-6 border dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <label htmlFor="requests-per-page" className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{t('projectsView.perPage')}:</label>
                        <select
                          id="requests-per-page"
                          value={perPage ?? pagination?.meta.page.per ?? 10}
                          onChange={event => onPerPageChange?.(Number(event.target.value))}
                          className="bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded text-sm py-1 px-2"
                        >
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-slate-100 dark:bg-slate-700 shadow-sm' : ''}`} title={t('table')}><ViewListIcon className="w-5 h-5 text-gray-600 dark:text-gray-300"/></button>
                      <button onClick={() => setViewMode('cards')} className={`p-1.5 rounded-md ${viewMode === 'cards' ? 'bg-slate-100 dark:bg-slate-700 shadow-sm' : ''}`} title={t('cards')}><ViewGridIcon className="w-5 h-5 text-gray-600 dark:text-gray-300"/></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="relative">
                          <label className="text-xs text-gray-500 dark:text-gray-400">{t('search')}</label>
                          <input
                              type="text"
                              placeholder={t('projectsView.searchPlaceholder')}
                              value={tempSearchInput}
                              onChange={e => setTempSearchInput(e.target.value)}
                              onBlur={handleSearchSubmit}
                              onKeyDown={e => { if (e.key === 'Enter') handleSearchSubmit(); }}
                              className="w-full bg-slate-50 dark:bg-slate-700/50 border-gray-300 dark:border-gray-600 rounded-md text-sm p-2 ps-10"
                          />
                          <SearchIcon className="absolute top-7 start-3 w-5 h-5 text-gray-400"/>
                      </div>
                      <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">{t('projectsView.filterByStatus')}</label>
                          <select value={statusFilter} onChange={e => onStatusFilterChange ? onStatusFilterChange(e.target.value) : setStatusFilterInternal(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-700/50 border-gray-300 dark:border-gray-600 rounded-md text-sm p-2">
                              <option value="all">{t('all')}</option>
                              {Object.values(EducationalRequestStatus).map(s => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">حالة الدفع</label>
                          <select value={paymentFilter} onChange={e => onPaymentFilterChange ? onPaymentFilterChange(e.target.value) : setPaymentFilterInternal(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-700/50 border-gray-300 dark:border-gray-600 rounded-md text-sm p-2">
                              <option value="all">{t('all')}</option>
                              {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
                          </select>
                      </div>
                  </div>
                </div>
                
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 bg-white dark:bg-slate-800 rounded-xl shadow-sm border dark:border-gray-700 text-slate-600 dark:text-slate-300" role="status" aria-live="polite">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-b-brand-primary"></div>
                        <span className="text-sm font-medium">{t('requestsView.loading')}</span>
                    </div>
                ) : isError && filteredRequests.length === 0 ? (
                    <div className="text-center py-12 px-4 bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-900" role="alert">
                        <p className="text-red-700 dark:text-red-300 mb-4">{t('requestsView.loadError')}</p>
                        <button type="button" onClick={onRetry} className="px-4 py-2 text-sm font-semibold text-white rounded-lg" style={{ backgroundColor: 'var(--primary-color)' }}>
                            {t('requestsView.retry')}
                        </button>
                    </div>
                ) : viewMode === 'table' ? (
                    <>
                    {isError && (
                        <div className="flex items-center justify-center gap-3 py-3 mb-4 text-sm text-red-700 dark:text-red-300" role="alert">
                            <span>{t('requestsView.loadError')}</span>
                            <button type="button" onClick={onRetry} className="font-semibold underline">{t('requestsView.retry')}</button>
                        </div>
                    )}
                    {isFetching && (
                        <div className="flex items-center justify-center gap-2 py-3 mb-4 text-sm text-slate-600 dark:text-slate-300" role="status" aria-live="polite">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-200 border-b-brand-primary"></div>
                            <span>{t('requestsView.refreshing')}</span>
                        </div>
                    )}
                     <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-white dark:bg-slate-800 border dark:border-gray-700">
                        <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">{t('userDetail.requestTitle')}</th>
                                    <th scope="col" className="px-6 py-3">{t('status')}</th>
                                    <th scope="col" className="px-6 py-3">{t('finance.status')}</th>
                                    <th scope="col" className="px-6 py-3">{t('educatorDashboard.progress')}</th>
                                    <th scope="col" className="px-6 py-3">{t('modals.deadline')}</th>
                                    <th scope="col" className="px-6 py-3">{t('userDetail.linkedProject')}</th>
                                    <th scope="col" className="px-6 py-3">{t('action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.map(request => (
                                    <RequestRow
                                        key={request.id}
                                        request={request}
                                        requesterName={request.requesterName}
                                        linkedProject={projects.find(p => p.educationalRequestId === request.id) || null}
                                        onViewDetails={() => navigateTo('requestDetail', request.id)}
                                        navigateTo={navigateTo}
                                    />
                                ))}
                                {filteredRequests.length === 0 && (
                                    <tr><td colSpan={7} className="text-center py-10 text-gray-500">{t('noResults')}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    </>
                ) : (
                    <>
                        {isError && (
                            <div className="flex items-center justify-center gap-3 py-3 mb-4 text-sm text-red-700 dark:text-red-300" role="alert">
                                <span>{t('requestsView.loadError')}</span>
                                <button type="button" onClick={onRetry} className="font-semibold underline">{t('requestsView.retry')}</button>
                            </div>
                        )}
                        {isFetching && (
                            <div className="flex items-center justify-center gap-2 py-3 mb-4 text-sm text-slate-600 dark:text-slate-300" role="status" aria-live="polite">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-200 border-b-brand-primary"></div>
                                <span>{t('requestsView.refreshing')}</span>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredRequests.map(request => (
                                 <RequestCard
                                    key={request.id}
                                    request={request}
                                    requesterName={request.requesterName}
                                    linkedProject={projects.find(p => p.educationalRequestId === request.id) || null}
                                    navigateTo={navigateTo}
                                />
                            ))}
                        </div>
                        {filteredRequests.length === 0 && (
                            <div className="text-center py-10 text-gray-500">{t('noResults')}</div>
                        )}
                    </>
                )}

                {pagination && pagination.meta.page.total > 0 && (
                    <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 border dark:border-gray-700">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                {t('projectsView.showingResults', {
                                    from: pagination.meta.page.from,
                                    to: pagination.meta.page.to,
                                    total: pagination.meta.page.total
                                })}
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => pagination.meta.page.previous && onPageChange?.(pagination.meta.page.previous)}
                                    disabled={!pagination.meta.page.isPrevious}
                                    aria-label={t('requestsView.previous')}
                                    className="p-3 rounded-lg border border-slate-300 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                                <div className="flex gap-2 items-center">
                                    {buildPageList(pagination.meta.page.current, pagination.meta.page.last).map((page, index) => {
                                        if (page === '...') return <span key={`dots-${index}`} className="px-2">...</span>;
                                        const pageNumber = Number(page);
                                        const isCurrent = pageNumber === pagination.meta.page.current;
                                        const isOnlyPage = pagination.meta.page.last === 1;
                                        return (
                                            <button
                                                key={pageNumber}
                                                type="button"
                                                onClick={() => onPageChange?.(pageNumber)}
                                                disabled={isCurrent || isOnlyPage}
                                                aria-current={isCurrent ? 'page' : undefined}
                                                className={`px-3 py-2 text-sm rounded-lg ${isOnlyPage ? 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-400 cursor-not-allowed' : isCurrent ? 'text-white' : 'border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                                style={isCurrent && !isOnlyPage ? { backgroundColor: 'var(--primary-color)' } : {}}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => pagination.meta.page.next && onPageChange?.(pagination.meta.page.next)}
                                    disabled={!pagination.meta.page.isNext}
                                    aria-label={t('requestsView.next')}
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

export default EducationalRequestsView;
