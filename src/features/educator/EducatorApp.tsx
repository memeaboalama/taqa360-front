import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    EducatorViewType, Project, Educator, AssignmentStatus, Task, ProjectStatus,
    AssignmentType, AdminMessage, EducatorStatus, Bid, ToastNotification,
    Transaction, WithdrawalRequest, InboxMessage, SupportTicket, Attachment
} from '../../shared/types';
import EducatorSidebar from './components/EducatorSidebar';
import MobileHeader from './components/MobileHeader';
import ToastContainer from '../../shared/components/Toast';
import DashboardView from './views/DashboardView';
import OpportunitiesView from './views/OpportunitiesView';
import OpportunityDetailView from './views/OpportunityDetailView';
import OpportunityTaskDetailView from './views/OpportunityTaskDetailView';
import CreateBidView from './views/CreateBidView';
import { BidDetailView } from './views/BidDetailView';
import TaskDetailView from './views/TaskDetailView';
import { ProposalsView } from './views/ProposalsView';
import EarningsView from './views/EarningsView';
import InboxView from './views/InboxView';
import SupportView from './views/SupportView';
import ProfileView from './views/ProfileView';
import SettingsView from './views/SettingsView';
import TasksView from './views/TasksView';
import AssignmentsView from './views/AssignmentsView';
import AssignmentDetailView from './views/AssignmentDetailView';
import TaskDetailContainer from './views/TaskDetailContainer';
import { DashboardIcon, BriefcaseIcon, ProjectsIcon, FileTextIcon, MenuAlt4Icon } from '../../shared/components/Icons';
import EducatorMobileMenu from './components/EducatorMobileMenu';
import { useLanguage } from '../../app/providers/LanguageProvider';
import { useOpportunities, useProject, useOpportunityProject } from '../projects/hooks/useProjectQueries';
import { useCreateBid as useCreateBidMutation, useEducatorBids as useEducatorBidsQuery, useEducatorBidDetail, useUpdateBid as useUpdateBidMutation, useAcceptAssignment, useRejectAssignment, useEducatorProfileData } from '../../core/hooks/useEducatorQueries';
import { useMyProfile } from '../../features/educators/hooks/useEducatorQueries';


interface EducatorAppProps {
    currentView: EducatorViewType;
    viewContext: any;
    navigateTo: (view: EducatorViewType, context?: any) => void;
    currentUser: Educator;
    projects: Project[];
    bids: Bid[];
    withdrawals: WithdrawalRequest[];
    transactions: Transaction[];
    inboxMessages: InboxMessage[];
    supportTickets: SupportTicket[];
    adminMessages: AdminMessage[];
    managedSkills: string[];
    managedMajors: string[];
    handleUpdateEducatorProfile: (updatedProfile: Educator) => void;
    handleCreateBid: (bidData: Omit<Bid, 'id' | 'educatorId' | 'createdAt'>) => void;
    handleUpdateBid: (bidId: string, bidData: Omit<Bid, 'id' | 'educatorId' | 'createdAt'>) => void;
    handleAcceptInvitation: (projectId: string, taskId: string) => void;
    handleDeclineInvitation: (projectId: string, taskId: string) => void;
    handleUpdateTask: (projectId: string, taskId: string, taskData: Partial<Task>) => void;
    handleAddDeliverable: (projectId: string, taskId: string, deliverable: any) => void;
    handleEditDeliverable: (projectId: string, taskId: string, deliverableId: string, newTitle: string) => void;
    handleDeleteDeliverable: (projectId: string, taskId: string, deliverableId: string) => void;
    handleAddSubTask: (projectId: string, taskId: string, title: string) => void;
    handleEditSubTask: (projectId: string, taskId: string, subTaskId: string, newTitle: string) => void;
    handleToggleSubTask: (projectId: string, taskId: string, subTaskId: string) => void;
    handleAddSubTaskAttachment: (projectId: string, taskId: string, subTaskId: string, attachment: any) => void;
    handleEditSubTaskAttachment: (projectId: string, taskId: string, subTaskId: string, attachmentId: string, newTitle: string) => void;
    handleDeleteSubTaskAttachment: (projectId: string, taskId: string, subTaskId: string, attachmentId: string) => void;
    handleAddNote: (projectId: string, taskId: string, content: string) => void;
    handleCreateSupportTicket: (ticketData: { category: string; subject: string; message: string; attachments: Omit<Attachment, 'id'>[] }) => void;
    handleAddSupportTicketReply: (ticketId: string, replyData: { content: string, attachments: Omit<Attachment, 'id'>[] }) => void;
    handleLogout: () => void;
    isMobile: boolean;
// FIX: Added addToast to props interface.
    addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    toasts: ToastNotification[];
}


