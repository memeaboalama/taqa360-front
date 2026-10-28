import React, { useMemo } from 'react';
import AdminTaskDetailView from './TaskDetailView';
import { ViewType, AssignmentType } from '../../../shared/types';
import { useAdminProject, useAdminEducators, useCreateSubTask, useToggleSubTaskComplete, useUpdateTask, useChangeTaskStatus, useDeleteTask, useAssignTaskEducators, useAdminTask, useUpdateSubTask, useUploadSubTaskAttachment, useDeleteSubTask, useOpenTaskBidding, useCloseTaskBidding, useCreateTaskNote } from '../../../core/hooks/useAdminQueries';
import { useData } from '../../../app/providers/DataProvider';
import { useLanguage } from '../../../app/providers/LanguageProvider';

interface Props {
  projectId: string;
  taskId: string;
  navigateTo: (view: ViewType, id?: any) => void;
}

function unwrapProject(payload: any) {
  if (!payload || typeof payload !== 'object') return payload;
  const dataNode = payload.data ?? payload;
  const project = 'project' in (dataNode || {}) ? dataNode.project : dataNode;
  return project;
}

function normalizeProject(pInput: any) {
  const p = unwrapProject(pInput);
  if (!p) return p;
  const tasks = Array.isArray(p.tasks) ? p.tasks.map((t: any) => ({
    ...t,
    id: t.id,
    title: t.title || '',
    description: t.description || '',
    status: (t.status || 'PENDING').toString().toUpperCase(),
    budget: t.budget ?? null,
    deadline: t.deadline || t.dueDate || null,
    isPublic: Boolean(t.isPublic ?? t.is_public ?? false),
    biddingStatus: (t.biddingStatus || t.bidding_status || 'CLOSED').toString().toUpperCase(),
    creationDate: t.createdAt || t.creationDate || t.created_at || '',
    progress: typeof t.progress === 'number' ? t.progress : (t.progress?.percentage ?? 0),
    subTasks: Array.isArray(t.subTasks ?? (t as any).sub_tasks) ? (t.subTasks ?? (t as any).sub_tasks).map((st: any) => ({
      ...st,
      id: st.id,
      title: st.title,
      completed: Boolean(st.completed ?? false),
      createdBy: (st.createdBy?.type || st.createdBy || 'admin').toString().toLowerCase() === 'admin' ? 'admin' : 'provider',
      providerId: st.createdBy?.id || st.providerId,
      attachments: Array.isArray(st.attachments) ? st.attachments : [],
      createdAt: st.createdAt || st.created_at || '',
      modifiedAt: st.modifiedAt || st.modified_at || null
    })) : [],
    assignments: Array.isArray(t.assignedEducators) ? t.assignedEducators.map((a: any) => ({
      id: a.id,
      educatorId: a.educator?.id || a.educatorId || a.educator_id || null,
      type: (a.type || a.assignmentType || 'DIRECT'),
      status: a.status || a.assignmentStatus || 'PENDING',
      amount: a.amount,
      agreementNotes: a.agreementNotes
    })) : (Array.isArray(t.assignments) ? t.assignments : []),
    assignedEducators: Array.isArray(t.assignedEducators) ? t.assignedEducators.map((a: any) => ({ ...a, type: a.type || a.assigned_type || a.assignmentType || 'DIRECT' })) : [],
    attachments: Array.isArray(t.attachments) ? t.attachments : [],
    deliverables: Array.isArray(t.deliverables) ? t.deliverables : [],
    notes: Array.isArray(t.notes) ? t.notes : [],
    activityLog: Array.isArray(t.activityLog) ? t.activityLog : [],
    project: t.project || { id: p.id, title: p.title }
  })) : [];

  return {
    ...p,
    id: p.id,
    title: p.title || '',
    description: p.description || '',
    status: (p.status || 'PENDING').toString().toUpperCase(),
    budget: p.budget ?? null,
    isPublished: Boolean(p.isPublished ?? p.is_published ?? false),
    creationType: (p.creationType || p.creation_type || 'STANDALONE').toString().toUpperCase(),
    createdBy: p.createdBy?.name || p.created_by || p.createdBy || '',
    deadline: p.deadline || null,
    tasks,
  };
}

