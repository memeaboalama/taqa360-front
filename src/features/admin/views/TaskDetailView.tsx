import React, { useState, useMemo } from 'react';
import { Project, Task, Educator, SubTask, TaskNote, Attachment, ProjectStatus, Assignment, AssignmentStatus, ViewType, TaskActivityLog } from '../../../shared/types';
import { ArrowLeftIcon, ArrowRightIcon, BriefcaseIcon, CheckCircleIcon, PaperclipIcon, PlusIcon, SendIcon, ClipboardListIcon, UploadCloudIcon, ClockIcon, DollarSignIcon, CalendarDaysIcon, EditIcon, TrashIcon, CheckIcon, XCircleIcon, ChatBubbleLeftRightIcon } from '../../../shared/components/Icons';
import Avatar from '../../../shared/components/Avatar';
import ConfirmationModal from '../../../shared/components/modals/ConfirmationModal';
import { ADMIN_USER } from '../../../shared/constants';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface TaskDetailViewProps {
    project: Project;
    task: Task;
    educators: Educator[];
    navigateTo: (view: ViewType, id?: string | { projectId: string; taskId: string; } | null) => void;
    onAddSubTask: (projectId: string, taskId: string, title: string) => void;
    onToggleSubTask: (projectId: string, taskId: string, subTaskId: string) => void;
    onAddNote: (projectId: string, taskId: string, content: string) => void;
    onUpdateTask: (projectId: string, taskId: string, taskData: Partial<Task>) => void;
    onUpdateTaskStatus: (projectId: string, taskId: string, newStatus: ProjectStatus, reason: string) => void;
    onDeleteTask: (projectId: string, taskId: string, reason: string) => void;
    onAssignProvider: (projectId: string, taskId: string, newAssignments: Omit<Assignment, 'id'>[]) => void;
    onUpdateBiddingStatus: (projectId: string, taskId: string) => void;
    isAddingSubTask?: boolean;
    // New handlers for subtask editing and attachments
    onEditSubTask?: (projectId: string, taskId: string, subTaskId: string, newTitle: string) => void;
    onAddSubTaskAttachment?: (projectId: string, taskId: string, subTaskId: string, file: File, title?: string) => void;
    onDeleteSubTask?: (projectId: string, taskId: string, subTaskId: string) => void;
}

type EditableSidebarCard = 'status' | 'financials' | 'dates' | null;

