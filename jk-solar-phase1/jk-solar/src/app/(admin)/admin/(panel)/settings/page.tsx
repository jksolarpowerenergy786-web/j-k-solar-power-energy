import { ResourceTable } from '@/components/admin/ResourceTable';
import { requireAdmin } from '@/lib/auth';
export const metadata = { title: 'Website settings' };
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; f?: string }> }) {
  await requireAdmin(['super_admin', 'admin']);   // staff cannot open this page
  return <ResourceTable title='Website settings' description="Contact details, social links, WhatsApp message and subsidy page content." table='website_settings' columns={[{key:'key',label:'Setting'},{key:'is_public',label:'Public',kind:'bool'},{key:'updated_at',label:'Updated',kind:'date'}]} order={{column:'key',ascending:true}} basePath='/admin/settings' note="Phase 1 foundation: this list is live data protected by Row Level Security. Add/edit forms arrive in Phase 4." searchParams={await searchParams} />;
}
