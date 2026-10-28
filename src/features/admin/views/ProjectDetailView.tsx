import React, { useState, useMemo } from 'react';
import { Project, Task, ProjectStatus, Educator, Assignment, AssignmentType, AssignmentStatus, ProjectCreationType, Bid, EducationalRequest, User, ViewType, BidStatus } from '../../../shared/types';
import { ClockIcon, CheckCircleIcon, PlusIcon, EditIcon, DollarSignIcon, TrashIcon, BidsIcon, ArrowLeftIcon, ArrowRightIcon, UsersIcon, BriefcaseIcon, LinkIcon, BookOpenIcon, TrendingUpIcon, LockClosedIcon, LockOpenIcon, PaperclipIcon, CheckIcon } from '../../../shared/components/Icons';
import AddTaskModal from '../components/modals/AddTaskModal';
import Avatar from '../../../shared/components/Avatar';
import EditProjectDetailsModal from '../components/modals/EditProjectDetailsModal';
import AssignProviderModal from '../components/modals/AssignProviderModal';
import BidsView from './BidsView';
import ConfirmationModal from '../../../shared/components/modals/ConfirmationModal';
import { useCancelAssignment } from '../../../core/hooks/useAdminQueries';
import EditTaskModal from '../components/modals/EditTaskModal';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import EditAssignmentModal from '../components/modals/EditAssignmentModal';
import ProjectAttachmentsTab from '../components/ProjectAttachmentsTab';
import ProjectDeliverablesTab from '../components/ProjectDeliverablesTab';
import { resolveProjectTeam } from '../../../shared/utils';

interface ProjectDetailViewProps {
    project: Project;
    bids: Bid[];
    educators: Educator[];
    educationalRequests: EducationalRequest[];
    users: User[];
    navigateTo: (view: ViewType, id?: string | { projectId: string; taskId: string }) => void;
    onAddTask: (projectId: string, taskData: Omit<Task, 'id' | 'status' | 'assignments' | 'biddingStatus' | 'subTasks' | 'notes' | 'attachments' | 'activityLog' | 'creationDate' | 'deliverables'>) => Promise<void>;
    onUpdateTaskStatus: (projectId: string, taskId: string, newStatus: ProjectStatus, reason: string) => void;
    onUpdateProjectDetails: (projectId: string, details: Partial<Project>) => Promise<void> | void;
    onUpdateProjectStatus: (projectId: string, newStatus: ProjectStatus, reason: string) => void | Promise<any>;
    onUpdateTask: (projectId: string, taskId: string, taskData: Partial<Task>) => void;
    onAssignProvider: (projectId: string, taskId: string, newAssignments: Omit<Assignment, 'id'>[]) => Promise<void>;
    onUpdateBidTaskStatus: (bidId: string, taskId: string, newStatus: BidStatus, details?: { reason?: string; approvalMessage?: string; assignmentAgreement?: string; }) => void;
    onUpdateTaskBiddingStatus: (projectId: string, taskId: string) => void;
    onDeleteTask: (projectId: string, taskId: string, reason: string) => void;
    onToggleProjectPublication: (projectId: string, reason?: string) => void | Promise<any>;
    isSavingProject?: boolean;
}

