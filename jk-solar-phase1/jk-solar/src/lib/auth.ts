import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type AdminRole = 'super_admin' | 'admin' | 'staff';
export type AdminSession = { id: string; email: string; fullName: string | null; role: AdminRole };

/** Returns the signed-in, active admin, or null. Checks the admin_users table, not just that a Supabase login exists. */
export async function getAdmin(): Promise<AdminSession | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('admin_users').select('id,email,full_name,role,is_active').eq('id', user.id).maybeSingle();
  if (!data || !data.is_active) return null;
  return { id: data.id, email: data.email, fullName: data.full_name, role: data.role as AdminRole };
}

/** Server-side guard for admin pages and actions. Pass the roles allowed; omit for any active admin. */
export async function requireAdmin(allowed?: AdminRole[]): Promise<AdminSession> {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login?error=not_admin');
  if (allowed && !allowed.includes(admin.role)) redirect('/admin?error=forbidden');
  return admin;
}