function unwrapTask(payload: any) {
  if (!payload || typeof payload !== 'object') return payload;
  const dataNode = payload.data ?? payload;
  const task = 'task' in (dataNode || {}) ? dataNode.task : dataNode;
  return task;
}

function normalizeTask(tInput: any, project: any) {
  const t = unwrapTask(tInput);
  if (!t) return t;
  return {
    ...t,
    id: t.id,
    title: t.title || '',
    description: t.description || '',
    status: (t.status || 'PENDING').toString().toUpperCase(),
    budget: t.budget ?? null,
    deadline: t.deadline || t.dueDate || null,
    isPublic: Boolean(t.isPublic ?? t.is_public ?? false),
    biddingStatus: (t.biddingStatus || t.bidding_status || 'CLOSED').toString().toUpperCase(),
    creationDate: t.createdAt || t.creationDate || t.created_at || '',
    progress: typeof t.progress === 'number' ? t.progress : (t.progress?.percentage ?? 0),
    subTasks: Array.isArray(t.subTasks ?? (t as any).sub_tasks) ? (t.subTasks ?? (t as any).sub_tasks).map((st: any) => ({
      ...st,
      id: st.id,
      title: st.title,
      completed: Boolean(st.completed ?? false),
      createdBy: (st.createdBy?.type || st.createdBy || 'admin').toString().toLowerCase() === 'admin' ? 'admin' : 'provider',
      providerId: st.createdBy?.id || st.providerId,
      attachments: Array.isArray(st.attachments) ? st.attachments : [],
      createdAt: st.createdAt || st.created_at || '',
      modifiedAt: st.modifiedAt || st.modified_at || null
    })) : [],
    assignments: Array.isArray(t.assignedEducators) ? t.assignedEducators.map((a: any) => ({
      id: a.id,
      educatorId: a.educator?.id || a.educatorId || a.educator_id || null,
      type: (a.type || a.assignmentType || 'DIRECT'),
      status: a.status || a.assignmentStatus || 'PENDING',
      amount: a.amount,
      agreementNotes: a.agreementNotes
    })) : (Array.isArray(t.assignments) ? t.assignments : []),
    assignedEducators: Array.isArray(t.assignedEducators) ? t.assignedEducators.map((a: any) => ({ ...a, type: a.type || a.assigned_type || a.assignmentType || 'DIRECT' })) : [],
    attachments: Array.isArray(t.attachments) ? t.attachments : [],
    deliverables: Array.isArray(t.deliverables) ? t.deliverables : [],
    notes: Array.isArray(t.notes) ? t.notes : [],
    activityLog: Array.isArray(t.activityLog) ? t.activityLog : [],
    project: t.project || { id: project?.id, title: project?.title }
  };
}

