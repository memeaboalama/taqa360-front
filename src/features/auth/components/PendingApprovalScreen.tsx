
import React from 'react';
import { ClockIcon, ArrowLeftIcon } from '../../../shared/components/Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface PendingApprovalScreenProps {
  onLogout: () => void;
}

const PendingApprovalScreen: React.FC<PendingApprovalScreenProps> = ({ onLogout }) => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg text-center">
        <div className="bg-white dark:bg-slate-800 p-10 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/50 text-brand-primary dark:text-brand-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <ClockIcon className="w-10 h-10"/>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('pending.title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-4 mb-8">
                {t('pending.message')}
            </p>
            <button onClick={onLogout} className="inline-flex items-center py-2.5 px-6 text-sm font-semibold text-red-600 dark:text-red-400 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600">
                <ArrowLeftIcon className="w-5 h-5 me-2" />
                {t('logout')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalScreen;
