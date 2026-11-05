import { AuthShell } from '@/components/admin/AuthShell';
import { AuthForm } from '@/components/admin/AuthForm';
import { login } from '../actions';
import { isSupabaseConfigured } from '@/lib/env';

export const metadata = { title: 'Sign in' };
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ reset?: string; error?: string }> }) {
  const sp = await searchParams;
  return (
    <AuthShell title="Admin sign in">
      {!isSupabaseConfigured() && <p role="alert" className="mt-4 rounded-lg bg-sun/20 p-3 text-sm text-navy">Supabase is not configured yet. Copy <code>.env.example</code> to <code>.env.local</code> and add your project keys (see README).</p>}
      {sp.error === 'not_admin' && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">This account is not an active admin.</p>}
      <AuthForm action={login} submit="Sign in" notice={sp.reset ? 'Password updated. Sign in with your new password.' : undefined}
        fields={[{ name: 'email', label: 'Email', type: 'email', autoComplete: 'username' }, { name: 'password', label: 'Password', type: 'password', autoComplete: 'current-password' }]}
        links={[{ href: '/admin/forgot-password', text: 'Forgot password?' }]} />
    </AuthShell>
  );
}
