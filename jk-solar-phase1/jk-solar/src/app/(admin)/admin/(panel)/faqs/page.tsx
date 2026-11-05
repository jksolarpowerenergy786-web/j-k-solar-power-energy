import { ResourceTable } from '@/components/admin/ResourceTable';
export const metadata = { title: 'FAQs' };
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; f?: string }> }) {
  return <ResourceTable title='FAQs' description="Questions and answers in English and Gujarati." table='faqs' columns={[{key:'question_en',label:'Question (EN)'},{key:'question_gu',label:'Question (ગુ)'},{key:'is_active',label:'Published',kind:'bool'}]} searchColumns={['question_en', 'question_gu']} order={{column:'sort_order',ascending:true}} basePath='/admin/faqs' note="Phase 1 foundation: this list is live data protected by Row Level Security. Add/edit forms arrive in Phase 4." searchParams={await searchParams} />;
}
