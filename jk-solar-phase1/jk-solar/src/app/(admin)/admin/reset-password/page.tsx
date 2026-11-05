import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/admin/AuthShell';
import { AuthForm } from '@/components/admin/AuthForm';
import { updatePassword } from '../actions';
import { createClient } from '@/lib/supabase/server';
export const metadata = { title: 'Choose a new password' };
export default async function Page() {
  const { data: { user } } = await (await createClient()).auth.getUser();
  if (!user) redirect('/admin/forgot-password');   // only reachable from the emailed link (session set by /auth/callback)
  return <AuthShell title="Choose a new password"><AuthForm action={updatePassword} submit="Update password" fields={[{ name: 'password', label: 'New password (12+ characters)', type: 'password', autoComplete: 'new-password' }, { name: 'confirm', label: 'Confirm password', type: 'password', autoComplete: 'new-password' }]} /></AuthShell>;
}
