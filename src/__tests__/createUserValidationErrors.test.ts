import { describe, expect, it } from 'vitest';
import { getServerValidationErrors } from '../features/admin/views/CreateUserView';

describe('create user server validation errors', () => {
  it('uses the field errors returned by the admin API client', () => {
    const message = 'قيمة حقل البريد الالكتروني مُستخدمة من قبل.';
    const result = getServerValidationErrors({
      statusCode: 422,
      message,
      data: { email: [message] },
      errors: { email: [message] },
    });

    expect(result).toEqual({ email: message });
  });

  it('does not convert non-validation errors into field errors', () => {
    expect(getServerValidationErrors({ statusCode: 500, message: 'Server error' })).toBeNull();
  });
});
