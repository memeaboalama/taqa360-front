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
