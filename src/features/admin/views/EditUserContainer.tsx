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

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="inline-block animate-spin rounded-full h-12 w-12 mb-4" style={{ borderBottom: '3px solid var(--primary-color)' }}></div>
      <span className="text-base font-medium text-slate-600 dark:text-slate-400">{t('loading')}</span>
    </div>
  );

  if (isError || !user) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-lg text-red-500">{t('common.viewNotFound')}</p>
    </div>
  );

  return (
    <EditUserView
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
