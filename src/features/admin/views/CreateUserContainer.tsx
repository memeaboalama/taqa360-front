import React from 'react';
import CreateUserView from './CreateUserView';
import { useCreateUser } from '../../../core/hooks/useAdminQueries';
import { ViewType } from '../../../shared/types';
import { useData } from '../../../app/providers/DataProvider';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKeyFactory } from '../../../core/hooks/useBaseQuery';

interface Props {
  navigateTo: (view: ViewType, id?: string) => void;
}

const CreateUserContainer: React.FC<Props> = ({ navigateTo }) => {
  const createUser = useCreateUser();
  const queryClient = useQueryClient();
  const { addToast } = useData();
  const { t } = useLanguage();

  return (
    <CreateUserView
      navigateTo={navigateTo}
      isPending={createUser.isPending}
      onAddUser={async (data) => {
        try {
          await createUser.mutateAsync(data);
          await queryClient.invalidateQueries({
            queryKey: QueryKeyFactory.lists(QueryKeyFactory.QUERIES.USERS),
            refetchType: 'all',
          });
        } catch (error) {
          addToast(error instanceof Error ? error.message : t('errors.unknown'), 'error');
          throw error;
        }
        addToast(t('toasts.userCreated'));
        navigateTo('users');
      }}
    />
  );
};

export default CreateUserContainer;
