import React from 'react';
import CreateUserView from './CreateUserView';
import { useCreateUser } from '../../../core/hooks/useAdminQueries';
import { ViewType } from '../../../shared/types';
import { useData } from '../../../app/providers/DataProvider';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface Props {
  navigateTo: (view: ViewType, id?: string) => void;
}

const CreateUserContainer: React.FC<Props> = ({ navigateTo }) => {
  const createUser = useCreateUser();
  const { addToast } = useData();
  const { t } = useLanguage();

  return (
    <CreateUserView
      navigateTo={navigateTo}
      isPending={createUser.isPending}
      onAddUser={async (data) => {
        await createUser.mutateAsync(data);
        addToast(t('toasts.userCreated'));
        navigateTo('users');
      }}
    />
  );
};

export default CreateUserContainer;
