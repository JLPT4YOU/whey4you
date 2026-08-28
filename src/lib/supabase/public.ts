import { createClient as createSupabaseClient } from '@supabase/supabase-js';

let publicSupabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

/**
 * Public Supabase Client (Stateless, không đọc cookies request)
 * Phục vụ cho Server Components, Static Generation và unstable_cache
 */
export function createPublicClient() {
  if (publicSupabaseInstance) return publicSupabaseInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  publicSupabaseInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return publicSupabaseInstance;
}
