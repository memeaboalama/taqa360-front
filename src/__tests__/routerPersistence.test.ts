import { describe, it, expect } from 'vitest';
import { saveEducatorRoute, loadEducatorRoute } from '../core/utils/router';

describe('router persistence', () => {
  it('saves and loads educator route via path', () => {
    saveEducatorRoute('proposals', { bidId: 'b-123' });
    const { view, ctx } = loadEducatorRoute();
    expect(view).toBe('proposals');
    expect(ctx).toEqual({ bidId: 'b-123' });
    expect(window.location.pathname).toContain('/educator/proposals');
  });
});
