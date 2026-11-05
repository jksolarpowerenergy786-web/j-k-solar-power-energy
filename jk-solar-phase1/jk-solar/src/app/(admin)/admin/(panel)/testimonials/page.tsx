import { ResourceTable } from '@/components/admin/ResourceTable';
export const metadata = { title: 'Testimonials' };
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; f?: string }> }) {
  return <ResourceTable title='Testimonials' description="Only reviews you approve are shown publicly. No reviews are ever generated." table='testimonials' columns={[{key:'customer_name',label:'Customer'},{key:'rating',label:'Rating'},{key:'project_type',label:'Project'},{key:'status',label:'Status',kind:'badge'},{key:'is_featured',label:'Featured',kind:'bool'},{key:'review_date',label:'Date',kind:'date'}]} searchColumns={['customer_name']} filter={{param:'f',column:'status',options:['pending', 'approved', 'rejected']}} basePath='/admin/testimonials' note="Phase 1 foundation: this list is live data protected by Row Level Security. Add/edit forms arrive in Phase 4." searchParams={await searchParams} />;
}
