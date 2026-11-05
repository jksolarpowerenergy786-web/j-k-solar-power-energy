import type { Metadata } from 'next';
import '@/styles/admin.css';

export const metadata: Metadata = { title: { default: 'Admin – JK Solar Power Energy', template: '%s – JK Solar Admin' }, robots: { index: false, follow: false } };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" /></head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
