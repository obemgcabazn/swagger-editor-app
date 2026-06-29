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

export function getSupabaseDevAuthEnv() {
  const requiredDevAuthEnv = [
    ['SUPABASE_DEV_USER_EMAIL', process.env.SUPABASE_DEV_USER_EMAIL],
    ['SUPABASE_DEV_USER_PASSWORD', process.env.SUPABASE_DEV_USER_PASSWORD],
  ] as const;

  const missingKeys = requiredDevAuthEnv.filter(([, value]) => !value).map(([key]) => key);

  if (missingKeys.length > 0) {
    throw new Error(`Missing Supabase dev auth environment variables: ${missingKeys.join(', ')}`);
  }

  return {
    email: process.env.SUPABASE_DEV_USER_EMAIL,
    password: process.env.SUPABASE_DEV_USER_PASSWORD,
  } as {
    email: string;
    password: string;
  };
}
