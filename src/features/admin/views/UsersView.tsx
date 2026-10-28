import React, { useMemo, useState } from 'react';
import { User, UserStatus, ViewType } from '../../../shared/types';
import { TrashIcon, EditIcon, MoreVerticalIcon, UsersIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '../../../shared/components/Icons';
import ConfirmationModal from '../../../shared/components/modals/ConfirmationModal';
import Avatar from '../../../shared/components/Avatar';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { useAdminUsers, useAdminEducationalRequests, useUpdateUserStatus, useDeleteUser } from '../../../core/hooks/useAdminQueries';
import { formatDate } from '../../../shared/utils';
import { env } from '../../../core/config/env';

interface UsersViewProps {
    navigateTo: (view: ViewType, id: string) => void;
}

const getStatusInfo = (status: UserStatus, t: (key: string) => string) => {
    const statusText = t(`status.${status}`);
    switch (status) {
        case UserStatus.ACTIVE: return { text: statusText, class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
        case UserStatus.SUSPENDED: return { text: statusText, class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' };
        case UserStatus.BANNED: return { text: statusText, class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' };
        default: return { text: statusText, class: 'bg-gray-100 text-gray-800' };
    }
};

const UserCard: React.FC<{
    user: User & { requestCount: number };
    navigateTo: (view: ViewType, id: string) => void;
    onUpdateStatus: (userId: string, newStatus: UserStatus, reason: string) => void;
    onDelete: (userId: string, reason: string) => void;
}> = ({ user, navigateTo, onUpdateStatus, onDelete }) => {
    const { t, language: cardLang } = useLanguage();
    const [action, setAction] = useState<{ type: 'delete' | 'status', payload?: any } | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const statusInfo = getStatusInfo(user.status, t);

    const handleConfirm = async (reason: string) => {
        if (!action) return;
        if (action.type === 'delete') {
            await onDelete(user.id, reason);
        } else if (action.type === 'status') {
            await onUpdateStatus(user.id, action.payload, reason);
        }
        setAction(null);
    };

    return (
        <>
            {action && (
                <ConfirmationModal 
                    isOpen={true}
                    onClose={() => setAction(null)}
                    onConfirm={handleConfirm}
                    title={action.type === 'delete' ? t('usersView.confirmDeleteTitle') : t('usersView.confirmStatusChangeTitle', { status: t(`status.${action.payload}`) })}
                    message={action.type === 'delete' ? t('usersView.confirmDeleteMessage', { name: user.name }) : t('usersView.confirmStatusChangeMessage')}
                    icon={action.type === 'delete' ? <TrashIcon className="w-8 h-8"/> : <EditIcon className="w-8 h-8"/>}
                    isReasonRequired={false}
                    confirmButtonClass={action.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                />
            )}
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
                    <button onClick={() => navigateTo('userDetail', user.id)} className="w-full px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md shadow-green-600/20 hover:shadow-lg hover:shadow-green-600/30">
                        {t('viewDetails')}
                    </button>
                    <div className="relative">
                        <button onClick={() => setMenuOpen(!menuOpen)} onBlur={() => setTimeout(() => setMenuOpen(false), 100)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600">
                             <MoreVerticalIcon className="w-5 h-5 text-slate-500 dark:text-slate-300" />
                        </button>
                        {menuOpen && (
                            <div className="absolute bottom-12 right-0 bg-white dark:bg-slate-900 rounded-md shadow-lg border dark:border-slate-700 w-40 z-10 text-right">
                                <button onClick={() => { setAction({ type: 'status', payload: user.status === UserStatus.ACTIVE ? UserStatus.SUSPENDED : UserStatus.ACTIVE }); setMenuOpen(false); }} className="w-full text-right px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-t-md">{t('usersView.changeStatus')}</button>
                                <button onClick={() => { setAction({ type: 'delete' }); setMenuOpen(false); }} className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-b-md">{t('usersView.deleteUser')}</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
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
    const { t } = useLanguage();
    const usersQuery = useAdminUsers({ per_page: env.DEFAULT_PAGE_SIZE });
    const requestsQuery = useAdminEducationalRequests({ per_page: env.DEFAULT_PAGE_SIZE });
    const updateStatus = useUpdateUserStatus();
    const deleteUser = useDeleteUser();

    const users = usersQuery.data || [] as User[];
    const educationalRequests = requestsQuery.data || [] as any[];

    const usersWithRequestCount = useMemo(() => {
        return users.map(user => ({
            ...user,
            requestCount: educationalRequests.filter(req => req.requesterId === user.id).length
        }));
    }, [users, educationalRequests]);

    const userStats = useMemo(() => ({
        total: usersQuery.totalItems || users.length,
        active: users.filter(u => u.status === UserStatus.ACTIVE).length,
        suspended: users.filter(u => u.status === UserStatus.SUSPENDED).length,
        banned: users.filter(u => u.status === UserStatus.BANNED).length,
    }), [users, usersQuery.totalItems]);

    return (
         <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('usersView.title')}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t('usersView.subtitle', { count: usersQuery.totalItems || users.length })}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard title={t('usersView.totalUsers')} value={userStats.total} icon={<UsersIcon className="w-6 h-6" style={{ color: 'var(--primary-color)' }} />} />
                <StatCard title={t('usersView.active')} value={userStats.active} icon={<CheckCircleIcon className="w-6 h-6 text-green-500"/>} />
                <StatCard title={t('usersView.suspended')} value={userStats.suspended} icon={<ClockIcon className="w-6 h-6 text-yellow-500"/>} />
                <StatCard title={t('usersView.banned')} value={userStats.banned} icon={<XCircleIcon className="w-6 h-6 text-red-500"/>} />
            </div>

            {usersQuery.isLoading ? (
              <div className="text-center py-10 col-span-full">
                <div className="inline-block animate-spin rounded-full h-6 w-6" style={{ borderBottom: '2px solid var(--primary-color)' }}></div>
                <span className="me-2 text-sm text-slate-600 dark:text-slate-400">{t('loading')}</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {usersWithRequestCount.map(user => (
                        <UserCard 
                            key={user.id}
                            user={user}
                            navigateTo={navigateTo}
                        onUpdateStatus={async (id, status, reason) => { await updateStatus.mutateAsync({ id, status, reason }); }}
                        onDelete={async (id) => { await deleteUser.mutateAsync(id); }}
                        />
                    ))}
                </div>
                 
                 {usersWithRequestCount.length === 0 && (
                    <div className="text-center py-20 col-span-full bg-white dark:bg-slate-800 rounded-xl">
                        <p className="text-lg text-slate-500">{t('usersView.noUsers')}</p>
                    </div>
                 )}
              </>
            )}
        </div>
    );
};

export default UsersView;
