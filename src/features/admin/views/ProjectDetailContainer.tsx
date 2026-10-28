import React, { useMemo, useRef } from 'react';
import { useAdminProject, useAdminEducators, useCreateTask, useUpdateTask, useDeleteTask, usePublishProject, useUnpublishProject, useUpdateProject, useChangeProjectStatus, useAssignTaskEducators, useChangeTaskStatus, useOpenTaskBidding, useCloseTaskBidding } from '../../../core/hooks/useAdminQueries';
import { adminService } from '../../../core/services/AdminService';
import ProjectDetailView from './ProjectDetailView';
import { useData } from '../../../app/providers/DataProvider';
import { useLanguage } from '../../../app/providers/LanguageProvider';
import { ViewType, ProjectStatus, BidStatus, AssignmentType, AssignmentStatus } from '../../../shared/types';

interface Props {
  projectId: string;
  navigateTo: (view: ViewType, id?: any) => void;
}

function normalizeProject(p: any) {
  if (!p) return p;

  // Support multiple wrappers:
  // { status, message, data: { project } }
  // { status, message, data: project }
  // direct project
  const payload = (p && typeof p === 'object') ? p : {};
  const dataNode = (payload as any).data ?? payload;
  const rawProject = (dataNode && typeof dataNode === 'object' && 'project' in dataNode)
    ? (dataNode as any).project
    : Array.isArray(dataNode)
      ? (dataNode as any)[0]
      : dataNode;

  const tasks = Array.isArray(rawProject?.tasks) ? rawProject.tasks.map((t: any) => ({
    // Preserve all original fields
    ...t,
    // Normalize key fields used by UI
    id: t.id,
    title: t.title || '',
    description: t.description || '',
    status: (t.status || 'PENDING').toString().toUpperCase(),
    budget: t.budget ?? null,
    deadline: t.deadline || t.dueDate || null,
    isPublic: Boolean(t.isPublic ?? t.is_public ?? false),
    biddingStatus: (t.biddingStatus || t.bidding_status || 'CLOSED').toString().toUpperCase(),
    creationDate: t.creationDate || t.createdAt || t.created_at || '',
    progress: typeof t.progress === 'number' ? t.progress : (t.progress?.percentage ?? 0),
    assignments: (Array.isArray(t.assignments) ? t.assignments : (Array.isArray(t.assignedEducators) ? t.assignedEducators : [])).map((a: any) => ({
      ...a,
      status: (a.status || a.assignmentStatus || a.assignment_status || 'PENDING').toString().toUpperCase(),
      amount: typeof a.amount === 'number' ? a.amount : Number(a.amount ?? 0) || 0,
    })),
    project: t.project || { id: rawProject.id, title: rawProject.title }
  })) : [];

  const activityLog = Array.isArray(rawProject?.activityLog)
    ? rawProject.activityLog.map((lg: any, i: number) => ({
        id: String(lg.id ?? lg.uuid ?? i),
        messageKey: lg.messageKey ?? lg.message_key ?? '',
        messagePayload: lg.messagePayload ?? lg.message_payload ?? {},
        actorName: lg.actorName ?? lg.actor ?? lg.actor_name ?? '',
        timestamp: lg.timestamp ?? lg.created_at ?? '',
      }))
    : [];

  return {
    // Preserve all original fields to "show everything" as requested
    ...rawProject,
    // Normalize key fields used across UI
    id: rawProject.id,
    title: rawProject.title || '',
    description: rawProject.description || '',
    status: (rawProject.status || 'PENDING').toString().toUpperCase(),
    budget: rawProject.budget ?? null,
    isPublished: Boolean(rawProject.isPublished ?? rawProject.is_published ?? false),
    creationType: (rawProject.creationType || rawProject.creation_type || 'STANDALONE').toString().toUpperCase(),
    createdBy: rawProject.createdBy || rawProject.created_by || null,
    deadline: rawProject.deadline || null,
    educationalRequestId: rawProject.educationalRequestId || rawProject.educational_request_id || null,
    tasks,
    activityLog,
  };
}

