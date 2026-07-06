import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'password_too_short')
  .regex(/\p{L}/u, 'password_needs_letter')
  .regex(/\p{N}/u, 'password_needs_digit')
  .regex(/[^\p{L}\p{N}]/u, 'password_needs_special');

export const signUpSchema = z
  .object({
    name: z.string().min(2, 'name_too_short').max(100, 'name_too_long'),
    email: z.email('invalid_email'),
    password: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'password_dont_match',
    path: ['passwordConfirm'],
  });

export const signInSchema = z.object({
  email: z.email('invalid_email'),
  password: z.string().min(1, 'password_required'),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
