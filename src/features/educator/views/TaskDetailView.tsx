import React, { useState, useMemo } from 'react';
import { Project, Task, Educator, SubTask, TaskNote, Attachment, ProjectStatus, TaskActivityLog } from '../../../shared/types';
import { EducatorViewType } from '../../../shared/types';
import { ArrowLeftIcon, ArrowRightIcon, BriefcaseIcon, CheckCircleIcon, PaperclipIcon, PlusIcon, SendIcon, ClipboardListIcon, UploadCloudIcon, ClockIcon, DollarSignIcon, CalendarIcon, EditIcon, TrashIcon, CheckIcon, XCircleIcon, ChatBubbleLeftRightIcon } from '../../../shared/components/Icons';
import Avatar from '../../../shared/components/Avatar';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { ADMIN_USER } from '../../../shared/constants';

interface TaskDetailViewProps {
    project: Project;
    task: Task;
    educator: Educator;
    navigateTo: (view: EducatorViewType, data?: any) => void;
    onAddSubTask: (projectId: string, taskId: string, title: string) => void;
    onToggleSubTask: (projectId: string, taskId: string, subTaskId: string) => void;
    onAddNote: (projectId: string, taskId: string, content: string) => void;
    onUpdateTaskStatus: (projectId: string, taskId: string, newStatus: ProjectStatus) => void | Promise<void>;
    onUpdateTask: (projectId: string, taskId: string, taskData: Partial<Task>) => void;
    onAddDeliverable: (projectId: string, taskId: string, deliverable: Omit<Attachment, 'id'>) => void | Promise<void>;
    onEditDeliverable: (projectId: string, taskId: string, deliverableId: string, file: File, title: string) => void | Promise<void>;
    onDeleteDeliverable: (projectId: string, taskId: string, deliverableId: string) => void | Promise<void>;
    onAddSubTaskAttachment: (projectId: string, taskId: string, subTaskId: string, attachment: Omit<Attachment, 'id'>) => void;
    onEditSubTask: (projectId: string, taskId: string, subTaskId: string, newTitle: string) => void;
}

