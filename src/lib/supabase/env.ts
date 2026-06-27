export function getSupabaseEnv() {
  const requiredServerEnv = [
    ['NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL],
    ['NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY],
  ] as const;

  const missingKeys = requiredServerEnv.filter(([, value]) => !value).map(([key]) => key);

  if (missingKeys.length > 0) {
    throw new Error(`Missing Supabase environment variables: ${missingKeys.join(', ')}`);
  }

  return {
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  } as {
    supabaseAnonKey: string;
    supabaseUrl: string;
  };
}
