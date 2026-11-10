import React from 'react';
import EditUserView from './EditUserView';
import { useAdminUser, useUpdateUser } from '../../../core/hooks/useAdminQueries';
import { ViewType } from '../../../shared/types';
import { useData } from '../../../app/providers/DataProvider';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface Props {
  navigateTo: (view: ViewType, id?: string) => void;
  userId: string;
}

const EditUserContainer: React.FC<Props> = ({ navigateTo, userId }) => {
  const { data: rawUser, isLoading, isError } = useAdminUser(userId);
  const updateUser = useUpdateUser();
  const { addToast } = useData();
  const { t } = useLanguage();

  const user = rawUser && typeof rawUser === 'object' && 'name' in rawUser
    ? rawUser
    : (rawUser as any)?.data ?? (rawUser as any)?.user ?? null;
  const userMatchesRequestedId = user && [user.id, user.databaseId]
    .some((id) => id != null && String(id) === String(userId));

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="inline-block animate-spin rounded-full h-12 w-12 mb-4" style={{ borderBottom: '3px solid var(--primary-color)' }}></div>
      <span className="text-base font-medium text-slate-600 dark:text-slate-400">{t('loading')}</span>
    </div>
  );

  if (isError || !user || !userMatchesRequestedId) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <p className="text-lg text-red-500">
          {user && !userMatchesRequestedId ? t('editUser.accountMismatch') : t('common.viewNotFound')}
        </p>
        {user && !userMatchesRequestedId && (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {t('editUser.accountMismatchDetails', { requestedId: userId, returnedEmail: user.email })}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <EditUserView
      key={user.id}
      navigateTo={navigateTo}
      user={user}
      isPending={updateUser.isPending}
      onSave={async (data) => {
        await updateUser.mutateAsync({ id: userId, data });
        addToast(t('toasts.userUpdated'));
        navigateTo('userDetail', userId);
      }}
    />
  );
};

export default EditUserContainer;
