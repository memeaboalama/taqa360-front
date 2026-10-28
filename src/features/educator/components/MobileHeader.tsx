
import React from 'react';
import { BellIcon, ProjectsIcon } from '../../../shared/components/Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';

const MobileHeader: React.FC<{ onNotificationsClick?: () => void }> = ({ onNotificationsClick }) => {
  const { t } = useLanguage();
  return (
    <header 
      className="bg-white dark:bg-slate-900 sticky top-0 z-30 border-b border-slate-200 dark:border-slate-700"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
             <div className="bg-brand-primary p-2 rounded-lg shadow-lg">
                <ProjectsIcon className="h-5 w-5 text-white" />
             </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">{t('brandName')}</span>
          </div>
          <button
            onClick={onNotificationsClick}
            title={t('dashboardView.notifications')}
            aria-label={t('dashboardView.notifications')}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <BellIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
