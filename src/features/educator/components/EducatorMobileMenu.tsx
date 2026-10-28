import React from 'react';
import { Educator, EducatorViewType } from '../../../shared/types';
import {
    DashboardIcon,
    BriefcaseIcon,
    ProjectsIcon,
    FileTextIcon,
    AcademicCapIcon,
    WalletIcon,
    EnvelopeIcon,
    LifebuoyIcon,
    SettingsIcon,
    LogoutIcon,
    XIcon
} from '../../../shared/components/Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import Avatar from '../../../shared/components/Avatar';

interface EducatorMobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    navigateTo: (view: EducatorViewType) => void;
    currentUser: Educator;
    onLogout: () => void;
}

const NavLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ icon, label, onClick }) => (
  <li>
    <button
      onClick={onClick}
      className="flex items-center w-full p-3 rounded-lg text-base text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
    >
      {icon}
      <span className="ms-4 font-semibold">{label}</span>
    </button>
  </li>
);

const MenuHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="px-3 pt-4 pb-2 text-sm font-semibold text-slate-400 uppercase">{children}</p>
);


const EducatorMobileMenu: React.FC<EducatorMobileMenuProps> = ({ isOpen, onClose, navigateTo, currentUser, onLogout }) => {
    const { t, language } = useLanguage();
    
    const handleNavigation = (view: EducatorViewType) => {
        navigateTo(view);
        onClose();
    };

    const mainNavItems: { view: EducatorViewType; label: string; icon: React.ReactNode }[] = [
        { view: 'dashboard', label: t('dashboard'), icon: <DashboardIcon className="w-6 h-6"/> },
        { view: 'opportunities', label: t('opportunities'), icon: <BriefcaseIcon className="w-6 h-6"/> },
        { view: 'tasks', label: t('tasks'), icon: <ProjectsIcon className="w-6 h-6"/> },
        { view: 'assignments', label: t('assignments'), icon: <FileTextIcon className="w-6 h-6"/> },
        { view: 'proposals', label: t('proposals'), icon: <FileTextIcon className="w-6 h-6"/> },
    ];

    const accountNavItems: { view: EducatorViewType; label: string; icon: React.ReactNode }[] = [
        { view: 'profile', label: t('profile'), icon: <AcademicCapIcon className="w-6 h-6"/> },
        { view: 'earnings', label: t('earnings'), icon: <WalletIcon className="w-6 h-6"/> },
        { view: 'inbox', label: t('inbox'), icon: <EnvelopeIcon className="w-6 h-6"/> },
        { view: 'support', label: t('support'), icon: <LifebuoyIcon className="w-6 h-6"/> },
        { view: 'settings', label: t('settings'), icon: <SettingsIcon className="w-6 h-6"/> },
    ];

    return (
        <>
            <div
                className={`fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            ></div>
            <div
                className={`fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 rounded-t-2xl shadow-top transition-transform duration-300 ease-in-out lg:hidden ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="mobile-menu-title"
            >
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <Avatar src={currentUser.avatarUrl} name={currentUser.name} size={40} className="rounded-full" />
                            <div>
                                <p id="mobile-menu-title" className="font-bold text-sm text-slate-800 dark:text-white">{currentUser.name}</p>
                                <p className="text-xs text-slate-500">{currentUser.discipline}</p>
                            </div>
                         </div>
                        <button onClick={onClose} className="p-2 -m-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                            <XIcon className="w-6 h-6 text-slate-500" />
                        </button>
                    </div>
                </div>
                <nav className="p-4 max-h-[50vh] overflow-y-auto">
                    <ul className="space-y-1">
                        <MenuHeader>{t('menu')}</MenuHeader>
                        {mainNavItems.map(item => (
                            <NavLink key={item.view} {...item} onClick={() => handleNavigation(item.view)} />
                        ))}
                         <MenuHeader>{t('account')}</MenuHeader>
                         {accountNavItems.map(item => (
                            <NavLink key={item.view} {...item} onClick={() => handleNavigation(item.view)} />
                        ))}
                    </ul>
                </nav>
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                     <button onClick={onLogout} className="flex items-center justify-center w-full p-3 rounded-lg text-base text-red-600 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50">
                        <LogoutIcon className="w-6 h-6 me-3"/>
                        <span className="font-semibold">{t('logout')}</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default EducatorMobileMenu;
