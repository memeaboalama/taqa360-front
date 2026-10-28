import React from 'react';
import { ViewType } from '../../../shared/types';
import EducatorApplicationDetailContainer from './EducatorApplicationDetailContainer';

interface EducatorDetailViewProps {
  educatorId: string;
  navigateTo: (view: ViewType, context?: any) => void;
}

const EducatorDetailView: React.FC<EducatorDetailViewProps> = ({ educatorId, navigateTo }) => {
  return (
    <EducatorApplicationDetailContainer
      educatorId={educatorId}
      navigateTo={navigateTo}
      mode="profile"
      backTarget="educators"
    />
  );
};

export default EducatorDetailView;
