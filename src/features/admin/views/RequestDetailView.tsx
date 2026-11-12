import React, { useState } from 'react';
import { EducationalRequest, EducationalRequestStatus, Project, Attachment, RequestActivityLog, RequestActivityType, PaymentStatus, FulfillmentStatus, User, ViewType } from '../../../shared/types';
import StatusUpdateModal from '../components/modals/StatusUpdateModal';
import { AcademicCapIcon, BriefcaseIcon, ChatBubbleLeftRightIcon, CheckBadgeIcon, ClipboardListIcon, CreditCardIcon, DocumentTextIcon, DollarSignIcon, EditIcon, LightBulbIcon, MapPinIcon, PaperclipIcon, PhoneIcon, PlusIcon, SendIcon, ArrowLeftIcon, ArrowRightIcon, BookOpenIcon, LinkIcon, UserCheckIcon, UserIcon, ClockIcon } from '../../../shared/components/Icons';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import Avatar from '../../../shared/components/Avatar';

interface RequestDetailViewProps {
    request: EducationalRequest;
    users: User[];
    linkedProject: Project | null;
    isLinkedProjectLoading?: boolean;
    navigateTo: (view: ViewType, id?: string | null) => void;
    isSaving?: boolean;
    onUpdateRequestStatus: (requestId: string, newStatus: EducationalRequestStatus, reason?: string) => void;
    onUpdatePaymentStatus: (requestId: string, newStatus: PaymentStatus, reason?: string) => void;
    onUpdateFulfillmentStatus: (requestId: string, newStatus: FulfillmentStatus, reason?: string) => void;
    onUpdateRequest: (requestId: string, details: Partial<EducationalRequest>) => void;
    onAddNote: (requestId: string, content: string) => void;
}

type EditableSection = 'info' | 'financials' | 'contact' | 'agreement' | 'key_info' | null;
type ActiveTab = 'details' | 'activity' | 'project';

type RequestDetailFormData = Partial<Pick<EducationalRequest, 'title' | 'description' | 'budget' | 'finalAgreement' | 'serviceType' | 'projectSiteType' | 'solarSystemType' | 'expectedDeliveryDate'> & Pick<User, 'name' | 'phone' | 'city' | 'address'>>;

type ProjectTrackingData = Omit<Project, 'createdBy' | 'tasks' | 'progress'> & {
    projectNumber?: number | string | null;
    startDate?: string | null;
    tasksCount?: number;
    completedTasksCount?: number;
    createdBy?: string | { name?: string } | null;
    progress?: number | { percentage?: number; completedTasks?: number; totalTasks?: number };
    tasks?: Array<{
        id?: string;
        status?: string;
        assignedEducators?: Array<{ id?: string; status?: string; educator?: { id?: string; name?: string } }>;
        assignments?: Array<{ id?: string; status?: string; educator?: { id?: string; name?: string } }>;
    }>;
};

const serviceTypeLabels: Record<string, string> = {
    general: 'خدمة عامة',
    task: 'مهمة',
    project: 'مشروع',
    research: 'بحث',
    explanation: 'شرح / استشارة تعليمية',
};

const siteTypeLabels: Record<string, string> = {
    residential: 'سكني',
    commercial: 'تجاري',
    industrial: 'صناعي',
    agricultural: 'زراعي / مزرعة',
    medical: 'مرفق طبي',
    educational: 'مرفق تعليمي',
    other: 'أخرى',
};

const solarSystemLabels: Record<string, string> = {
    'on-grid': 'متصل بالشبكة',
    'off-grid': 'خارج الشبكة',
    hybrid: 'هجين',
    not_sure: 'غير متأكد',
};

const formatOption = (value: string | null | undefined, labels: Record<string, string>) =>
    value ? labels[value] || value : 'غير محدد';

const formatServiceType = (value?: string | null) => formatOption(value, serviceTypeLabels);

