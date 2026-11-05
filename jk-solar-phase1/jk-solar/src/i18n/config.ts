import type { Lang } from './dictionary';
export const LANGS: Lang[] = ['en', 'gu'];
export const isLang = (v: string): v is Lang => LANGS.includes(v as Lang);
