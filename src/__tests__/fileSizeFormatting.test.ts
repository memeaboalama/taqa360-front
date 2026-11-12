import { describe, expect, it } from 'vitest';
import { formatFileSize } from '../shared/utils';

describe('formatFileSize', () => {
  it.each([
    [0, '0 بايت'],
    [512, '512 بايت'],
    [1024, '1 ك.ب'],
    [1048576, '1 م.ب'],
    ['1536', '1.5 ك.ب'],
    ['2.5 MB', '2.5 م.ب'],
    ['22KB', '22 ك.ب'],
    [null, '-'],
  ])('formats %s as %s', (value, expected) => {
    expect(formatFileSize(value)).toBe(expected);
  });
});
