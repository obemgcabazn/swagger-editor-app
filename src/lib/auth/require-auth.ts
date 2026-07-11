import 'server-only';

import { getLocale } from 'next-intl/server';

import { redirect } from '@/i18n/navigation';
import { getAuthClaims } from '@/lib/supabase/server';

export async function requireAuth() {
  const claims = await getAuthClaims();

  if (!claims) {
    redirect({ href: '/sign-in', locale: await getLocale() });
  }

  return claims;
}

export async function redirectIfAuthenticated() {
  const claims = await getAuthClaims();

  if (claims) {
    redirect({ href: '/', locale: await getLocale() });
  }
}