const TaskCard: React.FC<{
    task: Task;
    project: Project;
    educators: Educator[];
    navigateTo: (view: ViewType, id: { projectId: string; taskId: string }) => void;
    onDeleteTask: (projectId: string, taskId: string, reason: string) => void;
    onUpdateTask: (projectId: string, taskId: string, taskData: Partial<Task>) => void;
    onUpdateTaskBiddingStatus: (projectId: string, taskId: string) => void;
    onUpdateTaskStatus: (projectId: string, taskId: string, newStatus: ProjectStatus, reason: string) => void;
    onAssignProviderClick: (task: Task) => void;
}> = ({ task, project, educators, navigateTo, onDeleteTask, onUpdateTask, onUpdateTaskBiddingStatus, onUpdateTaskStatus, onAssignProviderClick }) => {

    const [action, setAction] = useState<{ type: 'delete' | 'publish' | 'status', payload?: any } | null>(null);
    const [editingAssignment, setEditingAssignment] = useState<any | null>(null);
    const [editingTask, setEditingTask] = useState(false);
    const [cancelAction, setCancelAction] = useState<{ assignmentId: string; taskId: string } | null>(null);
    const cancelAssignmentMutation = useCancelAssignment();

    const handleConfirmAction = async (reason: string) => {
        if (!action) return;
        switch (action.type) {
            case 'delete':
                await onDeleteTask(project.id, task.id, reason);
                break;
            case 'publish':
                await onUpdateTaskBiddingStatus(project.id, task.id);
                break;
            case 'status':
                await onUpdateTaskStatus(project.id, task.id, action.payload, reason);
                break;
        }
        setAction(null);
    };

    const progress = typeof (task as any).progress === 'number'
        ? (task as any).progress
        : (task.subTasks?.length ? (task.subTasks.filter(st => st.completed).length / task.subTasks.length) * 100 : (task.status === ProjectStatus.COMPLETED ? 100 : 0));

    const getStatusInfo = (status: ProjectStatus) => {
        switch (status) {
            case ProjectStatus.COMPLETED: return { text: 'مكتملة', color: 'bg-green-100 text-green-700' };
            case ProjectStatus.IN_PROGRESS: return { text: 'قيد التنفيذ', color: 'bg-yellow-100 text-yellow-700' };
            case ProjectStatus.CANCELED: return { text: 'ملغية', color: 'bg-red-100 text-red-700' };
            default: return { text: 'قيد الانتظار', color: 'bg-brand-primary/20 text-brand-primary' };
        }
    };

    const getBiddingStatusInfo = (task: Task) => {
        if (!task.isPublic) return { text: 'خاصة', color: 'bg-gray-100 text-gray-700' };
        if (task.biddingStatus === 'OPEN') return { text: 'عامة - تستقبل العروض', color: 'bg-teal-100 text-teal-700' };
        return { text: 'عامة - مغلقة', color: 'bg-orange-100 text-orange-700' };
    };

    // Support both internal 'assignments' shape and API 'assignedEducators' shape.
    // Always normalise: the API sends lowercase ('accepted') while the enum is
    // uppercase, and an earlier early-return for "already internal" items left
    // the raw lowercase string in place, so the badge switch never matched a case
    // and fell through to its default.
    const normalizeAssignment = (a: any) => {
        const rawType = a.type ?? a.assigned_type ?? a.assignmentType;
        const typeStr = typeof rawType === 'string' ? rawType.toUpperCase().replace(/[-\s]+/g, '_') : '';
        const mappedType: AssignmentType = typeStr === 'INVITATION' ? AssignmentType.INVITATION : (typeStr === 'DIRECT' ? AssignmentType.DIRECT : AssignmentType.FROM_BID);

        const rawStatus = a.status ?? a.assignment_status;
        const statusStr = typeof rawStatus === 'string' ? rawStatus.toUpperCase().replace(/[-\s]+/g, '_') : '';
        const mappedStatus: AssignmentStatus = statusStr === 'ACCEPTED' ? AssignmentStatus.ACCEPTED : (statusStr === 'REJECTED' || statusStr === 'CANCELLED' ? AssignmentStatus.REJECTED : AssignmentStatus.PENDING);

        return {
            ...a, // keep every field the API sent
            id: a.id,
            educatorId: a.educator?.id || a.educatorId || null,
            educator: a.educator || null, // keep nested educator for direct access
            type: mappedType,
            status: mappedStatus,
            // The enum has no CANCELLED member, so a cancelled assignment is mapped
            // to REJECTED above. Keep the real status here: the UI needs to tell
            // "the specialist rejected it" apart from "the admin cancelled it".
            rawStatus: statusStr,
            amount: a.amount,
            agreementNotes: a.agreementNotes || a.agreement_notes || null,
            rejectionReason: a.rejectionReason || a.rejection_reason || null,
            assignedAt: a.assigned_at ?? a.assignedAt ?? null,
            acceptedAt: a.accepted_at ?? a.acceptedAt ?? null,
        } as any;
    };

    const allAssignments = (task.assignments && task.assignments.length > 0)
        ? task.assignments.map(normalizeAssignment)
        : (task.assignedEducators && task.assignedEducators.length > 0)
            ? task.assignedEducators.map(normalizeAssignment)
            : [];

    const assignedProviders = allAssignments.filter((a: any) => String(a.status).toUpperCase() === String(AssignmentStatus.ACCEPTED));
    const invitedProviders = allAssignments.filter((a: any) => String(a.status).toUpperCase() === String(AssignmentStatus.PENDING));

    // The edit button used to store a snapshot of the assignment, so after a save
    // (which refetches the list) reopening the modal still showed the old status
    // and notes. Look the row up in the current list instead; the educator is not
    // part of the list payload, so it is kept from the click.
    const editingLive = editingAssignment
        ? allAssignments.find((a: any) => a.id === editingAssignment.id)
        : null;

    const getAssignmentIcon = (type: AssignmentType) => {
        switch (type) {
            case AssignmentType.DIRECT: return <span title="تعيين مباشر"><UsersIcon className="w-3 h-3 text-purple-600" /></span>;
            case AssignmentType.INVITATION: return <span title="دعوة"><PlusIcon className="w-3 h-3 text-brand-primary" /></span>;
            case AssignmentType.FROM_BID: return <span title="من خلال عرض"><BidsIcon className="w-3 h-3 text-green-600" /></span>;
        }
    };

    const getAssignmentTypeInfo = (type: AssignmentType) => {
        switch (type) {
            case AssignmentType.DIRECT: return { label: 'تعيين مباشر', color: 'bg-purple-100 text-purple-700' };
            case AssignmentType.INVITATION: return { label: 'دعوة', color: 'bg-brand-primary/20 text-brand-primary' };
            case AssignmentType.FROM_BID: return { label: 'من خلال عرض', color: 'bg-green-100 text-green-700' };
        }
    };

    const getAssignmentStatusInfo = (status: AssignmentStatus) => {
        // Normalise defensively: the API sends 'accepted' while the enum is
        // 'ACCEPTED', and a bare string comparison would silently fall through.
        switch (String(status ?? '').toUpperCase()) {
            case AssignmentStatus.ACCEPTED: return { label: 'مقبول', color: 'bg-green-100 text-green-700' };
            case AssignmentStatus.PENDING: return { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700' };
            case AssignmentStatus.REJECTED: return { label: 'مرفوض', color: 'bg-red-100 text-red-700' };
            case 'CANCELLED': return { label: 'ملغى', color: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300' };
            // Never claim "cancelled" for an unknown status: it is a real state,
            // so guessing it hides real bugs.
            default: return { label: String(status ?? 'غير معروف'), color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' };
        }
    };

    const taskStatusActions = [
        { status: ProjectStatus.IN_PROGRESS, label: "بدء التنفيذ" },
        { status: ProjectStatus.COMPLETED, label: "إكمال" },
        { status: ProjectStatus.PENDING, label: "إعادة للانتظار" },
    ];

    return (
        <>
            {action && <ConfirmationModal
                isOpen={true}
                onClose={() => setAction(null)}
                onConfirm={handleConfirmAction}
                title={
                    action.type === 'delete' ? "تأكيد حذف المهمة" :
                        action.type === 'publish' ? `تأكيد ${task.biddingStatus === 'OPEN' ? 'إيقاف' : 'بدء'} استقبال العروض` :
                            `تغيير حالة المهمة إلى "${action.payload}"`
                }
                message={
                    action.type === 'delete' ? "هل أنت متأكد من حذف هذه المهمة؟ لا يمكن التراجع عن هذا الإجراء." :
                        "يرجى تقديم سبب أو تعليق لهذا الإجراء للتوثيق."
                }
                icon={action.type === 'delete' ? <TrashIcon className="w-8 h-8" /> : <EditIcon className="w-8 h-8" />}
                isReasonRequired={action.type !== 'delete'}
                reasonLabel={action.type === 'delete' ? "سبب الحذف" : "التعليق"}
            />}
            {cancelAction && <ConfirmationModal
                isOpen={true}
                onClose={() => setCancelAction(null)}
                onConfirm={(reason: string) => {
                    if (cancelAssignmentMutation) {
                        cancelAssignmentMutation.mutate({ assignmentId: cancelAction.assignmentId, reason });
                    }
                    setCancelAction(null);
                }}
                title="تأكيد إلغاء التعيين"
                message="الرجاء ذكر سبب إلغاء التعيين"
                icon={<TrashIcon className="w-8 h-8" />}
                isReasonRequired={true}
                reasonLabel="سبب الإلغاء"
            />}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border dark:border-gray-700 overflow-hidden">
                <div className="p-4 border-b dark:border-gray-700">
                    <div className="flex justify-between items-start gap-2">
                        <div>
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white">{task.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusInfo(task.status).color}`}>{getStatusInfo(task.status).text}</span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getBiddingStatusInfo(task).color}`}>{getBiddingStatusInfo(task).text}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            {task.isPublic && <button onClick={() => setAction({ type: 'publish' })} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title={task.biddingStatus === 'OPEN' ? 'إيقاف استقبال العروض' : 'فتح استقبال العروض'}>{task.biddingStatus === 'OPEN' ? <LockOpenIcon className="w-5 h-5 text-green-500" /> : <LockClosedIcon className="w-5 h-5 text-red-500" />}</button>}
                            <button onClick={() => setEditingTask(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><EditIcon className="w-5 h-5 text-gray-400 hover:text-brand-primary" /></button>
                            <button onClick={() => setAction({ type: 'delete' })} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-500" /></button>
                            <button onClick={() => navigateTo('taskDetail', { projectId: project.id, taskId: task.id })} className="px-3 py-1.5 text-sm font-bold bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90">إدارة</button>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span>التقدم</span>
                            <span className="font-semibold">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                            <div className="bg-brand-primary h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>

                {allAssignments.length > 0 && (
                    <div className="border-t dark:border-gray-700 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <h5 className="text-xs font-bold text-gray-400 uppercase">التعيينات</h5>
                            <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                {allAssignments.reduce((sum: number, a: any) => sum + (Number(a.amount) || 0), 0).toLocaleString()} ريال
                            </span>
                        </div>
                        <div className="space-y-3">
                            {allAssignments.map((assignment: any) => {
                                const educator = assignment.educator || educators.find((e: any) => e.id === assignment.educatorId);
                                if (!educator) return null;
                                const typeInfo = getAssignmentTypeInfo(assignment.type);
                                // rawStatus is the truth from the API. `status` cannot be used for
                                // these checks: the enum has no CANCELLED member, so a cancelled
                                // assignment is normalised to REJECTED and a cancelled row was
                                // being reported as "the specialist rejected it".
                                const rawStatus = String((assignment as any).rawStatus ?? '').toUpperCase();
                                const isCancelled = rawStatus === 'CANCELLED';
                                const isPending = rawStatus === 'PENDING';
                                const isAccepted = rawStatus === 'ACCEPTED';
                                const isRejected = rawStatus === 'REJECTED';
                                const statusInfo = isCancelled
                                    ? { label: 'ملغى', color: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300' }
                                    : getAssignmentStatusInfo(assignment.status);

                                // Cancelling withdraws the assignment completely, so it is only
                                // possible while the specialist has not decided yet. Once they
                                // accepted or rejected, the relationship is settled.
                                const canCancel = isPending;

                                let settledNote: string | null = null;
                                if (isCancelled) {
                                    settledNote = 'تم إلغاء هذا التعيين وسُحب من المتخصص.';
                                } else if (isAccepted) {
                                    settledNote = 'قبل المتخصص هذا التعيين، لذلك لا يمكن إلغاؤه — يمكن رفضه بدلاً من ذلك.';
                                } else if (isRejected) {
                                    settledNote = 'رفض المتخصص هذا التعيين، لذلك لا يمكن إلغاؤه.';
                                }
                                return (
                                    <div key={assignment.id}>
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <Avatar src={educator.avatarUrl} name={educator.name} size={32} className="rounded-full" />
                                                <span className="font-semibold">{educator.name}</span>
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeInfo?.color}`}>{typeInfo?.label}</span>
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusInfo?.color}`}>{statusInfo?.label}</span>
                                                {assignment.assignedAt && (
                                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">تاريخ التعيين: {assignment.assignedAt}</span>
                                                )}
                                                {assignment.acceptedAt && (
                                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">تاريخ القبول: {assignment.acceptedAt}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-green-600 min-w-[96px] text-right flex-shrink-0">{(assignment.amount !== undefined && assignment.amount !== null ? Number(assignment.amount) : 0).toLocaleString()} ريال</span>
                                                <button onClick={() => setEditingAssignment({ ...assignment, educator })} className="px-2 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">تعديل</button>
                                                {canCancel && (
                                                    <button
                                                        onClick={() => setCancelAction({ assignmentId: assignment.id, taskId: task.id })}
                                                        disabled={cancelAssignmentMutation.isPending}
                                                        title="سحب التعيين من المتخصص بالكامل"
                                                        className="px-2 py-1 text-xs font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60"
                                                    >
                                                        {cancelAssignmentMutation.isPending ? 'جارٍ الإلغاء...' : 'إلغاء التعيين'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {settledNote && (
                                            <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1.5 ps-8 ms-3">
                                                {settledNote}
                                            </p>
                                        )}
                                        {assignment.rejectionReason && (
                                            <p className="text-xs text-red-500 mt-1.5 ps-8 border-s-2 border-red-200 dark:border-red-800 ms-3 py-1">
                                                <span className="font-semibold">السبب: </span>{assignment.rejectionReason}
                                            </p>
                                        )}
                                        {assignment.agreementNotes && (
                                            <p className="text-xs text-gray-500 mt-1.5 ps-8 border-s-2 border-gray-200 dark:border-gray-600 ms-3 py-1">
                                                {assignment.agreementNotes}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {editingAssignment && (
                    <EditAssignmentModal isOpen={true} onClose={() => setEditingAssignment(null)} taskId={task.id} projectId={project?.id} assignment={{ ...editingAssignment, ...(editingLive ?? {}), educator: editingAssignment.educator }} />
                )}
                {editingTask && (
                    <EditTaskModal isOpen={true} onClose={() => setEditingTask(false)} task={task} onSave={async (taskData) => { await onUpdateTask(project.id, task.id, taskData); setEditingTask(false); }} />
                )}
                <div className="border-t dark:border-gray-700 p-4 flex flex-col sm:flex-row gap-2 justify-between items-center">
                    <button onClick={() => onAssignProviderClick(task)} className="w-full sm:w-auto flex-grow flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-yellow-800 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-200 dark:hover:bg-yellow-900 rounded-lg">
                        <PlusIcon className="w-5 h-5" /> تعيين متخصص
                    </button>
                    <div className="w-full sm:w-auto flex gap-2">
                        {taskStatusActions.map(action => (
                            <button
                                key={action.status}
                                onClick={() => setAction({ type: 'status', payload: action.status })}
                                disabled={task.status === action.status}
                                className="w-full sm:w-auto flex-grow px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 rounded-lg disabled:opacity-50"
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="border-t dark:border-gray-700 p-3 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-center text-xs text-gray-500">
                    <span>تاريخ الإنشاء: <strong>{task.creationDate}</strong></span>
                    <span>الموعد النهائي: <strong>{task.deadline}</strong></span>
                </div>
            </div>
        </>
    );
};


const ProjectDetailView: React.FC<ProjectDetailViewProps> = (props) => {
    const { project, bids, educators, educationalRequests, users, navigateTo, onAddTask, onUpdateProjectStatus, onToggleProjectPublication, isSavingProject, ...taskProps } = props;
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'attachments' | 'deliverables' | 'bids' | 'activity'>('tasks');
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
    const [confirmationAction, setConfirmationAction] = useState<{ type: 'status' | 'publication'; title: string; message: string; payload: any, confirmClass?: string } | null>(null);
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [taskToAssign, setTaskToAssign] = useState<Task | null>(null);
    const [isAssigning, setIsAssigning] = useState(false);


    const projectTasks = project.tasks || [];
    const completedTasks = projectTasks.filter(t => t.status === ProjectStatus.COMPLETED).length;
    const progress = projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0;

    const handleTaskSubmit = async (taskData: Omit<Task, 'id' | 'status' | 'assignments' | 'biddingStatus' | 'subTasks' | 'notes' | 'attachments' | 'activityLog' | 'creationDate' | 'deliverables'>) => {
        await onAddTask(project.id, taskData);
    };

    const handleStatusChangeRequest = (newStatus: ProjectStatus) => {
        setConfirmationAction({
            type: 'status',
            title: `تأكيد تغيير حالة المشروع إلى "${newStatus}"`,
            message: "سيتم توثيق هذا التغيير في سجل الأحداث.",
            payload: newStatus,
            confirmClass: newStatus === ProjectStatus.CANCELED ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-primary hover:bg-brand-primary/90'
        });
    };

    const handlePublicationToggleRequest = () => {
        setConfirmationAction({
            type: 'publication',
            title: project.isPublished ? 'إيقاف استقبال العروض' : 'نشر المشروع للعروض',
            message: project.isPublished ? 'سيتم إيقاف استقبال عروض جديدة.' : 'سيتم نشر المشروع للعامة لاستقبال العروض.',
            payload: null,
            confirmClass: project.isPublished ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
        });
    };

    const handleConfirmation = async (reason: string) => {
        if (!confirmationAction) return;
        try {
            if (confirmationAction.type === 'status') {
                await onUpdateProjectStatus(project.id, confirmationAction.payload, reason);
            } else if (confirmationAction.type === 'publication') {
                await onToggleProjectPublication(project.id, reason);
            }
            setConfirmationAction(null);
        } catch (err) {
            console.error("Action failed", err);
        }
    }

    const projectTeam = useMemo(
        () => resolveProjectTeam(project, educators),
        [project, educators]
    );

    const totalCost = useMemo(() => {
        return (project.tasks || [])
            .flatMap(t => (t.assignments || []))
            .filter(a => a.status === AssignmentStatus.ACCEPTED && a.amount)
            .reduce((sum, a) => sum + (a.amount || 0), 0);
    }, [project.tasks]);
    const financial: any = (project as any).financial || null;

    const linkedRequest = project.educationalRequestId ? educationalRequests.find(r => r.id === project.educationalRequestId) : null;
    const requester = linkedRequest ? users.find(u => u.id === linkedRequest.requesterId) : null;

    const openAssignModalForTask = (task: Task) => {
        setTaskToAssign(task);
        setAssignModalOpen(true);
    };

    const handleAssignSubmit = async (newAssignments: Omit<Assignment, 'id'>[]) => {
        if (!taskToAssign) return;
        setIsAssigning(true);
        try {
            await props.onAssignProvider(project.id, taskToAssign.id, newAssignments);
            setAssignModalOpen(false);
            setTaskToAssign(null);
        } finally {
            setIsAssigning(false);
        }
    };


    return (
        <>
            <AddTaskModal isOpen={isAddTaskModalOpen} onClose={() => setIsAddTaskModalOpen(false)} onAddTask={handleTaskSubmit} />
            {isEditProjectModalOpen && <EditProjectDetailsModal isOpen={true} onClose={() => setIsEditProjectModalOpen(false)} project={project} isSaving={isSavingProject} onSave={async (details) => { try { await props.onUpdateProjectDetails(project.id, details); setIsEditProjectModalOpen(false); } catch { } }} />}
            {isAssignModalOpen && <AssignProviderModal isOpen={true} onClose={() => setAssignModalOpen(false)} educators={educators} onAssign={handleAssignSubmit} isSubmitting={isAssigning} />}
            {confirmationAction && <ConfirmationModal
                isOpen={true}
                onClose={() => setConfirmationAction(null)}
                onConfirm={handleConfirmation}
                title={confirmationAction.title}
                message={confirmationAction.message}
                icon={confirmationAction.type === 'status' ? <EditIcon className="w-8 h-8" /> : <BidsIcon className="w-8 h-8" />}
                isReasonRequired={false}
                reasonLabel="سبب الإجراء (اختياري)"
                confirmButtonClass={confirmationAction.confirmClass}
            />}

            <div className="animate-fade-in min-w-0">
                <div className="mb-6">
                    <button onClick={() => navigateTo('projects')} className="flex items-center text-sm text-brand-primary dark:text-yellow-500 hover:underline mb-2">{language === 'ar' ? <ArrowRightIcon className="w-4 h-4 me-1" /> : <ArrowLeftIcon className="w-4 h-4 me-1" />} العودة إلى المشاريع</button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white break-words">{project.title}</h1>
                </div>

                <div className="flex min-w-0 flex-col lg:flex-row-reverse gap-8">
                    <aside className="lg:w-1/3 w-full min-w-0 space-y-6 lg:sticky lg:top-8">
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md border dark:border-gray-700">
                            <h3 className="font-bold mb-4">تقدم المشروع</h3>
                            <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                                <div className="bg-brand-primary h-4 rounded-full text-white text-xs flex items-center justify-center" style={{ width: `${progress}%` }}>
                                    {Math.round(progress)}%
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">{completedTasks} / {projectTasks.length} مهام مكتملة</div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md border dark:border-gray-700 space-y-4">
                            <h3 className="font-bold text-lg">إدارة المشروع</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">الحالة</span>
                                <div className="flex flex-wrap justify-end gap-1">
                                    {Object.values(ProjectStatus).map(s => (
                                        <button key={s} onClick={() => s !== project.status && handleStatusChangeRequest(s)} className={`px-2 py-1 text-xs font-bold rounded-md ${project.status === s ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}>{s}</button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => setIsEditProjectModalOpen(true)} className="w-full p-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                                <EditIcon className="w-5 h-5" /> {t('modals.editProjectTitle')}
                            </button>
                            {project.creationType === ProjectCreationType.PUBLIC && (
                                <button onClick={handlePublicationToggleRequest} className={`w-full p-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 ${project.isPublished ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                                    {project.isPublished ? <LockClosedIcon className="w-5 h-5" /> : <LockOpenIcon className="w-5 h-5" />}
                                    {project.isPublished ? 'إيقاف استقبال العروض' : 'نشر المشروع للعروض'}
                                </button>
                            )}
                        </div>

                        {linkedRequest && requester && (
                            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md border dark:border-gray-700">
                                <h3 className="font-bold mb-3 flex items-center"><LinkIcon className="w-5 h-5 me-2 text-gray-400" />طلب مرتبط</h3>
                                <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                                    <p className="font-semibold text-brand-primary hover:underline cursor-pointer" onClick={() => navigateTo('requestDetail', linkedRequest.id)}>{linkedRequest.title}</p>
                                    <p className="text-xs text-gray-500">مقدم من: {requester.name}</p>
                                </div>
                            </div>
                        )}

                        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-md border dark:border-gray-700">
                            <div className="flex items-center mb-3">
                                <UsersIcon className="w-5 h-5 me-2 text-gray-400" />
                                <h3 className="font-bold">فريق عمل المشروع ({projectTeam.length})</h3>
                            </div>
                            {projectTeam.length > 0 ? (
                                <div className="space-y-2">
                                    {projectTeam.slice(0, 4).map(e => (
                                        <div key={e.id} className="flex items-center gap-3">
                                            <Avatar src={e.avatarUrl} name={e.name} size={32} className="rounded-full" />
                                            <span className="text-sm font-semibold">{e.name}</span>
                                        </div>
                                    ))}
                                    {projectTeam.length > 4 && <p className="text-xs text-center text-gray-500">... و {projectTeam.length - 4} آخرون</p>}
                                </div>
                            ) : <p className="text-sm text-gray-400 text-center py-2">لم يتم تعيين فريق بعد.</p>}
                        </div>

                    </aside>
                    <main className="lg:w-2/3 w-full min-w-0">
                        <div className="mb-6 overflow-x-auto border-b border-gray-200 dark:border-gray-700">
                            <nav className="flex w-max min-w-full space-x-4 rtl:space-x-reverse -mb-px">
                                <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-2 px-3 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'overview' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}><TrendingUpIcon className="w-5 h-5" />نظرة عامة</button>
                                <button onClick={() => setActiveTab('tasks')} className={`flex items-center gap-2 px-3 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'tasks' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}><BriefcaseIcon className="w-5 h-5" />المهام ({projectTasks.length})</button>
                                <button onClick={() => setActiveTab('attachments')} className={`flex items-center gap-2 px-3 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'attachments' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}><PaperclipIcon className="w-5 h-5" />المرفقات</button>
                                {project.creationType === ProjectCreationType.PUBLIC && (
                                    <button onClick={() => setActiveTab('bids')} className={`flex items-center gap-2 px-3 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'bids' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}><BidsIcon className="w-5 h-5" />عروض المهام ({bids.length})</button>
                                )}
                                <button onClick={() => setActiveTab('deliverables')} className={`flex items-center gap-2 px-3 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'deliverables' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}><CheckCircleIcon className="w-5 h-5" />ملفات التسليم</button>
                                <button onClick={() => setActiveTab('activity')} className={`flex items-center gap-2 px-3 py-2 font-medium text-sm rounded-t-lg ${activeTab === 'activity' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}><ClockIcon className="w-5 h-5" />سجل الأحداث{(project.activityLog?.length ?? 0) > 0 && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-primary/15 text-brand-primary">{project.activityLog.length}</span>}</button>
                            </nav>
                        </div>

                        <div className="animate-fade-in space-y-6">
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border dark:border-gray-700">
                                        <h3 className="font-bold mb-3 flex items-center text-lg"><BookOpenIcon className="w-5 h-5 me-2 text-gray-400" />وصف المشروع</h3>
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{project.description}</p>
                                    </div>


                                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border dark:border-gray-700">
                                        <h3 className="font-bold mb-3 flex items-center text-lg"><DollarSignIcon className="w-5 h-5 me-2 text-gray-400" />التقرير المالي</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                                                <p className="text-sm text-gray-500">الميزانية المخصصة</p>
                                                <p className="text-2xl font-bold text-green-600">{(financial?.totalBudget ?? project.budget) ? `${Number(financial?.totalBudget ?? project.budget).toLocaleString()} ريال` : 'غير محدد'}</p>
                                            </div>
                                            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                                                <p className="text-sm text-gray-500">التكلفة الفعلية (المبالغ المعينة)</p>
                                                <p className="text-2xl font-bold text-brand-primary">{Number(financial?.assignedCost ?? totalCost).toLocaleString()} ريال</p>
                                            </div>
                                            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                                                <p className="text-sm text-gray-500">الميزانية المتبقية</p>
                                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{Number(financial?.remainingBudget ?? Math.max((project.budget || 0) - totalCost, 0)).toLocaleString()} ريال</p>
                                            </div>
                                            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                                                <p className="text-sm text-gray-500">نسبة الاستخدام</p>
                                                <p className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>{Number(financial?.utilizationPercentage ?? ((project.budget ? (totalCost / (project.budget || 1)) * 100 : 0))).toFixed(0)}%</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'tasks' && (
                                <div className="space-y-4">
                                    <div className="text-right mb-4">
                                        <button onClick={() => setIsAddTaskModalOpen(true)} className="flex items-center px-4 py-2 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors shadow-sm ml-auto">
                                            <PlusIcon className="w-4 h-4 me-2" /> إضافة مهمة جديدة
                                        </button>
                                    </div>
                                    {projectTasks.length > 0 ? (
                                        <div className="space-y-4">
                                            {projectTasks.map(task =>
                                                <TaskCard
                                                    key={task.id}
                                                    task={task}
                                                    project={project}
                                                    educators={educators}
                                                    navigateTo={navigateTo}
                                                    onDeleteTask={taskProps.onDeleteTask}
                                                    onUpdateTask={taskProps.onUpdateTask}
                                                    onUpdateTaskBiddingStatus={taskProps.onUpdateTaskBiddingStatus}
                                                    onUpdateTaskStatus={taskProps.onUpdateTaskStatus}
                                                    onAssignProviderClick={openAssignModalForTask}
                                                />
                                            )}
                                        </div>
                                    ) : <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed dark:border-gray-700"><p className="text-gray-500 dark:text-gray-400">لا توجد مهام مضافة لهذا المشروع بعد.</p><button onClick={() => setIsAddTaskModalOpen(true)} className="mt-4 text-brand-primary font-bold hover:underline">أضف المهمة الأولى</button></div>}
                                </div>
                            )}
                            {activeTab === 'attachments' && (
                                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border dark:border-gray-700">
                                    <ProjectAttachmentsTab projectId={project.id} />
                                </div>
                            )}
                            {activeTab === 'deliverables' && (
                                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border dark:border-gray-700">
                                    <ProjectDeliverablesTab projectId={project.id} />
                                </div>
                            )}
                            {activeTab === 'bids' && (
                                <BidsView
                                    project={project}
                                    bids={bids}
                                    educators={educators}
                                    navigateTo={navigateTo}
                                    onUpdateBidTaskStatus={props.onUpdateBidTaskStatus}
                                    onUpdateTaskBiddingStatus={props.onUpdateTaskBiddingStatus}
                                />
                            )}
                            {activeTab === 'activity' && (
                                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border dark:border-gray-700">
                                    <h3 className="font-bold mb-1 text-lg">سجل أحداث المشروع</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">توثيق تلقائي لكل عمليات المشروع: الإنشاء، التعديل، الحالات، النشر، المهام، التعيينات، العروض والمرفقات.</p>
                                    {(project.activityLog ?? []).length > 0 ? (
                                        <ol className="relative border-s border-gray-200 dark:border-gray-700 space-y-4 ps-4">
                                            {(project.activityLog ?? []).map((log: any) => {
                                                const key: string = log.messageKey ?? '';
                                                const isProject = key.startsWith('project.');
                                                const isBid = key.startsWith('bid.');
                                                const iconBg = isProject ? 'bg-brand-primary/15 text-brand-primary' : isBid ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300';
                                                return (
                                                    <li key={log.id} className="relative">
                                                        <span className={`absolute -start-[26px] top-0 w-6 h-6 rounded-full flex items-center justify-center ${iconBg}`}>
                                                            <ClockIcon className="w-3.5 h-3.5" />
                                                        </span>
                                                        <p className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed">{t(key || 'project.updated', log.messagePayload ?? {})}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            <span className="font-semibold">{log.actorName ?? log.actor ?? 'النظام'}</span>
                                                            {log.timestamp ? <span> • {log.timestamp}</span> : null}
                                                        </p>
                                                        {Boolean(log.messagePayload?.reason) && (
                                                            <p className="text-xs text-gray-500 mt-1 border-s-2 border-gray-200 dark:border-gray-600 ps-2">السبب: {log.messagePayload.reason}</p>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ol>
                                    ) : (
                                        <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                            <ClockIcon className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600" />
                                            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">لا توجد أحداث مسجلة لهذا المشروع بعد.</p>
                                            <p className="text-xs text-gray-400 mt-1">أي تعديل على المشروع أو مهامه أو تعييناته سيظهر هنا تلقائياً.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default ProjectDetailView;
