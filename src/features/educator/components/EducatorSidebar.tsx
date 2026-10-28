import React from 'react';
import { EducatorViewType, Educator } from '../../../shared/types';
import { DashboardIcon, BriefcaseIcon, ProjectsIcon, FileTextIcon, AcademicCapIcon, WalletIcon, EnvelopeIcon, LifebuoyIcon, SettingsIcon, ArrowLeftIcon, LogoutIcon } from '../../../shared/components/Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import LanguageSwitcher from '../../../shared/components/LanguageSwitcher';
import Avatar from '../../../shared/components/Avatar';
import BrandLogo from '../../../shared/components/BrandLogo';

interface EducatorSidebarProps {
  currentView: EducatorViewType;
  navigateTo: (view: EducatorViewType) => void;
  educator: Educator;
  onLogout: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <li>
    <button
      onClick={onClick}
      className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 group ${
        isActive
          ? 'bg-brand-primary text-white shadow-sm'
          : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'
      }`}
    >
      {icon}
      <span className="ms-3 font-semibold">{label}</span>
    </button>
  </li>
);

const EducatorSidebar: React.FC<EducatorSidebarProps> = ({ currentView, navigateTo, educator, onLogout }) => {
  const { t, language } = useLanguage();

  const mainNavItems: { view: EducatorViewType; label: string; icon: React.ReactNode }[] = [
    { view: 'dashboard', label: t('dashboard'), icon: <DashboardIcon className="w-6 h-6"/> },
    { view: 'opportunities', label: t('opportunities'), icon: <BriefcaseIcon className="w-6 h-6"/> },
    { view: 'tasks', label: t('tasks'), icon: <ProjectsIcon className="w-6 h-6"/> },
    { view: 'assignments', label: t('assignments'), icon: <FileTextIcon className="w-6 h-6"/> },
    { view: 'proposals', label: t('proposals'), icon: <FileTextIcon className="w-6 h-6"/> },
  ];

  const secondaryNavItems: { view: EducatorViewType; label: string; icon: React.ReactNode }[] = [
    { view: 'profile', label: t('profile'), icon: <AcademicCapIcon className="w-6 h-6"/> },
    { view: 'earnings', label: t('earnings'), icon: <WalletIcon className="w-6 h-6"/> },
    { view: 'inbox', label: t('inbox'), icon: <EnvelopeIcon className="w-6 h-6"/> },
    { view: 'support', label: t('support'), icon: <LifebuoyIcon className="w-6 h-6"/> },
    { view: 'settings', label: t('settings'), icon: <SettingsIcon className="w-6 h-6"/> },
  ];

  const isViewActive = (view: EducatorViewType) => {
      if (view === 'opportunities') return ['opportunities', 'opportunityDetail', 'opportunityTaskDetail', 'createBid'].includes(currentView as string);
      if (view === 'proposals') return ['proposals', 'bidDetail'].includes(currentView);
      if (view === 'tasks') return currentView === 'tasks' || currentView === 'taskDetail';
      if (view === 'assignments') return currentView === 'assignments';
      return currentView === view;
  }

  return (
    <aside className={`hidden lg:flex flex-col bg-white dark:bg-slate-800 border-e border-slate-200 dark:border-slate-700 w-64 fixed inset-y-0 ${language === 'ar' ? 'right-0' : 'left-0'} z-30`}>
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700">
          {/* <button onClick={() => navigateTo('dashboard')} className="flex items-center">
                <div className="bg-brand-primary p-2 rounded-lg shadow-lg">
                    <ProjectsIcon className="h-6 w-6 text-white" />
                </div>
                <span className="self-center text-2xl font-bold whitespace-nowrap dark:text-white ms-3">{t('brandName')}</span>
            </button> */}
            <button onClick={() => navigateTo('dashboard')} className="flex items-center">
                <BrandLogo className="h-20 w-auto" /> 
                {/* <span className="self-center text-2xl font-bold whitespace-nowrap dark:text-white ms-3">{t('brandName')}</span> */}

            </button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
            <p className="px-3 pt-2 pb-2 text-xs font-semibold text-slate-400 uppercase">{t('menu')}</p>
            <ul className="space-y-2 font-medium">
                {mainNavItems.map(item => (
                    <NavItem key={item.view} {...item} isActive={isViewActive(item.view)} onClick={() => navigateTo(item.view)} />
                ))}
            </ul>
            <p className="px-3 pt-4 pb-2 text-xs font-semibold text-slate-400 uppercase">{t('account')}</p>
            <ul className="space-y-2 font-medium">
                {secondaryNavItems.map(item => (
                    <NavItem key={item.view} {...item} isActive={isViewActive(item.view)} onClick={() => navigateTo(item.view)} />
                ))}
            </ul>
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
             <div className="mb-3">
                <LanguageSwitcher variant="compact" className="w-full" />
             </div>
             <div className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                 <div className="flex items-center gap-3">
                    <Avatar src={educator.avatarUrl} name={educator.name} size={40} className="rounded-full" />
                    <div className="flex-grow">
                        <p className="font-bold text-sm text-slate-800 dark:text-white">{educator.name}</p>
                        <p className="text-xs text-slate-500">{educator.discipline}</p>
                    </div>
                     <button onClick={onLogout} title={t('logout')} className="p-2 text-slate-500 hover:text-red-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600">
                        <LogoutIcon className="w-5 h-5"/>
                    </button>
                 </div>
            </div>
        </div>
    </aside>
  );
};

export default EducatorSidebar;
