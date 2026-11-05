import { AuthShell } from '@/components/admin/AuthShell';
import { AuthForm } from '@/components/admin/AuthForm';
import { requestPasswordReset } from '../actions';
export const metadata = { title: 'Reset password' };
export default function Page() {
  return <AuthShell title="Reset your password"><AuthForm action={requestPasswordReset} submit="Send reset link" fields={[{ name: 'email', label: 'Admin email', type: 'email', autoComplete: 'username' }]} links={[{ href: '/admin/login', text: 'Back to sign in' }]} /></AuthShell>;
}