function normalizeBids(p: any, project: any) {
  const payload = (p && typeof p === 'object') ? p : {};
  const dataNode = (payload as any).data ?? payload;
  const rawProject = (dataNode && typeof dataNode === 'object' && 'project' in dataNode)
    ? (dataNode as any).project
    : Array.isArray(dataNode)
      ? (dataNode as any)[0]
      : dataNode;

  const existingBids: any[] = Array.isArray(rawProject?.bids) ? rawProject.bids : [];
  const bidTasksFromProject: any[] = Array.isArray(rawProject?.bidsTasks) ? rawProject.bidsTasks : [];

  const norm = (v: any, fallback: string) => (typeof v === 'string' && v)
    ? v.trim().toUpperCase().replace(/[-\s]+/g, '_')
    : fallback;

  const toNumber = (v: any): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  // Build a robust mapping from any known task identifier in the API payload to the canonical task.id used by the UI
  const taskIdMap = new Map<string, string>();
  const candidateKeys = ['id','uuid','uuidv4','taskId','task_id','db_id','internalId','internal_id','numericId','num_id'];
  const tasksArr: any[] = Array.isArray(project?.tasks) ? project.tasks : [];
  tasksArr.forEach((t: any) => {
    candidateKeys.forEach((k) => {
      const v = (t as any)[k];
      if (v !== undefined && v !== null && v !== '') {
        taskIdMap.set(String(v), t.id);
      }
    });
  });

  const mapToCanonicalTaskId = (raw: any): string => {
    const rawStr = String(raw ?? '');
    if (!rawStr) return rawStr;
    if (taskIdMap.has(rawStr)) return taskIdMap.get(rawStr)!;
    const asNum = Number(rawStr);
    if (Number.isFinite(asNum) && taskIdMap.has(String(asNum))) return taskIdMap.get(String(asNum))!;
    if (tasksArr.some(t => t.id === rawStr)) return rawStr;
    return rawStr;
  };

  // If API already returns bids array, map it directly
  const mappedExisting = existingBids.map((bid: any, i: number) => ({
    id: String(bid.id ?? bid.uuid ?? i),
    projectId: String(bid.projectId ?? rawProject?.id ?? ''),
    educatorId: String(bid.educatorId ?? bid.educator_id ?? bid.educator?.id ?? ''),
    proposal: bid.proposal ?? '',
    deliveryDays: toNumber(bid.deliveryDays ?? bid.delivery_days ?? 0),
    createdAt: String(bid.createdAt ?? bid.created_at ?? ''),
    bidTasks: Array.isArray(bid.bidTasks ?? bid.bid_tasks)
      ? (bid.bidTasks ?? bid.bid_tasks).map((bt: any) => ({
          taskId: mapToCanonicalTaskId(bt.taskId ?? bt.task_id ?? bt.task?.id ?? ''),
          status: norm(bt.status, 'PENDING'),
          amount: toNumber(bt.amount ?? 0),
          rejectionReason: bt.rejectionReason ?? bt.rejection_reason ?? undefined,
          approvalMessage: bt.approvalMessage ?? bt.approval_message ?? undefined,
          bidTaskId: bt.id ? String(bt.id) : (bt.bidTaskId ? String(bt.bidTaskId) : undefined),
        }))
      : [],
    attachments: Array.isArray(bid.attachments) ? bid.attachments : [],
    links: Array.isArray(bid.links) ? (bid.links.flat?.() || bid.links).map((l: any, idx: number) => ({ id: String(l.id ?? idx), title: l.title ?? '', url: l.url ?? '' })) : [],
    educator: bid.educator ?? undefined,
  }));

  if (mappedExisting.length > 0) return mappedExisting as any;

  // Otherwise, construct bids from project.bidsTasks (group by bidId)
  if (bidTasksFromProject.length > 0) {
    const groups = new Map<string, any[]>();
    bidTasksFromProject.forEach((item: any) => {
      const key = String(item.bidId ?? item.bid_id ?? item.id ?? '');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    });

    const bids = Array.from(groups.entries()).map(([bidId, items], idx) => {
      const first = items[0] || {};
      return {
        id: String(bidId || idx),
        projectId: String(rawProject?.id ?? ''),
        educatorId: String(first.aducator?.id ?? first.educator?.id ?? ''),
        educator: first.aducator || first.educator || undefined,
        proposal: first.proposal ?? '',
        deliveryDays: toNumber(first.deliveryDays ?? first.delivery_days ?? 0),
        createdAt: String(first.createdAt ?? first.created_at ?? ''),
        bidTasks: items.map((it: any) => ({
          taskId: mapToCanonicalTaskId(it.taskId ?? it.task_id ?? ''),
          status: norm(it.status, 'PENDING'),
          amount: toNumber(it.amount ?? 0),
          rejectionReason: it.rejection_reason ?? undefined,
          approvalMessage: it.approval_message ?? undefined,
          bidTaskId: it.id ? String(it.id) : (it.bidTaskId ? String(it.bidTaskId) : undefined),
        })),
        attachments: [],
        links: [],
      };
    });

    return bids as any;
  }

  return [];
}

