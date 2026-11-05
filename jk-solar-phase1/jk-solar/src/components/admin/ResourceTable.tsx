import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { fmtDate } from '@/lib/utils';

export type Column = { key: string; label: string; kind?: 'text' | 'date' | 'bool' | 'badge' | 'money' };
type Props = {
  title: string; description?: string; table: string; select?: string; columns: Column[];
  searchColumns?: string[]; filter?: { param: string; column: string; options: string[] };
  order?: { column: string; ascending?: boolean }; searchParams: { q?: string; f?: string }; basePath: string; note?: string; actions?: React.ReactNode;
};

const get = (row: Record<string, unknown>, path: string) => path.split('.').reduce<unknown>((a, k) => (a as Record<string, unknown> | null)?.[k], row);
function cell(v: unknown, kind: Column['kind'] = 'text') {
  if (v === null || v === undefined || v === '') return <span className="text-slate-400">–</span>;
  if (kind === 'date') return fmtDate(String(v));
  if (kind === 'bool') return v ? 'Yes' : 'No';
  if (kind === 'money') return `₹${Number(v).toLocaleString('en-IN')}`;
  if (kind === 'badge') return <span className="rounded-full bg-royal/10 px-2 py-0.5 text-xs font-medium capitalize text-royal">{String(v).replace(/_/g, ' ')}</span>;
  return String(v);
}

/** Read-only list backed by the signed-in admin's own session, so Row Level Security decides what is visible. */
export async function ResourceTable({ title, description, table, select = '*', columns, searchColumns, filter, order = { column: 'created_at', ascending: false }, searchParams, basePath, note, actions }: Props) {
  const supabase = await createClient();
  let query = supabase.from(table).select(select).order(order.column, { ascending: order.ascending ?? false }).limit(100);
  const q = searchParams.q?.trim().replace(/[%,()]/g, ' ');
  if (q && searchColumns?.length) query = query.or(searchColumns.map(c => `${c}.ilike.%${q}%`).join(','));
  if (filter && searchParams.f && filter.options.includes(searchParams.f)) query = query.eq(filter.column, searchParams.f);
  const { data, error } = await query;
  const rows = (data ?? []) as unknown as Record<string, unknown>[];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2"><h1 className="text-2xl font-semibold text-navy">{title}</h1>{actions}</div>
      {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      {note && <p className="mt-3 rounded-lg bg-sun/20 p-3 text-sm text-navy">{note}</p>}
      {(searchColumns || filter) && (
        <form className="mt-4 flex flex-wrap gap-2" action={basePath}>
          {searchColumns && <input name="q" defaultValue={searchParams.q} placeholder="Search…" aria-label="Search" className="field max-w-xs" />}
          {filter && <select name="f" defaultValue={searchParams.f ?? ''} aria-label="Filter" className="field max-w-[220px]"><option value="">All</option>{filter.options.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}</select>}
          <button className="btn-primary">Apply</button>
          {(searchParams.q || searchParams.f) && <Link href={basePath} className="grid min-h-[44px] place-items-center px-2 text-sm text-royal">Clear</Link>}
        </form>
      )}
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">Could not load data: {error.message}. Check that the migrations were applied and your account is an active admin.</p>}
      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-600"><tr>{columns.map(c => <th key={c.key} className="px-4 py-3">{c.label}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r, i) => <tr key={String(r.id ?? i)}>{columns.map(c => <td key={c.key} className="px-4 py-3 align-top">{cell(get(r, c.key), c.kind)}</td>)}</tr>)}
            {!error && rows.length === 0 && <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-slate-500">Nothing here yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
