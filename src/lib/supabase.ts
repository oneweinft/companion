import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client initialization.
 *
 * Setup:
 * 1. Create a free project at https://supabase.com
 * 2. Copy your Project URL and anon key from Settings > API
 * 3. Add to .env.local:
 *    VITE_SUPABASE_URL=https://yourproject.supabase.co
 *    VITE_SUPABASE_ANON_KEY=your-anon-key
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;
