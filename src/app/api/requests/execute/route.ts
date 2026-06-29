import { NextResponse } from 'next/server';

import { executeExternalRequest, parseExecuteRequestPayload } from '@/lib/requests/execute-request';
import { recordRequestHistory } from '@/lib/requests/request-history';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const parsed = parseExecuteRequestPayload(payload);

  if (!parsed.data) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const result = await executeExternalRequest(parsed.data);
  const analytics = await recordRequestHistory(result);

  return NextResponse.json({
    analytics,
    ...result,
  });
}