const InfoCard: React.FC<{title: string, icon: React.ReactNode, children: React.ReactNode, action?: React.ReactNode, className?: string}> = ({title, icon, children, action, className}) => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border dark:border-gray-700 ${className}`}>
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <div className="flex items-center">
                <div className="text-gray-500 dark:text-gray-400">{icon}</div>
                <h3 className="font-bold text-gray-800 dark:text-white ms-3">{title}</h3>
            </div>
            {action && <div>{action}</div>}
        </div>
        <div className="p-4">{children}</div>
    </div>
);


const SubTaskItem: React.FC<{ subTask: SubTask, onToggle: () => void, onEdit?: (newTitle: string) => Promise<void> | void, onAddAttachment?: (file: File, title?: string) => Promise<void> | void, onDelete?: () => void, educators?: Educator[] }> = ({ subTask, onToggle, onEdit, onAddAttachment, onDelete, educators }) => {
    const { t } = useLanguage();
    const [isEditing, setIsEditing] = React.useState(false);
    const [title, setTitle] = React.useState(subTask.title);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isAdding, setIsAdding] = React.useState(false);
    const [isUploading, setIsUploading] = React.useState(false);
    const [newFiles, setNewFiles] = React.useState<File[]>([]);
    const [attTitle, setAttTitle] = React.useState('');
    const [attEditTitle, setAttEditTitle] = React.useState('');
    const [open, setOpen] = React.useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            setNewFiles(Array.from(e.target.files));
        }
    };

    const handleAddAttachments = async () => {
        if (newFiles.length === 0 || !attTitle.trim() || !onAddAttachment) return;
        setIsUploading(true);
        try {
            for (const file of newFiles) {
                await onAddAttachment(file, attTitle.trim());
            }
            setIsAdding(false);
            setNewFiles([]);
            setAttTitle('');
        } catch (e) {
            // error handled by parent
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveTitle = async () => {
        if (!title.trim()) return;
        setIsSaving(true);
        try {
            if (onEdit && title.trim() !== subTask.title) {
                await onEdit(title.trim());
            }
            if (newFiles.length > 0 && onAddAttachment) {
                setIsUploading(true);
                for (const file of newFiles) {
                    await onAddAttachment(file, attEditTitle.trim() || file.name);
                }
                setNewFiles([]);
                setAttEditTitle('');
                setIsUploading(false);
            }
        } finally {
            setIsSaving(false);
            setIsEditing(false);
        }
    };

    const creator = subTask.createdBy === 'admin' ? { name: t('taskDetail.admin'), avatarUrl: (ADMIN_USER && ADMIN_USER.avatarUrl) || '' } : (educators ? educators.find(e => e.id === subTask.providerId) : null);

    return (
        <div className="group">
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50">
                <input
                    type="checkbox"
                    id={`st-${subTask.id}`}
                    checked={subTask.completed}
                    onChange={onToggle}
                    className="w-5 h-5 text-brand-primary bg-gray-200 border-gray-300 rounded focus:ring-brand-primary me-3 cursor-pointer"
                />

                <div className="flex items-center flex-grow gap-3">
                    <div className="flex-grow">
                        {isEditing ? (
                            <div className="space-y-2 py-1 w-full">
                                <input value={title} onChange={e => setTitle(e.target.value)} disabled={isSaving || isUploading} onKeyDown={e => e.key === 'Enter' && handleSaveTitle()} className="w-full bg-white dark:bg-gray-800 p-1.5 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 outline-none focus:ring-1 focus:ring-brand-primary" autoFocus placeholder={t('taskDetail.subTaskTitle') || 'عنوان المهمة الفرعية'} />
                                {subTask.attachments && subTask.attachments.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-2">
                                        {subTask.attachments.map((att: any) => (
                                            <a href={att.url} target="_blank" rel="noopener noreferrer" key={att.id} className="flex items-center gap-1 text-xs text-brand-primary hover:underline">
                                                <PaperclipIcon className="w-3 h-3"/>
                                                <span className="font-semibold">{att.title || att.name}</span>
                                            </a>
                                        ))}
                                    </div>
                                )}
                                {newFiles.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs whitespace-nowrap font-semibold">{t('taskDetail.attachmentTitle') || 'اسم المرفق'} <span className="text-red-500">*</span></span>
                                        <input type="text" value={attEditTitle} onChange={e => setAttEditTitle(e.target.value)} disabled={isSaving || isUploading} placeholder={t('taskDetail.writeNote') || 'اكتب اسم المرفق'} className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs p-1.5 disabled:opacity-50 outline-none focus:ring-1 focus:ring-brand-primary" />
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <input type="file" multiple onChange={handleFileChange} disabled={isSaving || isUploading} className="block w-full text-xs file:mr-2 file:px-2 file:py-1 file:rounded file:bg-gray-200 file:border-0 dark:file:bg-gray-700 disabled:opacity-50 cursor-pointer" />
                                    <button onClick={() => { setIsEditing(false); setTitle(subTask.title); setNewFiles([]); setAttEditTitle(''); }} disabled={isSaving || isUploading} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50">
                                        {t('cancel') || 'إلغاء'}
                                    </button>
                                    <button onClick={handleSaveTitle} disabled={isSaving || isUploading || !title.trim() || (newFiles.length > 0 && !attEditTitle.trim())} className="px-3 py-1 bg-brand-primary text-white text-xs rounded hover:bg-brand-primary/90 disabled:opacity-50 flex items-center gap-1">
                                        {(isSaving || isUploading) && <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                        {t('save') || 'حفظ'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label htmlFor={`st-${subTask.id}`} className={`text-sm cursor-pointer ${subTask.completed ? 'line-through text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>
                                {subTask.title}
                            </label>
                        )}
                        <div className="text-xs text-gray-400 mt-1">{subTask.createdAt}{subTask.modifiedAt ? ` • ${t('taskDetail.lastModifiedPrefix', { date: subTask.modifiedAt })}` : ''}</div>
                    </div>

                    {!isEditing && (
                        <div className="flex items-center gap-2">
                            <button onClick={() => setOpen(prev => !prev)} title={open ? t('taskDetail.hideDetails') : t('taskDetail.showDetails')} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                                <span className="text-xs font-semibold">{t('taskDetail.attachmentsCount', { count: subTask.attachments?.length || 0 })}</span>
                            </button>
                            <div className="flex items-center gap-2">
                                {isSaving ? (
                                    <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <button onClick={() => setIsEditing(true)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><EditIcon className="w-4 h-4 text-gray-400"/></button>
                                )}
                                {onDelete && <button onClick={onDelete} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><TrashIcon className="w-4 h-4 text-gray-400"/></button>}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {open && (
                <div className="ms-8 ps-4 border-s-2 dark:border-gray-700 py-2 space-y-2 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        {creator ? (
                            <>
                                <Avatar src={creator.avatarUrl} name={creator.name} size={28} className="rounded-full" />
                                <span className="font-semibold ms-2">{creator.name}</span>
                                <span className="text-[11px] ms-2 px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded-full">{subTask.createdBy === 'admin' ? t('taskDetail.admin') : t('taskDetail.specialist')}</span>
                            </>
                        ) : (
                            <span className="text-xs text-gray-400">{t('taskDetail.creatorUnknown')}</span>
                        )}
                    </div>

                    {subTask.attachments && subTask.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                            {subTask.attachments.map((att: any) => (
                                <a href={att.url} target="_blank" rel="noopener noreferrer" key={att.id} className="flex items-center gap-2 text-xs text-brand-primary hover:underline">
                                    <PaperclipIcon className="w-3 h-3"/>
                                    <span className="font-semibold">{att.title || att.name}</span>
                                    <span className="text-gray-400">({att.size})</span>
                                </a>
                            ))}
                        </div>
                    )}

                    {!isAdding ? (
                        <button onClick={() => setIsAdding(true)} className="text-xs text-brand-primary flex items-center gap-1 mt-2"><PlusIcon className="w-3 h-3"/> {t('taskDetail.addAttachments')}</button>
                    ) : (
                        <div className="mt-2 space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs whitespace-nowrap font-semibold">{t('taskDetail.attachmentTitle')} <span className="text-red-500">*</span></span>
                                <input type="text" value={attTitle} onChange={e => setAttTitle(e.target.value)} disabled={isUploading} placeholder={t('taskDetail.writeNote')} className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs p-1.5 disabled:opacity-50" />
                                <input type="file" multiple onChange={handleFileChange} disabled={isUploading} className="text-xs file:mr-1 file:px-2 file:py-1 file:rounded file:bg-brand-primary/10 disabled:opacity-50" />
                            </div>
                            {newFiles.length > 0 && (
                                <div className="flex items-center justify-end gap-2">
                                    <span className="text-xs text-gray-500">{t('taskDetail.filesSelected', { count: newFiles.length })}</span>
                                    <button onClick={handleAddAttachments} disabled={isUploading || !attTitle.trim()} className="px-3 py-1.5 bg-brand-primary text-white rounded text-xs inline-flex items-center gap-1 disabled:opacity-50">
                                        {isUploading && (
                                            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        )}
                                        {t('taskDetail.save')}
                                    </button>
                                    <button onClick={() => { setIsAdding(false); setNewFiles([]); setAttTitle(''); }} disabled={isUploading} className="px-3 py-1.5 bg-gray-300 text-xs rounded disabled:opacity-50">{t('taskDetail.cancel')}</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

type ActiveTab = 'subTasks' | 'files' | 'notes' | 'activity';

const TabButton: React.FC<{
    id: ActiveTab;
    label: string;
    count?: number;
    icon: React.ReactNode;
    activeTab: ActiveTab;
    setActiveTab: (tab: ActiveTab) => void;
}> = ({ id, label, count, icon, activeTab, setActiveTab }) => {
    const isActive = activeTab === id;
    return (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center px-3 py-2 font-semibold text-sm rounded-t-lg transition-colors duration-200 group ${
                isActive
                    ? 'border-b-2 border-brand-primary text-brand-primary'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
            {icon}
            <span className="ms-2">{label}</span>
            {count !== undefined && (
                <span
                    className={`ms-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                        isActive
                            ? 'bg-yellow-100 dark:bg-yellow-900 text-brand-primary'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                    }`}
                >
                    {count}
                </span>
            )}
        </button>
    );
};

const TaskActivityItem: React.FC<{ log: TaskActivityLog }> = ({ log }) => {
    const { t } = useLanguage();
    const message = t(log.messageKey, log.messagePayload);
    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex-shrink-0 flex items-center justify-center text-brand-primary mt-0.5">
                <ClockIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-200">
                    {log.actorName && (
                        <span className="font-semibold text-gray-900 dark:text-white me-1">{log.actorName}:</span>
                    )}
                    {message || log.messageKey}
                </p>
                <time className="text-xs text-gray-400 mt-0.5 block">{log.timestamp}</time>
            </div>
        </div>
    );
};

const NoteItem: React.FC<{ note: TaskNote }> = ({ note }) => (
    <div className="flex items-start gap-3">
        <Avatar src={note.authorAvatar} name={note.authorName} size={40} />
        <div className="flex-grow p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <div className="flex justify-between items-center">
                <p className="font-bold text-sm text-gray-800 dark:text-white">{note.authorName}</p>
                <time className="text-xs text-gray-400">{note.createdAt}</time>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-line">{note.content}</p>
        </div>
    </div>
);

const AdminTaskDetailView: React.FC<TaskDetailViewProps> = (props) => {
    const { project, task, educators, navigateTo, onAddSubTask, onToggleSubTask, onAddNote, isAddingSubTask } = props;
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState<ActiveTab>('subTasks');
    const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
    const [newNoteContent, setNewNoteContent] = useState('');

    const progress = useMemo(() => {
        if (task.status === ProjectStatus.COMPLETED) return 100;
        if (!task.subTasks || task.subTasks.length === 0) return 0;
        const completed = task.subTasks.filter(st => st.completed).length;
        return (completed / task.subTasks.length) * 100;
    }, [task]);
    
    const handleAddSubTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newSubTaskTitle.trim()) {
            await onAddSubTask(project.id, task.id, newSubTaskTitle.trim());
            setNewSubTaskTitle('');
        }
    };
    
    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (newNoteContent.trim()) {
            onAddNote(project.id, task.id, newNoteContent.trim());
            setNewNoteContent('');
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 sm:mb-8">
                <div>
                    <button onClick={() => navigateTo('projectDetail', project.id)} className="flex items-center text-sm text-brand-primary dark:text-yellow-500 hover:underline mb-2">
                        {language === 'ar' ? <ArrowRightIcon className="w-4 h-4 me-1" /> : <ArrowLeftIcon className="w-4 h-4 me-1" />} {t('adminBidDetail.backToProject')}
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{task.title}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t('proposals.bidForProject')}: {project.title}</p>
                </div>
            </div>

            {/* Assigned educators summary */}
            <div className="mb-6">
                <h3 className="text-lg font-bold mb-3">{t('taskDetail.assignedSpecialists', { count: (task.assignedEducators || []).length })}</h3>
                {(task.assignedEducators || []).length === 0 ? (
                    <p className="text-sm text-gray-400">{t('taskDetail.noAssignedSpecialists')}</p>
                ) : (
                    <div className="space-y-3">
                        {(task.assignedEducators || []).map((assignment: any) => {
                            const educator = assignment.educator || educators?.find(e => e.id === (assignment as any).educatorId);
                            if(!educator) return null;
                            const rawStatus = String(assignment.status || '').toUpperCase();
                            const rawType = String(assignment.type || assignment.assigned_type || '').toUpperCase().replace(/[-\s]+/g, '_');
                            const statusBadge = rawStatus === 'ACCEPTED' ? 'bg-green-100 text-green-700' : rawStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
                            const typeBadge = rawType === 'DIRECT' ? 'bg-purple-100 text-purple-700' : rawType === 'INVITATION' ? 'bg-brand-primary/20 text-brand-primary' : 'bg-green-100 text-green-700';
                            const typeLabel = rawType === 'DIRECT' ? t('taskDetail.directAssignment') : rawType === 'INVITATION' ? t('assignmentType.INVITATION') : t('taskDetail.fromBid');
                            return (
                                <div key={assignment.id} className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <Avatar src={educator.avatarUrl} name={educator.name} size={48} className="rounded-full" />
                                        <div className="min-w-0">
                                            <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">{educator.name}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeBadge}`}>{typeLabel}</span>
                                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBadge}`}>{rawStatus === 'ACCEPTED' ? t('status.ACCEPTED') : rawStatus === 'PENDING' ? t('status.PENDING') : t('status.REJECTED')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right min-w-[140px]">
                                        {assignment.amount ? (
                                            <div className="font-bold text-green-600">{(assignment.amount).toLocaleString()} {t('taskDetail.sarCurrency')}</div>
                                        ) : null}
                                        {assignment.assignedAt || assignment.assigned_at ? (
                                            <div className="text-[10px] text-gray-400 mt-1 whitespace-nowrap">{t('taskDetail.assignmentDate', { date: assignment.assignedAt || assignment.assigned_at })}</div>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
                <aside className="lg:w-1/3 w-full space-y-6 lg:sticky lg:top-8 flex-shrink-0">
                    <InfoCard title={t('taskDetail.taskProgress')} icon={<BriefcaseIcon className="w-5 h-5"/>}>
                        <div className="flex justify-between text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
                            <span>{t('taskDetail.progress')}</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-slate-200/70 rounded-full h-2.5 dark:bg-slate-700">
                            <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    </InfoCard>
                    <InfoCard title={t('taskDetail.financialInfo')} icon={<DollarSignIcon className="w-5 h-5"/>}>
                       <div className="flex justify-between items-center text-sm">
                            <span className="font-semibold text-slate-600 dark:text-slate-300">{t('taskDetail.taskBudget')}</span>
                            <span className="font-bold text-green-600">{task.budget ? `${task.budget.toLocaleString()} ${t('taskDetail.sarCurrency')}` : t('taskDetail.notSet')}</span>
                        </div>
                    </InfoCard>
                    <InfoCard title={t('taskDetail.dates')} icon={<CalendarDaysIcon className="w-5 h-5"/>}>
                        <div className="text-sm space-y-2">
                            <div className="flex justify-between"><span>{t('taskDetail.creationDate')}:</span> <strong>{task.creationDate}</strong></div>
                            {task.modifiedAt && <div className="flex justify-between"><span>{t('taskDetail.lastModified')}:</span> <strong>{task.modifiedAt}</strong></div>}
                            <div className="flex justify-between"><span>{t('taskDetail.deadline')}:</span> <strong>{task.deadline && task.deadline > '1900-01-01' ? task.deadline : t('taskDetail.notSet')}</strong></div>
                        </div>
                    </InfoCard>
                </aside>

                <main className="lg:w-2/3 w-full">
                    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                        <nav className="flex space-x-2 rtl:space-x-reverse -mb-px overflow-x-auto" aria-label="Tabs">
                            <TabButton id="subTasks" label={t('taskDetail.subTasks')} count={(task.subTasks || []).length} icon={<ClipboardListIcon className="w-5 h-5"/>} activeTab={activeTab} setActiveTab={setActiveTab} />
                            <TabButton id="files" label={t('taskDetail.deliverables')} count={(task.deliverables || []).length} icon={<UploadCloudIcon className="w-5 h-5"/>} activeTab={activeTab} setActiveTab={setActiveTab} />
                            <TabButton id="notes" label={t('taskDetail.notes')} count={(task.notes || []).length} icon={<ChatBubbleLeftRightIcon className="w-5 h-5"/>} activeTab={activeTab} setActiveTab={setActiveTab} />
                            <TabButton id="activity" label={t('taskDetail.activityLog')} count={(task.activityLog || []).length} icon={<ClockIcon className="w-5 h-5"/>} activeTab={activeTab} setActiveTab={setActiveTab} />
                        </nav>
                    </div>

                    <div className="space-y-6">
                       {activeTab === 'subTasks' && (
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border dark:border-gray-700 p-4 sm:p-6 space-y-3">
                                {(task.subTasks || []).map(st => (
   <SubTaskItem
       key={st.id}
       subTask={st}
       educators={educators}
       onToggle={() => onToggleSubTask(project.id, task.id, st.id)}
       onEdit={(newTitle) => props.onEditSubTask && props.onEditSubTask(project.id, task.id, st.id, newTitle)}
       onAddAttachment={(file, title) => props.onAddSubTaskAttachment && props.onAddSubTaskAttachment(project.id, task.id, st.id, file, title)}
       onDelete={() => props.onDeleteSubTask && props.onDeleteSubTask(project.id, task.id, st.id)}
   />
))}
                               <form onSubmit={handleAddSubTask} className="flex items-center gap-2 pt-3">
                                    <input type="text" value={newSubTaskTitle} onChange={e => setNewSubTaskTitle(e.target.value)} disabled={isAddingSubTask} placeholder={t('taskDetail.addNewSubTask')} className="w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md text-sm p-2 disabled:opacity-50 disabled:cursor-not-allowed" />
                                    <button type="submit" disabled={!newSubTaskTitle.trim() || isAddingSubTask} className="p-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 disabled:bg-slate-400 disabled:cursor-not-allowed">
                                        {isAddingSubTask ? (
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            <PlusIcon className="w-5 h-5"/>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}
                        {activeTab === 'files' && (
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border dark:border-gray-700 p-4 sm:p-6">
                                {(task.deliverables || []).length === 0 ? (
                                    <p className="text-center text-sm text-gray-500 py-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">{t('taskDetail.noDeliverables')}</p>
                                ) : (
                                    <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {(task.deliverables || []).map((d: any) => (
                                            <li key={d.id} className="py-3 flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-sm text-gray-800 dark:text-white truncate">{d.original_name || d.name || d.title}</p>
                                                    {d.size !== undefined && d.size !== null && d.size !== '' && (
                                                        <p className="text-xs text-gray-500 mt-0.5">{typeof d.size === 'number' ? `${d.size} MB` : d.size}</p>
                                                    )}
                                                </div>
                                                {d.url && (
                                                    <a href={d.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200">
                                                        {t('taskDetail.openFile')}
                                                    </a>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                        {activeTab === 'notes' && (
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border dark:border-gray-700 p-4 sm:p-6 space-y-4">
                                {(task.notes || []).length === 0 ? (
                                    <p className="text-center text-sm text-gray-500 py-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">{t('taskDetail.noNotes')}</p>
                                ) : (
                                    (task.notes || []).map(note => <NoteItem key={note.id} note={note} />)
                                )}
                               <form onSubmit={handleAddNote} className="flex items-center gap-3 pt-3">
                                   <Avatar src={ADMIN_USER.avatarUrl} name={ADMIN_USER.name} size={40} />
                                    <input type="text" value={newNoteContent} onChange={e => setNewNoteContent(e.target.value)} placeholder={t('taskDetail.writeNote')} className="w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md text-sm p-2" />
                                   <button type="submit" disabled={!newNoteContent.trim()} className="p-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 disabled:bg-slate-400 disabled:cursor-not-allowed"><SendIcon className="w-5 h-5"/></button>
                               </form>
                            </div>
                        )}
                        {activeTab === 'activity' && (
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border dark:border-gray-700 p-4 sm:p-6 space-y-4">
                                {(task.activityLog || []).length === 0 ? (
                                    <p className="text-center text-sm text-gray-500 py-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">{t('taskDetail.noActivity')}</p>
                                ) : (
                                    (task.activityLog || []).map(log => <TaskActivityItem key={log.id} log={log} />)
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminTaskDetailView;
