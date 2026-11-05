import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/admin/Sidebar';
import { Logo } from '@/components/site/Logo';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();                       // server-side guard on every panel page
  const supabase = await createClient();
  const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('is_read', false);
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar role={admin.role} email={admin.email} unread={count ?? 0} logo={<Logo />} />
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
