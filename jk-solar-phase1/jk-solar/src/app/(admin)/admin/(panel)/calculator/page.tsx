import { ResourceTable } from '@/components/admin/ResourceTable';
import { requireAdmin } from '@/lib/auth';
export const metadata = { title: 'Calculator settings' };
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; f?: string }> }) {
  await requireAdmin(['super_admin', 'admin']);   // staff cannot open this page
  return <ResourceTable title='Calculator settings' description="Cost per kW, generation, tariff, efficiency and subsidy text. All values start empty; the calculator will not show costs or savings for anything you have not set." table='calculator_settings' columns={[{key:'label',label:'Label'},{key:'state',label:'State'},{key:'district',label:'District'},{key:'cost_per_kw',label:'Cost / kW',kind:'money'},{key:'monthly_generation_per_kw',label:'Units / kW / month'},{key:'tariff_per_unit',label:'Tariff / unit',kind:'money'},{key:'is_active',label:'Active',kind:'bool'}]} basePath='/admin/calculator' note="Phase 1 foundation: this list is live data protected by Row Level Security. Add/edit forms arrive in Phase 4." searchParams={await searchParams} />;
}
