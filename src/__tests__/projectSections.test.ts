import { describe, expect, it } from 'vitest';
import {
  getProjectTabForView,
  getProjectTaskCount,
  isProjectAreaView,
  isProjectListView,
  PROJECT_SECTIONS,
} from '../features/admin/constants/projectSections';

describe('admin project sections', () => {
  it('maps every project section view to its matching API tab', () => {
    expect(PROJECT_SECTIONS.map(({ key }) => key)).toEqual([
      'all',
      'with_offers',
      'pending',
      'in_progress',
      'completed',
    ]);

    PROJECT_SECTIONS.forEach(({ key, view }) => {
      expect(getProjectTabForView(view)).toBe(key);
      expect(isProjectListView(view)).toBe(true);
    });
  });

  it('keeps project details in the project area without treating them as list tabs', () => {
    expect(isProjectAreaView('projectDetail')).toBe(true);
    expect(isProjectAreaView('createProject')).toBe(true);
    expect(isProjectListView('projectDetail')).toBe(false);
    expect(getProjectTabForView('dashboard')).toBe('all');
  });

  it('uses the API task count consistently and falls back to loaded tasks only when absent', () => {
    expect(getProjectTaskCount({ tasksCount: 0, tasks: [{ id: 'one' }] })).toBe(0);
    expect(getProjectTaskCount({ tasksCount: 3, tasks: [{ id: 'one' }] })).toBe(3);
    expect(getProjectTaskCount({ tasks: [{ id: 'one' }, { id: 'two' }] })).toBe(2);
    expect(getProjectTaskCount({})).toBe(0);
  });
});
