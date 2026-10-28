import { describe, it, expect, vi, beforeEach } from 'vitest';

const post = vi.fn().mockResolvedValue({ data: { status: true } });

vi.mock('../core/api/baseClient', () => ({
  apiClient: { post: (...args: any[]) => post(...args), get: vi.fn() },
}));

import { EducatorService } from '../features/educators/services/EducatorService';

describe('EducatorService.rejectAssignment', () => {
  beforeEach(() => post.mockClear());

  it('sends the reason as rejection_reason', async () => {
    await EducatorService.rejectAssignment('uuid-1', 'الجدول غير مناسب');
    expect(post).toHaveBeenCalledTimes(1);
    const [url, body] = post.mock.calls[0] as any[];
    expect(url).toBe('/educator/assignments/uuid-1/decline');
    expect(body.rejection_reason).toBe('الجدول غير مناسب');
  });

  it('still fills rejection_reason from the legacy note argument', async () => {
    await EducatorService.rejectAssignment('uuid-2', undefined, 'ملاحظة قديمة');
    const [, body] = post.mock.calls[0] as any[];
    expect(body.rejection_reason).toBe('ملاحظة قديمة');
  });
});