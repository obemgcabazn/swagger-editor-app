import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseEnv } from './env';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { supabasePublishableKey, supabaseUrl } = getSupabaseEnv();

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      // called after token refresh, sign-in/sign-out
      setAll(cookiesToSet, cacheHeaders) {
        // update request cookies -> Server Components reading cookies on the same request see the refreshed token
        // Browser -> server direction, name=value cookie pairs don't have options
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        supabaseResponse = NextResponse.next({ request });
        // server -> browser, 'Http-only', 'SameSite', 'Max-Age' cookie options
        // update response cookies -> browser stores the refreshed token for the next navigation
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );

        Object.entries(cacheHeaders).forEach(([key, value]) => {
          supabaseResponse.headers.set(key, value);
        });
      },
    },
  });

  // local first validity token check, only network trip if refresh needed
  await supabase.auth.getClaims();

  return supabaseResponse;
}
