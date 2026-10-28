import { describe, it, expect, beforeAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LanguageProvider } from '../app/providers/LanguageProvider';
import OpportunityDetailView from '../features/educator/views/OpportunityDetailView';
import { Project, Task, ProjectStatus, BidStatus } from '../shared/types';

beforeAll(() => {
  (globalThis as any).localStorage = {
    _v: 'ar',
    getItem() { return this._v; },
    setItem(_k: string, v: string) { this._v = v; },
  };
});

const task = (patch: Partial<Task> = {}): Task => ({
  id: 'task-1',
  title: 'تصميم وحدة تعليمية',
  description: 'وصف المهمة',
  status: ProjectStatus.PENDING,
  assignments: [],
  budget: 1500,
  deadline: '2026-12-01',
  isPublic: true,
  biddingStatus: 'OPEN',
  subTasks: [],
  attachments: [],
  deliverables: [],
  notes: [],
  creationDate: '2026-01-01',
  activityLog: [],
  ...patch,
});

const project = (patch: Partial<Project> = {}): Project => ({
  id: 'proj-1',
  title: 'مشروع تجريبي',
  description: 'وصف المشروع',
  status: ProjectStatus.PENDING,
  tags: [],
  budget: 5000,
  isPublished: true,
  tasks: [task()],
  creationType: 'PUBLIC' as any,
  createdBy: '',
  createdAt: '2026-01-01',
  deadline: null,
  educationalRequestId: null,
  activityLog: [],
  ...patch,
});

const render = (p: Project) =>
  renderToStaticMarkup(
    <LanguageProvider>
      <OpportunityDetailView project={p} navigateTo={() => {}} isApproved={true} />
    </LanguageProvider>
  );

describe('OpportunityDetailView', () => {
  it('shows an Arabic empty-state message (not the raw i18n key) when no task is open', () => {
    const html = render(project({ tasks: [task({ biddingStatus: 'CLOSED' })] }));
    expect(html).toContain('لا توجد مهام متاحة للعروض');
    expect(html).not.toContain('noAvailableTasks');
    expect(html).not.toContain('noTasksAvailable');
  });

  it('hides the empty-state message when an open task exists', () => {
    const html = render(project());
    expect(html).not.toContain('لا توجد مهام متاحة للعروض');
    expect(html).toContain('تصميم وحدة تعليمية');
  });

  it('renders the previous bid block with bid tasks, a translated status, attachments and links', () => {
    const html = render(
      project({
        hasEducatorBidForOpportunity: true,
        bid: {
          id: 'bid-1',
          projectId: 'proj-1',
          educatorId: 'edu-1',
          proposal: 'نص المقترح',
          deliveryDays: 10,
          totalAmount: 1500,
          createdAt: '2026-01-05',
          bidTasks: [{ taskId: 'task-1', status: BidStatus.PENDING, amount: 1500 }],
          attachments: [
            { id: 'a1', name: 'my-proposal.pdf', url: 'https://example.com/p.pdf', size: '1024', type: 'bids' },
          ],
          links: [{ id: 'l1', title: 'أعمالي', url: 'https://example.com' }],
        } as any,
      })
    );

    expect(html).toContain('لديك عرض سابق');
    expect(html).toContain('نص المقترح');
    expect(html).toContain('تفاصيل المهمة والتسعير');
    expect(html).toContain('تصميم وحدة تعليمية');
    // Bid task status must come from the dictionary, never the raw value.
    expect(html).toContain('قيد الانتظار');
    expect(html).not.toContain('>pending<');
    expect(html).not.toContain('proposals.pending');
    expect(html).toContain('my-proposal.pdf');
    expect(html).toContain('https://example.com/p.pdf');
    expect(html).toContain('https://example.com');
    expect(html).toContain('تحديث العرض');
  });

  it('does not render the previous bid block when the educator has no bid', () => {
    const html = render(project({ hasEducatorBidForOpportunity: false, bid: undefined }));
    expect(html).not.toContain('لديك عرض سابق');
    expect(html).toContain('تقديم عرض على المشروع');
  });
});
