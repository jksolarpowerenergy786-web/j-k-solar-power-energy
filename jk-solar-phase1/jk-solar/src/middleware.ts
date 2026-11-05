import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const LANGS = ['en', 'gu'];
const PUBLIC_ADMIN = ['/admin/login', '/admin/forgot-password', '/admin/reset-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return pathname === '/admin/login' ? NextResponse.next() : NextResponse.redirect(new URL('/admin/login', request.url));
    }
    const { response, user } = await updateSession(request);
    if (!user && !PUBLIC_ADMIN.includes(pathname)) return NextResponse.redirect(new URL('/admin/login', request.url));
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  // Public site: keep the visitor's language in the URL (/en, /gu) and remember it in a cookie.
  const first = pathname.split('/')[1];
  if (!LANGS.includes(first) && !pathname.startsWith('/auth') && !pathname.startsWith('/api')) {
    const saved = request.cookies.get('jk_lang')?.value;
    const lang = LANGS.includes(saved ?? '') ? saved : 'en';
    return NextResponse.redirect(new URL(`/${lang}${pathname === '/' ? '' : pathname}`, request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|brand/|.*\\.(?:svg|png|jpg|jpeg|webp|ico|txt|xml)$).*)'] };
