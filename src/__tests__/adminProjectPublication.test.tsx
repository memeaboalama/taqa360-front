import { beforeAll, describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LanguageProvider } from '../app/providers/LanguageProvider';
import ProjectDetailView from '../features/admin/views/ProjectDetailView';
import BidsView from '../features/admin/views/BidsView';
import { getAvailableBidActions } from '../features/admin/views/BidsView';
import { Bid, BidStatus, Project, ProjectCreationType, ProjectStatus, Task } from '../shared/types';

beforeAll(() => {
  (globalThis as any).localStorage = {
    getItem: () => 'ar',
    setItem: () => {},
  };
});

const renderProjectDetail = (creationType: ProjectCreationType, isPublished = false) => {
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
    educationalRequestId: null,
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

  describe('task bid actions', () => {
    it('only offers reject, accept and assign actions for pending bids', () => {
      expect(getAvailableBidActions(BidStatus.PENDING)).toEqual(['reject', 'approve', 'assign']);
    });

    it('does not offer accept again for approved bids', () => {
      expect(getAvailableBidActions(BidStatus.APPROVED)).toEqual(['reject', 'assign']);
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
