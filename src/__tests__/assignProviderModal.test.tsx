import { beforeAll, describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LanguageProvider } from '../app/providers/LanguageProvider';
import AssignProviderModal from '../features/admin/components/modals/AssignProviderModal';
import { Educator } from '../shared/types';

beforeAll(() => {
  (globalThis as any).localStorage = {
    _v: 'ar',
    getItem() { return this._v; },
    setItem(_key: string, value: string) { this._v = value; },
  };
});

describe('AssignProviderModal', () => {
  it('preselects current assignees without counting them as new assignments', () => {
    const educator = {
      id: 'educator-1',
      name: 'Existing specialist',
      email: 'specialist@example.test',
      phone: '',
      status: 'ACTIVE',
      avatarUrl: '',
      rating: 4.5,
      availabilityStatus: 'available',
      bio: '',
      profile: {},
      academicMajors: [],
      languages: [],
      services: [],
    } as Educator;

    const html = renderToStaticMarkup(
      <LanguageProvider>
        <AssignProviderModal
          isOpen
          onClose={() => {}}
          educators={[educator]}
          existingEducatorIds={[educator.id]}
          onAssign={async () => {}}
        />
      </LanguageProvider>
    );

    expect(html).toContain('Existing specialist');
    expect(html).toContain('border-brand-primary bg-yellow-50');
    expect(html).toContain('حفظ (0)');
  });
});
