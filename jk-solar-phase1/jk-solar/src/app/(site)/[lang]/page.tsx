import { notFound } from 'next/navigation';
import { isLang } from '@/i18n/config';
import { Logo } from '@/components/site/Logo';
import { HomeClient } from '@/components/site/HomeClient';

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <HomeClient lang={lang} logo={<Logo />} footerLogo={<Logo dark />} />;
}
