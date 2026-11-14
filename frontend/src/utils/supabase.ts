import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

/**
 * Lazily-created Supabase client.
 *
 * If the Supabase environment variables are not configured, `supabase` will be
 * `null`. Callers should guard against this and display a user-friendly error
 * instead of crashing the entire application at import time.
 */
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

/**
 * Returns the Supabase client or throws a descriptive error if it is not
 * configured. Use this in features that require Supabase (e.g. password reset)
 * to fail gracefully with a clear message.
 */
export function getSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your environment.'
    )
  }
  return supabase
}