const InfoCard: React.FC<{title: string, icon: React.ReactNode, children: React.ReactNode, action?: React.ReactNode, className?: string}> = ({title, icon, children, action, className}) => (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 ${className}`}>
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center">
                <div className="text-slate-500 dark:text-slate-400">{icon}</div>
                <h3 className="font-bold text-slate-900 dark:text-white ms-3">{title}</h3>
            </div>
            {action}
        </div>
        <div className="p-4">{children}</div>
    </div>
);

const TaskActivityItem: React.FC<{ log: TaskActivityLog }> = ({ log }) => {
    const { t } = useLanguage();
    const message = t(log.messageKey, log.messagePayload);
    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 flex-shrink-0 flex items-center justify-center text-brand-primary mt-0.5">
                <ClockIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 dark:text-slate-200">
                    {log.actorName && (
                        <span className="font-semibold text-slate-900 dark:text-white me-1">{log.actorName}:</span>
                    )}
                    {message || log.messageKey}
                </p>
                <time className="text-xs text-slate-400 mt-0.5 block">{log.timestamp}</time>
            </div>
        </div>
    );
};

const NoteItem: React.FC<{ note: TaskNote }> = ({ note }) => (
    <div className="flex items-start gap-3">
        <Avatar src={note.authorAvatar} name={note.authorName} size={40} />
        <div className="flex-grow p-3 bg-slate-100 dark:bg-slate-900 rounded-lg">
            <div className="flex justify-between items-center">
                <p className="font-bold text-sm text-slate-800 dark:text-white">{note.authorName}</p>
                <time className="text-xs text-slate-400">{note.createdAt}</time>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-line">{note.content}</p>
        </div>
    </div>
);

const DeliverableItem: React.FC<{ deliverable: Attachment; disabled?: boolean; onEdit: (id: string, file: File, title: string) => void | Promise<void>; onDelete: (id: string) => void | Promise<void>; }> = ({ deliverable, disabled, onEdit, onDelete }) => {
    const { t } = useLanguage();
    const [isEditing, setIsEditing] = useState(false);
    const [replacementFile, setReplacementFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleReplace = async () => {
        if (!replacementFile || isSaving) return;
        setIsSaving(true);
        try {
            await onEdit(deliverable.id, replacementFile, replacementFile.name);
            setIsEditing(false);
            setReplacementFile(null);
        } catch {
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-lg">
            {isEditing ? (
                <div className="space-y-2">
                    <input
                        type="file"
                        disabled={isSaving}
                        onChange={e => setReplacementFile(e.target.files?.[0] || null)}
                        className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-primary/10 dark:file:bg-brand-primary/20 file:text-brand-primary dark:file:text-brand-accent hover:file:bg-brand-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <div className="flex items-center gap-2">
                        <button onClick={handleReplace} disabled={!replacementFile || isSaving} className="text-xs px-2 py-1 bg-brand-primary text-white rounded-md disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center gap-1">
                            {isSaving && <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                            {t('taskDetail.upload')}
                        </button>
                        <button onClick={() => setIsEditing(false)} disabled={isSaving} className="text-xs px-2 py-1 bg-slate-400 text-white rounded-md disabled:opacity-50">{t('taskDetail.cancel')}</button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-200">{deliverable.title || deliverable.name}</p>
                        <a href={deliverable.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-primary dark:text-brand-accent hover:underline">{deliverable.name} ({deliverable.size})</a>
                    </div>
                    <div className="flex items-center gap-2">
                        {!disabled && (
                            <>
                                <button onClick={() => setIsEditing(true)} title={t('taskDetail.replaceDeliverable')}><EditIcon className="w-4 h-4 text-slate-400 hover:text-brand-primary"/></button>
                                <button onClick={() => onDelete(deliverable.id)} title={t('taskDetail.deleteDeliverable')}><TrashIcon className="w-4 h-4 text-slate-400 hover:text-red-500"/></button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const SubTaskItem: React.FC<{
    subTask: SubTask;
    disabled?: boolean;
    onToggle: () => void;
    onEditSubTask: (subTaskId: string, newTitle: string) => void | Promise<void>;
    onAddAttachment: (subTaskId: string, attachment: Omit<Attachment, 'id'>) => void;
}> = (props) => {
    const { subTask, disabled, onToggle, onEditSubTask, onAddAttachment } = props;
    const [isAdding, setIsAdding] = useState(false);
    const [newAttachment, setNewAttachment] = useState<{ file: File | null, title: string }>({ file: null, title: '' });
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isSavingTitle, setIsSavingTitle] = useState(false);
    const [newTitle, setNewTitle] = useState(subTask.title);
    const [isUploading, setIsUploading] = useState(false);
    const { t } = useLanguage();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setNewAttachment({ file, title: file.name });
        }
    };

    const handleAddAttachment = async () => {
        if (newAttachment.file && !isUploading) {
            setIsUploading(true);
            try {
                await onAddAttachment(subTask.id, {
                    title: newAttachment.title,
                    name: newAttachment.file.name,
                    size: `${(newAttachment.file.size / 1024).toFixed(1)} KB`,
                    type: newAttachment.file.type,
                    url: '#',
                    uploadedBy: 'provider' as const,
                    file: newAttachment.file,
                });
                setIsAdding(false);
                setNewAttachment({ file: null, title: '' });
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleSaveTitle = async () => {
        if (isSavingTitle) return;
        const trimmed = newTitle.trim();
        if (!trimmed || trimmed === subTask.title) {
            setIsEditingTitle(false);
            return;
        }
        setIsSavingTitle(true);
        try {
            await onEditSubTask(subTask.id, trimmed);
            setIsEditingTitle(false);
        } catch {
        } finally {
            setIsSavingTitle(false);
        }
    }
    const creatorLabel = subTask.createdBy === 'admin' ? t('taskDetail.admin') : t('taskDetail.educator');

    return (
        <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-lg">
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    checked={subTask.completed}
                    disabled={disabled}
                    onChange={onToggle}
                    className="w-5 h-5 text-brand-primary bg-gray-200 border-gray-300 rounded focus:ring-brand-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                />
                {isEditingTitle ? (
                    <input type="text" value={newTitle} disabled={isSavingTitle} onChange={e => setNewTitle(e.target.value)} onBlur={handleSaveTitle} onKeyDown={e => e.key === 'Enter' && handleSaveTitle()} autoFocus className="flex-grow bg-white dark:bg-slate-800 p-1 border rounded-md text-sm disabled:opacity-60" />
                ) : (
                    <label className={`flex-grow text-sm cursor-pointer ${subTask.completed ? 'line-through text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                        {subTask.title}
                    </label>
                )}
                 <div className="flex items-center gap-1">
                    {isEditingTitle ? (
                        <>
                            <button onClick={handleSaveTitle} disabled={isSavingTitle} className="p-1 rounded-full hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isSavingTitle ? <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent"></span> : <CheckIcon className="w-4 h-4 text-green-600"/>}
                            </button>
                            <button onClick={() => setIsEditingTitle(false)} disabled={isSavingTitle} className="p-1 rounded-full hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"><XCircleIcon className="w-4 h-4 text-red-600"/></button>
                        </>
                    ) : (
                        !disabled && (
                            <button onClick={() => setIsEditingTitle(true)} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><EditIcon className="w-4 h-4 text-slate-400"/></button>
                        )
                    )}
                </div>
            </div>
            <div className="ms-8 mt-1 text-xs text-slate-400">
                <span>{t('taskDetail.createdAt')}: {subTask.createdAt}</span>
                {subTask.modifiedAt && <span className="ms-2">({t('taskDetail.lastEdit')}: {subTask.modifiedAt})</span>}
            </div>

            <div className="ms-8 mt-2">
                <div className="flex items-center gap-2">
                    <Avatar name={creatorLabel} size={28} />
                    <span className="text-xs font-semibold">{creatorLabel}</span>
                </div>

                {subTask.attachments && subTask.attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        {subTask.attachments.map(att => (
                            <a key={att.id} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-brand-primary dark:text-brand-accent hover:underline bg-slate-200 dark:bg-slate-700 rounded-md px-2 py-1">
                                <PaperclipIcon className="w-3 h-3"/>
                                <span className="font-semibold">{att.title || att.name}</span>
                                {att.size ? <span className="text-slate-400">({att.size})</span> : null}
                            </a>
                        ))}
                    </div>
                )}

                {!disabled && (!isAdding ? (
                     <button onClick={() => setIsAdding(true)} className="mt-2 text-xs flex items-center gap-1 text-brand-primary hover:underline"><PlusIcon className="w-3 h-3"/>{t('taskDetail.addAttachment')}</button>
                ) : (
                    <div className="mt-2 p-2 bg-slate-200 dark:bg-slate-700 rounded-md space-y-2">
                         <input type="file" onChange={handleFileChange} className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-primary/10 dark:file:bg-brand-primary/20 file:text-brand-primary dark:file:text-brand-accent hover:file:bg-brand-primary/20" />
                        {newAttachment.file && (
                            <div className="flex items-center gap-2">
                                <input type="text" value={newAttachment.title} onChange={(e) => setNewAttachment(a => ({...a, title: e.target.value}))} placeholder={t('taskDetail.attachmentTitle')} className="w-full text-xs p-1 rounded-md"/>
                                <button onClick={handleAddAttachment} disabled={isUploading} className="text-xs px-2 py-1 bg-brand-primary text-white rounded-md disabled:opacity-50 flex items-center gap-1">
                                    {isUploading && <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                    {t('taskDetail.save')}
                                </button>
                                <button onClick={() => setIsAdding(false)} disabled={isUploading} className="text-xs px-2 py-1 bg-slate-400 text-white rounded-md">{t('taskDetail.cancel')}</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const TaskDetailView: React.FC<TaskDetailViewProps> = (props) => {
    const { project, task, onAddSubTask, onToggleSubTask, onUpdateTaskStatus, onAddNote, onAddDeliverable, onEditDeliverable, onDeleteDeliverable, onEditSubTask, onAddSubTaskAttachment } = props;
    const { t, language } = useLanguage();
    const BackIcon = language === 'ar' ? ArrowRightIcon : ArrowLeftIcon;
    const isCompleted = task.status === ProjectStatus.COMPLETED;

    // The task payload carries only this specialist's own assignment (the
    // backend filters it by auth()->id()), so this single entry decides what the
    // page may do. Until it is accepted the task is read-only: a pending
    // invitation, a rejected one or a cancelled one must not expose any action.
    const myAssignment = (task.assignments || [])[0] as any;
    const isAssignmentAccepted =
        String(myAssignment?.status ?? '').trim().toUpperCase() === 'ACCEPTED';
    const canAct = isAssignmentAccepted && !isCompleted;

    const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
    const [newDeliverable, setNewDeliverable] = useState<{ file: File | null, title: string }>({ file: null, title: '' });
    const [isUploadingDeliverable, setIsUploadingDeliverable] = useState(false);
    const [isCompletingTask, setIsCompletingTask] = useState(false);
    const [newNoteContent, setNewNoteContent] = useState('');

    if (!task) {
        return (
            <div className="p-6">
                <button onClick={() => props.navigateTo('tasks')} className="text-brand-primary hover:underline text-sm mb-3">{t('taskDetail.goBackToTasks')}</button>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('taskDetail.taskNotFound') || 'لم يتم العثور على المهمة'}</h2>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">{t('taskDetail.taskNotFoundHelp') || 'ربما تمت إزالتها أو لم تعد متاحة.'}</p>
                </div>
            </div>
        );
    }

    const progress = useMemo(() => {
        if (task.status === ProjectStatus.COMPLETED) return 100;
        if (!task.subTasks || task.subTasks.length === 0) return 0;
        const completed = task.subTasks.filter(st => st.completed).length;
        return (completed / task.subTasks.length) * 100;
    }, [task]);

    const handleAddSubTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSubTaskTitle.trim()) {
            onAddSubTask(project.id, task.id, newSubTaskTitle.trim());
            setNewSubTaskTitle('');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewDeliverable({ file, title: newDeliverable.title || file.name.split('.').slice(0, -1).join('.') });
        }
    };

    const handleAddDeliverable = async () => {
        if (!newDeliverable.file || isUploadingDeliverable) return;
        const deliverableData = {
            title: newDeliverable.title,
            name: newDeliverable.file.name,
            size: `${(newDeliverable.file.size / 1024 / 1024).toFixed(2)} MB`,
            type: newDeliverable.file.type,
            url: '#',
            uploadedBy: 'provider' as const,
            file: newDeliverable.file,
        };
        setIsUploadingDeliverable(true);
        try {
            await onAddDeliverable(project.id, task.id, deliverableData);
            setNewDeliverable({ file: null, title: '' });
        } catch {
        } finally {
            setIsUploadingDeliverable(false);
        }
    };

    const handleCompleteTask = async () => {
        if (isCompletingTask) return;
        setIsCompletingTask(true);
        try {
            await onUpdateTaskStatus(project.id, task.id, ProjectStatus.COMPLETED);
        } catch {
        } finally {
            setIsCompletingTask(false);
        }
    };

    const handleAddNote = async () => {
        if (!newNoteContent.trim()) return;
        await onAddNote(project.id, task.id, newNoteContent.trim());
        setNewNoteContent('');
    };

    const totalAssignedAmount = task.assignments?.find(a => a.educatorId === props.educator.id)?.amount || 0;

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 sm:mb-8">
                <div>
                    <button onClick={() => props.navigateTo('tasks')} className="flex items-center text-sm text-brand-primary dark:text-brand-accent hover:underline mb-2">
                        <BackIcon className="w-4 h-4 me-1" /> {t('taskDetail.goBackToTasks')}
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{task.title}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t('taskDetail.partOfProject')}: {project.title}</p>
                </div>
                <button
                    onClick={handleCompleteTask}
                    disabled={!canAct || isCompletingTask}
                    title={!isAssignmentAccepted ? 'متاح بعد قبول التعيين فقط' : undefined}
                    className="w-full sm:w-auto p-2 sm:p-3 text-sm sm:text-base font-bold bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
                >
                    {isCompletingTask ? (
                        <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                        <CheckCircleIcon className="h-6 w-6"/>
                    )}
                    {isCompleted ? t('taskDetail.taskCompleted') : t('taskDetail.completeTask')}
                </button>
            </div>

            {!isAssignmentAccepted && (
                <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
                    <span className="font-semibold">هذه المهمة للعرض فقط.</span>{' '}
                    {myAssignment
                        ? 'لم يتم قبول التعيين بعد، لذا جميع الإجراءات (تعديل المهام الفرعية، رفع المخرجات، وإنهاء المهمة) معطّلة.'
                        : 'لا يوجد لديك تعيين على هذه المهمة، لذا لا تتوفر أي إجراءات.'}
                </div>
            )}

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
                        <div className="space-y-3 text-sm">
                             <div className="flex justify-between items-center">
                                <span className="font-semibold text-slate-600 dark:text-slate-300">{t('taskDetail.taskBudget')}</span>
                                <span className="font-bold text-green-600">{task.budget ? `${task.budget.toLocaleString()} ${t('taskDetail.sarCurrency')}` : t('taskDetail.notSet')}</span>
                            </div>
                            <div className="flex justify-between items-center text-brand-primary dark:text-brand-accent pt-2 border-t dark:border-slate-600">
                                <span className="font-semibold">{t('taskDetail.agreedAmount')}</span>
                                <span className="font-bold">{totalAssignedAmount.toLocaleString()} {t('taskDetail.sarCurrency')}</span>
                            </div>
                        </div>
                    </InfoCard>

                     <InfoCard title={t('taskDetail.dates')} icon={<CalendarIcon className="w-5 h-5"/>}>
                        <div className="text-sm space-y-2">
                            <div className="flex justify-between"><span>{t('taskDetail.creationDate')}:</span> <strong className="font-mono">{task.creationDate}</strong></div>
                            {task.modifiedAt && <div className="flex justify-between"><span>{t('taskDetail.lastModified')}:</span> <strong className="font-mono">{task.modifiedAt}</strong></div>}
                            <div className="flex justify-between"><span>{t('taskDetail.deadline')}:</span> <strong className="font-mono">{task.deadline}</strong></div>
                        </div>
                    </InfoCard>
                    
                     <InfoCard title={t('taskDetail.attachments')} icon={<PaperclipIcon className="w-5 h-5"/>}>
                        {(task.attachments?.length ?? 0) > 0 ? (
                            <ul className="space-y-2">
                               {task.attachments?.map(att => <li key={att.id}><a href={att.url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-primary dark:text-brand-accent hover:underline">{att.name}</a></li>)}
                            </ul>
                        ) : <p className="text-sm text-slate-500 dark:text-slate-400 text-center">{t('taskDetail.noAttachments')}</p>}
                    </InfoCard>
                </aside>
                
                <main className="lg:w-2/3 w-full space-y-6">
                    <InfoCard title={t('taskDetail.taskDescription')} icon={<BriefcaseIcon className="w-5 h-5"/>}>
                       <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{task.description}</p>
                    </InfoCard>
                    
                    <InfoCard title={t('taskDetail.subTasksList')} icon={<ClipboardListIcon className="w-5 h-5"/>}>
                        <div className="space-y-3">
                           {(task.subTasks || []).map(st =>
                                <SubTaskItem
                                    key={st.id}
                                    subTask={st}
                                    disabled={!canAct}
                                    onToggle={() => onToggleSubTask(project.id, task.id, st.id)}
                                    onEditSubTask={onEditSubTask.bind(null, project.id, task.id)}
                                    onAddAttachment={onAddSubTaskAttachment.bind(null, project.id, task.id)}
                                />
                            )}
                            {canAct && (
                                <form onSubmit={handleAddSubTask} className="flex items-center gap-2 pt-3">
                                    <input type="text" value={newSubTaskTitle} onChange={e => setNewSubTaskTitle(e.target.value)} placeholder={t('taskDetail.addNewSubTask')} className="w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md text-sm p-2" />
                                    <button type="submit" disabled={!newSubTaskTitle.trim()} className="p-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary/90 disabled:bg-slate-400 disabled:cursor-not-allowed"><PlusIcon className="w-5 h-5"/></button>
                                </form>
                            )}
                        </div>
                    </InfoCard>
                    
                    <InfoCard title={t('taskDetail.finalDeliverables')} icon={<UploadCloudIcon className="w-5 h-5"/>}>
                        <div className="space-y-3 mb-4">
                            {(task.deliverables || []).map(d => <DeliverableItem key={d.id} deliverable={d} disabled={!canAct} onEdit={(id, file, title) => onEditDeliverable(project.id, task.id, id, file, title)} onDelete={(id) => onDeleteDeliverable(project.id, task.id, id)}/>)}
                        </div>
                        {canAct && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-2 border border-slate-200 dark:border-slate-700">
                             <input type="file" onChange={handleFileUpload} disabled={isUploadingDeliverable} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 dark:file:bg-brand-primary/20 file:text-brand-primary dark:file:text-brand-accent hover:file:bg-brand-primary/20 dark:hover:file:bg-brand-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"/>
                             {newDeliverable.file &&
                                <div className="flex gap-2">
                                     <input type="text" value={newDeliverable.title} disabled={isUploadingDeliverable} onChange={e => setNewDeliverable(d => ({...d, title: e.target.value}))} placeholder={t('taskDetail.attachmentTitle')} className="w-full bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md text-sm p-2 disabled:opacity-60" />
                                     <button onClick={handleAddDeliverable} disabled={isUploadingDeliverable} className="px-3 bg-brand-primary text-white rounded-md text-sm font-semibold hover:bg-brand-primary/90 flex items-center gap-1 disabled:bg-slate-400 disabled:cursor-not-allowed">
                                        {isUploadingDeliverable && <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                        {t('taskDetail.upload')}
                                     </button>
                                 </div>
                              }
                        </div>
                        )}
                    </InfoCard>

<InfoCard title={t('taskDetail.notes')} icon={<ChatBubbleLeftRightIcon className="w-5 h-5"/>}>
                        {(task.notes || []).length > 0 ? (
                            <div className="space-y-3">
                                {(task.notes || []).map(note => <NoteItem key={note.id} note={note} />)}
                            </div>
                        ) : canAct ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Avatar src={ADMIN_USER.avatarUrl} name={ADMIN_USER.name} size={40} />
                                    <input
                                        type="text"
                                        value={newNoteContent}
                                        onChange={e => setNewNoteContent(e.target.value)}
                                        placeholder={t('taskDetail.writeNote')}
                                        className="w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md text-sm p-2"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddNote}
                                        disabled={!newNoteContent.trim()}
                                        className="px-3 py-2 bg-brand-primary text-white rounded-md text-sm hover:bg-brand-primary/90 disabled:bg-slate-400 disabled:cursor-not-allowed">
                                        <SendIcon className="w-4 h-4"/>
                                        {t('taskDetail.addNote')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-4 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">{t('taskDetail.noNotes')}</p>
                        )}
                    </InfoCard>

                    <InfoCard title={t('taskDetail.activityLog')} icon={<ClockIcon className="w-5 h-5"/>}>
                        {(task.activityLog || []).length === 0 ? (
                            <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-4 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">{t('taskDetail.noActivity')}</p>
                        ) : (
                            <div className="space-y-4">
                                {(task.activityLog || []).map(log => <TaskActivityItem key={log.id} log={log} />)}
                            </div>
                        )}
                    </InfoCard>
                </main>
            </div>
        </div>
    );
};

export default TaskDetailView;
