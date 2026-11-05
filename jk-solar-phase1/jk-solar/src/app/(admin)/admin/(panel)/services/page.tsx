import { ResourceTable } from '@/components/admin/ResourceTable';
export const metadata = { title: 'Services' };
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; f?: string }> }) {
  return <ResourceTable title='Services' description="Service pages content (English and Gujarati)." table='services' columns={[{key:'title_en',label:'Title (EN)'},{key:'title_gu',label:'Title (ગુ)'},{key:'slug',label:'Slug'},{key:'is_active',label:'Published',kind:'bool'}]} searchColumns={['title_en', 'title_gu']} order={{column:'sort_order',ascending:true}} basePath='/admin/services' note="Phase 1 foundation: this list is live data protected by Row Level Security. Add/edit forms arrive in Phase 4." searchParams={await searchParams} />;
}
