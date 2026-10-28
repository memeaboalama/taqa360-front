


import React, { useState, useEffect } from 'react';
import { useData } from '../../../app/providers/DataProvider';
import AdminSidebar from './AdminSidebar';
import AdminBottomNavBar from './AdminBottomNavBar';
import AdminMobileMenu from './AdminMobileMenu';
import InviteEducatorModal from './modals/InviteEducatorModal';
import { ViewType } from '../../../shared/types';
import ToastContainer from '../../../shared/components/Toast';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { useInviteEducator } from '../../../core/hooks/useAdminQueries';

interface AdminLayoutProps {
    children: React.ReactNode;
    currentView: ViewType;
    navigateTo: (view: ViewType, context?: any) => void;
    isInviteModalOpen: boolean;
    setInviteModalOpen: (isOpen: boolean) => void;
    onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentView, navigateTo, isInviteModalOpen, setInviteModalOpen, onLogout }) => {
    const { addToast, toasts } = useData();
    const { language, t } = useLanguage();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    const { mutate: inviteEducator, isPending: isInviting } = useInviteEducator();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleInvite = (email: string) => {
        inviteEducator(email, {
            onSuccess: () => {
                addToast(t('toasts.invitationSent'));
                setInviteModalOpen(false);
            },
            onError: (error: any) => {
                addToast(error?.message || t('toasts.invitationFailed'), 'error');
            }
        });
    };

    const handleNavigate = (view: ViewType, context: any = null) => {
        navigateTo(view, context);
        if(isMobileMenuOpen) setMobileMenuOpen(false);
    }
    
    return (
        <div className={`min-h-screen text-brand-dark dark:text-slate-300 transition-all duration-300 ${!isMobile && (isSidebarCollapsed ? (language === 'ar' ? 'lg:pr-20' : 'lg:pl-20') : (language === 'ar' ? 'lg:pr-64' : 'lg:pl-64'))}`}>
            <ToastContainer notifications={toasts} />
            <InviteEducatorModal isOpen={isInviteModalOpen} onClose={() => setInviteModalOpen(false)} onInvite={handleInvite} isLoading={isInviting} />
            {!isMobile && <AdminSidebar currentView={currentView} navigateTo={handleNavigate} isCollapsed={isSidebarCollapsed} setCollapsed={setSidebarCollapsed} onLogout={onLogout} />}
            
            <main className={isMobile ? 'p-4 pb-[calc(6rem+env(safe-area-inset-bottom))]' : 'p-4 sm:p-6 lg:p-8'}>
                 {children}
            </main>

            {isMobile && (
                <>
                    <AdminBottomNavBar currentView={currentView} navigateTo={handleNavigate} onMenuClick={() => setMobileMenuOpen(true)} />
                    <AdminMobileMenu isOpen={isMobileMenuOpen} onClose={() => setMobileMenuOpen(false)} currentView={currentView} navigateTo={handleNavigate} onLogout={onLogout} />
                </>
            )}
        </div>
    );
};

export default AdminLayout;