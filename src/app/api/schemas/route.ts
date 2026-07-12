import { NextResponse } from 'next/server';
import { createSupabaseServerClient, getAuthClaims } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const claims = await getAuthClaims(supabase);

  if (!claims?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('saved_schemas')
    .select('content, format')
    .eq('user_id', claims.sub)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? { content: '', format: 'yaml' });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const claims = await getAuthClaims(supabase);

  if (!claims?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { content: string; format: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.content || !body.format) {
    return NextResponse.json({ error: 'content and format are required' }, { status: 400 });
  }

  if (body.format !== 'json' && body.format !== 'yaml') {
    return NextResponse.json({ error: 'format must be json or yaml' }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from('saved_schemas')
    .select('id')
    .eq('user_id', claims.sub)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('saved_schemas')
      .update({
        content: body.content,
        format: body.format as 'json' | 'yaml',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    const { error } = await supabase.from('saved_schemas').insert({
      user_id: claims.sub,
      content: body.content,
      format: body.format as 'json' | 'yaml',
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