const InfoCard: React.FC<{title: string, icon: React.ReactNode, children: React.ReactNode, onEdit?: () => void, isEditing?: boolean}> = ({title, icon, children, onEdit, isEditing}) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border dark:border-gray-700 w-full">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <div className="flex items-center">
                <div className="text-gray-500 dark:text-gray-400">{icon}</div>
                <h3 className="font-bold text-gray-800 dark:text-white ms-3">{title}</h3>
            </div>
            {onEdit && !isEditing && <button onClick={onEdit} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><EditIcon className="w-5 h-5 text-gray-400"/></button>}
        </div>
        <div className="p-4">{children}</div>
    </div>
);

const ActivityIcon: React.FC<{type: RequestActivityType}> = ({ type }) => {
    const iconMap: Record<RequestActivityType, { icon: React.ReactNode; color: string; }> = {
        'CREATED': { icon: <PlusIcon className="w-5 h-5"/>, color: 'bg-yellow-100 text-brand-primary dark:bg-yellow-900/50 dark:text-yellow-400' },
        'STATUS_CHANGED': { icon: <LightBulbIcon className="w-5 h-5"/>, color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400' },
        'NOTE': { icon: <ChatBubbleLeftRightIcon className="w-5 h-5"/>, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400' },
        'PROJECT_LINKED': { icon: <BriefcaseIcon className="w-5 h-5"/>, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400' },
        'DETAILS_UPDATED': { icon: <EditIcon className="w-5 h-5"/>, color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
        'PAYMENT_STATUS_CHANGED': { icon: <CreditCardIcon className="w-5 h-5"/>, color: 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' },
        'FULFILLMENT_STATUS_CHANGED': { icon: <CheckBadgeIcon className="w-5 h-5"/>, color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400' },
        'AGREEMENT_UPDATED': { icon: <DocumentTextIcon className="w-5 h-5"/>, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400' },
    };
    const { icon, color } = iconMap[type] ?? { icon: <LightBulbIcon className="w-5 h-5"/>, color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' };
    return <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>{icon}</div>;
};

const ActivityItem: React.FC<{log: RequestActivityLog}> = ({ log }) => {
    const { t } = useLanguage();
    return (
        <div className="flex items-start gap-4">
            <ActivityIcon type={log.type} />
            <div className="flex-grow bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                    <div>
                         <div className="flex items-center mb-1">
                            <Avatar src={log.actorAvatar} name={log.actor} size={24} className="rounded-full me-2" />
                            <p className="font-semibold text-gray-800 dark:text-white text-sm">{log.actor}</p>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{t(log.detailsKey, log.detailsPayload)}</p>
                    </div>
                     <time className="text-xs text-gray-400 flex-shrink-0 ms-4">{log.timestamp}</time>
                </div>
                {log.changes && <ul className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-300">
                    {Object.entries(log.changes).map(([field, change]) => {
                        const fieldKey = `request.field.${field}`;
                        const fieldLabel = t(fieldKey);
                        return <li key={field}>
                            <span className="font-semibold">{fieldLabel === fieldKey ? field : fieldLabel}:</span>{' '}
                            <span>{change.from ?? '—'} → {change.to ?? '—'}</span>
                        </li>;
                    })}
                </ul>}
                {log.reason && <p className="mt-2 text-xs italic text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded-md">السبب: {log.reason}</p>}
            </div>
        </div>
    );
};

const TabButton: React.FC<{ icon: React.ReactNode, label: string, count?: number, isActive: boolean, onClick: () => void }> = ({ icon, label, count, isActive, onClick}) => (
    <button onClick={onClick} className={`flex items-center px-3 py-2 font-semibold text-sm rounded-t-lg transition-colors duration-200 group ${isActive ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
        {icon}
        <span className="ms-2">{label}</span>
        {count !== undefined && <span className={`ms-2 text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-yellow-100 dark:bg-yellow-900 text-brand-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'}`}>{count}</span>}
    </button>
);

const formatDateTime = (dateStr?: string | null): string => {
    if (!dateStr) return 'غير محدد';
    return dateStr.split('.')[0].replace('Z', '');
};

const RequestDetailView: React.FC<RequestDetailViewProps> = (props) => {
    const { request, users, linkedProject, isLinkedProjectLoading = false, navigateTo, isSaving = false, onUpdateRequest, onAddNote, onUpdateRequestStatus, onUpdateFulfillmentStatus, onUpdatePaymentStatus } = props;
    const { t, language } = useLanguage();
    const projectData = linkedProject as ProjectTrackingData | null;
    const projectProgress = typeof projectData?.progress === 'object' ? projectData.progress : null;
    const projectTasks = projectData?.tasks ?? [];
    const totalTasks = projectProgress?.totalTasks ?? projectData?.tasksCount ?? projectTasks.length;
    const completedTasks = projectProgress?.completedTasks ?? projectData?.completedTasksCount ??
        projectTasks.filter(task => task.status?.toUpperCase() === 'COMPLETED').length;
    const progressPercentage = Math.min(100, Math.max(0,
        typeof projectData?.progress === 'number'
            ? projectData.progress
            : projectProgress?.percentage ?? (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0)
    ));
    const projectProviders = Array.from(new Map(
        projectTasks
            .flatMap(task => task.assignedEducators ?? task.assignments ?? [])
            .filter(assignment => assignment.status?.toUpperCase() === 'ACCEPTED' && assignment.educator?.name)
            .map(assignment => [assignment.educator!.id || assignment.educator!.name!, assignment.educator!.name!])
    ).values());
    const projectOwner = typeof projectData?.createdBy === 'object' ? projectData.createdBy?.name : projectData?.createdBy;
    const projectResponsible = projectProviders.length > 0 ? projectProviders.join('، ') : projectOwner || '';
    const projectStatus = projectData?.status
        ? t(`status.${String(projectData.status).replace(/[-\s]/g, '_').toUpperCase()}`)
        : t('requestDetail.project.notSpecified');
    const translatedProjectStatus = projectData?.status && projectStatus.startsWith('status.')
        ? String(projectData.status)
        : projectStatus;
    
    const requester = (users || []).find(u => u.id === request.requesterId);

    const [editingSection, setEditingSection] = useState<EditableSection>(null);
    const [formData, setFormData] = useState<RequestDetailFormData>({});
    const [noteContent, setNoteContent] = useState('');
    const noteInputRef = React.useRef<HTMLInputElement | null>(null);
    const [statusUpdateAction, setStatusUpdateAction] = useState<{
        type: 'request' | 'payment' | 'fulfillment',
        title: string,
        description: string,
        label: string,
        icon: React.ReactNode,
        handler: Function,
        newStatus: any,
        isReasonRequired?: boolean
    } | null>(null);
    const [activeTab, setActiveTab] = useState<ActiveTab>('details');

    const handleEditClick = (section: EditableSection) => {
        setEditingSection(section);
        const currentData: RequestDetailFormData = {};
        switch(section) {
            case 'info':
                currentData.title = request.title;
                currentData.description = request.description;
                break;
            case 'financials':
                currentData.budget = request.budget;
                break;
            case 'contact':
                if (requester) {
                    currentData.name = requester.name;
                    currentData.phone = requester.phone;
                    currentData.city = requester.city;
                    currentData.address = requester.address;
                }
                break;
            case 'agreement':
                currentData.finalAgreement = request.finalAgreement;
                break;
             case 'key_info':
                currentData.serviceType = request.serviceType || '';
                currentData.projectSiteType = request.projectSiteType || '';
                currentData.solarSystemType = request.solarSystemType || '';
                currentData.expectedDeliveryDate = request.expectedDeliveryDate;
                break;
        }
        setFormData(currentData);
    };

    const handleCancelEdit = () => {
        setEditingSection(null);
        setFormData({});
    };

    const handleSave = async () => {
        if (editingSection) {
            const { title, description, budget, finalAgreement, serviceType, projectSiteType, solarSystemType, expectedDeliveryDate } = formData;
            const requestDetails: Partial<EducationalRequest> = {
                title, description, budget: budget !== undefined ? (budget === '' ? null : Number(budget)) : undefined,
                finalAgreement, serviceType, projectSiteType, solarSystemType, expectedDeliveryDate
            };
            const cleanRequestDetails = Object.fromEntries(Object.entries(requestDetails).filter(([, v]) => v !== undefined));
            if (Object.keys(cleanRequestDetails).length > 0) {
                try {
                    await onUpdateRequest(request.id, cleanRequestDetails);
                    handleCancelEdit();
                } catch (e) {
                    // keep section open on error
                }
            } else {
                handleCancelEdit();
            }
        }
    };
    
    const renderEditingControls = () => (
        <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={handleCancelEdit} disabled={isSaving} className="px-4 py-1.5 rounded-md text-sm font-semibold bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed">إلغاء</button>
            <button type="button" onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold bg-brand-primary text-white hover:bg-brand-primary/90 disabled:opacity-70 disabled:cursor-not-allowed">
                {isSaving && <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                {isSaving ? 'جارِ الحفظ...' : 'حفظ'}
            </button>
        </div>
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();
        if(noteContent.trim()) {
            onAddNote(request.id, noteContent.trim());
            setNoteContent('');
        }
    };

    const focusNoteInput = () => {
      // The note composer lives on the activity tab, so switch to it first
      // before focusing — otherwise the button is a silent no-op.
      setActiveTab('activity');
      window.requestAnimationFrame(() => noteInputRef.current?.focus());
    };

    const handleStatusChange = (type: 'request' | 'payment' | 'fulfillment', newStatus: any) => {
       const statusMap = {
           request: { title: 'تغيير حالة الطلب', handler: onUpdateRequestStatus, oldStatus: request.status, icon: <LightBulbIcon className="w-8 h-8"/>, description: `سيتم تغيير حالة الطلب من "${request.status}" إلى "${newStatus}".` },
           payment: { title: 'تغيير حالة الدفع', handler: onUpdatePaymentStatus, oldStatus: request.paymentStatus, icon: <CreditCardIcon className="w-8 h-8"/>, description: `سيتم تغيير حالة الدفع من "${request.paymentStatus}" إلى "${newStatus}".` },
           fulfillment: { title: 'تغيير حالة الإنجاز', handler: onUpdateFulfillmentStatus, oldStatus: request.fulfillmentStatus, icon: <CheckBadgeIcon className="w-8 h-8"/>, description: `سيتم تغيير حالة الإنجاز من "${request.fulfillmentStatus}" إلى "${newStatus}".` },
       }
       const action = statusMap[type];
       setStatusUpdateAction({
            type,
            title: `${action.title} إلى "${newStatus}"`,
            description: action.description,
            label: 'سبب التحديث (اختياري)',
            icon: action.icon,
            handler: action.handler,
            newStatus,
            isReasonRequired: false,
        });
    };

    if (!requester) {
        // Distinguish "users still loading" from "requester not found" so the
        // view does not hang on an endless spinner when the lookup fails.
        if (!users || users.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 mb-4" style={{ borderBottom: '3px solid var(--primary-color)' }}></div>
                    <span className="text-base font-medium text-slate-600 dark:text-slate-400">{t('loading')}</span>
                </div>
            );
        }
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in text-center">
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('taskDetail.noData')}</p>
                <button onClick={() => navigateTo('educationalRequests')} className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90">{t('projectsView.backToList') || t('cancel')}</button>
            </div>
        );
    }

    return (
        <>
            {statusUpdateAction && <StatusUpdateModal 
                isOpen={true} 
                onClose={() => setStatusUpdateAction(null)}
                title={statusUpdateAction.title}
                description={statusUpdateAction.description}
                label={statusUpdateAction.label}
                icon={statusUpdateAction.icon}
                isReasonRequired={statusUpdateAction.isReasonRequired ?? false}
                onSubmit={async (reason) => {
                    try {
                        await statusUpdateAction.handler(request.id, statusUpdateAction.newStatus, reason);
                        setStatusUpdateAction(null);
                    } catch (e) {
                        // keep modal open on error
                    }
                }}
            />}
            <div className="animate-fade-in">
                <div className="mb-6">
                    <button onClick={() => navigateTo('educationalRequests')} className="flex items-center text-sm text-brand-primary dark:text-yellow-500 hover:underline mb-2">
                        {language === 'ar' ? <ArrowRightIcon className="w-4 h-4 me-1"/> : <ArrowLeftIcon className="w-4 h-4 me-1"/>} العودة إلى الطلبات
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{request.title} {request.code ? <span className="text-sm font-semibold text-gray-500 ms-2">({request.code})</span> : null}</h1>
                </div>

                <div className="flex flex-col lg:flex-row-reverse gap-8">
                    {/* Sidebar */}
                    <aside className="lg:w-1/3 w-full space-y-6 lg:sticky lg:top-8 flex-shrink-0">
                        <InfoCard title="حالة الطلب" icon={<ClipboardListIcon className="w-6 h-6"/>}>
                           <div className="space-y-3">
                                <div className="flex items-center justify-between"><span className="text-sm font-semibold">حالة الطلب:</span> <div className="flex gap-1">{Object.values(EducationalRequestStatus).map(s => <button key={s} onClick={() => s !== request.status && handleStatusChange('request', s)} className={`px-2 py-0.5 text-xs font-bold rounded-md ${request.status === s ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}>{s}</button>)}</div></div>
                                <div className="flex items-center justify-between"><span className="text-sm font-semibold">حالة الدفع:</span> <div className="flex gap-1">{Object.values(PaymentStatus).map(s => <button key={s} onClick={() => s !== request.paymentStatus && handleStatusChange('payment', s)} className={`px-2 py-0.5 text-xs font-bold rounded-md ${request.paymentStatus === s ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}>{s}</button>)}</div></div>
                                 <div className="flex items-center justify-between"><span className="text-sm font-semibold">حالة الإنجاز:</span> <div className="flex gap-1">{Object.values(FulfillmentStatus).map(s => <button key={s} onClick={() => s !== request.fulfillmentStatus && handleStatusChange('fulfillment', s)} className={`px-2 py-0.5 text-xs font-bold rounded-md ${request.fulfillmentStatus === s ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}>{s}</button>)}</div></div>
                                 <div className="flex items-center justify-between pt-2 border-t dark:border-gray-700">
                                     <span className="text-sm font-semibold">درجة الاستعجال:</span>
                                     {(() => {
                                         const urgencyMap: Record<string, { label: string; cls: string }> = {
                                             'normal': { label: 'عادي', cls: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200' },
                                             'urgent': { label: 'عاجل', cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' },
                                             'very_urgent': { label: 'عاجل جداً', cls: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' },
                                         };
                                         const u = request.urgencyLevel ? (urgencyMap[request.urgencyLevel] ?? null) : null;
                                         return u
                                             ? <span className={`px-3 py-1 text-xs font-bold rounded-full ${u.cls}`}>{u.label}</span>
                                             : <span className="text-xs text-gray-400">غير محدد</span>;
                                     })()}
                                 </div>
                           </div>
                        </InfoCard>

                        <InfoCard title="مقدم الطلب" icon={<UserCheckIcon className="w-6 h-6"/>}>
                           <div className="flex items-center gap-3">
                                <Avatar src={requester.avatarUrl} name={requester.name} size={48} className="rounded-full" />
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-white">{requester.name}</h4>
                                    <p className="text-xs text-gray-500">{requester.email || 'لا يوجد بريد مسجل'}</p>
                                </div>
                           </div>
                           <div className="mt-3 pt-3 border-t dark:border-gray-700 text-sm space-y-2">
                                <p className="flex items-center gap-2"><PhoneIcon className="w-4 h-4 text-gray-400"/> {requester.phone || 'غير محدد'}</p>
                                <p className="flex items-center gap-2"><MapPinIcon className="w-4 h-4 text-gray-400"/> {[requester.city, requester.address].filter(Boolean).join(', ') || 'غير محدد'}</p>
                           </div>
                        </InfoCard>

                        <InfoCard title="المرفقات" icon={<PaperclipIcon className="w-6 h-6"/>}>
                           {request.attachments.length > 0 ? (
                               <ul className="space-y-2">
                                   {request.attachments.map(att => (
                                        <li key={att.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                            <a href={att.url} className="flex items-center gap-2 text-sm text-brand-primary hover:underline"><PaperclipIcon className="w-4 h-4"/>{att.name}</a>
                                            <span className="text-xs text-gray-400">{att.size}</span>
                                        </li>
                                   ))}
                               </ul>
                           ) : <p className="text-center text-sm text-gray-400 py-4">لا توجد مرفقات.</p>}
                        </InfoCard>
                    </aside>

                    {/* Main content */}
                    <main className="lg:w-2/3 w-full">
                        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                            <nav className="flex space-x-4 rtl:space-x-reverse -mb-px">
                               <TabButton icon={<DocumentTextIcon className="w-5 h-5"/>} label="التفاصيل" isActive={activeTab === 'details'} onClick={() => setActiveTab('details')} />
                               <TabButton icon={<ClockIcon className="w-5 h-5"/>} label="سجل النشاطات" count={request.activityLog.length} isActive={activeTab === 'activity'} onClick={() => setActiveTab('activity')} />
                               <TabButton icon={<BriefcaseIcon className="w-5 h-5"/>} label="المشروع" isActive={activeTab === 'project'} onClick={() => setActiveTab('project')} />
                            </nav>
                        </div>

                        {activeTab === 'details' && (
                           <div className="space-y-6">
                               <InfoCard title="وصف الطلب" icon={<BookOpenIcon className="w-6 h-6"/>} onEdit={() => handleEditClick('info')} isEditing={editingSection === 'info'}>
                                   {editingSection === 'info' ? (
                                       <div className="space-y-2">
                                           <input name="title" value={formData.title ?? ''} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"/>
                                           <textarea name="description" rows={5} value={formData.description ?? ''} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"></textarea>
                                           {renderEditingControls()}
                                       </div>
                                   ) : <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{request.description}</p>}
                               </InfoCard>
                               <div className="grid md:grid-cols-2 gap-6">
                                   <InfoCard title="بيانات الخدمة" icon={<AcademicCapIcon className="w-6 h-6"/>} onEdit={() => handleEditClick('key_info')} isEditing={editingSection === 'key_info'}>
                                        {editingSection === 'key_info' ? (
                                            <div className="space-y-3 text-sm">
                                                <div>
                                                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">نوع الخدمة المطلوبة</label>
                                                        <select name="serviceType" value={formData.serviceType ?? ''} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-primary block w-full p-2 dark:bg-gray-700 dark:border-gray-600">
                                                            <option value="">اختر نوع الخدمة...</option>
                                                            <option value="general">خدمة عامة</option>
                                                            <option value="task">مهمة</option>
                                                            <option value="project">مشروع</option>
                                                            <option value="research">بحث</option>
                                                            <option value="explanation">شرح / استشارة تعليمية</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">نوع موقع المشروع</label>
                                                        <select name="projectSiteType" value={formData.projectSiteType ?? ''} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-primary block w-full p-2 dark:bg-gray-700 dark:border-gray-600">
                                                            <option value="">اختر نوع الموقع...</option>
                                                            <option value="residential">سكني</option>
                                                            <option value="commercial">تجاري</option>
                                                            <option value="industrial">صناعي</option>
                                                            <option value="agricultural">زراعي / مزرعة</option>
                                                            <option value="medical">مرفق طبي</option>
                                                            <option value="educational">مرفق تعليمي</option>
                                                            <option value="other">أخرى</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">نوع نظام الطاقة الشمسية</label>
                                                        <select name="solarSystemType" value={formData.solarSystemType ?? ''} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-primary block w-full p-2 dark:bg-gray-700 dark:border-gray-600">
                                                            <option value="">اختر نوع النظام...</option>
                                                            <option value="on-grid">متصل بالشبكة</option>
                                                            <option value="off-grid">خارج الشبكة</option>
                                                            <option value="hybrid">هجين</option>
                                                            <option value="not_sure">غير متأكد</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">موعد التنفيذ أو التسليم المتوقع</label>
                                                        <input name="expectedDeliveryDate" type="date" value={formData.expectedDeliveryDate ?? ''} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-primary block w-full p-2 dark:bg-gray-700 dark:border-gray-600"/>
                                                    </div>
                                                {renderEditingControls()}
                                            </div>
                                        ) : (
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between"><span>نوع الخدمة المطلوبة:</span> <strong>{request.serviceName || formatServiceType(request.serviceType)}</strong></div>
                                                <div className="flex justify-between"><span>نوع موقع المشروع:</span> <strong>{formatOption(request.projectSiteType, siteTypeLabels)}</strong></div>
                                                <div className="flex justify-between"><span>نوع نظام الطاقة الشمسية:</span> <strong>{formatOption(request.solarSystemType, solarSystemLabels)}</strong></div>
                                                <div className="flex justify-between"><span>تاريخ مراجعة الطلب:</span> <strong>{request.reviewedAt ? formatDateTime(request.reviewedAt) : 'غير مراجع'}</strong></div>
                                                <div className="flex justify-between"><span>تاريخ إرسال الطلب:</span> <strong>{formatDateTime(request.createdAt)}</strong></div>
                                                <div className="flex justify-between"><span>موعد التنفيذ أو التسليم المتوقع:</span> <strong>{request.expectedDeliveryDate || 'غير محدد'}</strong></div>
                                            </div>
                                        )}
                                   </InfoCard>
                                   <InfoCard title="المعلومات المالية" icon={<DollarSignIcon className="w-6 h-6"/>} onEdit={() => handleEditClick('financials')} isEditing={editingSection === 'financials'}>
                                     {editingSection === 'financials' ? (
                                         <div className="space-y-3 text-sm">
                                             <div>
                                                 <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">الميزانية (ريال)</label>
                                                 <input name="budget" placeholder="الميزانية" type="number" value={formData.budget ?? ''} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-primary block w-full p-2 dark:bg-gray-700 dark:border-gray-600"/>
                                             </div>
                                             {renderEditingControls()}
                                         </div>
                                     ) : (
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between"><span>الميزانية:</span> <strong className="text-green-600">{request.budget?.toLocaleString() || 'غير محدد'} ريال</strong></div>
                                        </div>
                                     )}
                                   </InfoCard>
                               </div>
                                <InfoCard title="الاتفاق النهائي" icon={<DocumentTextIcon className="w-6 h-6"/>} onEdit={() => handleEditClick('agreement')} isEditing={editingSection === 'agreement'}>
                                    {editingSection === 'agreement' ? (
                                        <div>
                                            <textarea name="finalAgreement" rows={5} value={formData.finalAgreement ?? ''} onChange={handleInputChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand-primary block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"></textarea>
                                            {renderEditingControls()}
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{request.finalAgreement || 'لم يتم إضافة اتفاق نهائي بعد.'}</p>
                                            {request.additionalNotes ? (
                                                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-sm">
                                                    <span className="font-semibold">ملاحظات إضافية:</span>
                                                    <p className="mt-1 text-gray-600 dark:text-gray-300 whitespace-pre-line">{request.additionalNotes}</p>
                                                </div>
                                            ) : null}
                                        </div>
                                    )}
                               </InfoCard>
                           </div>
                        )}

                        {activeTab === 'activity' && (
                            <div className="space-y-4">
                               {request.activityLog.map(log => <ActivityItem key={log.id} log={log} />)}
                               <form onSubmit={handleAddNote} className="flex items-center gap-3 mt-6">
                                   <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300" aria-label="المستخدم">
                                       <UserIcon className="w-5 h-5" />
                                   </div>
                                   <div className="relative flex-grow">
                                        <input ref={noteInputRef} type="text" value={noteContent} onChange={e => setNoteContent(e.target.value)} placeholder="أضف ملاحظة جديدة..." className="w-full bg-white border border-gray-300 rounded-lg p-2.5 ps-4 text-sm dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-brand-primary"/>
                                        <button type="submit" disabled={!noteContent.trim()} className="absolute top-1/2 -translate-y-1/2 start-2 p-1.5 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 disabled:bg-slate-400"><SendIcon className="w-4 h-4"/></button>
                                   </div>
                               </form>
                            </div>
                        )}

                        {/* Mobile sticky action bar — offset above the fixed bottom nav */}
                        <div className="sm:hidden fixed bottom-16 inset-x-0 z-50 bg-white/95 dark:bg-slate-900/95 border-t dark:border-gray-700 px-4 py-3 safe-area flex items-center gap-3">
                          <button onClick={() => setActiveTab('activity')} className="flex-1 py-3 rounded-xl bg-slate-100 text-sm">سجل النشاطات</button>
                          <button onClick={() => { focusNoteInput(); }} className="flex-1 py-3 rounded-xl bg-brand-primary text-white">أضف ملاحظة</button>
                        </div>

                        {activeTab === 'project' && (
                           <div className="p-5 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border dark:border-gray-700">
                               {linkedProject ? (
                                   <div className="space-y-5">
                                       <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                           <div>
                                               <h4 className="font-bold text-lg mb-1">{t('requestDetail.project.title')}</h4>
                                               <p className="font-semibold text-brand-primary dark:text-brand-accent">{linkedProject.title}</p>
                                               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                   {t('requestDetail.project.number')}: {projectData?.projectNumber ? `#${projectData.projectNumber}` : t('requestDetail.project.notSpecified')}
                                               </p>
                                           </div>
                                           <span className="inline-flex self-start px-3 py-1 text-sm font-semibold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                                               {translatedProjectStatus}
                                           </span>
                                       </div>

                                       {isLinkedProjectLoading ? (
                                           <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500 dark:text-gray-400" role="status" aria-live="polite">
                                               <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-200 border-b-brand-primary" />
                                               <span>{t('requestDetail.project.loading')}</span>
                                           </div>
                                       ) : (
                                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-start">
                                           <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                               <p className="text-xs text-gray-500 dark:text-gray-400">{t('requestDetail.project.progress')}</p>
                                               <p className="font-bold mt-1">{progressPercentage}%</p>
                                               <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-600 mt-2">
                                                   <div className="h-2 rounded-full bg-brand-primary" style={{ width: `${progressPercentage}%` }} />
                                               </div>
                                           </div>
                                           <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                               <p className="text-xs text-gray-500 dark:text-gray-400">{t('requestDetail.project.tasks')}</p>
                                               <p className="font-bold mt-1">{t('requestDetail.project.completedTasks', { completed: completedTasks, total: totalTasks })}</p>
                                           </div>
                                           <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                               <p className="text-xs text-gray-500 dark:text-gray-400">{t('requestDetail.project.responsible')}</p>
                                               <p className="font-semibold mt-1">{projectResponsible || t('requestDetail.project.unassigned')}</p>
                                           </div>
                                           <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                               <p className="text-xs text-gray-500 dark:text-gray-400">{t('requestDetail.project.startDate')}</p>
                                               <p className="font-semibold mt-1">{projectData?.startDate ? formatDateTime(projectData.startDate) : t('requestDetail.project.notSpecified')}</p>
                                           </div>
                                           <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 sm:col-span-2 lg:col-span-4">
                                               <p className="text-xs text-gray-500 dark:text-gray-400">{t('requestDetail.project.deadline')}</p>
                                               <p className="font-semibold mt-1">{projectData?.deadline ? formatDateTime(projectData.deadline) : t('requestDetail.project.notSpecified')}</p>
                                           </div>
                                       </div>
                                       )}

                                       <div className="text-start">
                                           <button onClick={() => navigateTo('projectDetail', linkedProject.id)} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90">
                                               {t('viewDetails')}
                                           </button>
                                       </div>
                                   </div>
                               ) : (
                                   <div>
                                        <h4 className="font-bold text-lg mb-2">{t('requestDetail.project.noProject')}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('requestDetail.project.createHint')}</p>
                                        <button onClick={() => navigateTo('createProject', request.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">{t('requestDetail.project.createFromRequest')}</button>
                                   </div>
                               )}
                           </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
};

export default RequestDetailView;
