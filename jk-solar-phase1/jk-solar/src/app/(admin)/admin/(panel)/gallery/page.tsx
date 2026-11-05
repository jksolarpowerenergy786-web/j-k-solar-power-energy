import { ResourceTable } from '@/components/admin/ResourceTable';
export const metadata = { title: 'Gallery' };
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; f?: string }> }) {
  return <ResourceTable title='Gallery' description="Project images and videos (uploads go to the site-media storage bucket in Phase 4)." table='gallery' columns={[{key:'title_en',label:'Title'},{key:'category',label:'Category',kind:'badge'},{key:'media_type',label:'Type',kind:'badge'},{key:'is_active',label:'Published',kind:'bool'},{key:'created_at',label:'Added',kind:'date'}]} searchColumns={['title_en']} order={{column:'sort_order',ascending:true}} basePath='/admin/gallery' note="Phase 1 foundation: this list is live data protected by Row Level Security. Add/edit forms arrive in Phase 4." searchParams={await searchParams} />;
}
