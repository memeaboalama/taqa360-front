

import React from 'react';
import { ViewType } from '../../../shared/types';
import { DashboardIcon, ProjectsIcon, PlusCircleIcon, UserCheckIcon, MenuAlt4Icon } from '../../../shared/components/Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { isProjectAreaView } from '../constants/projectSections';

interface AdminBottomNavBarProps {
    currentView: ViewType;
    navigateTo: (view: ViewType) => void;
    onMenuClick: () => void;
}

const NavButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    onClick: () => void;
    isMainAction?: boolean;
}> = ({ icon, label, isActive, onClick, isMainAction = false }) => {
    if (isMainAction) {
        return (
            <button onClick={onClick} className="flex flex-col items-center justify-center text-gray-700 dark:text-gray-300 -mt-6">
                <div className="w-16 h-16 rounded-full bg-brand-primary text-white flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg">
                    {icon}
                </div>
                <span className="text-xs font-bold mt-1">{label}</span>
            </button>
        )
    }

    return (
         <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${isActive ? 'text-brand-primary' : 'text-gray-500 dark:text-gray-400'}`}>
            {icon}
            <span className="text-[10px] font-semibold">{label}</span>
        </button>
    )
};


const AdminBottomNavBar: React.FC<AdminBottomNavBarProps> = ({ currentView, navigateTo, onMenuClick }) => {
    const { t } = useLanguage();
    return (
        <footer 
            className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 shadow-top z-40"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
           <div className="grid grid-cols-5 h-full max-w-lg mx-auto">
                <NavButton
                    icon={<DashboardIcon className="w-6 h-6"/>}
                    label={t('home')}
                    isActive={currentView === 'dashboard'}
                    onClick={() => navigateTo('dashboard')}
                />
                 <NavButton
                    icon={<ProjectsIcon className="w-6 h-6"/>}
                    label={t('projects')}
                    isActive={isProjectAreaView(currentView)}
                    onClick={() => navigateTo('projects')}
                />
                 <NavButton
                    icon={<PlusCircleIcon className="w-10 h-10"/>}
                    label={t('new')}
                    onClick={() => navigateTo('createProject')}
                    isMainAction
                />
                 <NavButton
                    icon={<UserCheckIcon className="w-6 h-6"/>}
                    label={t('requests')}
                     isActive={['educationalRequests', 'requestDetail'].includes(currentView as ViewType)}
                    onClick={() => navigateTo('educationalRequests')}
                />
                 <NavButton
                    icon={<MenuAlt4Icon className="w-6 h-6"/>}
                    label={t('menu')}
                    onClick={onMenuClick}
                />
           </div>
        </footer>
    )
};

export default AdminBottomNavBar;