const requiredPublicKeys = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;

export function getMissingPublicEnvVars() {
  return requiredPublicKeys.filter((key) => !process.env[key]);
}

export function getEnvVar(name: string, fallback = "") {
  return process.env[name] ?? fallback;
}

export function hasSupabaseEnv() {
  return getMissingPublicEnvVars().length === 0;
}
