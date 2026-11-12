// Utility Functions
// A collection of helper functions used across the application.

export const formatDate = (date: string | Date | null | undefined, locale: string = 'ar-EG'): string => {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatFileSize = (value: number | string | null | undefined): string => {
  if (value == null || value === '') return '-';

  const raw = String(value).trim();
  const match = raw.match(/^([\d.,]+)\s*(bytes?|b|kb|kib|mb|mib|gb|gib|بايت|بايتات|ك\.ب|م\.ب|ج\.ب)?$/i);
  if (!match) return raw;

  const amount = Number(match[1].replace(',', '.'));
  if (!Number.isFinite(amount) || amount < 0) return raw;

  const unit = (match[2] ?? 'bytes').toLowerCase();
  const unitPower: Record<string, number> = {
    byte: 0,
    bytes: 0,
    b: 0,
    بايت: 0,
    بايتات: 0,
    kb: 1,
    kib: 1,
    'ك.ب': 1,
    mb: 2,
    mib: 2,
    'م.ب': 2,
    gb: 3,
    gib: 3,
    'ج.ب': 3,
  };
  const bytes = amount * 1024 ** (unitPower[unit] ?? 0);
  const units = ['بايت', 'ك.ب', 'م.ب', 'ج.ب'];
  let size = bytes;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }

  return `${Number(size.toFixed(index === 0 || size >= 10 ? 0 : 1))} ${units[index]}`;
};

/** Shape we need from an assignment, tolerant of the API's nested/flat forms. */
export interface TeamAssignmentLike {
  id?: string;
  status?: string | null;
  educatorId?: string | null;
  educator?: { id?: string | null; name?: string | null; avatarUrl?: string | null } | null;
}

const normalizeStatus = (value: string | null | undefined): string =>
  String(value ?? '').trim().toUpperCase().replace(/[-\s]+/g, '_');

/**
 * Single source of truth for "can this bid still be edited?".
 *
 * Mirrors the backend guard (`Bid::isUpdatable()` / `UpdateBidAction`): a bid is
 * editable only while none of its tasks has left PENDING. Approved (accepted),
 * assigned (execution started) and rejected bids are locked, so the edit entry
 * points must not offer them.
 */
export const isBidUpdatable = (bidTasks: any): boolean => {
  const tasks = Array.isArray(bidTasks) ? bidTasks : [];
  return !tasks.some(bt => normalizeStatus(bt?.status) !== 'PENDING');
};

/**
 * Single source of truth for "who is on this project's team".
 *
 * A project has no team field: the team is derived from the assignments of its
 * tasks, and only ACCEPTED assignments count. The same educator can be assigned
 * to several tasks and must appear once. Names/avatars are not part of the
 * project payload for every shape, so they are resolved against the educators
 * list when missing.
 *
 * Used by both the project list card and the project detail team card so the
 * two screens can never disagree.
 */
export const resolveProjectTeam = (
  project: any,
  educators: any[] = []
): { id: string; name: string; avatarUrl: string | null }[] => {
  const tasks: any[] = Array.isArray(project?.tasks) ? project.tasks : [];

  const byEducatorId = new Map<string, TeamAssignmentLike>();
  for (const task of tasks) {
    // tasks[].assignments is the normalised key, tasks[].assignedEducators is
    // the raw API key
    const assignments: TeamAssignmentLike[] = Array.isArray(task?.assignments)
      ? task.assignments
      : Array.isArray(task?.assignedEducators)
        ? task.assignedEducators
        : [];

    for (const assignment of assignments) {
      if (normalizeStatus(assignment?.status) !== 'ACCEPTED') continue;

      const id = assignment?.educator?.id || assignment?.educatorId || null;
      if (!id || byEducatorId.has(id)) continue;
      byEducatorId.set(id, assignment);
    }
  }

  const educatorsById = new Map<string, any>(
    (Array.isArray(educators) ? educators : [])
      .filter((e: any) => e?.id)
      .map((e: any) => [e.id, e])
  );

  return Array.from(byEducatorId.entries())
    .map(([id, assignment]) => {
      const educator: any =
        (assignment.educator && assignment.educator.name ? assignment.educator : null) ||
        educatorsById.get(id) ||
        null;
      return {
        id,
        name: educator?.name ?? 'Unknown',
        avatarUrl: educator?.avatarUrl ?? educator?.avatar_url ?? educator?.image ?? null,
      };
    })
    .filter((member) => member.name !== 'Unknown' || educatorsById.has(member.id));
};

export const getProjectOverviewMetrics = (project: any) => {
  const tasks: any[] = Array.isArray(project?.tasks) ? project.tasks : [];
  const assignments: any[] = tasks.flatMap((task) => (
    Array.isArray(task?.assignments)
      ? task.assignments
      : Array.isArray(task?.assignedEducators)
        ? task.assignedEducators
        : []
  ));
  const taskCounts = { pending: 0, inProgress: 0, completed: 0, cancelled: 0 };
  const assignmentCounts = { accepted: 0, pending: 0, rejected: 0, inProgress: 0, completed: 0, cancelled: 0 };
  let acceptedCost = 0;

  for (const task of tasks) {
    const status = normalizeStatus(task?.status);
    if (status === 'PENDING') taskCounts.pending += 1;
    else if (status === 'IN_PROGRESS') taskCounts.inProgress += 1;
    else if (status === 'COMPLETED') taskCounts.completed += 1;
    else if (status === 'CANCELED' || status === 'CANCELLED') taskCounts.cancelled += 1;
  }

  for (const assignment of assignments) {
    const status = normalizeStatus(assignment?.status ?? assignment?.assignment_status);
    if (status === 'ACCEPTED') {
      assignmentCounts.accepted += 1;
      acceptedCost += Number(assignment?.amount) || 0;
    } else if (status === 'PENDING') assignmentCounts.pending += 1;
    else if (status === 'REJECTED' || status === 'REJECTED_BY_EDUCATOR') assignmentCounts.rejected += 1;
    else if (status === 'IN_PROGRESS') assignmentCounts.inProgress += 1;
    else if (status === 'COMPLETED') assignmentCounts.completed += 1;
    else if (status === 'CANCELLED') assignmentCounts.cancelled += 1;
  }

  return { tasks, assignments, taskCounts, assignmentCounts, acceptedCost };
};
