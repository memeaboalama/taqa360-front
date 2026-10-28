import { describe, it, expect, beforeAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '../app/providers/LanguageProvider';
import AssignmentDetailView, { AssignmentDetailAssignment } from '../features/educator/views/AssignmentDetailView';

beforeAll(() => {
  (globalThis as any).localStorage = {
    _v: 'ar',
    getItem() { return this._v; },
    setItem(_k: string, v: string) { this._v = v; },
  };
});

const base: AssignmentDetailAssignment = {
  id: 'a1',
  assigned_type: 'invitation',
  status: 'pending',
  amount: 500,
  agreementNotes: null,
  rejectionReason: null,
  assigned_at: '2026-01-01',
  accepted_at: null,
  projectTitle: 'مشروع تجريبي',
  task: { id: 't1', title: 'مهمة', status: 'open', deadline: '2026-02-01' },
};

const render = (patch: Partial<AssignmentDetailAssignment>) => {
  const client = new QueryClient();
  return renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <LanguageProvider>
        <AssignmentDetailView assignment={{ ...base, ...patch }} navigateTo={() => {}} />
      </LanguageProvider>
    </QueryClientProvider>
  );
};

describe('AssignmentDetailView per status', () => {
  it('pending: decision buttons present, no task details button', () => {
    const html = render({ status: 'pending' });
    expect(html).not.toContain('عرض تفاصيل المهمة');
    expect(html).toContain('قبول');
    expect(html).toContain('رفض');
  });

  it('accepted: task details button is present', () => {
    const html = render({ status: 'accepted', accepted_at: '2026-01-05' });
    expect(html).toContain('عرض تفاصيل المهمة');
    expect(html).not.toContain('سبب الرفض');
  });

  it('rejected: reason is shown and task details button is absent', () => {
    const html = render({ status: 'rejected', rejectionReason: 'الجدول غير مناسب' });
    expect(html).toContain('سبب الرفض');
    expect(html).toContain('الجدول غير مناسب');
    expect(html).not.toContain('عرض تفاصيل المهمة');
  });

  it('pending shows neither the reason row nor the task button', () => {
    const html = render({ status: 'pending', rejectionReason: 'الجدول غير مناسب' });
    expect(html).not.toContain('سبب الرفض');
    expect(html).not.toContain('عرض تفاصيل المهمة');
  });
});