const ProjectDetailContainer: React.FC<Props> = ({ projectId, navigateTo }) => {
  const projectQuery = useAdminProject(projectId);
  const educatorsParams = useMemo(() => ({ paginated: "true" as const, per_page: 100, status: 'active' as any }), []);
  const educatorsQuery = useAdminEducators(educatorsParams);
  const { addToast, handleUpdateTaskBiddingStatus } = useData();
  const { t } = useLanguage();

  const translateError = (e: any): string => {
    const msg = e?.response?.data?.message || e?.message || '';
    if (/already assigned|already been assigned|معين مسبقاً/i.test(msg)) return t('errors.alreadyAssigned');
    if (/duplicate|مكرر/i.test(msg)) return t('errors.duplicate');
    return msg || t('errors.unknown');
  };

  // Keep last valid project so background refetches don't cause "لا يوجد مشروع" flash
  const lastValidProjectRef = useRef<any>(null);

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const publishProject = usePublishProject();
  const unpublishProject = useUnpublishProject();
  const updateProject = useUpdateProject();
  const changeProjectStatus = useChangeProjectStatus();
  const assignTaskEducators = useAssignTaskEducators();
  const changeTaskStatus = useChangeTaskStatus();
  const openTaskBidding = useOpenTaskBidding();
  const closeTaskBidding = useCloseTaskBidding();

  if (projectQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="inline-block animate-spin rounded-full h-12 w-12 mb-4" style={{ borderBottom: '3px solid var(--primary-color)' }}></div>
        <span className="text-base font-medium text-slate-600 dark:text-slate-400">جارِ التحميل...</span>
      </div>
    );
  }

  const normalizedProject = normalizeProject(projectQuery.data as any);
  // If we just got a valid project, save it. If data is temporarily gone (refetch), reuse saved.
  if (normalizedProject) lastValidProjectRef.current = normalizedProject;
  const project = normalizedProject || (projectQuery.isFetching ? lastValidProjectRef.current : null);

  const bids = normalizeBids(projectQuery.data as any, project);
  const educatorsPayload: any = educatorsQuery.data;
  const educators = Array.isArray(educatorsPayload)
    ? educatorsPayload
    : Array.isArray(educatorsPayload?.data?.educators)
      ? educatorsPayload.data.educators
      : Array.isArray(educatorsPayload?.data)
        ? educatorsPayload.data
        : Array.isArray(educatorsPayload?.educators)
          ? educatorsPayload.educators
          : [];

  // During background refetch (e.g. after status change), data may be briefly undefined.
  // Show the spinner instead of the "no project" message to prevent a flash.
  if (!project) {
    if (projectQuery.isFetching) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
          <div className="inline-block animate-spin rounded-full h-12 w-12 mb-4" style={{ borderBottom: '3px solid var(--primary-color)' }}></div>
          <span className="text-base font-medium text-slate-600 dark:text-slate-400">جارِ التحميل...</span>
        </div>
      );
    }
    return <div className="p-6 text-center text-slate-500">لا يوجد مشروع</div>;
  }

  return (
    <ProjectDetailView
      project={project}
      bids={bids}
      educators={educators}
      educationalRequests={[]}
      users={[]}
      navigateTo={navigateTo}
      onAddTask={async (pid, taskData) => {
        try {
          await createTask.mutateAsync({ projectId: pid, taskData });
          await projectQuery.refetch();
          addToast && addToast('تمت إضافة المهمة بنجاح.', 'success');
        } catch (e: any) {
          addToast && addToast(translateError(e) || 'فشل إضافة المهمة', 'error');
          throw e;
        }
      }}
      onUpdateTask={async (pid, tid, taskData) => {
        try {
          await updateTask.mutateAsync({ projectId: pid, taskId: tid, taskData });
          await projectQuery.refetch();
          addToast && addToast('تم تحديث المهمة بنجاح.', 'success');
        } catch (e: any) {
          addToast && addToast(e?.message || 'فشل تحديث المهمة', 'error');
          throw e;
        }
      }}
      onUpdateTaskStatus={async (pid, tid, newStatus, reason) => {
        try {
          await changeTaskStatus.mutateAsync({ projectId: pid, taskId: tid, status: newStatus.toString().toLowerCase(), reason });
          await projectQuery.refetch();
          addToast && addToast('تم تغيير حالة المهمة بنجاح.', 'success');
        } catch (e: any) {
          addToast && addToast(e?.message || 'فشل تغيير حالة المهمة', 'error');
          throw e;
        }
      }}
      onDeleteTask={async (pid, tid, reason) => {
        try {
          await deleteTask.mutateAsync({ projectId: pid, taskId: tid, reason });
          await projectQuery.refetch();
          addToast && addToast('تم حذف المهمة بنجاح.', 'success');
        } catch (e: any) {
          addToast && addToast(e?.message || 'فشل حذف المهمة', 'error');
          throw e;
        }
      }}
      onAssignProvider={async (pid, tid, assignments) => {
        const educators = assignments.map(a => a.educatorId);
        const primary = assignments[0];
        try {
          await assignTaskEducators.mutateAsync({
            projectId: pid,
            taskId: tid,
            educators,
            assigned_type: (primary?.type || AssignmentType.DIRECT).toString().toLowerCase(),
            amount: primary?.amount,
            bid_id: undefined,
            agreement_notes: primary?.agreementNotes,
          });
          await projectQuery.refetch();
          addToast && addToast('تم التعيين بنجاح.', 'success');
        } catch (e: any) {
          addToast && addToast(translateError(e), 'error');
          throw e;
        }
      }}
      onUpdateBidTaskStatus={async (bidId, taskId, newStatus, details) => {
        try {
          const bidObj = (bids as any[]).find(b => b.id === bidId);
          const bidTask = bidObj?.bidTasks?.find((bt: any) => bt.taskId === taskId);
          let bidTaskId: string | undefined = bidTask?.bidTaskId || bidTask?.id;

          if (!bidTaskId) {
            const bidDetail = await adminService.getBid(bidId);
            const raw = (bidDetail as any)?.bid || bidDetail || {};
            const found = Array.isArray(raw?.bidTasks)
              ? raw.bidTasks.find((bt: any) => String(bt.taskId ?? bt.task_id) === String(taskId))
              : undefined;
            if (found?.id) bidTaskId = String(found.id);
          }

          if (!bidTaskId) {
            throw new Error('لم يتم العثور على معرف عرض المهمة');
          }

          if (newStatus === BidStatus.APPROVED) {
            await adminService.approveBidTaskById(bidTaskId, details?.approvalMessage);
          } else if (newStatus === BidStatus.REJECTED) {
            await adminService.rejectBidTaskById(bidTaskId, details?.reason);
          } else if (newStatus === BidStatus.ASSIGNED) {
            const educatorId = bidObj?.educatorId;
            await adminService.assignBidTaskById(bidTaskId, educatorId, details?.assignmentAgreement);
          }

          await projectQuery.refetch();
          addToast && addToast('تم تحديث حالة العرض بنجاح.');
        } catch (e: any) {
          addToast && addToast(e?.message || 'تعذر تنفيذ العملية', 'error');
        }
      }}
      onUpdateTaskBiddingStatus={async (pid, tid) => {
        try {
          const t = (project.tasks || []).find((tk: any) => tk.id === tid);
          if (t && t.biddingStatus === 'OPEN') {
            await closeTaskBidding.mutateAsync({ projectId: pid, taskId: tid });
            addToast && addToast('تم إيقاف استقبال العروض.', 'success');
          } else {
            await openTaskBidding.mutateAsync({ projectId: pid, taskId: tid });
            addToast && addToast('تم فتح استقبال العروض.', 'success');
          }
          await projectQuery.refetch();
        } catch (e: any) {
          addToast && addToast(e?.message || 'فشل تغيير حالة استقبال العروض', 'error');
          throw e;
        }
      }}
      onUpdateProjectDetails={async (pid, details) => {
        const { newAttachments, removedAttachmentIds, ...rest } = details as any;
        const payload: Record<string, unknown> = {};
        if (rest.title !== undefined) payload.title = rest.title;
        if (rest.description !== undefined) payload.description = rest.description;
        if (rest.budget !== undefined) payload.budget = rest.budget;
        if (rest.deadline !== undefined) payload.deadline = rest.deadline;
        try {
          await updateProject.mutateAsync({ id: pid, data: payload });
          addToast && addToast('تم تحديث بيانات المشروع بنجاح.');
        } catch (e: any) {
          addToast && addToast(e?.message || 'فشل تحديث بيانات المشروع', 'error');
        }
      }}
      isSavingProject={updateProject.isPending}
      onUpdateProjectStatus={async (pid, newStatus: ProjectStatus, reason: string) => {
        await changeProjectStatus.mutateAsync({ projectId: pid, status: newStatus.toString().toLowerCase(), reason });
        addToast(`تم تغيير حالة المشروع بنجاح إلى "${newStatus}"`, 'success');
      }}
      onToggleProjectPublication={(pid, reason) => {
        if (project.isPublished) {
          return unpublishProject.mutateAsync({ id: pid, reason: reason || '' });
        } else {
          return publishProject.mutateAsync(pid);
        }
      }}
    />
  );
};

export default ProjectDetailContainer;
