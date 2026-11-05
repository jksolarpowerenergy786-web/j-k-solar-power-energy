'use client';
import { useActionState } from 'react';
import Link from 'next/link';
import type { FormState } from '@/app/(admin)/admin/actions';

type Field = { name: string; label: string; type: string; autoComplete?: string };
export function AuthForm({ action, fields, submit, links, notice }: {
  action: (s: FormState, f: FormData) => Promise<FormState>; fields: Field[]; submit: string; links?: { href: string; text: string }[]; notice?: string;
}) {
  const [state, run, pending] = useActionState(action, null);
  return (
    <form action={run} className="mt-5 space-y-4" noValidate>
      {notice && <p role="status" className="rounded-lg bg-leaf/10 p-3 text-sm text-green-800">{notice}</p>}
      {fields.map(f => (
        <div key={f.name}><label htmlFor={f.name} className="mb-1 block text-sm font-medium">{f.label}</label>
          <input id={f.name} name={f.name} type={f.type} autoComplete={f.autoComplete} required className="field" /></div>
      ))}
      {state?.error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
      {state?.message && <p role="status" className="rounded-lg bg-leaf/10 p-3 text-sm text-green-800">{state.message}</p>}
      <button className="btn-primary w-full" disabled={pending}>{pending ? 'Please wait…' : submit}</button>
      {links?.map(l => <Link key={l.href} href={l.href} className="block text-center text-sm text-royal hover:underline">{l.text}</Link>)}
    </form>
  );
}
