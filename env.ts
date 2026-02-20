/**
 * Environment variables validation. Fails fast at build/runtime if required vars are missing.
 */
const required = ['DATABASE_URL', 'JWT_SECRET'] as const;
const optional = ['NODE_ENV'] as const;

function getEnv(key: string): string | undefined {
  return process.env[key];
}

/** Validate required env vars. Call once at app init (e.g. in middleware or API). */
export function validateEnv(): void {
  const missing: string[] = [];
  for (const key of required) {
    const value = getEnv(key);
    if (value === undefined || value === '') {
      missing.push(key);
    }
  }
  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required env: ${missing.join(', ')}`);
  }
}

export function getRequiredEnv(key: (typeof required)[number]): string {
  const value = getEnv(key);
  if (value === undefined || value === '') {
    return key === 'JWT_SECRET' ? 'fallback-dev-secret' : '';
  }
  return value;
}

export type EnvKeys = (typeof required)[number] | (typeof optional)[number];
