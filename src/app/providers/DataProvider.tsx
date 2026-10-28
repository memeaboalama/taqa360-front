import React, { createContext, useContext, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKeyFactory } from '../../core/hooks/useBaseQuery';
import { 
    Project, Bid, Educator, AppNotification, ToastNotification, User, 
    EducationalRequest, EducatorApplication, Invoice, AdminActivity, AdminMessage, 
    ManagedItem, SupportTicket, SupportTicketMessage, UserStatus, InvoiceStatus, 
    ProjectStatus, Attachment, SubTask, Task, TaskNote, BidStatus, EducatorViewType, Assignment, AssignmentType, AssignmentStatus, EducationalRequestStatus, PaymentStatus, FulfillmentStatus, RequestActivityLog, SupportTicketStatus, ProjectActivityLog
} from '../../shared/types';
import { 
    PROJECTS, BIDS, EDUCATORS, NOTIFICATIONS, WITHDRAWAL_REQUESTS, 
    TRANSACTIONS, INBOX_MESSAGES, SUPPORT_TICKETS, PREDEFINED_SKILLS, 
    ADMIN_USER, USERS, EDUCATIONAL_REQUESTS, EDUCATOR_APPLICATIONS, INVOICES, 
    ADMIN_ACTIVITY_FEED, ADMIN_MESSAGES_FOR_EDUCATOR, PREDEFINED_MAJORS, PREDEFINED_SERVICES 
} from '../../shared/constants';
import { useAuth } from './AuthProvider';
import { useLanguage } from './LanguageProvider';

type ManagedItemType = 'majors' | 'skills' | 'services';

