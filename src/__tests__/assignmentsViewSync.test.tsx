import { beforeAll, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LanguageProvider } from '../app/providers/LanguageProvider';

vi.mock('../core/hooks/useEducatorQueries', () => ({
  useEducatorAssignments: vi.fn(),
  useAcceptAssignment: () => ({ mutateAsync: vi.fn() }),
  useRejectAssignment: () => ({ mutateAsync: vi.fn() }),
}));

import { useEducatorAssignments } from '../core/hooks/useEducatorQueries';
import AssignmentsView from '../features/educator/views/AssignmentsView';

beforeAll(() => {
  (globalThis as any).localStorage = {
    _v: 'ar',
    getItem() { return this._v; },
    setItem(_k: string, v: string) { this._v = v; },
  };
});

describe('AssignmentsView background sync', () => {
  it('keeps showing cached assignments without a loading message while refreshing', () => {
    vi.mocked(useEducatorAssignments).mockReturnValue({
      data: [{
        id: 'assignment-1',
        assigned_type: 'direct',
        status: 'pending',
        amount: 500,
        projectTitle: 'مشروع محفوظ',
        task: { id: 'task-1', title: 'مهمة محفوظة', status: 'open' },
      }],
      counts: { invitations: 0, assignments: 1 },
      isLoading: false,
      isLoadingError: false,
      isRefetchError: false,
      isFetching: true,
      error: null,
    } as any);

    const html = renderToStaticMarkup(
      <LanguageProvider>
        <AssignmentsView navigateTo={() => {}} addToast={() => {}} />
      </LanguageProvider>
    );

    expect(html).toContain('مهمة محفوظة');
    expect(html).not.toContain('جاري التحميل');
  });
});
