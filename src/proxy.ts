import createMiddleware from 'next-intl/middleware';
import { type NextRequest, type NextResponse } from 'next/server';

import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/proxy';

const intlMiddleware = createMiddleware(routing);

// Headers Supabase @supabase/ssr writes via setAll(cacheHeaders) on session refresh - copy them so CDN won't cache auth responses.
const SUPABASE_SESSION_CACHE_HEADERS = new Set(['cache-control', 'expires', 'pragma']);

// Merge Supabase session refresh output into the next-intl proxy response without overriding intl headers.
export function mergeSupabaseSessionIntoIntlResponse(
  supabaseResponse: NextResponse,
  intlResponse: NextResponse
) {
  for (const cookie of supabaseResponse.cookies.getAll()) {
    intlResponse.cookies.set(cookie);
  }

  for (const [name, value] of supabaseResponse.headers) {
    if (SUPABASE_SESSION_CACHE_HEADERS.has(name.toLowerCase())) {
      intlResponse.headers.set(name, value);
    }
  }
}

export async function proxy(request: NextRequest) {
  const supabaseResponse = await updateSession(request);
  const intlResponse = intlMiddleware(request);

  if (intlResponse) {
    mergeSupabaseSessionIntoIntlResponse(supabaseResponse, intlResponse);
    return intlResponse;
  }

  return supabaseResponse;
}

// we exlude api routes, since i18n route mathcing can be expensive for every api call
export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
