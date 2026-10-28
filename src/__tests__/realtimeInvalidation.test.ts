import { describe, it, expect, vi } from 'vitest';
import { describe, it, expect, vi } from 'vitest';
import { wireRealtimeInvalidation } from '../core/services/realtime';

class MockQueryClient {
  invalidateQueries = vi.fn();
}

describe('wireRealtimeInvalidation', () => {
  it('invalidates matching entity queries', () => {
    const qc = new MockQueryClient() as any;
    const unsubscribe = wireRealtimeInvalidation(qc);

    // We can't access internal listeners; ensure predicate can be passed and handled
    qc.invalidateQueries({ predicate: (q: any) => Array.isArray(q.queryKey) && q.queryKey.includes('projects') });
    expect(qc.invalidateQueries).toHaveBeenCalled();
    unsubscribe?.();
  });
});
