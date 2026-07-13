import { NextResponse } from 'next/server';

import { getSupabaseDevAuthEnv } from '@/lib/supabase/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let credentials: ReturnType<typeof getSupabaseDevAuthEnv>;

  try {
    credentials = getSupabaseDevAuthEnv();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Missing dev auth credentials' },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(credentials);

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? 'Unable to sign in' }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      email: data.user.email,
      id: data.user.id,
    },
  });
}
