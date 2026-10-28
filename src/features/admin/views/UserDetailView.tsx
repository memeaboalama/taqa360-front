import React, { useMemo, useState } from 'react';
import { User, UserStatus, ViewType } from '../../../shared/types';
import { TrashIcon, EditIcon, MoreVerticalIcon, UsersIcon, CheckCircleIcon, XCircleIcon, ClockIcon, PlusIcon, SearchIcon, ViewGridIcon, ViewListIcon, PencilSquareIcon } from '../../../shared/components/Icons';
import ConfirmationModal from '../../../shared/components/modals/ConfirmationModal';
import Avatar from '../../../shared/components/Avatar';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { useData } from '../../../app/providers/DataProvider';
import { useAdminUsers, useAdminEducationalRequests, useUpdateUserStatus, useDeleteUser } from '../../../core/hooks/useAdminQueries';
import { formatDate } from '../../../shared/utils';
import { env } from '../../../core/config/env';

interface UsersViewProps {
    navigateTo: (view: ViewType, id?: string) => void;
}

const normalizeStatus = (status?: string): UserStatus => {
    const s = (status || '').toUpperCase();
    if (s === 'SUSPENDED') return UserStatus.SUSPENDED;
    if (s === 'BANNED') return UserStatus.BANNED;
    return UserStatus.ACTIVE;
};

