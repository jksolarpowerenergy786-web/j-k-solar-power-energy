import 'server-only';
import { createClient } from '@supabase/supabase-js';

/** Service-role client: bypasses RLS. Server-only (the 'server-only' import fails the build if it reaches client code).
 *  Use ONLY in API routes / server actions after validating input, e.g. public booking and tracking in Phase 3. */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || !process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_URL not configured');
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
