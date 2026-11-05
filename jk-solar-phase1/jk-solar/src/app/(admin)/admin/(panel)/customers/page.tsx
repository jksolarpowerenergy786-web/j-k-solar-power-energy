import { ResourceTable } from '@/components/admin/ResourceTable';
export const metadata = { title: 'Customers' };
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; f?: string }> }) {
  return <ResourceTable title='Customers' description="Customer records (private; visible to admins only)." table='customers' columns={[{key:'full_name',label:'Name'},{key:'mobile',label:'Mobile'},{key:'email',label:'Email'},{key:'city',label:'City'},{key:'district',label:'District'},{key:'created_at',label:'Added',kind:'date'}]} searchColumns={['full_name', 'mobile', 'email']} basePath='/admin/customers' note="Phase 1 foundation: this list is live data protected by Row Level Security. Add/edit forms arrive in Phase 4." searchParams={await searchParams} />;
}