const TaskDetailContainer: React.FC<Props> = ({ projectId, taskId, navigateTo }) => {
  const { t } = useLanguage();
  // Queries
  const projectQuery = useAdminProject(projectId);
  const taskQuery = useAdminTask(taskId);
  const educatorsQuery = useAdminEducators({ paginated: "true" as const, per_page: 20 });

  // Mutations / hooks (call unconditionally to preserve hooks order)
  const createSubTask = useCreateSubTask();
  const toggleSubTaskComplete = useToggleSubTaskComplete();
  const updateTask = useUpdateTask();
  const changeTaskStatus = useChangeTaskStatus();
  const deleteTask = useDeleteTask();
  const assignTaskEducators = useAssignTaskEducators();
  const updateSubTask = useUpdateSubTask();
  const uploadSubTaskAttachment = useUploadSubTaskAttachment();
  const deleteSubTask = useDeleteSubTask();
  const openTaskBidding = useOpenTaskBidding();
  const closeTaskBidding = useCloseTaskBidding();
  const createTaskNote = useCreateTaskNote();

  const { handleUpdateTaskBiddingStatus, addToast } = useData();

  // Loading state
  if (projectQuery.isLoading || taskQuery.isLoading || educatorsQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="inline-block animate-spin rounded-full h-12 w-12 mb-4" style={{ borderBottom: '3px solid var(--primary-color)' }}></div>
        <span className="text-base font-medium text-slate-600 dark:text-slate-400">{t('loading')}</span>
      </div>
    );
  }

  const project = normalizeProject(projectQuery.data as any);
  const task = normalizeTask(taskQuery.data as any, project) || project?.tasks?.find((t: any) => t.id === taskId);
  const educatorsPayload: any = educatorsQuery.data;
  const educators = Array.isArray(educatorsPayload)
    ? educatorsPayload
    : Array.isArray(educatorsPayload?.data?.educators)
      ? educatorsPayload.data.educators
      : Array.isArray(educatorsPayload?.educators)
        ? educatorsPayload.educators
        : [];

  if (!project || !task) {
    return <div className="p-6 text-center text-slate-500">{t('taskDetail.noData')}</div>;
  }

  return (
    <AdminTaskDetailView
      project={project as any}
      task={task as any}
      educators={educators as any}
      navigateTo={navigateTo}
      isAddingSubTask={createSubTask.isPending}
      onAddSubTask={async (pid, tid, title) => {
        try {
          await createSubTask.mutateAsync({ projectId: pid, taskId: tid, title });
          addToast && addToast('تم إضافة المهمة الفرعية بنجاح.');
        } catch (e: any) {
          addToast && addToast(e?.message || 'فشل إضافة المهمة الفرعية', 'error');
        }
      }}
      onToggleSubTask={(pid, tid, subTaskId) => {
        const st = task.subTasks.find((s: any) => s.id === subTaskId);
        toggleSubTaskComplete.mutate({ projectId: pid, taskId: tid, subTaskId, is_complete: !(st?.completed) });
      }}
      onAddNote={async (pid, tid, content) => {
        try {
          await createTaskNote.mutateAsync({ taskId: tid, content });
          addToast && addToast('تمت إضافة الملاحظة بنجاح.');
        } catch (e: any) {
          addToast && addToast(e?.message || 'فشل إضافة الملاحظة', 'error');
        }
      }}
      onUpdateTask={(pid, tid, taskData) => updateTask.mutate({ projectId: pid, taskId: tid, taskData })}
      onUpdateTaskStatus={(pid, tid, newStatus, reason) => changeTaskStatus.mutate({ projectId: pid, taskId: tid, status: newStatus.toString().toLowerCase(), reason })}
      onDeleteTask={(pid, tid, reason) => deleteTask.mutate({ projectId: pid, taskId: tid, reason })}
      onAssignProvider={(pid, tid, assignments) => {
        const educators = assignments.map(a => a.educatorId);
        const primary = assignments[0];
        assignTaskEducators.mutate({
          projectId: pid,
          taskId: tid,
          educators,
          assigned_type: (primary?.type || AssignmentType.DIRECT).toString().toLowerCase(),
          amount: primary?.amount,
          bid_id: undefined,
          agreement_notes: primary?.agreementNotes,
        });
      }}
      onUpdateBiddingStatus={(pid, tid) => {
        if (task.biddingStatus === 'OPEN') {
          closeTaskBidding.mutate({ projectId: pid, taskId: tid });
        } else {
          openTaskBidding.mutate({ projectId: pid, taskId: tid });
        }
      }}
      onEditSubTask={async (pid, tid, subTaskId, newTitle) => {
        try {
          await updateSubTask.mutateAsync({ projectId: pid, taskId: tid, subTaskId, title: newTitle });
          addToast && addToast('تم تعديل المهمة الفرعية بنجاح.');
        } catch (e: any) {
          addToast && addToast(e?.message || 'فشل تعديل المهمة الفرعية', 'error');
        }
      }}
      onAddSubTaskAttachment={async (pid, tid, subTaskId, file, title) => {
        try {
          await uploadSubTaskAttachment.mutateAsync({ projectId: pid, taskId: tid, subTaskId, file, title });
        } catch (e: any) {
          addToast && addToast(e?.message || 'فشل رفع المرفق', 'error');
        }
      }}
      onDeleteSubTask={(pid, tid, subTaskId) => deleteSubTask.mutate({ projectId: pid, taskId: tid, subTaskId })}
    />
  );
};

export default TaskDetailContainer;