const getStatusInfo = (status: string, t: (key: string) => string) => {
    const normalized = normalizeStatus(status);
    const statusText = t(`status.${status}`) !== `status.${status}` ? t(`status.${status}`) : t(`status.${normalized}`);
    switch (normalized) {
        case UserStatus.ACTIVE: return { text: statusText, class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
        case UserStatus.SUSPENDED: return { text: statusText, class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' };
        case UserStatus.BANNED: return { text: statusText, class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' };
        default: return { text: statusText, class: 'bg-gray-100 text-gray-800' };
    }
};

const UserActionsMenu: React.FC<{
    user: User;
    onUpdateStatus: (userId: string, newStatus: UserStatus, reason: string) => Promise<void>;
    onDelete: (userId: string, reason: string) => Promise<void>;
}> = ({ user, onUpdateStatus, onDelete }) => {
    const { t, language: userActionsLang } = useLanguage();
    const [action, setAction] = useState<{ type: 'delete' | 'status', payload?: any } | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const handleConfirm = async (reason: string) => {
        if (!action) return;
        if (action.type === 'delete') {
            await onDelete(user.id, reason);
        } else if (action.type === 'status') {
            await onUpdateStatus(user.id, action.payload, reason);
        }
        setAction(null);
    };

    const currentStatus = normalizeStatus(user.status);
    const nextStatus = currentStatus === UserStatus.ACTIVE ? UserStatus.SUSPENDED : UserStatus.ACTIVE;

    return (
        <>
            {action && (
                <ConfirmationModal
                    isOpen={true}
                    onClose={() => setAction(null)}
                    onConfirm={handleConfirm}
                    title={action.type === 'delete' ? t('usersView.confirmDeleteTitle') : t('usersView.confirmStatusChangeTitle', { status: t(`status.${action.payload}`) })}
                    message={action.type === 'delete' ? t('usersView.confirmDeleteMessage', { name: user.name }) : t('usersView.confirmStatusChangeMessage')}
                    icon={action.type === 'delete' ? <TrashIcon className="w-8 h-8" /> : <EditIcon className="w-8 h-8" />}
                    isReasonRequired={false}
                    confirmButtonClass={action.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-primary text-white hover:bg-brand-primary/90'}
                />
            )}
            <div className="relative">
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                    onBlur={() => setTimeout(() => setMenuOpen(false), 200)}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                    aria-label="User Actions"
                >
                    <MoreVerticalIcon className="w-5 h-5 text-slate-500 dark:text-slate-300" />
                </button>
                {menuOpen && (
                    <div
                        onMouseDown={(e) => e.preventDefault()}
                        className="absolute bottom-full mb-1 right-0 bg-white dark:bg-slate-900 rounded-md shadow-lg border dark:border-slate-700 w-40 z-20 text-right"
                    >
                        <button
                            type="button"
                            onClick={() => { setAction({ type: 'status', payload: nextStatus }); setMenuOpen(false); }}
                            className="w-full text-right px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-t-md"
                        >
                            {t('usersView.changeStatus')}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setAction({ type: 'delete' }); setMenuOpen(false); }}
                            className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-b-md"
                        >
                            {t('usersView.deleteUser')}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

const UserCard: React.FC<{
    user: User & { requestCount: number };
    navigateTo: (view: ViewType, id?: string) => void;
    onUpdateStatus: (userId: string, newStatus: UserStatus, reason: string) => Promise<void>;
    onDelete: (userId: string, reason: string) => Promise<void>;
}> = ({ user, navigateTo, onUpdateStatus, onDelete }) => {
    const { t, language: cardLang } = useLanguage();
    const statusInfo = getStatusInfo(user.status, t);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 p-6 flex flex-col text-center">
            <Avatar src={user.avatarUrl} name={user.name} size={96} className="mx-auto mb-4 rounded-full border-4 border-slate-200 dark:border-slate-700" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{user.email}</p>

            <div className="grid grid-cols-3 gap-4 my-4 text-sm py-4 border-y dark:border-slate-700">
                <div>
                    <p className="font-bold text-slate-800 dark:text-white">{user.requestCount}</p>
                    <p className="text-xs text-slate-500">{t('requests')}</p>
                </div>
                <div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.class}`}>{statusInfo.text}</span>
                    <p className="text-xs text-slate-500 mt-1.5">{t('status')}</p>
                </div>
                <div>
                    <p className="font-bold text-slate-800 dark:text-white">{formatDate(user.registrationDate, cardLang === 'ar' ? 'ar-EG' : 'en-US')}</p>
                    <p className="text-xs text-slate-500">{t('usersView.joinedOn')}</p>
                </div>
            </div>

            <div className="mt-auto pt-4 flex items-center gap-2">
                <button onClick={() => navigateTo('userDetail', user.id)} className="flex-1 px-4 py-2 text-sm font-semibold bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-all shadow-md shadow-brand-primary/20 hover:shadow-lg hover:shadow-brand-primary/30">
                    {t('viewDetails')}
                </button>
                <button onClick={() => navigateTo('editUser', user.id)} className="p-2 text-sm font-semibold text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all" title={t('editUser.title')}>
                    <EditIcon className="w-4 h-4" />
                </button>
                <UserActionsMenu user={user} onUpdateStatus={onUpdateStatus} onDelete={onDelete} />
            </div>
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center">
        <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">{icon}</div>
        <div className="ms-3">
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
        </div>
    </div>
);

const UsersView: React.FC<UsersViewProps> = ({ navigateTo }) => {
    const { t, language } = useLanguage();
    const { addToast } = useData();
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const usersQuery = useAdminUsers({ per_page: env.DEFAULT_PAGE_SIZE });
    const requestsQuery = useAdminEducationalRequests({ per_page: env.DEFAULT_PAGE_SIZE });
    const updateStatus = useUpdateUserStatus();
    const deleteUser = useDeleteUser();
    const isRtl = language === 'ar';

    const usersPayload: any = usersQuery.data;
    const users: User[] = Array.isArray(usersPayload)
        ? usersPayload
        : Array.isArray(usersPayload?.data?.users)
            ? usersPayload.data.users
            : Array.isArray(usersPayload?.users)
                ? usersPayload.users
                : Array.isArray(usersPayload?.data)
                    ? usersPayload.data
                    : [];

    const requestsPayload: any = requestsQuery.data;
    const requests: any[] = Array.isArray(requestsPayload)
        ? requestsPayload
        : Array.isArray(requestsPayload?.data?.requests)
            ? requestsPayload.data.requests
            : Array.isArray(requestsPayload?.requests)
                ? requestsPayload.requests
                : Array.isArray(requestsPayload?.data)
                    ? requestsPayload.data
                    : [];

    const usersWithRequestCount = useMemo(() => {
        return users.map(user => ({
            ...user,
            requestCount: requests.filter((r: any) => r.requesterId === user.id || r.requester_id === user.id).length
        }));
    }, [users, requests]);

    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) return usersWithRequestCount;
        const q = searchTerm.trim().toLowerCase();
        return usersWithRequestCount.filter(u =>
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
        );
    }, [usersWithRequestCount, searchTerm]);

    const userStats = useMemo(() => ({
        total: usersQuery.totalItems || users.length,
        active: users.filter(u => normalizeStatus(u.status) === UserStatus.ACTIVE).length,
        suspended: users.filter(u => normalizeStatus(u.status) === UserStatus.SUSPENDED).length,
        banned: users.filter(u => normalizeStatus(u.status) === UserStatus.BANNED).length,
    }), [users, usersQuery.totalItems]);

    const handleUpdateStatus = async (id: string, status: UserStatus, reason: string) => {
        try {
            await updateStatus.mutateAsync({ id, status, reason });
            addToast(`تم تغيير حالة المستخدم إلى ${t(`status.${status}`)}`);
        } catch (err: any) {
            addToast(err?.response?.data?.message || err?.message || t('toasts.failedToUpdateUserStatus'), 'error');
            throw err;
        }
    };

    const handleDeleteUser = async (id: string) => {
        try {
            await deleteUser.mutateAsync(id);
            addToast(t('toasts.userDeleted'));
        } catch (err: any) {
            addToast(err?.response?.data?.message || err?.message || t('toasts.failedToDeleteUser'), 'error');
            throw err;
        }
    };

    if (usersQuery.isLoading || requestsQuery.isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            <div className="inline-block animate-spin rounded-full h-12 w-12 mb-4" style={{ borderBottom: '3px solid var(--primary-color)' }}></div>
            <span className="text-base font-medium text-slate-600 dark:text-slate-400">{t('loading')}</span>
        </div>
    );

    if (usersQuery.isError || requestsQuery.isError) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-lg text-red-500">{t('usersView.errorFetching')}</p>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('usersView.title')}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t('usersView.subtitle', { count: usersQuery.totalItems || users.length })}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-sm w-full sm:w-64">
                        <SearchIcon className="w-4 h-4 text-slate-400 me-2" />
                        <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('modals.searchByNameOrEmail')} className="w-full bg-transparent text-sm outline-none text-slate-700 dark:text-slate-200" />
                    </div>
                    <div className="inline-flex items-center gap-2">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-brand-primary text-white' : 'bg-white dark:bg-slate-800 border dark:border-gray-700'}`} aria-label="Grid view"><ViewGridIcon className="w-5 h-5" /></button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-brand-primary text-white' : 'bg-white dark:bg-slate-800 border dark:border-gray-700'}`} aria-label="List view"><ViewListIcon className="w-5 h-5" /></button>
                        <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-brand-primary text-white' : 'bg-white dark:bg-slate-800 border dark:border-gray-700'}`} aria-label="Table view"><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" /></svg></button>
                    </div>
                    <button onClick={() => navigateTo('createUser')} className="flex items-center px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors shadow-md hover:shadow-lg">
                        <PlusIcon className="w-5 h-5 me-2 text-white" />
                        {t('usersView.addUser')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard title={t('usersView.totalUsers')} value={userStats.total} icon={<UsersIcon className="w-6 h-6" style={{ color: 'var(--primary-color)' }} />} />
                <StatCard title={t('usersView.active')} value={userStats.active} icon={<CheckCircleIcon className="w-6 h-6 text-green-500" />} />
                <StatCard title={t('usersView.suspended')} value={userStats.suspended} icon={<ClockIcon className="w-6 h-6 text-yellow-500" />} />
                <StatCard title={t('usersView.banned')} value={userStats.banned} icon={<XCircleIcon className="w-6 h-6 text-red-500" />} />
            </div>

            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {filteredUsers.map(user => (
                        <UserCard
                            key={user.id}
                            user={user}
                            navigateTo={navigateTo}
                            onUpdateStatus={handleUpdateStatus}
                            onDelete={handleDeleteUser}
                        />
                    ))}
                    {filteredUsers.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-white dark:bg-slate-800 rounded-xl">
                            <p className="text-lg text-slate-500">{t('usersView.noUsers')}</p>
                        </div>
                    )}
                </div>
            )}

            {viewMode === 'list' && (
                <div className="space-y-2">
                    {filteredUsers.map(user => (
                        <div key={user.id} className="bg-white dark:bg-slate-800 border dark:border-gray-700 rounded-xl p-3 flex items-center gap-3">
                            <Avatar src={user.avatarUrl} name={user.name} size={44} className="rounded-full shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-brand-dark dark:text-white truncate">{user.name}</div>
                                <div className="text-xs text-slate-500 truncate">{user.email}</div>
                            </div>
                            <span className={`px-2 py-0.5 text-[11px] rounded-full shrink-0 ${getStatusInfo(user.status, t).class}`}>{getStatusInfo(user.status, t).text}</span>
                            <button onClick={() => navigateTo('userDetail', user.id)} className="px-2.5 py-1.5 bg-brand-primary text-white rounded-lg text-sm shrink-0">{t('viewDetails')}</button>
                            <button onClick={() => navigateTo('editUser', user.id)} className="p-2 text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 shrink-0" title={t('editUser.title')}><EditIcon className="w-4 h-4" /></button>
                            <UserActionsMenu user={user} onUpdateStatus={handleUpdateStatus} onDelete={handleDeleteUser} />
                        </div>
                    ))}
                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12 text-slate-500">{t('usersView.noUsers')}</div>
                    )}
                </div>
            )}

            {viewMode === 'table' && (
                <div className="relative overflow-x-auto shadow-sm sm:rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-sm text-right text-slate-700 dark:text-slate-300">
                        <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                            <tr>
                                <th scope="col" className={`px-6 py-3 ${isRtl ? 'text-right' : 'text-left'}`}>{t('usersView.name')}</th>
                                <th scope="col" className="px-6 py-3">{t('email')}</th>
                                <th scope="col" className="px-6 py-3">{t('status')}</th>
                                <th scope="col" className="px-6 py-3">{t('usersView.joinedOn')}</th>
                                <th scope="col" className={`px-6 py-3 ${isRtl ? 'text-right' : 'text-left'}`}>{t('action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => {
                                const statusInfo = getStatusInfo(user.status, t);
                                return (
                                    <tr key={user.id} className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 hover:bg-brand-light/30 dark:hover:bg-slate-700/40 transition-colors">
                                        <td className={`px-6 py-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                                            <div className={`flex items-center gap-3`}>
                                                <Avatar src={user.avatarUrl} name={user.name} size={40} className="rounded-full shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-brand-dark dark:text-white truncate">{user.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.class}`}>{statusInfo.text}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{user.registrationDate ? formatDate(user.registrationDate, language === 'ar' ? 'ar-EG' : 'en-US') : '—'}</td>
                                        <td className={`px-6 py-4 ${isRtl ? 'text-right' : 'text-left'}`}>
                                            <div className="flex items-center gap-2 justify-end">
                                                <button onClick={() => navigateTo('userDetail', user.id)} className="px-3 py-1.5 text-sm font-semibold bg-brand-primary text-white rounded-lg">{t('viewDetails')}</button>
                                                <button onClick={() => navigateTo('editUser', user.id)} className="p-2 text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600" title={t('editUser.title')}><EditIcon className="w-4 h-4" /></button>
                                                <UserActionsMenu user={user} onUpdateStatus={handleUpdateStatus} onDelete={handleDeleteUser} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center px-6 py-12 text-slate-500 dark:text-slate-400">{t('usersView.noUsers')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UsersView;