const EducatorBottomNavBar: React.FC<{ currentView: EducatorViewType, navigateTo: (view: EducatorViewType) => void, onMenuClick: () => void }> = ({ currentView, navigateTo, onMenuClick }) => {
    const { t } = useLanguage();
    const NavButton: React.FC<{ icon: React.ReactNode, label: string, isActive?: boolean, onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
         <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${isActive ? 'text-brand-primary' : 'text-slate-500 dark:text-slate-400'}`}>
            {icon}
            <span className="text-[10px] font-semibold">{label}</span>
        </button>
    );

    return (
        <footer 
            className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-top z-40"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
           <div className="grid grid-cols-5 h-full max-w-lg mx-auto">
               <NavButton icon={<DashboardIcon className="w-6 h-6"/>} label={t('dashboard')} isActive={currentView === 'dashboard'} onClick={() => navigateTo('dashboard')}/>
               <NavButton icon={<BriefcaseIcon className="w-6 h-6"/>} label={t('opportunities')} isActive={['opportunities', 'opportunityDetail', 'createBid'].includes(currentView)} onClick={() => navigateTo('opportunities')}/>
               <NavButton icon={<ProjectsIcon className="w-6 h-6"/>} label={t('tasks')} isActive={['tasks', 'taskDetail'].includes(currentView)} onClick={() => navigateTo('tasks')}/>
               <NavButton icon={<FileTextIcon className="w-6 h-6"/>} label={t('proposals')} isActive={['proposals', 'bidDetail'].includes(currentView)} onClick={() => navigateTo('proposals')}/>
               <NavButton icon={<MenuAlt4Icon className="w-6 h-6"/>} label={t('menu')} onClick={onMenuClick} />
           </div>
        </footer>
    );
};

export const EducatorApp: React.FC<EducatorAppProps> = (props) => {
  const { currentView, viewContext, navigateTo, currentUser, projects, bids, isMobile, toasts, ...handlers } = props;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, t } = useLanguage();

  // Mutations used across views (must be called at top-level to comply with React hooks rules)
  const { mutate: acceptAssign } = useAcceptAssignment();
  const { mutate: rejectAssign } = useRejectAssignment();

  // Preload educator profile and related lists to make profile view instant and complete
  const myProfileQuery = useMyProfile();
  const educatorProfileData = useEducatorProfileData();

  // Opportunities/project queries
  const projectId = viewContext?.projectId;
  // projectQuery is only consulted when no projectId is present (enabled: !!id keeps it idle).
  const projectQuery = useProject('');
  const opportunityProjectQuery = useOpportunityProject(projectId || '');
  const activeProjectQuery = projectId ? opportunityProjectQuery : projectQuery;
  const opportunitiesQuery = useOpportunities({ paginated: true, per_page: 12, page: 1 });

  // Create bid mutation (educator-level)
  const createBidMutation = useCreateBidMutation();


  const isApproved = useMemo(() => {
      const status = String(currentUser.status || '').toUpperCase();
      return status === String(EducatorStatus.ACTIVE).toUpperCase();
  }, [currentUser.status]);
  const bidId = currentView === 'bidDetail' ? (viewContext?.bidId as string) : '';
  const bidDetailQuery = useEducatorBidDetail(bidId);
  const oppBidId = currentView === 'opportunityDetail' ? (viewContext?.bidId as string) : '';
  const oppBidDetailQuery = useEducatorBidDetail(oppBidId);
  const createOrEditBidId = currentView === 'createBid' ? (viewContext?.bidId as string) : '';
  const createOrEditBidQuery = useEducatorBidDetail(createOrEditBidId);
  const updateBidMutation = useUpdateBidMutation();

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        {
          const onAcceptInvitation = (projectId: string, taskId: string) => {
            const proj = projects.find(p => p.id === projectId);
            const task = proj?.tasks.find(t => t.id === taskId);
            const assignment = task?.assignments.find(a => a.educatorId === currentUser.id);
            if (assignment?.id) acceptAssign({ assignmentId: assignment.id });
          };
          const onDeclineInvitation = (projectId: string, taskId: string) => {
            const proj = projects.find(p => p.id === projectId);
            const task = proj?.tasks.find(t => t.id === taskId);
            const assignment = task?.assignments.find(a => a.educatorId === currentUser.id);
            if (assignment?.id) rejectAssign({ assignmentId: assignment.id });
          };

          return <DashboardView navigateTo={navigateTo} projects={projects} educator={currentUser} adminMessages={props.adminMessages} onAcceptInvitation={onAcceptInvitation} onDeclineInvitation={onDeclineInvitation} isApproved={isApproved} bids={bids} />;
        }
      case 'opportunities':
        return <OpportunitiesView navigateTo={navigateTo} />;
      case 'opportunityDetail':
        {
          const oppBidId = currentView === 'opportunityDetail' ? (viewContext?.bidId as string) : '';
          if (oppBidId) {
            if (oppBidDetailQuery.isLoading) return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
              <div className="inline-block animate-spin rounded-full h-12 w-12 mb-4" style={{ borderBottom: '3px solid var(--primary-color)' }}></div>
              <span className="text-base font-medium text-slate-600 dark:text-slate-400">جارِ التحميل...</span>
            </div>
          );
            if (oppBidDetailQuery.error) return <div className="py-20 text-center text-red-500">فشل في تحميل تفاصيل المشروع</div>;
            const oppBidResp = oppBidDetailQuery.data as any;
            const bidPayload = oppBidResp?.bid || oppBidResp || null;
            if (!bidPayload?.project) return <div>{t('common.projectNotFound')}</div>;
            const norm = (v: any, fallback: string) => (typeof v === 'string' && v) ? v.trim().toUpperCase().replace(/[-\s]+/g, '_') : fallback;
            const proj: Project = {
              id: bidPayload.project.id,
              title: bidPayload.project.title,
              description: bidPayload.project.description,
              status: norm(bidPayload.project.status, 'PENDING') as any,
              tags: bidPayload.project.tags || [],
              budget: bidPayload.project.budget ?? null,
              isPublished: !!bidPayload.project.isPublished,
              tasks: (bidPayload.project.tasks || []).map((t: any) => ({
                id: t.id,
                projectId: bidPayload.project.id,
                title: t.title,
                description: t.description,
                status: norm(t.status, 'PENDING') as any,
                assignments: t.assignments || [],
                budget: t.budget ?? null,
                deadline: t.deadline || '',
                isPublic: !!t.isPublic,
                biddingStatus: norm(t.biddingStatus, 'OPEN'),
                subTasks: [],
                attachments: [],
                deliverables: [],
                notes: [],
                creationDate: t.creationDate || '',
                modifiedAt: undefined,
                activityLog: []
              })),
              creationType: norm(bidPayload.project.creationType, 'PUBLIC') as any,
              createdBy: bidPayload.project.createdBy?.name || '',
              createdAt: bidPayload.project.createdAt,
              updatedAt: bidPayload.project.updatedAt,
              activityLog: [],
              endDate: bidPayload.project.deadline || null
            } as any;
            return <OpportunityDetailView project={proj} navigateTo={navigateTo} isApproved={isApproved} />;
          }
          if (activeProjectQuery.isLoading) return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
              <div className="inline-block animate-spin rounded-full h-12 w-12 mb-4" style={{ borderBottom: '3px solid var(--primary-color)' }}></div>
              <span className="text-base font-medium text-slate-600 dark:text-slate-400">جارِ التحميل...</span>
            </div>
          );
          if (activeProjectQuery.error) return <div className="py-20 text-center text-red-500">فشل في تحميل تفاصيل المشروع</div>;
          if (!activeProjectQuery.data) return <div>{t('common.taskNotFound')}</div>;
          return <OpportunityDetailView project={activeProjectQuery.data as any} navigateTo={navigateTo} isApproved={isApproved} />;
        }
      case 'opportunityTaskDetail':
         const projectForTask = activeProjectQuery.data || projects.find(p => p.id === viewContext.projectId);
         const taskForDetail = projectForTask?.tasks.find(t => t.id === viewContext.taskId);
         return projectForTask && taskForDetail ? <OpportunityTaskDetailView project={projectForTask} task={taskForDetail} navigateTo={navigateTo} isApproved={isApproved} /> : <div>{t('common.taskNotFound')}</div>;
      case 'createBid':
         if (activeProjectQuery.isLoading) return (
           <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
             <div className="inline-block animate-spin rounded-full h-12 w-12 mb-4" style={{ borderBottom: '3px solid var(--primary-color)' }}></div>
             <span className="text-base font-medium text-slate-600 dark:text-slate-400">{t('loading')}</span>
           </div>
         );
         if (activeProjectQuery.error) return <div className="py-20 text-center text-red-500">فشل في تحميل بيانات المشروع</div>;
         if (!activeProjectQuery.data) return <div>{t('common.bidNotFound')}</div>;

         const handleCreateBid = async (bidData: any) => {
            try {
               const resp = await createBidMutation.mutateAsync(bidData);
               props.addToast && props.addToast(t('toasts.bidSubmitted'));
               navigateTo('proposals');
            } catch (e: any) {
               const rawErrors = e?.errors && typeof e.errors === 'object' ? Object.values(e.errors) : (e?.data && typeof e.data === 'object' ? Object.values(e.data) : []);
               const flatErrors = Array.isArray(rawErrors) ? rawErrors.flat().filter(Boolean) : [];
               const message = flatErrors.length ? flatErrors.slice(0, 3).join(' | ') : (e?.message || t('toasts.couldNotCreateBid') || 'فشل تقديم العرض');
               props.addToast && props.addToast(String(message), 'error');
            }
         };

         const onUpdateBid = async (bidIdToUpdate: string, bidData: any) => {
            try {
               const resp = await updateBidMutation.mutateAsync({ id: bidIdToUpdate, data: bidData });
               props.addToast && props.addToast(t('toasts.bidUpdated') || 'تم تحديث العرض');
               navigateTo('proposals');
            } catch (e: any) {
               const rawErrors = e?.errors && typeof e.errors === 'object' ? Object.values(e.errors) : (e?.data && typeof e.data === 'object' ? Object.values(e.data) : []);
               const flatErrors = Array.isArray(rawErrors) ? rawErrors.flat().filter(Boolean) : [];
               const message = flatErrors.length ? flatErrors.slice(0, 3).join(' | ') : (e?.message || t('toasts.couldNotUpdateBid') || 'فشل تحديث العرض');
               props.addToast && props.addToast(String(message), 'error');
            }
         };

         if (createOrEditBidId) {
           if (createOrEditBidQuery.isLoading) return (
             <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
               <div className="inline-block animate-spin rounded-full h-12 w-12 mb-4" style={{ borderBottom: '3px solid var(--primary-color)' }}></div>
               <span className="text-base font-medium text-slate-600 dark:text-slate-400">{t('loading')}</span>
             </div>
           );
           if (createOrEditBidQuery.error) return <div className="py-20 text-center text-red-500">فشل في تحميل بيانات العرض</div>;
           const bidResp = createOrEditBidQuery.data as any;
           const bidData = bidResp?.bid || bidResp || null;
           if (!bidData) return <div>{t('common.bidNotFound')}</div>;

           const norm = (v: any, fallback: string) => (typeof v === 'string' && v)
             ? v.trim().toUpperCase().replace(/[-\s]+/g, '_')
             : fallback;

           const mappedBid: Bid = {
             id: bidData.id,
             projectId: bidData.projectId,
             educatorId: bidData.educatorId,
             bidTasks: (bidData.bidTasks || []).map((bt: any) => ({ taskId: bt.taskId, status: norm(bt.status, 'PENDING') as any, amount: bt.amount })),
             deliveryDays: bidData.deliveryDays,
             proposal: bidData.proposal || '',
             createdAt: bidData.createdAt,
             attachments: (bidData.attachments || []).map((a: any) => ({ id: a.id, title: a.name, name: a.original_name || a.name, url: a.url, size: String(a.size), type: a.type })),
             links: Array.isArray(bidData.links) ? (bidData.links.flat?.() || bidData.links).map((l: any, i: number) => ({ id: l.id || String(i), title: l.title, url: l.url })) : []
           };

           return <CreateBidView project={activeProjectQuery.data as any} existingBid={mappedBid} onCreateBid={handleCreateBid} onUpdateBid={onUpdateBid} navigateTo={navigateTo} isApproved={isApproved} preselectTaskId={viewContext?.taskId} />;
         }

         return <CreateBidView project={activeProjectQuery.data as any} onCreateBid={handleCreateBid} onUpdateBid={onUpdateBid} navigateTo={navigateTo} isApproved={isApproved} preselectTaskId={viewContext?.taskId} />;
      case 'editBid':
         const bidToEdit = bids.find(b => b.id === viewContext.bidId);
         const projectForEdit = bidToEdit ? projects.find(p => p.id === bidToEdit.projectId) : null;
         return bidToEdit && projectForEdit ? <CreateBidView project={projectForEdit} existingBid={bidToEdit} onCreateBid={props.handleCreateBid} onUpdateBid={props.handleUpdateBid} navigateTo={navigateTo} isApproved={isApproved} /> : <div>{t('common.bidNotFound')}</div>;
      case 'my-projects':
        return <TasksView navigateTo={navigateTo as any} />;
      case 'tasks':
        return <TasksView navigateTo={navigateTo as any} />;
      case 'assignments':
        return (
          <AssignmentsView
            navigateTo={navigateTo as any}
            addToast={props.addToast}
          />
        );
      case 'proposals':
        return <ProposalsView navigateTo={navigateTo} projects={projects} />;
      case 'bidDetail':
         if (bidDetailQuery.isLoading) return (
           <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
             <div className="inline-block animate-spin rounded-full h-12 w-12 mb-4" style={{ borderBottom: '3px solid var(--primary-color)' }}></div>
             <span className="text-base font-medium text-slate-600 dark:text-slate-400">{t('loading')}</span>
           </div>
         );
         if (bidDetailQuery.error) return <div className="py-20 text-center text-red-500">فشل في تحميل تفاصيل العرض</div>;
         const bidResp = (bidDetailQuery.data as any);
         const bidData = bidResp?.bid || bidResp || null;
         if (!bidData) return <div>{t('common.bidNotFound')}</div>;

         const norm = (v: any, fallback: string) => (typeof v === 'string' && v)
           ? v.trim().toUpperCase().replace(/[-\s]+/g, '_')
           : fallback;

         // Map to local types expected by view
         const mappedBid: Bid = {
           id: bidData.id,
           projectId: bidData.projectId,
           educatorId: bidData.educatorId,
           bidTasks: (bidData.bidTasks || []).map((bt: any) => ({ taskId: bt.taskId, status: norm(bt.status, 'PENDING'), amount: bt.amount })),
           deliveryDays: bidData.deliveryDays,
           proposal: bidData.proposal || '',
           createdAt: bidData.createdAt,
           attachments: (bidData.attachments || []).map((a: any) => ({ id: a.id, title: a.name, name: a.original_name || a.name, url: a.url, size: String(a.size), type: a.type })),
           links: Array.isArray(bidData.links) ? (bidData.links.flat?.() || bidData.links).map((l: any, i: number) => ({ id: l.id || String(i), title: l.title, url: l.url })) : []
         };
         const mappedProject: Project | undefined = bidData.project ? {
           id: bidData.project.id,
           title: bidData.project.title,
           description: bidData.project.description,
           status: norm(bidData.project.status, 'PENDING'),
           tags: bidData.project.tags || [],
           budget: bidData.project.budget ?? null,
           isPublished: !!bidData.project.isPublished,
           tasks: (bidData.project.tasks || []).map((t: any) => ({
             id: t.id,
             title: t.title,
             description: t.description,
             status: norm(t.status, 'PENDING'),
             assignments: t.assignments || [],
             budget: t.budget ?? null,
             deadline: t.deadline || '',
             isPublic: !!t.isPublic,
             biddingStatus: norm(t.biddingStatus, 'OPEN'),
             subTasks: [],
             attachments: [],
             deliverables: [],
             notes: [],
             creationDate: t.creationDate || '',
             activityLog: [],
             modifiedAt: undefined
           })),
           creationType: norm(bidData.project.creationType, 'PUBLIC'),
           createdBy: bidData.project.createdBy?.name || '',
           createdAt: bidData.project.createdAt,
           deadline: bidData.project.deadline || null,
           educationalRequestId: bidData.project.educationalRequestId || null,
           activityLog: [],
           requesterName: bidData.project.requesterName
         } : projects.find(p => p.id === mappedBid.projectId);
         if (!mappedProject) return <div>{t('common.projectNotFound')}</div>;
         return <BidDetailView bid={mappedBid} project={mappedProject} educator={currentUser} navigateTo={navigateTo} />;
      case 'assignmentDetail':
          return <AssignmentDetailView assignment={viewContext?.assignment} navigateTo={navigateTo} addToast={props.addToast} />;
      case 'taskDetail':
          if (viewContext?.taskId && !viewContext?.projectId) {
            return <TaskDetailContainer taskId={viewContext.taskId} educator={currentUser} navigateTo={navigateTo} />;
          }
          const project = projects.find(p => p.id === viewContext.projectId);
          const task = project?.tasks.find(t => t.id === viewContext.taskId);
          return project && task ? <TaskDetailView project={project} task={task} educator={currentUser} navigateTo={navigateTo} onAddSubTask={(p, t, title) => props.handleAddSubTask(p, t, title)} onToggleSubTask={props.handleToggleSubTask} onAddNote={(p, t, c) => props.handleAddNote(p,t,c)} onUpdateTaskStatus={()=>{}} onUpdateTask={props.handleUpdateTask} onAddDeliverable={props.handleAddDeliverable} onEditDeliverable={props.handleEditDeliverable} onDeleteDeliverable={props.handleDeleteDeliverable} onAddSubTaskAttachment={props.handleAddSubTaskAttachment} onEditSubTask={props.handleEditSubTask} /> : <div>{t('common.taskNotFound')}</div>;
      case 'earnings':
// FIX: Use `props.addToast` instead of `handlers.addToast`
        return <EarningsView transactions={props.transactions} withdrawals={props.withdrawals} onRequestWithdrawal={(amount) => props.addToast(t('toasts.withdrawalRequestSent'))} />;
      case 'inbox':
        return <InboxView messages={props.inboxMessages} />;
      case 'support':
        return <SupportView tickets={props.supportTickets} currentUser={currentUser} onCreateTicket={props.handleCreateSupportTicket} onAddReply={props.handleAddSupportTicketReply} />;
      case 'profile':
        if (educatorProfileData.profile.isLoading) {
          return (
            <div className="col-span-full text-center py-12">
              <div className="inline-block animate-spin rounded-full h-6 w-6" style={{ borderBottom: '2px solid var(--primary-color)' }}></div>
              <span className="ms-2 text-sm text-slate-600 dark:text-slate-400">{t('loading')}</span>
            </div>
          );
        }
        const profileUser = (educatorProfileData.profile.data as any) || (myProfileQuery.data as any) || currentUser || ({} as any);
        const ensuredUser = {
          ...profileUser,
          // Ensure nested profile object exists with sensible fallbacks without dropping server fields
          profile: {
            ...profileUser.profile,
            profileCompletion: profileUser.profile?.profileCompletion ?? 0,
            experienceLevel: profileUser.profile?.experienceLevel ?? profileUser.profile?.experience_level ?? profileUser.experienceLevel ?? 'INTERMEDIATE',
            educationLevel: profileUser.profile?.educationLevel ?? profileUser.educationLevel ?? null,
            gender: profileUser.profile?.gender ?? null,
            birthDate: profileUser.profile?.birthDate ?? null,
            nationality: profileUser.profile?.nationality ?? profileUser.nationality ?? null,
            idType: profileUser.profile?.idType ?? null,
            idNumber: profileUser.profile?.idNumber ?? '',
            idDocumentUrl: profileUser.profile?.idDocumentUrl ?? undefined,
            idDocumentBackUrl: profileUser.profile?.idDocumentBackUrl ?? undefined,
            identityStatus: profileUser.profile?.identityStatus ?? profileUser.profile?.verificationStatus ?? 'PENDING'
          },
          // Merge lists from dedicated endpoints if available
          academicMajors: Array.isArray(educatorProfileData.academicMajors.data) ? educatorProfileData.academicMajors.data : (Array.isArray(profileUser.academicMajors) ? profileUser.academicMajors : []),
          workExperience: Array.isArray(educatorProfileData.workExperience.data) ? educatorProfileData.workExperience.data : (Array.isArray(profileUser.workExperience) ? profileUser.workExperience : []),
          certifications: Array.isArray(educatorProfileData.certifications.data) ? educatorProfileData.certifications.data : (Array.isArray(profileUser.certifications) ? profileUser.certifications : []),
          services: Array.isArray(educatorProfileData.services.data) ? educatorProfileData.services.data : (Array.isArray(profileUser.services) ? profileUser.services : []),
          skills: Array.isArray(educatorProfileData.skills.data) ? educatorProfileData.skills.data : (Array.isArray(profileUser.skills) ? profileUser.skills : []),
          languages: Array.isArray(educatorProfileData.languages.data) ? educatorProfileData.languages.data : (Array.isArray(profileUser.languages) ? profileUser.languages : []),
          socialLinks: Array.isArray(educatorProfileData.socialLinks.data) ? educatorProfileData.socialLinks.data : (Array.isArray(profileUser.socialLinks) ? profileUser.socialLinks : []),
          paymentInfo: { ...(profileUser.paymentInfo || {}), ...(educatorProfileData.paymentInfo.data || {}) },
          achievements: Array.isArray(profileUser.achievements) ? profileUser.achievements : [],
        } as any;
        return <ProfileView educator={ensuredUser} onUpdateProfile={props.handleUpdateEducatorProfile} predefinedSkills={props.managedSkills} predefinedMajors={props.managedMajors} />;
      case 'settings':
        return <SettingsView />;
      default:
        return <div>{t('common.viewNotFound')}</div>;
    }
  };

  return (
    <div className="bg-brand-light dark:bg-slate-950 min-h-screen font-sans">
      <ToastContainer notifications={toasts} />
      <div className={`flex transition-all duration-300 ${isMobile ? 'flex-col' : ''}`}>
        {!isMobile && <EducatorSidebar currentView={currentView} navigateTo={navigateTo} educator={currentUser} onLogout={props.handleLogout} />}
        {isMobile && (
          <MobileHeader
            onNotificationsClick={() => {
              navigateTo('dashboard');
              window.setTimeout(() => {
                document.getElementById('db-notifications')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 120);
            }}
          />
        )}
        
        <div className={`flex-grow transition-all duration-300 ${!isMobile ? (language === 'ar' ? 'lg:pr-64' : 'lg:pl-64') : ''}`}>
          <main className={isMobile ? 'p-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))]' : 'p-4 sm:p-6 lg:p-8'}>
            {renderView()}
          </main>
        </div>
        
        {isMobile && (
          <>
            <EducatorBottomNavBar currentView={currentView} navigateTo={navigateTo} onMenuClick={() => setIsMobileMenuOpen(true)} />
            <EducatorMobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                navigateTo={navigateTo}
                currentUser={currentUser}
                onLogout={props.handleLogout}
            />
          </>
        )}
      </div>
    </div>
  );
};
