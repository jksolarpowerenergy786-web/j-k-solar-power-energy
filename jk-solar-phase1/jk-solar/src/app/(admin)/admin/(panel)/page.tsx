import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { fmtDate, label } from '@/lib/utils';

export const metadata = { title: 'Dashboard' };
type Counts = [string, string, (q: any) => any][];   // eslint-disable-line @typescript-eslint/no-explicit-any

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const admin = await requireAdmin();
  const sp = await searchParams;
  const supabase = await createClient();
  const count = async (table: string, f?: (q: any) => any) => {   // eslint-disable-line @typescript-eslint/no-explicit-any
    const q = supabase.from(table).select('*', { count: 'exact', head: true });
    const { count: c, error } = await (f ? f(q) : q);
    return error ? null : (c ?? 0);
  };
  const stats: Counts = [
    ['Total enquiries', 'enquiries', q => q], ['Total bookings', 'bookings', q => q],
    ['Pending requests', 'bookings', q => q.in('status', ['request_received', 'under_review', 'contact_pending'])],
    ['Approved bookings', 'bookings', q => q.eq('status', 'approved')],
    ['Completed installations', 'bookings', q => q.eq('status', 'installation_completed')],
    ['Total customers', 'customers', q => q], ['Total products', 'products', q => q], ['Total services', 'services', q => q],
  ];
  const [values, enq, bk] = await Promise.all([
    Promise.all(stats.map(([, t, f]) => count(t, f))),
    supabase.from('enquiries').select('id,name,source,created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('bookings').select('id,reference_no,status,created_at,customers(full_name)').order('created_at', { ascending: false }).limit(5),
  ]);
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold text-navy">Welcome{admin.fullName ? `, ${admin.fullName}` : ''}</h1><p className="text-sm text-slate-600">Overview of enquiries and bookings.</p></div>
      {sp.error === 'forbidden' && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">Your role does not have access to that page.</p>}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(([name], i) => (
          <div key={name} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500">{name}</p><p className="mt-1 text-3xl font-bold text-navy">{values[i] ?? '–'}</p>
          </div>))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4"><div className="mb-2 flex justify-between"><h2 className="font-semibold">Recent enquiries</h2><Link href="/admin/notifications" className="text-sm text-royal">Notifications</Link></div>
          {(enq.data ?? []).length === 0 ? <p className="py-6 text-center text-sm text-slate-500">No enquiries yet.</p> :
            <ul className="divide-y divide-slate-100 text-sm">{enq.data!.map(e => <li key={e.id} className="flex justify-between gap-2 py-2"><span>{e.name} <span className="text-slate-500">· {label(e.source)}</span></span><span className="text-slate-500">{fmtDate(e.created_at)}</span></li>)}</ul>}</section>
        <section className="rounded-xl border border-slate-200 bg-white p-4"><div className="mb-2 flex justify-between"><h2 className="font-semibold">Recent booking requests</h2><Link href="/admin/bookings" className="text-sm text-royal">All bookings</Link></div>
          {(bk.data ?? []).length === 0 ? <p className="py-6 text-center text-sm text-slate-500">No bookings yet.</p> :
            <ul className="divide-y divide-slate-100 text-sm">{bk.data!.map((b: any) => <li key={b.id} className="flex justify-between gap-2 py-2"><span>{b.reference_no} <span className="text-slate-500">· {b.customers?.full_name}</span></span><span className="text-slate-500">{label(b.status)}</span></li>)}</ul>}</section>
      </div>
    </div>
  );
}
