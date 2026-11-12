import { beforeAll, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LanguageProvider } from '../app/providers/LanguageProvider';

vi.mock('../core/hooks/useAdminQueries', () => ({
  useAdminProjects: () => ({
    data: [{
      id: 'project-1',
      title: 'مشروع بدون ميزانية',
      status: 'pending',
      budget: null,
      creationType: 'public',
      tasks: [],
    }],
    isLoading: false,
    isError: false,
    isFetching: false,
  }),
  useAdminEducators: () => ({ data: {} }),
  usePublishProject: () => ({ mutate: vi.fn() }),
  useUnpublishProject: () => ({ mutate: vi.fn() }),
  useDeleteProject: () => ({ mutate: vi.fn() }),
}));

import ProjectsView from '../features/admin/views/ProjectsView';

beforeAll(() => {
  (globalThis as any).localStorage = {
    getItem: () => 'ar',
    setItem: () => {},
  };
});

describe('admin projects budget', () => {
  it('uses the same Arabic not-set translation in the project card', () => {
    const html = renderToStaticMarkup(
      <LanguageProvider>
        <ProjectsView navigateTo={() => {}} activeTab="all" />
      </LanguageProvider>
    );

    expect(html).toContain('غير محدد');
    expect(html).not.toContain('N/A');
  });
});
