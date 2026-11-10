import type { ComponentType } from 'react';
import type { ViewType } from '../../../shared/types';
import {
  BidsIcon,
  CheckCircleIcon,
  ClockIcon,
  ProjectsIcon,
  ZapIcon,
} from '../../../shared/components/Icons';

export type ProjectTabKey =
  | 'all'
  | 'with_offers'
  | 'pending'
  | 'in_progress'
  | 'completed';

export interface ProjectSection {
  key: ProjectTabKey;
  view: ViewType;
  labelKey: string;
  icon: ComponentType<{ className?: string }>;
}

export const PROJECT_SECTIONS: ProjectSection[] = [
  { key: 'all', view: 'projects', labelKey: 'projectsView.tabs.all', icon: ProjectsIcon },
  { key: 'with_offers', view: 'projectsWithOffers', labelKey: 'projectsView.tabs.withOffers', icon: BidsIcon },
  { key: 'pending', view: 'projectsPending', labelKey: 'projectsView.tabs.pending', icon: ClockIcon },
  { key: 'in_progress', view: 'projectsInProgress', labelKey: 'projectsView.tabs.inProgress', icon: ZapIcon },
  { key: 'completed', view: 'projectsCompleted', labelKey: 'projectsView.tabs.completed', icon: CheckCircleIcon },
];

export const PROJECT_SIDEBAR_SECTIONS = PROJECT_SECTIONS;

const PROJECT_VIEW_TABS = Object.fromEntries(
  PROJECT_SECTIONS.map((section) => [section.view, section.key])
) as Record<string, ProjectTabKey>;

const PROJECT_DETAIL_VIEWS: ViewType[] = [
  'projectDetail',
  'createProject',
  'bidDetail',
  'taskDetail',
];

export function getProjectTabForView(view: ViewType): ProjectTabKey {
  return PROJECT_VIEW_TABS[view] ?? 'all';
}

export function isProjectListView(view: ViewType): boolean {
  return PROJECT_SECTIONS.some((section) => section.view === view);
}

export function isProjectAreaView(view: ViewType): boolean {
  return isProjectListView(view) || PROJECT_DETAIL_VIEWS.includes(view);
}

export function getProjectTaskCount(project: {
  tasksCount?: number | string | null;
  tasks_count?: number | string | null;
  tasks?: unknown[];
}): number {
  const count = project.tasksCount ?? project.tasks_count;
  if (count !== null && count !== undefined && count !== '' && Number.isFinite(Number(count))) {
    return Number(count);
  }
  return Array.isArray(project.tasks) ? project.tasks.length : 0;
}
