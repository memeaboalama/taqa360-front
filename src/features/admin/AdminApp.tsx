import React, { useState } from 'react';
import { useData } from '../../app/providers/DataProvider';
import AdminLayout from './components/AdminLayout';
import { ViewType, EducatorStatus, BidStatus, ProjectStatus } from '../../shared/types';
import { ADMIN_USER } from '../../shared/constants';

// Views from the new structure
import DashboardView from './views/DashboardView';
import ProjectsView from './views/ProjectsView';
import CreateProjectContainer from './views/CreateProjectContainer';
import EducationalRequestsContainer from './views/EducationalRequestsContainer';
import RequestDetailContainer from './views/RequestDetailContainer';
import EducatorsView from './views/EducatorsView';
import EducatorDetailView from './views/EducatorDetailView';
import UsersView from './views/UsersView';
import FinanceView from './views/FinanceView';
import ReportsView from './views/ReportsView';
import CalendarView from './views/CalendarView';
import AdminSettingsView from './views/SettingsView';
import EducatorApplicationsView from './views/EducatorApplicationsView';
import RegistrationRequestsView from './views/RegistrationRequestsView';
import EducatorApplicationDetailContainer from './views/EducatorApplicationDetailContainer';
import RejectedEducatorsView from './views/RejectedEducatorsView';
import SpecializationsView from './views/SpecializationsView';
import SkillsView from './views/SkillsView';
import ServicesView from './views/ServicesView';
import SupportTicketsView from './views/SupportTicketsView';
import ProjectDetailContainer from './views/ProjectDetailContainer';
import UserDetailView from './views/UserDetailView';
import UserProfileView from './views/UserProfileView';
import TaskDetailContainer from './views/TaskDetailContainer';
import AdminBidDetailView from './views/BidDetailView';
import BidDetailContainer from './views/BidDetailContainer';
import InvoiceDetailView from './views/InvoiceDetailView';
import CreateUserContainer from './views/CreateUserContainer';
import EditUserContainer from './views/EditUserContainer';
import { useLanguage } from '../../app/providers/LanguageProvider';

interface AdminAppProps {
    onLogout: () => void;
}

import { loadAdminRoute, onHashChange, saveAdminRoute } from '../../core/utils/router';
import RejectedEducatorsContainer from './views/RejectedEducatorsContainer';

const AdminApp: React.FC<AdminAppProps> = ({ onLogout }) => {
    const data = useData();
    const { t } = useLanguage();
    const initial = loadAdminRoute();
    const [currentView, setCurrentView] = useState<ViewType>((initial.view as ViewType) || 'dashboard');
    const [viewContext, setViewContext] = useState<any>(initial.ctx || null);
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);

    React.useEffect(() => {
        const unsub = onHashChange((state) => {
            if (state.role === 'admin') {
                const r = loadAdminRoute();
                if (r.view && r.view !== currentView) setCurrentView(r.view as ViewType);
                if (r.ctx !== undefined) setViewContext(r.ctx);
            }
        });
        return unsub;
    }, [currentView]);

    const navigateTo = (view: ViewType, context: any = null) => {
        window.scrollTo(0, 0);
        setCurrentView(view);
        setViewContext(context);
        saveAdminRoute(view, context);
    };

    const renderView = () => {
        const adminProps = { navigateTo };
        switch(currentView) {
            // case 'dashboard': return <DashboardView navigateTo={navigateTo} />;
            case 'dashboard': return <ProjectsView {...adminProps} />;
            case 'projects': return <ProjectsView {...adminProps} />;
            case 'projectDetail': return <ProjectDetailContainer
                {...adminProps}
                projectId={viewContext}
                />;
            case 'createProject': return <CreateProjectContainer {...adminProps} selectedRequestId={viewContext} />;
            case 'educationalRequests': return <EducationalRequestsContainer {...adminProps} />;
            case 'requestDetail': return <RequestDetailContainer {...adminProps} requestId={viewContext} />;
            case 'educators': return <EducatorsView onInvite={() => setInviteModalOpen(true)} navigateTo={navigateTo} />;
            case 'educatorDetail':
                return <EducatorDetailView educatorId={viewContext} navigateTo={navigateTo} />;
            case 'educatorApplications': return <RegistrationRequestsView {...adminProps} navigateTo={navigateTo} />;
            case 'educatorApplicationDetail': {
                const ctx = viewContext as any;
                const educatorId = typeof ctx === 'string' ? ctx : ctx?.id || '';
                const mode: 'application' | 'profile' = typeof ctx === 'object' && ctx?.mode === 'profile' ? 'profile' : 'application';
                const backTo = typeof ctx === 'object' ? ctx?.backTo : undefined;
                return (
                    <EducatorApplicationDetailContainer
                        educatorId={String(educatorId)}
                        navigateTo={navigateTo}
                        mode={mode}
                        backTarget={backTo}
                    />
                );
            }
            case 'rejectedEducators': {
                // const RejectedEducatorsContainer = require('./views/RejectedEducatorsContainer').default;
                return <RejectedEducatorsContainer navigateTo={navigateTo} />;
            }
            case 'users': return <UserDetailView {...adminProps} />;
            case 'createUser': return <CreateUserContainer navigateTo={navigateTo} />;
            case 'userDetail': return <UserProfileView {...adminProps} userId={viewContext} />;
      case 'editUser': return <EditUserContainer navigateTo={navigateTo} userId={viewContext} />;
            case 'finance': return <FinanceView {...adminProps} invoices={data.invoices} projects={data.projects} users={data.users} />;
            case 'invoiceDetail': return <InvoiceDetailView {...adminProps} invoice={data.invoices.find(i => i.id === viewContext)!} project={data.projects.find(p => p.id === data.invoices.find(i => i.id === viewContext)!.projectId)!} requester={data.users.find(u => u.id === data.invoices.find(i => i.id === viewContext)!.requesterId)!} onUpdateStatus={data.handleUpdateInvoiceStatus} />;
            case 'reports': return <ReportsView {...adminProps} projects={data.projects} educators={data.educators} invoices={data.invoices} />;
            case 'calendar': return <CalendarView {...adminProps} projects={data.projects} />;
            case 'settings': return <AdminSettingsView />;
            case 'specializations': return <SpecializationsView />;
            case 'skills': return <SkillsView />;
            case 'services': return <ServicesView />;
            case 'support': return <SupportTicketsView tickets={data.supportTickets} educators={data.educators} onAddReply={(ticketId, replyData) => data.handleAddSupportTicketReply(ticketId, replyData, ADMIN_USER, 'admin')} onUpdateStatus={data.handleUpdateSupportTicketStatus} />;
            case 'taskDetail':
                return <TaskDetailContainer {...adminProps} projectId={viewContext.projectId} taskId={viewContext.taskId} />;
            case 'bidDetail':
                return <BidDetailContainer {...adminProps} bidId={viewContext} />;
            default: return <div>{t('common.viewNotFound')}</div>;
        }
    }

    return (
        <AdminLayout
            currentView={currentView}
            navigateTo={navigateTo}
            onLogout={onLogout}
            isInviteModalOpen={isInviteModalOpen}
            setInviteModalOpen={setInviteModalOpen}
        >
            {renderView()}
        </AdminLayout>
    );
};

export default AdminApp;
