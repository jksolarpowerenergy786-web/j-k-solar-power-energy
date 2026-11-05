import type { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return ['en', 'gu'].map(l => ({ url: `${base}/${l}`, changeFrequency: 'weekly', priority: 1, alternates: { languages: { en: `${base}/en`, gu: `${base}/gu` } } }));
}