interface DataContextType {
    projects: Project[];
    bids: Bid[];
    educators: Educator[];
    notifications: AppNotification[];
    withdrawals: any[];
    transactions: any[];
    inboxMessages: any[];
    supportTickets: SupportTicket[];
    toasts: ToastNotification[];
    users: User[];
    educationalRequests: EducationalRequest[];
    educatorApplications: EducatorApplication[];
    invoices: Invoice[];
    activityFeed: AdminActivity[];
    adminMessages: AdminMessage[];
    managedMajors: ManagedItem[];
    managedServices: ManagedItem[];
    managedSkills: ManagedItem[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    setBids: React.Dispatch<React.SetStateAction<Bid[]>>;
    setEducators: React.Dispatch<React.SetStateAction<Educator[]>>;
    setSupportTickets: React.Dispatch<React.SetStateAction<SupportTicket[]>>;
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
    setManagedMajors: React.Dispatch<React.SetStateAction<ManagedItem[]>>;
    setManagedSkills: React.Dispatch<React.SetStateAction<ManagedItem[]>>;
    setManagedServices: React.Dispatch<React.SetStateAction<ManagedItem[]>>;
    addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    handleDeleteProject: (projectId: string, reason: string) => void;
    handleToggleProjectPublication: (projectId: string, reason?: string) => void;
    handleUpdateInvoiceStatus: (invoiceId: string, newStatus: InvoiceStatus) => void;
    handleCreateSupportTicket: (ticketData: { category: string; subject: string; message: string; attachments: Omit<Attachment, 'id'>[] }, currentUser: Educator) => void;
    handleAddSupportTicketReply: (ticketId: string, replyData: { content: string, attachments: Omit<Attachment, 'id'>[] }, currentUser: any, userRole: 'educator' | 'admin') => void;
    handleUpdateSupportTicketStatus: (ticketId: string, newStatus: SupportTicketStatus) => void;
    handleUpdateEducatorProfile: (updatedProfile: Educator, options?: { showToast?: boolean }) => void;
    handleCreateBid: (bidData: Omit<Bid, 'id' | 'educatorId' | 'createdAt'>, currentUser: Educator, navigateTo: (view: EducatorViewType, ctx?: any) => void) => void;
    handleUpdateBid: (bidId: string, updatedBidData: Omit<Bid, 'id' | 'educatorId' | 'createdAt'>, navigateTo: (view: EducatorViewType, ctx?: any) => void) => void;
    handleAcceptInvitation: (projectId: string, taskId: string) => void;
    handleDeclineInvitation: (projectId: string, taskId: string) => void;
    handleUpdateTask: (projectId: string, taskId: string, taskData: Partial<Task>) => void;
    handleAddDeliverable: (projectId: string, taskId: string, deliverable: Omit<Attachment, 'id'>) => void;
    handleEditDeliverable: (projectId: string, taskId: string, deliverableId: string, newTitle: string) => void;
    handleDeleteDeliverable: (projectId: string, taskId: string, deliverableId: string) => void;
    handleAddSubTask: (projectId: string, taskId: string, title: string, currentUser: Educator | typeof ADMIN_USER) => void;
    handleEditSubTask: (projectId: string, taskId: string, subTaskId: string, newTitle: string) => void;
    handleToggleSubTask: (projectId: string, taskId: string, subTaskId: string) => void;
    handleAddSubTaskAttachment: (projectId: string, taskId: string, subTaskId: string, attachment: Omit<Attachment, 'id'>) => void;
    handleEditSubTaskAttachment: (projectId: string, taskId: string, subTaskId: string, attachmentId: string, newTitle: string) => void;
    handleDeleteSubTaskAttachment: (projectId: string, taskId: string, subTaskId: string, attachmentId: string) => void;
    handleAddNote: (projectId: string, taskId: string, content: string, currentUser: Educator | typeof ADMIN_USER) => void;
    handleUpdateUserStatus: (userId: string, newStatus: UserStatus, reason: string) => void;
    handleDeleteUser: (userId: string, reason: string) => void;
    handleAddProject: (projectData: any, navigateTo: (view: any, ctx?: any) => void) => void;
    handleUpdateProjectDetails: (projectId: string, details: Partial<Project>) => void;
    handleAddTask: (projectId: string, taskData: Omit<Task, 'id' | 'status' | 'assignments' | 'biddingStatus' | 'subTasks' | 'notes' | 'attachments' | 'activityLog' | 'creationDate' | 'deliverables'>) => void;
    handleDeleteTask: (projectId: string, taskId: string, reason: string) => void;
    handleAssignProvider: (projectId: string, taskId: string, newAssignments: Omit<Assignment, 'id'>[]) => void;
    handleUpdateBidTaskStatus: (bidId: string, taskId: string, newStatus: BidStatus, details: any) => void;
    handleUpdateTaskBiddingStatus: (projectId: string, taskId: string) => void;
    handleUpdateProjectStatus: (projectId: string, newStatus: ProjectStatus, reason: string) => void;
    handleUpdateTaskStatus: (projectId: string, taskId: string, newStatus: ProjectStatus, reason: string) => void;
    handleUpdateRequestStatus: (requestId: string, newStatus: EducationalRequestStatus, reason?: string) => void;
    handleUpdatePaymentStatus: (requestId: string, newStatus: PaymentStatus, reason?: string) => void;
    handleUpdateFulfillmentStatus: (requestId: string, newStatus: FulfillmentStatus, reason?: string) => void;
    handleUpdateRequest: (requestId: string, details: Partial<EducationalRequest>) => void;
    handleAddRequestNote: (requestId: string, content: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { setCurrentUser, currentUser } = useAuth();
    const { t } = useLanguage();
    const [projects, setProjects] = useState<Project[]>(PROJECTS);
    const [bids, setBids] = useState<Bid[]>(BIDS);
    const [educators, setEducators] = useState<Educator[]>(EDUCATORS);
    const [notifications, setNotifications] = useState<AppNotification[]>(NOTIFICATIONS);
    const [withdrawals, setWithdrawals] = useState<any[]>(WITHDRAWAL_REQUESTS);
    const [transactions, setTransactions] = useState<any[]>(TRANSACTIONS);
    const [inboxMessages, setInboxMessages] = useState<any[]>(INBOX_MESSAGES);
    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(SUPPORT_TICKETS);
    const [toasts, setToasts] = useState<ToastNotification[]>([]);
    const [users, setUsers] = useState<User[]>(USERS);
    const [educationalRequests, setEducationalRequests] = useState<EducationalRequest[]>(EDUCATIONAL_REQUESTS);
    const [educatorApplications, setEducatorApplications] = useState<EducatorApplication[]>(EDUCATOR_APPLICATIONS);
    const [invoices, setInvoices] = useState<Invoice[]>(INVOICES);
    const [activityFeed, setActivityFeed] = useState<AdminActivity[]>(ADMIN_ACTIVITY_FEED);
    const [adminMessages, setAdminMessages] = useState<AdminMessage[]>(ADMIN_MESSAGES_FOR_EDUCATOR);
    const [managedMajors, setManagedMajors] = useState<ManagedItem[]>(() => PREDEFINED_MAJORS.map((m, i) => ({ id: `maj-const-${i}`, name: m, isActive: true })));
    const [managedServices, setManagedServices] = useState<ManagedItem[]>(() => PREDEFINED_SERVICES.map((s, i) => ({ id: `serv-const-${i}`, name: s, isActive: true })));
    const [managedSkills, setManagedSkills] = useState<ManagedItem[]>(() => PREDEFINED_SKILLS.map((s, i) => ({ id: `skill-const-${i}`, name: s, isActive: true })));

    const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    };

    // Sync with React Query cache to ensure global consistency for server-backed entities
    const queryClient = useQueryClient();

    React.useEffect(() => {
        const cache = queryClient.getQueryCache();
        const unsub = cache.subscribe(() => {
            try {
                const all = cache.getAll();
                // Projects
                const projQuery = all.find(q => Array.isArray(q.queryKey) && q.queryKey[0] === 'projects');
                if (projQuery && projQuery.state?.data) {
                    const payload: any = projQuery.state.data as any;
                    const list = payload?.data?.projects || payload?.data || payload || [];
                    if (Array.isArray(list)) setProjects(list as Project[]);
                }
                // Educators
                const eduQuery = all.find(q => Array.isArray(q.queryKey) && q.queryKey[0] === 'educators');
                if (eduQuery && eduQuery.state?.data) {
                    const payload: any = eduQuery.state.data as any;
                    const list = payload?.data?.educators || payload?.data || payload || [];
                    if (Array.isArray(list)) setEducators(list as Educator[]);
                }
                // Educational Requests
                const reqQuery = all.find(q => Array.isArray(q.queryKey) && q.queryKey[0] === 'educational-requests');
                if (reqQuery && reqQuery.state?.data) {
                    const payload: any = reqQuery.state.data as any;
                    const list = payload?.data?.educational_requests || payload?.data?.educationalRequests || payload?.data || payload || [];
                    if (Array.isArray(list)) setEducationalRequests(list as EducationalRequest[]);
                }
            } catch (e) {
                // swallow errors to avoid breaking UI
                // console.warn('DataProvider sync error', e);
            }
        });

        return () => unsub();
    }, [queryClient]);
    
    const handleDeleteProject = (projectId: string, reason: string) => {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      addToast(t('toasts.projectDeleted'), 'info');
    };

    const handleToggleProjectPublication = (projectId: string, reason?: string) => {
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, isPublished: !p.isPublished } : p));
      addToast(t('toasts.projectPublicationUpdated'));
    };
    
    const handleUpdateInvoiceStatus = (invoiceId: string, newStatus: InvoiceStatus) => {
      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: newStatus } : inv));
      addToast(t('toasts.invoiceStatusUpdated'));
    };

    const handleCreateSupportTicket = (ticketData: { category: string; subject: string; message: string; attachments: Omit<Attachment, 'id'>[] }, currentUser: Educator) => {
        const newTicket: SupportTicket = { id: `s-${Date.now()}`, educatorId: currentUser.id, ...ticketData, status: SupportTicketStatus.OPEN, createdAt: new Date().toLocaleDateString('fr-CA'), lastReply: t('now'), messages: [{ sender: 'educator', senderName: currentUser.name, senderAvatar: currentUser.avatarUrl, content: ticketData.message, timestamp: t('now'), attachments: ticketData.attachments.map((att, i) => ({...att, id: `att-${Date.now()}-${i}`})) }]};
        setSupportTickets(prev => [newTicket, ...prev]);
        addToast(t('toasts.supportTicketCreated'));
    };

    const handleAddSupportTicketReply = (ticketId: string, replyData: { content: string, attachments: Omit<Attachment, 'id'>[] }, currentUser: any, userRole: 'educator' | 'admin') => {
        const newReply: SupportTicketMessage = { sender: userRole, senderName: currentUser.name, senderAvatar: currentUser.avatarUrl, content: replyData.content, timestamp: t('now'), attachments: replyData.attachments.map((att, i) => ({...att, id: `att-${Date.now()}-${i}`})) };
        setSupportTickets(prev => prev.map(ticket => ticket.id === ticketId ? { ...ticket, messages: [...ticket.messages, newReply], lastReply: t('now'), status: SupportTicketStatus.OPEN } : ticket));
        addToast(t('toasts.replySent'));
    };

    const handleUpdateSupportTicketStatus = (ticketId: string, newStatus: SupportTicketStatus) => {
        setSupportTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
        addToast(t('toasts.ticketStatusChangedTo', { status: t(`status.${newStatus}`) }));
    };


    const handleUpdateEducatorProfile = (updatedProfile: Educator, options?: { showToast?: boolean }) => {
        setEducators(prev => prev.map(e => e.id === updatedProfile.id ? updatedProfile : e));
        // Preserve AuthUser shape and role; only update educator-related fields
        const mergedUser: any = {
            ...(currentUser || {}),
            id: (currentUser && currentUser.id) ? currentUser.id : String(updatedProfile.id || ''),
            name: updatedProfile.name ?? currentUser?.name,
            email: updatedProfile.email ?? currentUser?.email,
            phone: updatedProfile.phone ?? currentUser?.phone,
            role: currentUser?.role ?? 'educator',
            status: updatedProfile.status ?? currentUser?.status,
            educator: updatedProfile,
        };
        setCurrentUser(mergedUser);
        // Invalidate educator profile cache so all components refetch latest data
        try {
          QueryKeyFactory.invalidateAll(queryClient, 'educator-profile');
        } catch (e) {
          queryClient.invalidateQueries({ queryKey: QueryKeyFactory.all('educator-profile') });
        }
        if (options?.showToast !== false) {
          addToast(t('toasts.changesSaved'));
        }
    };

    const handleCreateBid = (bidData: Omit<Bid, 'id' | 'educatorId' | 'createdAt'>, currentUser: Educator, navigateTo: (view: any, ctx?: any) => void) => {
        const newBid: Bid = { id: `b-${Date.now()}`, educatorId: currentUser.id, createdAt: new Date().toLocaleDateString('fr-CA'), ...bidData };
        setBids(prev => [newBid, ...prev]);
        navigateTo('proposals');
        addToast(t('toasts.bidSubmitted'));
    };

    const handleUpdateBid = (bidId: string, updatedBidData: Omit<Bid, 'id' | 'educatorId' | 'createdAt'>, navigateTo: (view: any, ctx?: any) => void) => {
        setBids(prev => prev.map(b => b.id === bidId ? { ...b, ...updatedBidData } : b));
        navigateTo('proposals');
        addToast(t('toasts.bidUpdated'));
    };

    const handleAcceptInvitation = (projectId: string, taskId: string) => { addToast(t('toasts.invitationAccepted'), 'success'); };
    const handleDeclineInvitation = (projectId: string, taskId: string) => { addToast(t('toasts.invitationDeclined'), 'info'); };
    
    const handleUpdateTask = (projectId: string, taskId: string, taskData: Partial<Task>) => {
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, ...taskData, modifiedAt: new Date().toLocaleDateString('fr-CA') } : t) } : p));
      addToast(t('toasts.taskUpdated'));
    };
  
    const handleAddDeliverable = (projectId: string, taskId: string, deliverable: Omit<Attachment, 'id'>) => {
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, deliverables: [...t.deliverables, { ...deliverable, id: `del-${Date.now()}` }] } : t)} : p));
      addToast(t('toasts.deliverableUploaded'));
    };
  
    const handleEditDeliverable = (projectId: string, taskId: string, deliverableId: string, newTitle: string) => {
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, deliverables: t.deliverables.map(d => d.id === deliverableId ? { ...d, title: newTitle } : d)} : t) } : p));
        addToast(t('toasts.deliverableTitleUpdated'));
    };
  
    const handleDeleteDeliverable = (projectId: string, taskId: string, deliverableId: string) => {
         setProjects(prev => prev.map(p => p.id === projectId ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, deliverables: t.deliverables.filter(d => d.id !== deliverableId)} : t) } : p));
        addToast(t('toasts.deliverableDeleted'), 'info');
    };

    const handleAddSubTask = (projectId: string, taskId: string, title: string, currentUser: Educator | typeof ADMIN_USER) => {
        const newSubTask: SubTask = { id: `st-${Date.now()}`, title, completed: false, createdBy: 'provider', providerId: currentUser?.id, attachments: [], createdAt: new Date().toLocaleDateString('fr-CA'), };
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, subTasks: [...t.subTasks, newSubTask] } : t) } : p));
    };
    
    const handleEditSubTask = (projectId: string, taskId: string, subTaskId: string, newTitle: string) => {
        setProjects(prevProjects => prevProjects.map(p => {
            if (p.id !== projectId) return p;
            return {
                ...p,
                tasks: p.tasks.map(t => {
                    if (t.id !== taskId) return t;
                    return {
                        ...t,
                        subTasks: t.subTasks.map(st => 
                            st.id === subTaskId 
                                ? { ...st, title: newTitle, modifiedAt: new Date().toLocaleDateString('fr-CA') } 
                                : st
                        )
                    };
                })
            };
        }));
        addToast(t('toasts.subtaskUpdated'));
    };

    const handleToggleSubTask = (projectId: string, taskId: string, subTaskId: string) => {
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, subTasks: t.subTasks.map(st => st.id === subTaskId ? { ...st, completed: !st.completed } : st) } : t) } : p));
    };

    const handleAddSubTaskAttachment = (projectId: string, taskId: string, subTaskId: string, attachment: Omit<Attachment, 'id'>) => {
        setProjects(prevProjects => prevProjects.map(p => {
            if (p.id !== projectId) return p;
            return {
                ...p,
                tasks: p.tasks.map(t => {
                    if (t.id !== taskId) return t;
                    return {
                        ...t,
                        subTasks: t.subTasks.map(st => {
                            if (st.id !== subTaskId) return st;
                            return {
                                ...st,
                                attachments: [...(st.attachments || []), { ...attachment, id: `sta-${Date.now()}` }]
                            };
                        })
                    };
                })
            };
        }));
        addToast(t('toasts.attachmentAddedToSubtask'));
    };

    const handleEditSubTaskAttachment = (projectId: string, taskId: string, subTaskId: string, attachmentId: string, newTitle: string) => {
        setProjects(prevProjects => prevProjects.map(p => {
            if (p.id !== projectId) return p;
            return {
                ...p,
                tasks: p.tasks.map(t => {
                    if (t.id !== taskId) return t;
                    return {
                        ...t,
                        subTasks: t.subTasks.map(st => {
                            if (st.id !== subTaskId) return st;
                            return {
                                ...st,
                                attachments: (st.attachments || []).map(att => 
                                    att.id === attachmentId ? { ...att, title: newTitle } : att
                                )
                            };
                        })
                    };
                })
            };
        }));
        addToast(t('toasts.attachmentTitleUpdated'));
    };

    const handleDeleteSubTaskAttachment = (projectId: string, taskId: string, subTaskId: string, attachmentId: string) => {
        setProjects(prevProjects => prevProjects.map(p => {
            if (p.id !== projectId) return p;
            return {
                ...p,
                tasks: p.tasks.map(t => {
                    if (t.id !== taskId) return t;
                    return {
                        ...t,
                        subTasks: t.subTasks.map(st => {
                            if (st.id !== subTaskId) return st;
                            return {
                                ...st,
                                attachments: (st.attachments || []).filter(att => att.id !== attachmentId)
                            };
                        })
                    };
                })
            };
        }));
        addToast(t('toasts.attachmentDeleted'), 'info');
    };
    
    const handleAddNote = (projectId: string, taskId: string, content: string, currentUser: Educator | typeof ADMIN_USER) => {
        const newNote: TaskNote = { id: `tn-${Date.now()}`, content, createdAt: t('now'), createdBy: 'provider', authorName: currentUser.name, authorAvatar: currentUser.avatarUrl };
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, notes: [newNote, ...(t.notes || [])] } : t) } : p));
        addToast(t('toasts.noteAdded'));
    };
    
    const handleUpdateUserStatus = (userId: string, newStatus: UserStatus, reason: string) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        addToast(t('toasts.userStatusUpdatedTo', { status: t(`status.${newStatus}`) }));
    };
    const handleDeleteUser = (userId: string, reason: string) => {
        setUsers(prev => prev.filter(u => u.id !== userId));
        addToast(t('toasts.userDeleted'), 'info');
    };
    const handleAddProject = (projectData: any, navigateTo: (view: any, ctx?: any) => void) => {
        const newProject: Project = { id: `p-${Date.now()}`, status: ProjectStatus.PENDING, tags: [], budget: null, isPublished: false, tasks: [], createdBy: ADMIN_USER.name, createdAt: new Date().toLocaleDateString('fr-CA'), deadline: null, activityLog: [], ...projectData };
        setProjects(prev => [newProject, ...prev]);
        navigateTo('projects');
        addToast(t('toasts.projectCreated'));
    };

    const handleUpdateProjectDetails = (projectId: string, details: Partial<Project>) => {
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...details, activityLog: [...p.activityLog, {id: `act-${Date.now()}`, messageKey: 'activityLog.projectDetailsUpdated', actor: ADMIN_USER.name, timestamp: t('now')}] } : p));
        addToast(t('toasts.projectDetailsUpdated'));
    };

    const handleAddTask = (projectId: string, taskData: Omit<Task, 'id' | 'status' | 'assignments' | 'biddingStatus' | 'subTasks' | 'notes' | 'attachments' | 'activityLog' | 'creationDate' | 'deliverables'>) => {
        setProjects(prev => prev.map(p => {
            if (p.id === projectId) {
                const newTask: Task = {
                    id: `t-${Date.now()}`,
                    status: ProjectStatus.PENDING,
                    assignments: [],
                    biddingStatus: 'CLOSED',
                    subTasks: [],
                    notes: [],
                    attachments: [],
                    deliverables: [],
                    activityLog: [],
                    creationDate: new Date().toLocaleDateString('fr-CA'),
                    ...taskData
                };
                return { ...p, tasks: [...p.tasks, newTask] };
            }
            return p;
        }));
        addToast(t('toasts.taskAdded'));
    };

    const handleDeleteTask = (projectId: string, taskId: string, reason: string) => {
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, tasks: p.tasks.filter(t => t.id !== taskId) } : p));
        addToast(t('toasts.taskDeleted'), 'info');
    };

    const handleAssignProvider = (projectId: string, taskId: string, newAssignments: Omit<Assignment, 'id'>[]) => {
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, tasks: p.tasks.map(t => {
            if (t.id === taskId) {
                const assignmentsWithIds: Assignment[] = newAssignments.map(a => ({ ...a, id: `as-${Date.now()}-${Math.random()}` }));
                return { ...t, assignments: [...t.assignments, ...assignmentsWithIds] };
            }
            return t;
        })} : p));
        addToast(t('toasts.assignedProvidersToTask', { count: newAssignments.length }));
    };

    const handleUpdateBidTaskStatus = (bidId: string, taskId: string, newStatus: BidStatus, details: any) => {
        setBids(prev => prev.map(b => {
            if (b.id === bidId) {
                return { ...b, bidTasks: b.bidTasks.map(bt => bt.taskId === taskId ? { ...bt, status: newStatus, ...details } : bt) };
            }
            return b;
        }));

        if (newStatus === BidStatus.ASSIGNED) {
            const bid = bids.find(b => b.id === bidId);
            if (bid) {
                const bidTask = bid.bidTasks.find(bt => bt.taskId === taskId);
                const newAssignment: Omit<Assignment, 'id'> = {
                    educatorId: bid.educatorId, type: AssignmentType.FROM_BID, status: AssignmentStatus.ACCEPTED,
                    amount: bidTask?.amount, agreementNotes: details.assignmentAgreement
                };
                handleAssignProvider(bid.projectId, taskId, [newAssignment]);
            }
        }
        addToast(t('toasts.bidStatusUpdated'));
    };

    const handleUpdateTaskBiddingStatus = (projectId: string, taskId: string) => {
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, biddingStatus: t.biddingStatus === 'OPEN' ? 'CLOSED' : 'OPEN' } : t)} : p));
        addToast(t('toasts.taskBiddingStatusUpdated'));
    };

    const handleUpdateProjectStatus = (projectId: string, newStatus: ProjectStatus, reason: string) => {
        const newLog: ProjectActivityLog = {id: `act-${Date.now()}`, messageKey: 'activityLog.statusChangedWithReason', messagePayload: { status: t(`status.${newStatus}`), reason }, actor: ADMIN_USER.name, timestamp: t('now')};
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status: newStatus, activityLog: [...p.activityLog, newLog] } : p));
        addToast(t('toasts.projectStatusUpdatedTo', { status: t(`status.${newStatus}`) }));
    };

    const handleUpdateTaskStatus = (projectId: string, taskId: string, newStatus: ProjectStatus, reason: string) => {
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)} : p));
        addToast(t('toasts.taskStatusUpdatedTo', { status: t(`status.${newStatus}`) }));
    };

    const handleUpdateRequestStatus = (requestId: string, newStatus: EducationalRequestStatus, reason?: string) => {
        const newLog: RequestActivityLog = {id: `act-${Date.now()}`, type: 'STATUS_CHANGED', detailsKey: 'activityLog.statusChangedTo', detailsPayload: { status: t(`status.${newStatus}`) }, actor: ADMIN_USER.name, actorAvatar: ADMIN_USER.avatarUrl, timestamp: t('now'), reason};
        setEducationalRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus, activityLog: [newLog, ...r.activityLog] } : r));
        addToast(t('toasts.requestStatusUpdatedTo', { status: t(`status.${newStatus}`) }));
    };

    const handleUpdatePaymentStatus = (requestId: string, newStatus: PaymentStatus, reason?: string) => {
        const newLog: RequestActivityLog = {id: `act-${Date.now()}`, type: 'PAYMENT_STATUS_CHANGED', detailsKey: 'activityLog.paymentStatusChangedTo', detailsPayload: { status: t(`status.${newStatus}`) }, actor: ADMIN_USER.name, actorAvatar: ADMIN_USER.avatarUrl, timestamp: t('now'), reason};
        setEducationalRequests(prev => prev.map(r => r.id === requestId ? { ...r, paymentStatus: newStatus, activityLog: [newLog, ...r.activityLog] } : r));
        addToast(t('toasts.paymentStatusUpdatedTo', { status: t(`status.${newStatus}`) }));
    };

    const handleUpdateFulfillmentStatus = (requestId: string, newStatus: FulfillmentStatus, reason?: string) => {
        const newLog: RequestActivityLog = {id: `act-${Date.now()}`, type: 'FULFILLMENT_STATUS_CHANGED', detailsKey: 'activityLog.fulfillmentStatusChangedTo', detailsPayload: { status: t(`status.${newStatus}`) }, actor: ADMIN_USER.name, actorAvatar: ADMIN_USER.avatarUrl, timestamp: t('now'), reason};
        setEducationalRequests(prev => prev.map(r => r.id === requestId ? { ...r, fulfillmentStatus: newStatus, activityLog: [newLog, ...r.activityLog] } : r));
        addToast(t('toasts.fulfillmentStatusUpdatedTo', { status: t(`status.${newStatus}`) }));
    };

    const handleUpdateRequest = (requestId: string, details: Partial<EducationalRequest>) => {
        const newLog: RequestActivityLog = {id: `act-${Date.now()}`, type: 'DETAILS_UPDATED', detailsKey: 'activityLog.requestDetailsUpdated', actor: ADMIN_USER.name, actorAvatar: ADMIN_USER.avatarUrl, timestamp: t('now')};
        setEducationalRequests(prev => prev.map(r => r.id === requestId ? { ...r, ...details, activityLog: [newLog, ...r.activityLog] } : r));
        addToast(t('toasts.requestDetailsUpdated'));
    };

    const handleAddRequestNote = (requestId: string, content: string) => {
        const newNote: RequestActivityLog = {
            id: `act-${Date.now()}`,
            type: 'NOTE',
            detailsKey: content, // For notes, the content itself is the key
            actor: ADMIN_USER.name,
            actorAvatar: ADMIN_USER.avatarUrl,
            timestamp: t('now'),
        };
        setEducationalRequests(prev => prev.map(r => r.id === requestId ? { ...r, activityLog: [newNote, ...r.activityLog] } : r));
        addToast(t('toasts.noteAdded'));
    };

    const value = {
        projects, setProjects, bids, setBids, educators, setEducators, notifications, withdrawals,
        transactions, inboxMessages, supportTickets, setSupportTickets, toasts, users, setUsers,
        educationalRequests, educatorApplications, invoices, setInvoices, activityFeed, adminMessages,
        managedMajors, setManagedMajors, managedServices, setManagedServices, managedSkills, setManagedSkills,
        addToast, handleDeleteProject, handleToggleProjectPublication, handleUpdateInvoiceStatus,
        handleCreateSupportTicket, handleAddSupportTicketReply, handleUpdateSupportTicketStatus,
        handleUpdateEducatorProfile, handleCreateBid, handleUpdateBid, handleAcceptInvitation,
        handleDeclineInvitation, handleUpdateTask, handleAddDeliverable, handleEditDeliverable,
        handleDeleteDeliverable, handleAddSubTask, handleEditSubTask, handleToggleSubTask,
        handleAddSubTaskAttachment, handleEditSubTaskAttachment, handleDeleteSubTaskAttachment,
        handleAddNote, handleUpdateUserStatus, handleDeleteUser, handleAddProject,
        handleUpdateProjectDetails, handleAddTask, handleDeleteTask, handleAssignProvider,
        handleUpdateBidTaskStatus, handleUpdateTaskBiddingStatus, handleUpdateProjectStatus,
        handleUpdateTaskStatus,
        handleUpdateRequestStatus, handleUpdatePaymentStatus, handleUpdateFulfillmentStatus,
        handleUpdateRequest, handleAddRequestNote,
    };

    return <DataContext.Provider value={value as DataContextType}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
