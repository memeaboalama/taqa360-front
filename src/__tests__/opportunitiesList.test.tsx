import { describe, it, expect, beforeAll, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '../app/providers/LanguageProvider';
import { apiClient } from '../core/api/client';
import { ProjectService } from '../features/projects/services/ProjectService';
import { projectQueryKeys } from '../features/projects/hooks/useProjectQueries';
import OpportunitiesView from '../features/educator/views/OpportunitiesView';

beforeAll(() => {
  (globalThis as any).localStorage = {
    _v: 'ar',
    getItem() { return this._v; },
    setItem(_k: string, v: string) { this._v = v; },
  };
});

// Shape copied verbatim from the live local response of
// GET /api/v1/educator/opportunities (captured 2026-10-07, top-level keys
// status/message/data/pagination exactly as ApiResponseTraitV2 emits them).
const API_BODY = {
  status: true,
  message: 'Opportunities retrieved successfully',
  data: {
    projects: [
      { id: '6a7ec88a-5e23-4f0e-8012-5a929ca86a8b', title: '[ZZTEST-OPP] فرصة اختبار بدون عرض سابق', description: 'd1', budget: '8000.00', tags: ['اختبار'] },
      { id: 'fb484c62-b7a4-4856-83c4-2af816ab0baf', title: '[ZZTEST-OPP] فرصة اختبار مع عرض سابق', description: 'd2', budget: '12000.00', tags: ['اختبار'] },
      { id: '4ca6f4d3-814c-4ceb-b790-ef2f9734cad7', title: 'ZZ-TEMP-BID-GUARD-TEST A', description: 'd3', budget: '1.00', tags: [] },
      { id: '3a56a9f5-2635-4efd-b21a-c587a19d61af', title: 'ZZ-TEMP-BID-GUARD-TEST B', description: 'd4', budget: '1.00', tags: [] },
      { id: '58cf2d69-3a2d-43fe-9325-5dceceec3e9a', title: 'ZZ-TEMP-BID-GUARD-TEST C', description: 'd5', budget: '1.00', tags: [] },
    ],
  },
  pagination: {
    meta: { page: { current: 1, first: 1, last: 1, next: null, previous: null, per: 10, from: 1, to: 5, count: 5, total: 5, isFirst: true, isLast: true, isNext: false, isPrevious: false } },
    links: {},
  },
};

// axios' get() resolves with an AxiosResponse, i.e. the body sits under `.data`.
const asAxiosResponse = (body: unknown) => ({ data: body, status: 200, statusText: 'OK', headers: {}, config: {} }) as any;

const stubApi = (body: unknown) => vi.spyOn(apiClient, 'get').mockResolvedValue(asAxiosResponse(body));

// The exact unwrap that useOpportunities() performs.
const applyHookTransform = (queryData: any) => {
  const pagePayload = queryData?.data || {};
  const projects = Array.isArray(pagePayload?.projects) ? pagePayload.projects : [];
  const pagination = queryData?.pagination;
  return { projects, pagination, pageMeta: pagination?.meta?.page };
};

// renderToStaticMarkup renders a single synchronous pass, so the query cache must
// already hold the response — otherwise the component renders its loading state.
// The key must match OpportunitiesView's own filter object exactly.
const VIEW_FILTERS = { paginated: true, per_page: 10, page: 1, status: '', search: '', sort_by: 'created_at' };

const renderList = async (body: unknown) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(projectQueryKeys.opportunitiesList(VIEW_FILTERS as any), body);

  const html = await renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <LanguageProvider>
        <OpportunitiesView navigateTo={() => {}} />
      </LanguageProvider>
    </QueryClientProvider>
  );
  return html;
};

describe('R1 — getOpportunities must return the body, not the AxiosResponse', () => {
  it('returns the HTTP body so the hook finds data.projects and pagination', async () => {
    const spy = stubApi(API_BODY);
    try {
      const result: any = await ProjectService.getOpportunities({ paginated: true, per_page: 10 } as any);

      // The bug: these were undefined because an extra envelope was returned.
      expect(Array.isArray(result?.data?.projects)).toBe(true);
      expect(result?.data?.projects).toHaveLength(5);
      expect(result?.pagination?.meta?.page?.total).toBe(5);

      const { projects, pageMeta } = applyHookTransform(result);
      expect(projects).toHaveLength(5);
      expect(pageMeta.total).toBe(5);
      expect(pageMeta.total > 0).toBe(true); // pagination bar renders
    } finally {
      spy.mockRestore();
    }
  });

  it('regression guard: the hook transform would yield [] for a raw AxiosResponse', () => {
    const { projects, pagination } = applyHookTransform(asAxiosResponse(API_BODY));
    expect(projects).toHaveLength(0);
    expect(pagination).toBeUndefined();
  });
});

describe('R2 — opportunities empty state must not leak raw i18n keys', () => {
  it('renders the existing Arabic strings, never noOpportunitiesTitle/Message', async () => {
const spy = stubApi(API_BODY);
    try {
      const html = await renderList({ status: true, message: 'ok', data: { projects: [] }, pagination: { meta: { page: { total: 0 } }, links: {} } });

      expect(html).toContain('لم يتم العثور على مشاريع');
      expect(html).toContain('لا توجد مشاريع تطابق الفلاتر الحالية.');
      expect(html).not.toContain('noOpportunitiesTitle');
      expect(html).not.toContain('noOpportunitiesMessage');
    } finally {
      spy.mockRestore();
    }
  });
});

describe('opportunities list renders the opportunities returned by the API', () => {
  it('renders a card per project and the result-count line', async () => {
    const spy = stubApi(API_BODY);
    try {
      const html = await renderList(API_BODY);

      expect(html).toContain('[ZZTEST-OPP] فرصة اختبار بدون عرض سابق');
      expect(html).toContain('[ZZTEST-OPP] فرصة اختبار مع عرض سابق');
      expect(html).not.toContain('noOpportunitiesTitle');

      // projectsView.showingResults -> عرض {from} إلى {to} من أصل {total} نتيجة
      expect(html.replace(/<[^>]+>/g, '')).toMatch(/عرض\s*1\s*إلى\s*5\s*من\s*أصل\s*5\s*نتيجة/);

      expect(html).not.toContain('لا توجد مشاريع تطابق الفلاتر الحالية.');
    } finally {
      spy.mockRestore();
    }
  });
});

