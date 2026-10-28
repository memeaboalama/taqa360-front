import { describe, it, expect } from 'vitest';
import { isBidUpdatable } from '../shared/utils';

describe('isBidUpdatable', () => {
  it('allows editing while every task is still pending', () => {
    expect(isBidUpdatable([{ status: 'PENDING' }, { status: 'pending' }])).toBe(true);
  });

  it('allows editing when the bid has no tasks yet', () => {
    expect(isBidUpdatable([])).toBe(true);
    expect(isBidUpdatable(undefined)).toBe(true);
  });

  it('blocks editing once a task is approved (agreement)', () => {
    expect(isBidUpdatable([{ status: 'PENDING' }, { status: 'APPROVED' }])).toBe(false);
  });

  it('blocks editing once a task is assigned (execution started)', () => {
    expect(isBidUpdatable([{ status: 'ASSIGNED' }])).toBe(false);
  });

  it('blocks editing once a task is rejected', () => {
    expect(isBidUpdatable([{ status: 'REJECTED' }])).toBe(false);
  });

  it('matches the backend guard on the raw API status casing', () => {
    expect(isBidUpdatable([{ status: 'approved' }])).toBe(false);
    expect(isBidUpdatable([{ status: 'in-progress' }])).toBe(false);
    expect(isBidUpdatable([{ status: 'pending' }])).toBe(true);
  });
});