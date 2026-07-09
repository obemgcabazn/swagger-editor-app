'use server';

import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { signInSchema, signUpSchema, type SignInInput, type SignUpInput } from '@/lib/auth/schemas';

export async function signInAction(input: SignInInput) {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation_error' as const };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    console.error('[signInAction] Supabase signIn failed:', error.code, error.message);
    return { error: 'invalid_credentials' as const };
  }

  const locale = await getLocale();
  redirect(`/${locale}`);
}

export async function signUpAction(input: SignUpInput) {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { error: 'validation_error' as const };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { name: parsed.data.name } },
  });

  if (error) {
    console.error('[signUpAction] Supabase signUp failed:', error.code, error.message);

    if (error.code === 'user_already_exists') {
      return { error: 'user_already_exists' as const };
    }
    if (error.code === 'over_email_send_rate_limit') {
      return { error: 'email_rate_limit' as const };
    }
    return { error: 'sign_up_error' as const };
  }

  const locale = await getLocale();
  redirect(`/${locale}`);
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  const locale = await getLocale();
  redirect(`/${locale}`);
}
