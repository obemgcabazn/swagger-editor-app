import createMiddleware from 'next-intl/middleware';
import { type NextRequest } from 'next/server';

import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/proxy';

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const supabaseResponse = await updateSession(request);
  const intlResponse = intlMiddleware(request);

  if (intlResponse) {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      intlResponse.cookies.set(cookie.name, cookie.value);
    });
    return intlResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
