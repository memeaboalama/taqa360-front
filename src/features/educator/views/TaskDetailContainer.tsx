import React, { useMemo } from 'react';
import { Educator, Project, Task, ProjectStatus } from '../../../shared/types';
import { EducatorViewType } from '../../../shared/types';
import TaskDetailView from './TaskDetailView';
import { useEducatorTaskDetail, useCreateEducatorSubTask, useToggleEducatorSubTask, useUploadEducatorDeliverable, useDeleteEducatorDeliverable, useEducatorUpdateTaskStatus, useUpdateEducatorSubTask, useUploadEducatorSubTaskAttachment } from '../../../core/hooks/useEducatorQueries';
import { ProjectService } from '../../../features/projects/services/ProjectService';
import { useData } from '../../../app/providers/DataProvider';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface TaskDetailContainerProps {
  taskId: string;
  educator: Educator;
  navigateTo: (view: EducatorViewType, data?: any) => void;
}

const mapStatus = (s: string | undefined): ProjectStatus => {
  const v = (s || '').trim().toUpperCase().replace(/[-\s]+/g, '_');
  return (['PENDING','IN_PROGRESS','COMPLETED','CANCELED'] as const).includes(v as any) ? (v as ProjectStatus) : ProjectStatus.PENDING;
};

const TaskDetailContainer: React.FC<TaskDetailContainerProps> = ({ taskId, educator, navigateTo }) => {
  const detail = useEducatorTaskDetail(taskId);
  const { addToast } = useData();
  const { t } = useLanguage();

  const { mutateAsync: createSubTask } = useCreateEducatorSubTask();
  const { mutateAsync: toggleSubTask } = useToggleEducatorSubTask();
  const { mutateAsync: uploadDeliverable } = useUploadEducatorDeliverable();
  const { mutateAsync: deleteDeliverable } = useDeleteEducatorDeliverable();
  const { mutateAsync: updateStatus } = useEducatorUpdateTaskStatus();
  const { mutateAsync: updateSubTask } = useUpdateEducatorSubTask();
  const { mutateAsync: uploadSubTaskAttachment } = useUploadEducatorSubTaskAttachment();

  if (detail.isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="inline-block animate-spin rounded-full h-12 w-12 mb-4" style={{ borderBottom: '3px solid var(--primary-color)' }}></div>
      <span className="text-base font-medium text-slate-600 dark:text-slate-400">جاري تحميل بيانات المهمة</span>
    </div>
  );
  if (detail.error) return <div className="py-20 text-center text-red-500">فشل في تحميل تفاصيل المهمة</div>;

  const payload: any = detail.data as any;
  const apiTask: any = payload?.data?.task || payload?.task || payload || {};

  // Map API task to local types
  const project: Project = {
    id: apiTask.project?.id || '',
    title: apiTask.project?.title || '',
    description: '',
    status: mapStatus(apiTask.status),
    tags: [],
    budget: apiTask.budget ?? null,
    isPublished: true,
    tasks: [],
    creationType: 'PUBLIC',
    createdBy: '',
    createdAt: '',
    deadline: apiTask.deadline || null,
    educationalRequestId: null,
    activityLog: [],
    requesterName: ''
  } as any;

  const task: Task = {
    id: apiTask.id,
    title: apiTask.title,
    description: apiTask.description || '',
    status: mapStatus(apiTask.status),
    assignments: apiTask.assignedEducator ? [{
      id: apiTask.assignedEducator.id,
      educatorId: educator.id,
      type: apiTask.assignedEducator.assigned_type || 'DIRECT',
      status: apiTask.assignedEducator.status || 'PENDING',
      amount: apiTask.assignedEducator.amount ?? undefined,
    }] : [],
    budget: apiTask.budget ?? null,
    deadline: apiTask.deadline || '',
    isPublic: true,
    biddingStatus: 'CLOSED',
    subTasks: (apiTask.subTasks || []).map((st: any) => ({
      id: st.id,
      title: st.title,
      completed: !!st.completed,
      createdBy: st.createdBy?.type === 'Admin' ? 'admin' : 'provider',
      providerId: undefined,
      attachments: (st.attachments || []).map((a: any) => ({ id: a.id, title: a.title, name: a.name || a.original_name || a.title || 'file', url: a.url, size: String(a.size || ''), type: a.type || '' })),
      createdAt: st.createdAt,
      modifiedAt: st.modifiedAt || undefined
    })),
    attachments: (apiTask.attachments || []).filter((a: any) => !String(a.collection_name || '').toLowerCase().includes('deliverable')).map((a: any) => ({ id: a.id, title: a.title, name: a.name || a.original_name || a.title || 'file', url: a.url, size: String(a.size || ''), type: a.type || '' })),
    deliverables: (apiTask.attachments || []).filter((a: any) => String(a.collection_name || '').toLowerCase().includes('deliverable')).map((a: any) => ({ id: a.id, title: a.title, name: a.name || a.original_name || a.title || 'file', url: a.url, size: String(a.size || ''), type: a.type || '' })),
    notes: (apiTask.notes || []).map((n: any) => ({ id: n.id, content: n.content, createdAt: n.createdAt, createdBy: typeof n.createdBy === 'string' ? n.createdBy : (n.createdBy?.type === 'Admin' ? 'admin' : 'provider'), authorName: n.authorName || n.createdBy?.name || '', authorAvatar: n.authorAvatar || '' })),
    creationDate: apiTask.createdAt || '',
    activityLog: (apiTask.activityLog || []).map((lg: any) => ({ id: lg.id || lg.timestamp, messageKey: lg.messageKey || '', messagePayload: lg.messagePayload, actorName: lg.actorName || lg.actor?.name || '', timestamp: lg.timestamp })),
    modifiedAt: apiTask.modifiedAt || undefined,
    hasEducatorBidForTask: undefined,
    bidDetailForTask: undefined,
    externalSubTasks: []
  };

  const handleAddSubTask = async (_projectId: string, _taskId: string, title: string) => {
    await createSubTask({ taskId, title });
  };

  const handleToggleSubTask = async (_projectId: string, _taskId: string, subTaskId: string) => {
    await toggleSubTask({ taskId, subTaskId });
  };

  const handleAddDeliverable = async (_projectId: string, _taskId: string, deliverable: any) => {
    if (!deliverable?.file) return;
    try {
      await uploadDeliverable({ taskId, file: deliverable.file, title: deliverable.title });
      addToast && addToast(t('toasts.deliverableUploaded'));
    } catch (e: any) {
      addToast && addToast(e?.message || t('toasts.failedToUploadDeliverable'), 'error');
      throw e;
    }
  };

  const handleReplaceDeliverable = async (_projectId: string, _taskId: string, deliverableId: string, file: File, title: string) => {
    try {
      await uploadDeliverable({ taskId, file, title: title || file.name });
      await deleteDeliverable({ taskId, deliverableId });
      addToast && addToast(t('toasts.deliverableReplaced'));
    } catch (e: any) {
      addToast && addToast(e?.message || t('toasts.failedToReplaceDeliverable'), 'error');
      throw e;
    }
  };

  const handleDeleteDeliverable = async (_projectId: string, _taskId: string, deliverableId: string) => {
    try {
      await deleteDeliverable({ taskId, deliverableId });
      addToast && addToast(t('toasts.deliverableDeleted'));
    } catch (e: any) {
      addToast && addToast(e?.message || t('toasts.failedToDeleteDeliverable'), 'error');
    }
  };

  const handleAddNote = async (projectId: string, taskId: string, content: string) => {
    try {
      await ProjectService.addTaskNote(taskId, content);
      addToast && addToast(t('toasts.noteAdded'));
    } catch (e: any) {
      addToast && addToast(e?.message || t('toasts.failedToAddNote'), 'error');
    }
  };

  const handleUpdateTaskStatus = async (_projectId: string, _taskId: string, newStatus: ProjectStatus) => {
    try {
      await updateStatus({ taskId, status: newStatus });
      addToast && addToast(t('toasts.taskUpdated'));
    } catch (e: any) {
      addToast && addToast(e?.message || t('toasts.failedToCompleteTask'), 'error');
      throw e;
    }
  };

  const handleEditSubTask = async (_projectId: string, _taskId: string, subTaskId: string, newTitle: string) => {
    try {
      await updateSubTask({ taskId, subTaskId, title: newTitle });
      addToast && addToast(t('toasts.subtaskUpdated'));
    } catch (e: any) {
      addToast && addToast(e?.message || t('toasts.failedToUpdateSubTask'), 'error');
      throw e;
    }
  };

  const handleAddSubTaskAttachment = async (_projectId: string, _taskId: string, subTaskId: string, attachment: any) => {
    if (!attachment?.file) return;
    try {
      await uploadSubTaskAttachment({ taskId, subTaskId, file: attachment.file, title: attachment.title });
      addToast && addToast(t('toasts.attachmentAddedToSubtask'));
    } catch (e: any) {
      addToast && addToast(e?.message || t('toasts.failedToUploadAttachment'), 'error');
    }
  };

  return (
    <TaskDetailView
      project={project}
      task={task}
      educator={educator}
      navigateTo={navigateTo}
      onAddSubTask={handleAddSubTask}
      onToggleSubTask={handleToggleSubTask}
      onAddNote={(projectId: string, taskId: string, content: string) => handleAddNote(projectId, taskId, content)}
      onUpdateTaskStatus={handleUpdateTaskStatus}
      onUpdateTask={() => {}}
      onAddDeliverable={handleAddDeliverable}
      onEditDeliverable={handleReplaceDeliverable}
      onDeleteDeliverable={handleDeleteDeliverable}
      onAddSubTaskAttachment={handleAddSubTaskAttachment}
      onEditSubTask={handleEditSubTask}
    />
  );
};

export default TaskDetailContainer;
