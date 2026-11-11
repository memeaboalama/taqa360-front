import { beforeAll, describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '../app/providers/LanguageProvider';
import { Bid, BidStatus, Educator, Project } from '../shared/types';
import { BidDetailView } from '../features/educator/views/BidDetailView';

beforeAll(() => {
  (globalThis as any).localStorage = {
    _v: 'ar',
    getItem() { return this._v; },
    setItem(_key: string, value: string) { this._v = value; },
  };
});

const createBid = (status: BidStatus, modificationStatus = 'APPROVED', decisionNote = 'تم الاعتماد'): Bid => ({
  id: 'bid-1',
  projectId: 'project-1',
  educatorId: 'educator-1',
  bidTasks: [{ taskId: 'task-1', status, amount: 100 }],
  deliveryDays: 5,
  proposal: 'الشروط الحالية',
  createdAt: '2026-01-01',
  attachments: [],
  links: [],
  modificationRequests: [{
    id: 'modification-1',
    status: modificationStatus,
    previousValues: {
      proposal: 'الشروط القديمة',
      deliveryDays: 7,
      tasks: [{ task_id: 'task-1', amount: 120 }],
    },
    requestedValues: {
      proposal: 'الشروط الحالية',
      deliveryDays: 5,
      tasks: [{ task_id: 'task-1', amount: 100 }],
    },
    decisionNote,
    createdAt: '2026-01-02T10:00:00Z',
    decidedAt: '2026-01-03T10:00:00Z',
  }],
});

const render = (status: BidStatus) => renderToStaticMarkup(
  <QueryClientProvider client={new QueryClient()}>
    <LanguageProvider>
      <BidDetailView
        bid={createBid(status)}
        project={{ id: 'project-1', title: 'مشروع', tasks: [{ id: 'task-1', title: 'مهمة' }] } as Project}
        educator={{} as Educator}
        navigateTo={() => {}}
      />
    </LanguageProvider>
  </QueryClientProvider>
);

const renderRejectedModification = () => renderToStaticMarkup(
  <QueryClientProvider client={new QueryClient()}>
    <LanguageProvider>
      <BidDetailView
        bid={createBid(BidStatus.APPROVED, 'REJECTED', 'سبب الرفض')}
        project={{ id: 'project-1', title: 'مشروع', tasks: [{ id: 'task-1', title: 'مهمة' }] } as Project}
        educator={{} as Educator}
        navigateTo={() => {}}
      />
    </LanguageProvider>
  </QueryClientProvider>
);

describe('agreed bid modification workflow', () => {
  it('offers a documented change request after agreement and before execution', () => {
    const html = render(BidStatus.APPROVED);
    expect(html).toContain('طلب تعديل الاتفاق');
    expect(html).toContain('سجل طلبات تعديل الاتفاق');
    expect(html).toContain('الشروط القديمة');
    expect(html).toContain('الشروط الحالية');
    expect(html).toContain('تم الاعتماد');
  });

  it('does not offer an agreement change request after execution starts', () => {
    const html = render(BidStatus.ASSIGNED);
    expect(html).not.toContain('طلب تعديل الاتفاق');
  });

  it('shows a rejected modification and the administration rejection reason', () => {
    const html = renderRejectedModification();
    expect(html).toContain('مرفوض');
    expect(html).toContain('سبب الرفض');
  });
});
