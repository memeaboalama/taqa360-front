import React, { useState } from 'react';
import { UserStatus, ViewType } from '../../../shared/types';
import { ArrowRightIcon, TrashIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, CalendarIcon, EditIcon } from '../../../shared/components/Icons';
import Avatar from '../../../shared/components/Avatar';
import ConfirmationModal from '../../../shared/components/modals/ConfirmationModal';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { useData } from '../../../app/providers/DataProvider';
import { useAdminUser, useUpdateUserStatus, useDeleteUser } from '../../../core/hooks/useAdminQueries';
import { formatDate } from '../../../shared/utils';

interface UserProfileViewProps {
    navigateTo: (view: ViewType, id?: string) => void;
    userId: string;
}

const normalizeStatus = (status?: string): UserStatus => {
    const s = (status || '').toUpperCase();
    if (s === 'SUSPENDED') return UserStatus.SUSPENDED;
    if (s === 'BANNED') return UserStatus.BANNED;
    return UserStatus.ACTIVE;
};

const UserProfileView: React.FC<UserProfileViewProps> = ({ navigateTo, userId }) => {
    const { t, language } = useLanguage();
    const { addToast } = useData();
    const isRtl = language === 'ar';

    const { data: rawUser, isLoading, isError, error } = useAdminUser(userId);
    const updateStatus = useUpdateUserStatus();
    const deleteUser = useDeleteUser();

    const user = rawUser && typeof rawUser === 'object' && 'name' in rawUser
        ? rawUser
        : (rawUser as any)?.data ?? (rawUser as any)?.user ?? null;

    const [statusAction, setStatusAction] = useState<{ status: UserStatus } | null>(null);
    const [deleteAction, setDeleteAction] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const currentStatus = user ? normalizeStatus(user.status) : UserStatus.ACTIVE;

    const handleStatusConfirm = async (reason: string) => {
        if (!statusAction || !user) return;
        setSubmitting(true);
        try {
            await updateStatus.mutateAsync({ id: user.id, status: statusAction.status, reason });
            addToast(`تم تغيير حالة المستخدم إلى ${t(`status.${statusAction.status}`)}`);
            setStatusAction(null);
        } catch (err: any) {
            addToast(err?.response?.data?.message || err?.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteConfirm = async (reason: string) => {
        if (!user) return;
        setSubmitting(true);
        try {
            await deleteUser.mutateAsync(user.id);
            addToast(t('toasts.userDeleted'));
            setDeleteAction(false);
            navigateTo('users');
        } catch (err: any) {
            addToast(err?.response?.data?.message || err?.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            <div className="inline-block animate-spin rounded-full h-12 w-12 mb-4" style={{ borderBottom: '3px solid var(--primary-color)' }}></div>
            <span className="text-base font-medium text-slate-600 dark:text-slate-400">{t('loading')}</span>
        </div>
    );

    if (isError) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-lg text-red-500">{t('usersView.errorFetching')}{(error as any)?.message ? `: ${(error as any).message}` : ''}</p>
        </div>
    );

    if (!user) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-lg text-red-500">{t('common.viewNotFound')}</p>
        </div>
    );

    const getStatusClass = (status: string) => {
        const normalized = normalizeStatus(status);
        switch (normalized) {
            case UserStatus.ACTIVE: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case UserStatus.SUSPENDED: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case UserStatus.BANNED: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const InfoRow: React.FC<{ label: string; value: string; icon?: React.ReactNode }> = ({ label, value, icon }) => (
        <div className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-slate-700 last:border-0">
            {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
            <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                <p className="text-sm font-medium text-slate-800 dark:text-white">{value || '—'}</p>
            </div>
        </div>
    );

    const nextStatus = currentStatus === UserStatus.ACTIVE ? UserStatus.SUSPENDED : UserStatus.ACTIVE;

    return (
        <div className="animate-fade-in">
            {statusAction && (
                <ConfirmationModal
                    isOpen={true}
                    onClose={() => setStatusAction(null)}
                    onConfirm={handleStatusConfirm}
                    title={t('usersView.confirmStatusChangeTitle', { status: t(`status.${statusAction.status}`) })}
                    message={t('usersView.confirmStatusChangeMessage')}
                    icon={<EditIcon className="w-8 h-8" />}
                    isReasonRequired={false}
                    submitting={submitting}
                    confirmButtonClass="bg-brand-primary text-white hover:bg-brand-primary/90"
                />
            )}
            {deleteAction && (
                <ConfirmationModal
                    isOpen={true}
                    onClose={() => setDeleteAction(false)}
                    onConfirm={handleDeleteConfirm}
                    title={t('usersView.confirmDeleteTitle')}
                    message={t('usersView.confirmDeleteMessage', { name: user.name })}
                    icon={<TrashIcon className="w-8 h-8" />}
                    isReasonRequired={false}
                    submitting={submitting}
                    confirmButtonClass="bg-red-600 hover:bg-red-700"
                />
            )}

            <button onClick={() => navigateTo('users')} className="flex items-center gap-2 text-sm font-semibold text-brand-primary hover:text-yellow-500 dark:hover:text-yellow-400 mb-6 transition-colors">
                <ArrowRightIcon className={`w-4 h-4 ${isRtl ? '' : 'rotate-180'}`} />
                {t('userDetail.backToUsers')}
            </button>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
                <div className="p-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <Avatar src={user.avatarUrl} name={user.name} size={100} className="rounded-full border-4 border-slate-200 dark:border-slate-700 shrink-0" />
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{user.name}</h1>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusClass(user.status)}`}>
                                    {t(`status.${user.status}`) !== `status.${user.status}` ? t(`status.${user.status}`) : t(`status.${currentStatus}`)}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 mt-4">
                                <button
                                    onClick={() => setStatusAction({ status: nextStatus })}
                                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg ${
                                        nextStatus === UserStatus.SUSPENDED
                                            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                            : 'bg-green-500 text-white hover:bg-green-600'
                                    }`}
                                >
                                    {t('usersView.changeStatus')}
                                </button>
                                <button
                                    onClick={() => navigateTo('editUser', user.id)}
                                    className="px-4 py-2 text-sm font-semibold text-blue-600 border border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                                >
                                    <EditIcon className="w-4 h-4 inline me-1" />
                                    {t('editUser.title')}
                                </button>
                                <button
                                    onClick={() => setDeleteAction(true)}
                                    className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                >
                                    <TrashIcon className="w-4 h-4 inline me-1" />
                                    {t('usersView.deleteUser')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-slate-700 p-8">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">{t('usersView.personalInfo')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoRow label={t('email')} value={user.email} icon={<EnvelopeIcon className="w-4 h-4" />} />
                        <InfoRow label={t('phone')} value={user.phone} icon={<PhoneIcon className="w-4 h-4" />} />
                        <InfoRow label={t('usersView.city')} value={user.city} icon={<MapPinIcon className="w-4 h-4" />} />
                        <InfoRow label={t('usersView.address')} value={user.address} icon={<MapPinIcon className="w-4 h-4" />} />
                        <InfoRow label={t('usersView.joinedOn')} value={formatDate(user.registrationDate, language === 'ar' ? 'ar-EG' : 'en-US')} icon={<CalendarIcon className="w-4 h-4" />} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileView;
