import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLang, LANGS } from '@/i18n/config';
import { D } from '@/i18n/dictionary';
import '@/styles/home.css';

export const generateStaticParams = () => LANGS.map(lang => ({ lang }));

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    title: 'JK Solar Power Energy',
    description: D[lang].sub,
    alternates: { languages: { en: '/en', gu: '/gu' } },
  };
}

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <html lang={lang}>
      <head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Noto+Sans+Gujarati:wght@400;500;700&display=swap" /></head>
      <body className={lang}>{children}</body>
    </html>
  );
}
