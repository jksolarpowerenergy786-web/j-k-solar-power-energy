'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';
import { NAV } from './nav';
import type { AdminRole } from '@/lib/auth';
import { logout } from '@/app/(admin)/admin/actions';

export function Sidebar({ role, email, unread, logo }: { role: AdminRole; email: string; unread: number; logo: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const items = NAV.filter(i => !i.roles || i.roles.includes(role));
  const nav = (
    <nav aria-label="Admin" className="flex-1 space-y-1 overflow-y-auto p-3">
      {items.map(i => {
        const active = i.href === '/admin' ? path === '/admin' : path.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} onClick={() => setOpen(false)} aria-current={active ? 'page' : undefined}
            className={`flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${active ? 'bg-royal text-white' : 'text-blue-100 hover:bg-white/10'}`}>
            <i.icon size={18} aria-hidden />{i.label}
            {i.href === '/admin/notifications' && unread > 0 && <span className="ml-auto rounded-full bg-sun px-2 text-xs font-bold text-navy">{unread}</span>}
          </Link>
        );
      })}
    </nav>
  );
  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between bg-navy px-4 py-2 lg:hidden">
        <span className="font-semibold text-white">JK Solar Admin</span>
        <button onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open} className="grid h-11 w-11 place-items-center text-white">{open ? <X /> : <Menu />}</button>
      </div>
      <aside className={`${open ? 'flex' : 'hidden'} fixed inset-x-0 bottom-0 top-[52px] z-20 flex-col bg-navy lg:static lg:flex lg:w-64 lg:shrink-0`}>
        <div className="hidden border-b border-white/10 bg-white p-4 lg:block">{logo}</div>
        {nav}
        <div className="border-t border-white/10 p-3 text-xs text-blue-100">
          <p className="truncate">{email}</p><p className="mb-2 capitalize">{role.replace('_', ' ')}</p>
          <form action={logout}><button className="flex min-h-[44px] w-full items-center gap-2 rounded-lg px-3 text-sm font-medium text-white hover:bg-white/10"><LogOut size={16} aria-hidden />Sign out</button></form>
        </div>
      </aside>
    </>
  );
}
