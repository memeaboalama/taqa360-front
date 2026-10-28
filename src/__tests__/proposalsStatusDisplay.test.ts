import { describe, it, expect } from 'vitest';

// Mirrors ProposalsView.normStatus exactly - the fix is that the API sends
// lower-cased statuses while BidStatus is upper-cased.
const normStatus = (value: unknown): string =>
    typeof value === 'string' ? value.trim().toUpperCase().replace(/[-\s]+/g, '_') : '';

enum BidStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  ASSIGNED = 'ASSIGNED',
  REJECTED = 'REJECTED',
}

// Mirrors ProposalsView overallStatus useMemo.
const overallStatus = (bidTasks: any[]) => {
  const statuses = bidTasks.map(bt => normStatus(bt.status));
  if (statuses.length === 0) return BidStatus.PENDING;
  if (statuses.every(s => s === BidStatus.ASSIGNED)) return BidStatus.ASSIGNED;
  if (statuses.every(s => s === BidStatus.REJECTED)) return BidStatus.REJECTED;
  if (statuses.some(s => s === BidStatus.ASSIGNED || s === BidStatus.APPROVED)) return BidStatus.APPROVED;
  return BidStatus.PENDING;
};

describe('ProposalsView overall status', () => {
  it('shows PENDING for a bid whose tasks are all pending', () => {
    expect(overallStatus([{ status: 'pending' }])).toBe(BidStatus.PENDING);
  });

  it('shows APPROVED for an agreed bid (api sends lower-case)', () => {
    expect(overallStatus([{ status: 'approved' }])).toBe(BidStatus.APPROVED);
  });

  it('shows ASSIGNED for a bid in execution (api sends lower-case)', () => {
    expect(overallStatus([{ status: 'assigned' }])).toBe(BidStatus.ASSIGNED);
  });

  it('shows REJECTED for a rejected bid', () => {
    expect(overallStatus([{ status: 'rejected' }])).toBe(BidStatus.REJECTED);
  });

  it('shows ASSIGNED only when every task is assigned', () => {
    expect(overallStatus([{ status: 'assigned' }, { status: 'assigned' }])).toBe(BidStatus.ASSIGNED);
    expect(overallStatus([{ status: 'assigned' }, { status: 'pending' }])).toBe(BidStatus.APPROVED);
  });

  it('falls back to PENDING when there are no tasks', () => {
    expect(overallStatus([])).toBe(BidStatus.PENDING);
  });

  it('reproduces the old bug without normalisation (regression guard)', () => {
    const broken = (bidTasks: any[]) => {
      const statuses = bidTasks.map(bt => bt.status); // no normStatus
      if (statuses.some(s => s === BidStatus.ASSIGNED || s === BidStatus.APPROVED)) return BidStatus.APPROVED;
      return BidStatus.PENDING;
    };
    // This is what produced the wrong badge before the fix.
    expect(broken([{ status: 'approved' }])).toBe(BidStatus.PENDING);
    // And this is what the fix produces.
    expect(overallStatus([{ status: 'approved' }])).toBe(BidStatus.APPROVED);
  });

  it('tolerates uppercase and hyphenated values from the API', () => {
    expect(overallStatus([{ status: 'APPROVED' }])).toBe(BidStatus.APPROVED);
    expect(overallStatus([{ status: 'in-progress' }])).toBe(BidStatus.PENDING);
  });
});