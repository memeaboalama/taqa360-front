import { beforeAll, describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LanguageProvider } from '../app/providers/LanguageProvider';
import ProjectDetailView from '../features/admin/views/ProjectDetailView';
import BidsView from '../features/admin/views/BidsView';
import { getAvailableBidActions, isEducatorAssignedToTask } from '../features/admin/views/BidsView';
import { getProjectOverviewMetrics, resolveProjectTeam } from '../shared/utils';
import { Bid, BidStatus, Project, ProjectCreationType, ProjectStatus, Task } from '../shared/types';

beforeAll(() => {
  (globalThis as any).localStorage = {
    getItem: () => 'ar',
    setItem: () => {},
  };
});

const renderProjectDetail = (
  creationType: ProjectCreationType,
  isPublished = false,
  educationalRequest?: Project['educationalRequest'],
) => {
  const project: Project = {
    id: 'project-1',
    title: 'مشروع تجريبي',
    description: '',
    status: ProjectStatus.PENDING,
    tags: [],
    budget: null,
    isPublished,
    tasks: [],
    creationType,
    createdBy: '',
    createdAt: '',
    deadline: null,
    educationalRequestId: educationalRequest?.id ?? null,
    educationalRequest,
    activityLog: [],
  };

  return renderToStaticMarkup(
    <LanguageProvider>
      <ProjectDetailView
        project={project}
        bids={[]}
        educators={[]}
        educationalRequests={[]}
        users={[]}
        navigateTo={() => {}}
        onAddTask={async () => {}}
        onUpdateTaskStatus={() => {}}
        onUpdateProjectDetails={() => {}}
        onUpdateProjectStatus={() => {}}
        onUpdateTask={() => {}}
        onAssignProvider={async () => {}}
        onUpdateBidTaskStatus={() => {}}
        onUpdateTaskBiddingStatus={() => {}}
        onDeleteTask={() => {}}
        onToggleProjectPublication={() => {}}
      />
    </LanguageProvider>
  );
};

describe('admin project publication and task offers', () => {
  it('derives project task, assignment and team summaries from the current task assignments', () => {
    const project = {
      tasks: [
        {
          status: 'COMPLETED',
          assignments: [
            { status: 'accepted', amount: '125.50', educator: { id: 'educator-1', name: 'متخصص 1' } },
            { status: 'PENDING', amount: 300, educator: { id: 'educator-2', name: 'متخصص 2' } },
          ],
        },
        {
          status: 'in_progress',
          assignedEducators: [
            { status: 'REJECTED', amount: 99, educator: { id: 'educator-3', name: 'متخصص 3' } },
            { status: 'CANCELLED', amount: 50, educator: { id: 'educator-4', name: 'متخصص 4' } },
          ],
        },
      ],
    };

    const metrics = getProjectOverviewMetrics(project);

    expect(metrics.tasks).toHaveLength(2);
    expect(metrics.taskCounts).toEqual({ pending: 0, inProgress: 1, completed: 1, cancelled: 0 });
    expect(metrics.assignments).toHaveLength(4);
    expect(metrics.assignmentCounts).toEqual({
      accepted: 1,
      pending: 1,
      rejected: 1,
      inProgress: 0,
      completed: 0,
      cancelled: 1,
    });
    expect(metrics.acceptedCost).toBe(125.5);
    expect(resolveProjectTeam(project).map(({ id }) => id)).toEqual(['educator-1']);
  });

  it.each([
    ProjectCreationType.PUBLIC,
    ProjectCreationType.FROM_REQUEST,
    ProjectCreationType.STANDALONE,
  ])('shows publication and task-offer controls for %s projects', (creationType) => {
    const html = renderProjectDetail(creationType);

    expect(html).toContain('نشر المشروع للعروض');
    expect(html).toContain('متوقف');
    expect(html).toContain('عروض المهام (0)');
  });

  it('shows the catalog service name on the linked project', () => {
    const html = renderProjectDetail(ProjectCreationType.FROM_REQUEST, false, {
      id: 'request-1',
      title: 'طلب طاقة',
      serviceName: 'تصميم نظام طاقة شمسية',
    });

    expect(html).toContain('تصميم نظام طاقة شمسية');
  });

  describe('task bid actions', () => {
    it('only offers reject, accept and assign actions for pending bids', () => {
      expect(getAvailableBidActions(BidStatus.PENDING)).toEqual(['reject', 'approve', 'assign']);
    });

    it('does not offer accept again for approved bids', () => {
      expect(getAvailableBidActions(BidStatus.APPROVED)).toEqual(['reject', 'assign']);
    });

    it('hides assign when this educator already has an active assignment for the task', () => {
      const task = {
        id: 'task-1',
        assignments: [{ educatorId: 'educator-1', status: 'ACCEPTED' }],
      } as Task;

      expect(isEducatorAssignedToTask(task, 'educator-1')).toBe(true);
      expect(getAvailableBidActions(BidStatus.PENDING, true)).toEqual(['reject', 'approve']);
      expect(getAvailableBidActions(BidStatus.APPROVED, true)).toEqual(['reject']);
    });

    it('allows assign again when the previous assignment was cancelled', () => {
      const task = {
        id: 'task-1',
        assignments: [{ educator: { id: 'educator-1' }, status: 'CANCELLED' }],
      } as Task;

      expect(isEducatorAssignedToTask(task, 'educator-1')).toBe(false);
      expect(getAvailableBidActions(BidStatus.APPROVED, false)).toEqual(['reject', 'assign']);
    });

    it.each([BidStatus.REJECTED, BidStatus.ASSIGNED])('does not offer bid actions for %s bids', (status) => {
      expect(getAvailableBidActions(status)).toEqual([]);
    });
  });

  it('shows the stop-receiving control for a published project', () => {
    const html = renderProjectDetail(ProjectCreationType.STANDALONE, true);

    expect(html).toContain('إيقاف استقبال العروض');
    expect(html).toContain('استقبال العروض');
    expect(html).toContain('مفتوح');
  });

  it('keeps existing offers visible for a task that is no longer public', () => {
    const task = { id: 'task-1', title: 'مهمة سابقة', isPublic: false, biddingStatus: 'CLOSED' } as Task;
    const project = { id: 'project-1', tasks: [task] } as Project;
    const bid = {
      id: 'bid-1',
      educatorId: 'educator-1',
      bidTasks: [{ taskId: task.id, status: BidStatus.PENDING, amount: 100 }],
    } as Bid;

    const html = renderToStaticMarkup(
      <BidsView
        project={project}
        bids={[bid]}
        educators={[]}
        navigateTo={() => {}}
        onUpdateBidTaskStatus={() => {}}
        onUpdateTaskBiddingStatus={() => {}}
      />
    );

    expect(html).toContain('مهمة سابقة');
    expect(html).toContain('1 عرض مقدم');
  });
});
