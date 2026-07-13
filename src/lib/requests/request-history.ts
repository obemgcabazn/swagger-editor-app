import 'server-only';

import type { Database, Json } from '@/lib/supabase/database.types';
import { createSupabaseServerClient, getAuthClaims } from '@/lib/supabase/server';

import type { ExecuteRequestResult } from './execute-request';

export type RequestHistoryRow = Database['public']['Tables']['request_history']['Row'];

export type RequestHistoryRecordStatus =
  | {
      error?: {
        code?: string;
        details?: string;
        hint?: string;
        message: string;
      };
      reason: 'insert_failed' | 'unauthenticated';
      recorded: false;
    }
  | { recorded: true };

export async function recordRequestHistory(
  result: ExecuteRequestResult
): Promise<RequestHistoryRecordStatus> {
  const supabase = await createSupabaseServerClient();
  const claims = await getAuthClaims(supabase);

  if (!claims?.sub) {
    return { reason: 'unauthenticated', recorded: false };
  }

  const { error: insertError } = await supabase.from('request_history').insert({
    duration_ms: result.response?.durationMs ?? null,
    endpoint_url: result.request.url,
    error_details: result.error?.message ?? null,
    method: result.request.method,
    request_headers: result.request.headers as Json,
    request_size_bytes: result.request.bodySizeBytes,
    response_headers: (result.response?.headers ?? null) as Json | null,
    response_size_bytes: result.response?.bodySizeBytes ?? null,
    status_code: result.response?.status ?? null,
    user_id: claims.sub,
  });

  if (insertError) {
    return {
      // keeping additional internal supabase error details for development
      ...(process.env.NODE_ENV === 'development'
        ? {
            error: {
              code: insertError.code,
              details: insertError.details,
              hint: insertError.hint,
              message: insertError.message,
            },
          }
        : {}),
      reason: 'insert_failed',
      recorded: false,
    };
  }

  return { recorded: true };
}

export async function getRequestHistory(): Promise<RequestHistoryRow[]> {
  const supabase = await createSupabaseServerClient();
  const claims = await getAuthClaims(supabase);

  if (!claims?.sub) {
    return [];
  }

  const { data, error } = await supabase
    .from('request_history')
    .select('*')
    .order('request_timestamp', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getRequestHistoryEntry(id: string): Promise<RequestHistoryRow | null> {
  const supabase = await createSupabaseServerClient();
  const claims = await getAuthClaims(supabase);

  if (!claims?.sub) {
    return null;
  }

  const { data, error } = await supabase
    .from('request_history')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
