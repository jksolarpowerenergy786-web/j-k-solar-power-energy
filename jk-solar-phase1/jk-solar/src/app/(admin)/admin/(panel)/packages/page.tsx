import { ResourceTable } from '@/components/admin/ResourceTable';
export const metadata = { title: 'Pricing & packages' };
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; f?: string }> }) {
  return <ResourceTable title='Pricing & packages' description="Capacities 1–10 kW. Prices and specifications stay empty until you enter them; nothing is invented." table='solar_packages' columns={[{key:'capacity_kw',label:'Capacity (kW)'},{key:'estimated_price',label:'Estimated price',kind:'money'},{key:'show_price',label:'Show price',kind:'bool'},{key:'is_active',label:'Enabled',kind:'bool'},{key:'updated_at',label:'Updated',kind:'date'}]} order={{column:'capacity_kw',ascending:true}} basePath='/admin/packages' note="Phase 1 foundation: this list is live data protected by Row Level Security. Add/edit forms arrive in Phase 4." searchParams={await searchParams} />;
}
