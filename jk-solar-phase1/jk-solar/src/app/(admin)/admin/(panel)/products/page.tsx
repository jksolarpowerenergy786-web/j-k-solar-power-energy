import { ResourceTable } from '@/components/admin/ResourceTable';
export const metadata = { title: 'Products' };
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; f?: string }> }) {
  return <ResourceTable title='Products' description="Catalogue shown on the public Products page." table='products' columns={[{key:'name_en',label:'Name'},{key:'category',label:'Category',kind:'badge'},{key:'brand',label:'Brand'},{key:'price',label:'Price',kind:'money'},{key:'availability',label:'Availability',kind:'badge'},{key:'is_active',label:'Published',kind:'bool'}]} searchColumns={['name_en', 'brand']} order={{column:'sort_order',ascending:true}} basePath='/admin/products' note="Phase 1 foundation: this list is live data protected by Row Level Security. Add/edit forms arrive in Phase 4." searchParams={await searchParams} />;
}
