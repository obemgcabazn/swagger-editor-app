import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvFile(filename: string) {
  const path = resolve(process.cwd(), filename);
  if (!existsSync(path)) {
    return;
  }

  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separator = trimmed.indexOf('=');
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator);
    const value = trimmed.slice(separator + 1).replace(/^"|"$/g, '');
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

export function getSupabaseDevCredentials() {
  return {
    email: process.env.SUPABASE_DEV_USER_EMAIL,
    password: process.env.SUPABASE_DEV_USER_PASSWORD,
  };
}

export function hasSupabaseDevCredentials() {
  const { email, password } = getSupabaseDevCredentials();
  return Boolean(email && password);
}
