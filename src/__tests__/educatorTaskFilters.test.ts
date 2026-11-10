import { describe, expect, it } from 'vitest';
import {
  formatTaskDeadline,
  isTaskCreatedWithinRange,
  isTaskRecentlyAdded,
} from '../features/educator/views/TasksView';

describe('educator task date filters', () => {
  it('filters by the API createdAt date and includes both range boundaries', () => {
    expect(isTaskCreatedWithinRange('2025-03-10 14:30:00', '2025-03-10', '2025-03-10')).toBe(true);
    expect(isTaskCreatedWithinRange('2025-03-09 23:59:00', '2025-03-10', '')).toBe(false);
    expect(isTaskCreatedWithinRange(undefined, '2025-03-10', '')).toBe(false);
  });

  it('uses the assignment date for recently assigned tasks', () => {
    expect(isTaskRecentlyAdded({
      createdAt: '2024-01-01',
      assignedEducator: { id: 'educator-id', assigned_type: 'FROM_BID', status: 'ACCEPTED', amount: 10, assigned_at: '2025-03-10' },
    }, '2025-03-01')).toBe(true);
  });

  it('accepts Laravel serialized date objects for assignment dates', () => {
    expect(isTaskRecentlyAdded({
      createdAt: '2024-01-01',
      assignedEducator: {
        id: 'educator-id',
        assigned_type: 'DIRECT',
        status: 'ACCEPTED',
        amount: 10,
        assigned_at: { date: '2025-03-10 11:15:00.000000', timezone_type: 3, timezone: 'Asia/Riyadh' },
      },
    }, '2025-03-01')).toBe(true);
  });

  it('formats valid deadlines consistently and preserves invalid values', () => {
    expect(formatTaskDeadline('2025-03-10', 'en')).toBe('10/03/2025');
    expect(formatTaskDeadline('not-a-date', 'en')).toBe('not-a-date');
    expect(formatTaskDeadline(null, 'en')).toBe('-');
  });
});
