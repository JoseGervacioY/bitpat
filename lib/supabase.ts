import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Standard public client using the anon key.
 * Use this for public queries or where RLS is not required or handled via Admin.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Creates a new Supabase client with the user's access token.
 * This satisfies RLS policies like (auth.uid() = user_id).
 */
export function createAuthClient(accessToken: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
