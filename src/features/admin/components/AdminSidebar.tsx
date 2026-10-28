import React, { useState } from 'react';
import { DashboardIcon, BookOpenIcon, SettingsIcon, UserCheckIcon, ProjectsIcon, ChevronDownIcon, UserPlusIcon, UserGroupIcon, UserMinusIcon, UsersIcon, ArrowLeftIcon, ArrowRightIcon, AcademicCapIcon, ReceiptPercentIcon, ChartBarIcon, CalendarIcon, SparklesIcon, BriefcaseIcon, LifebuoyIcon, LogoutIcon, GlobeAltIcon } from '../../../shared/components/Icons';
import BrandLogo from '../../../shared/components/BrandLogo';
import LanguageSwitcher from '../../../shared/components/LanguageSwitcher';
import { ViewType } from '../../../shared/types';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface AdminSidebarProps {
  currentView: ViewType;
  navigateTo: (view: ViewType) => void;
  isCollapsed: boolean;
  setCollapsed: (isCollapsed: boolean) => void;
  onLogout: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isSubItem?: boolean;
  isCollapsed: boolean;
}> = ({ icon, label, isActive, onClick, isSubItem = false, isCollapsed }) => {
  return (
    <li title={isCollapsed ? label : undefined}>
      <button
        onClick={onClick}
        className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 group ${
          isActive
            ? 'bg-brand-primary text-white shadow-sm'
            : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'
        } ${isCollapsed && !isSubItem ? 'justify-center' : ''} ${isSubItem ? (isCollapsed ? 'ps-4' : 'ps-8') : ''}`}
      >
        {icon}
        <span className={`ms-3 font-semibold transition-opacity duration-200 ${isCollapsed ? 'lg:opacity-0 lg:w-0 lg:hidden' : 'opacity-100'}`}>{label}</span>
      </button>
    </li>
  );
};


const AccordionMenu: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    isCollapsed: boolean;
    children: React.ReactNode;
}> = ({ icon, label, isActive, children, isCollapsed }) => {
    const [isOpen, setIsOpen] = useState(isActive);
    
    if (isCollapsed) {
      return (
         <li title={label}>
            <div className={`flex items-center justify-center w-full p-3 rounded-lg transition-colors duration-200 ${
              isActive ? 'bg-brand-primary/15 text-brand-primary dark:bg-gray-700 dark:text-gray-200' : 'text-gray-500'}`}>
                {icon}
            </div>
        </li>
      )
    }

    return (
        <li>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between w-full p-3 rounded-lg transition-colors duration-200 ${
                    isActive
                        ? 'bg-brand-primary/10 text-brand-primary dark:bg-gray-700 dark:text-gray-200'
                        : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
            >
                <div className="flex items-center">
                    {icon}
                    <span className="ms-3 font-semibold">{label}</span>
                </div>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <ul className="pt-2 ps-4 space-y-2">{children}</ul>}
        </li>
    );
};


const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentView, navigateTo, isCollapsed, setCollapsed, onLogout }) => {
  const { t, language, toggleLanguage } = useLanguage();
  const isProjectsActive = ['projects', 'projectDetail', 'createProject', 'bidDetail', 'taskDetail'].includes(currentView);
  const isRequestsActive = ['educationalRequests', 'requestDetail'].includes(currentView);
  const isEducatorsActive = ['educators', 'educatorDetail', 'educatorApplications', 'educatorApplicationDetail', 'rejectedEducators'].includes(currentView);
  const isUsersActive = ['users', 'userDetail'].includes(currentView);
  const isFinanceActive = ['finance', 'invoiceDetail'].includes(currentView);
  const isSupportActive = ['support', 'supportTicketDetail'].includes(currentView);
  
  return (
    <>
    <aside className={`hidden lg:flex flex-col bg-white dark:bg-slate-800 border-e border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out fixed inset-y-0 ${language === 'ar' ? 'right-0' : 'left-0'} z-30 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex ${isCollapsed ? 'justify-center' : 'justify-between'} items-center`}>
        <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('dashboard'); }} className="flex items-center">
            <BrandLogo className="h-20 w-auto mx-auto" />
        </a>
      </div>
      <div className="flex-1 p-4 overflow-y-auto overflow-x-hidden">
        <p className={`px-3 pt-2 pb-2 text-xs font-semibold text-gray-400 uppercase ${isCollapsed ? 'text-center' : ''}`}>{isCollapsed ? '•••' : t('mainMenu')}</p>
        <ul className="space-y-2 font-medium">
          {/* <NavItem
            icon={<DashboardIcon className="w-6 h-6" />}
            label={t('dashboard')}
            isActive={currentView === 'dashboard'}
            onClick={() => navigateTo('dashboard')}
            isCollapsed={isCollapsed}
          /> */}
          <NavItem
            icon={<BookOpenIcon className="w-6 h-6" />}
            label={t('projects')}
            isActive={isProjectsActive}
            onClick={() => navigateTo('projects')}
            isCollapsed={isCollapsed}
          />
          <NavItem
            icon={<UserCheckIcon className="w-6 h-6" />}
            label={t('requests')}
            isActive={isRequestsActive}
            onClick={() => navigateTo('educationalRequests')}
            isCollapsed={isCollapsed}
          />
          <AccordionMenu
            icon={<AcademicCapIcon className="w-6 h-6" />}
            label={t('educators')}
            isActive={isEducatorsActive}
            isCollapsed={isCollapsed}
          >
             <NavItem
                icon={<UserPlusIcon className="w-5 h-5" />}
                label={t('registrationRequests')}
                isActive={['educatorApplications', 'educatorApplicationDetail'].includes(currentView)}
                onClick={() => navigateTo('educatorApplications')}
                isSubItem
                isCollapsed={isCollapsed}
              />
               <NavItem
                icon={<UserGroupIcon className="w-5 h-5" />}
                label={t('acceptedEducators')}
                isActive={currentView === 'educators'}
                onClick={() => navigateTo('educators')}
                 isSubItem
                 isCollapsed={isCollapsed}
              />
               <NavItem
                icon={<UserMinusIcon className="w-5 h-5" />}
                label={t('rejectedEducators')}
                isActive={currentView === 'rejectedEducators'}
                onClick={() => navigateTo('rejectedEducators')}
                 isSubItem
                 isCollapsed={isCollapsed}
              />
          </AccordionMenu>
          <NavItem
            icon={<UsersIcon className="w-6 h-6" />}
            label={t('users')}
            isActive={isUsersActive}
            onClick={() => navigateTo('users')}
            isCollapsed={isCollapsed}
          />
        </ul>
        <p className={`px-3 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase ${isCollapsed ? 'text-center' : ''}`}>{isCollapsed ? '•••' : t('administration')}</p>
        <ul className="space-y-2 font-medium">
          <NavItem
            icon={<AcademicCapIcon className="w-6 h-6" />}
            label={t('specializations')}
            isActive={currentView === 'specializations'}
            onClick={() => navigateTo('specializations')}
            isCollapsed={isCollapsed}
          />
          <NavItem
            icon={<SparklesIcon className="w-6 h-6" />}
            label={t('skills')}
            isActive={currentView === 'skills'}
            onClick={() => navigateTo('skills')}
            isCollapsed={isCollapsed}
          />
           <NavItem
            icon={<BriefcaseIcon className="w-6 h-6" />}
            label={t('services')}
            isActive={currentView === 'services'}
            onClick={() => navigateTo('services')}
            isCollapsed={isCollapsed}
          />
        </ul>
        <p className={`px-3 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase ${isCollapsed ? 'text-center' : ''}`}>{isCollapsed ? '•••' : t('tools')}</p>
        <ul className="space-y-2 font-medium">
          <NavItem
            icon={<ReceiptPercentIcon className="w-6 h-6" />}
            label={t('finance')}
            isActive={isFinanceActive}
            onClick={() => navigateTo('finance')}
            isCollapsed={isCollapsed}
          />
          <NavItem
            icon={<ChartBarIcon className="w-6 h-6" />}
            label={t('reports')}
            isActive={currentView === 'reports'}
            onClick={() => navigateTo('reports')}
            isCollapsed={isCollapsed}
          />
           <NavItem
            icon={<CalendarIcon className="w-6 h-6" />}
            label={t('calendar')}
            isActive={currentView === 'calendar'}
            onClick={() => navigateTo('calendar')}
            isCollapsed={isCollapsed}
          />
          <NavItem
            icon={<LifebuoyIcon className="w-6 h-6" />}
            label={t('support')}
            isActive={isSupportActive}
            onClick={() => navigateTo('support')}
            isCollapsed={isCollapsed}
          />
        </ul>
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <ul className="space-y-2 font-medium">
           <NavItem
            icon={<SettingsIcon className="w-6 h-6" />}
            label={t('settings')}
            isActive={currentView === 'settings'}
            onClick={() => navigateTo('settings')}
            isCollapsed={isCollapsed}
          />
           <NavItem
              icon={<GlobeAltIcon className="w-6 h-6" />}
              label={language === 'ar' ? 'English' : 'العربية'}
              isActive={false}
              onClick={toggleLanguage}
              isCollapsed={isCollapsed}
            />
            <NavItem
              icon={<LogoutIcon className="w-6 h-6" />}
              label={t('logout')}
              isActive={false}
              onClick={onLogout}
              isCollapsed={isCollapsed}
            />
           <li title={isCollapsed ? t('toggleSidebar') : t('toggleSidebar')}>
              <button
                onClick={() => setCollapsed(!isCollapsed)}
                className={`flex items-center w-full p-3 rounded-lg transition-colors duration-200 group text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 ${isCollapsed ? 'justify-center' : ''}`}
              >
                {isCollapsed ? (language === 'ar' ? <ArrowLeftIcon className="w-6 h-6"/> : <ArrowRightIcon className="w-6 h-6"/>) : (language === 'ar' ? <ArrowRightIcon className="w-6 h-6"/> : <ArrowLeftIcon className="w-6 h-6"/>) }
                <span className={`ms-3 font-semibold transition-opacity duration-200 ${isCollapsed ? 'lg:opacity-0 lg:w-0 lg:hidden' : 'opacity-100'}`}>{t('toggleSidebar')}</span>
              </button>
            </li>
        </ul>
      </div>
    </aside>
    </>
  );
};

export default AdminSidebar;
