'use server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { isSupabaseConfigured } from '@/lib/env';

export type FormState = { error?: string; message?: string } | null;
const GENERIC = 'Incorrect email or password, or this account is not an admin.';

export async function login(_: FormState, form: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return { error: 'Supabase is not configured. Add the keys to .env.local (see README).' };
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const password = String(form.get('password') ?? '');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || password.length < 8) return { error: GENERIC };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: GENERIC };
  // A valid Supabase login is not enough: the user must also be an active row in admin_users.
  const { data: admin } = await supabase.from('admin_users').select('is_active').eq('id', data.user.id).maybeSingle();
  if (!admin?.is_active) { await supabase.auth.signOut(); return { error: GENERIC }; }
  redirect('/admin');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

export async function requestPasswordReset(_: FormState, form: FormData): Promise<FormState> {
  if (!isSupabaseConfigured()) return { error: 'Supabase is not configured.' };
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? (await headers()).get('origin') ?? '';
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/callback?next=/admin/reset-password` });
  // Same response whether or not the account exists (no account enumeration).
  return { message: 'If that email belongs to an admin account, a reset link has been requested. Check your inbox.' };
}

export async function updatePassword(_: FormState, form: FormData): Promise<FormState> {
  const password = String(form.get('password') ?? ''), confirm = String(form.get('confirm') ?? '');
  if (password.length < 12) return { error: 'Use at least 12 characters.' };
  if (password !== confirm) return { error: 'Passwords do not match.' };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: 'Could not update the password. Open the reset link from your email again.' };
  await supabase.auth.signOut();
  redirect('/admin/login?reset=1');
}

export async function markNotificationsRead() {
  const supabase = await createClient();
  await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('is_read', false);
  revalidatePath('/admin', 'layout');
}
