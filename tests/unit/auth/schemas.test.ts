import { describe, expect, it } from 'vitest';

import { signInSchema, signUpSchema } from '@/lib/auth/schemas';

const VALID_SIGN_UP = {
  name: 'Ada',
  email: 'ada@example.com',
  password: 'Password1!',
  passwordConfirm: 'Password1!',
};

describe('signInSchema', () => {
  it('accepts a fully valid sign-in payload', () => {
    const result = signInSchema.safeParse({ email: 'ada@example.com', password: 'anypassword' });
    expect(result.success).toBe(true);
  });

  describe('email field', () => {
    it('rejects an empty email with invalid_email', () => {
      const result = signInSchema.safeParse({ email: '', password: 'x' });
      expect(result.success).toBe(false);
      expect(result.error?.issues.find((i) => i.path[0] === 'email')?.message).toBe(
        'invalid_email'
      );
    });

    it('rejects a string without @ with invalid_email', () => {
      const result = signInSchema.safeParse({ email: 'notanemail', password: 'x' });
      expect(result.success).toBe(false);
      expect(result.error?.issues.find((i) => i.path[0] === 'email')?.message).toBe(
        'invalid_email'
      );
    });

    it('rejects a string missing domain with invalid_email', () => {
      const result = signInSchema.safeParse({ email: 'user@nodot', password: 'x' });
      expect(result.success).toBe(false);
      expect(result.error?.issues.find((i) => i.path[0] === 'email')?.message).toBe(
        'invalid_email'
      );
    });
  });

  describe('password field', () => {
    it('rejects an empty password with password_required', () => {
      const result = signInSchema.safeParse({ email: 'u@e.com', password: '' });
      expect(result.success).toBe(false);
      expect(result.error?.issues.find((i) => i.path[0] === 'password')?.message).toBe(
        'password_required'
      );
    });

    it('accepts any non-empty password', () => {
      expect(signInSchema.safeParse({ email: 'u@e.com', password: 'a' }).success).toBe(true);
    });
  });
});

describe('signUpSchema', () => {
  it('accepts a fully valid sign-up payload and returns typed data', () => {
    const result = signUpSchema.safeParse(VALID_SIGN_UP);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(VALID_SIGN_UP);
  });

  describe('name field', () => {
    it('rejects a name of 1 character with name_too_short', () => {
      const result = signUpSchema.safeParse({ ...VALID_SIGN_UP, name: 'a' });
      expect(result.success).toBe(false);
      expect(result.error?.issues.find((i) => i.path[0] === 'name')?.message).toBe(
        'name_too_short'
      );
    });

    it('rejects an empty name with name_too_short', () => {
      const result = signUpSchema.safeParse({ ...VALID_SIGN_UP, name: '' });
      expect(result.success).toBe(false);
      expect(result.error?.issues.find((i) => i.path[0] === 'name')?.message).toBe(
        'name_too_short'
      );
    });

    it('accepts a name of exactly 2 characters (lower boundary)', () => {
      expect(signUpSchema.safeParse({ ...VALID_SIGN_UP, name: 'ab' }).success).toBe(true);
    });

    it('accepts a name of exactly 100 characters (upper boundary)', () => {
      expect(signUpSchema.safeParse({ ...VALID_SIGN_UP, name: 'a'.repeat(100) }).success).toBe(
        true
      );
    });

    it('rejects a name of 101 characters with name_too_long', () => {
      const result = signUpSchema.safeParse({ ...VALID_SIGN_UP, name: 'a'.repeat(101) });
      expect(result.success).toBe(false);
      expect(result.error?.issues.find((i) => i.path[0] === 'name')?.message).toBe('name_too_long');
    });
  });

  describe('email field', () => {
    it('rejects an invalid email with invalid_email', () => {
      const result = signUpSchema.safeParse({ ...VALID_SIGN_UP, email: 'notvalid' });
      expect(result.success).toBe(false);
      expect(result.error?.issues.find((i) => i.path[0] === 'email')?.message).toBe(
        'invalid_email'
      );
    });

    it('accepts a valid email', () => {
      expect(signUpSchema.safeParse({ ...VALID_SIGN_UP, email: 'test@example.com' }).success).toBe(
        true
      );
    });
  });

  describe('password field (passwordSchema)', () => {
    it('rejects passwords under 8 characters with password_too_short', () => {
      // aB1! has letter, digit, special — but only 4 chars
      const pw = 'aB1!';
      const result = signUpSchema.safeParse({
        ...VALID_SIGN_UP,
        password: pw,
        passwordConfirm: pw,
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues.find((i) => i.path[0] === 'password')?.message).toBe(
        'password_too_short'
      );
    });

    it('rejects passwords with no Unicode letter with password_needs_letter', () => {
      const pw = '12345678!';
      const result = signUpSchema.safeParse({
        ...VALID_SIGN_UP,
        password: pw,
        passwordConfirm: pw,
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues.find((i) => i.path[0] === 'password')?.message).toBe(
        'password_needs_letter'
      );
    });

    it('rejects passwords with no Unicode digit with password_needs_digit', () => {
      const pw = 'abcdefgh!';
      const result = signUpSchema.safeParse({
        ...VALID_SIGN_UP,
        password: pw,
        passwordConfirm: pw,
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues.find((i) => i.path[0] === 'password')?.message).toBe(
        'password_needs_digit'
      );
    });

    it('rejects passwords with no special character with password_needs_special', () => {
      const pw = 'abcde123';
      const result = signUpSchema.safeParse({
        ...VALID_SIGN_UP,
        password: pw,
        passwordConfirm: pw,
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues.find((i) => i.path[0] === 'password')?.message).toBe(
        'password_needs_special'
      );
    });

    it('accepts a password satisfying all four constraints', () => {
      expect(signUpSchema.safeParse(VALID_SIGN_UP).success).toBe(true);
    });

    it('recognises a space as a valid special character', () => {
      const pw = 'abcde12 ';
      expect(
        signUpSchema.safeParse({ ...VALID_SIGN_UP, password: pw, passwordConfirm: pw }).success
      ).toBe(true);
    });

    it('recognises a Unicode letter as satisfying the letter requirement', () => {
      const pw = 'été12345!';
      expect(
        signUpSchema.safeParse({ ...VALID_SIGN_UP, password: pw, passwordConfirm: pw }).success
      ).toBe(true);
    });
  });

  describe('passwordConfirm / refine', () => {
    it('rejects mismatched passwords with password_dont_match', () => {
      const result = signUpSchema.safeParse({ ...VALID_SIGN_UP, passwordConfirm: 'Different1!' });
      expect(result.success).toBe(false);
      const issue = result.error?.issues.find((i) => i.message === 'password_dont_match');
      expect(issue).toBeDefined();
    });

    it('attaches the mismatch error to the passwordConfirm path', () => {
      const result = signUpSchema.safeParse({ ...VALID_SIGN_UP, passwordConfirm: 'Different1!' });
      expect(result.success).toBe(false);
      const issue = result.error?.issues.find((i) => i.message === 'password_dont_match');
      expect(issue?.path).toEqual(['passwordConfirm']);
    });

    it('accepts matching passwords', () => {
      expect(signUpSchema.safeParse(VALID_SIGN_UP).success).toBe(true);
    });
  });
});
