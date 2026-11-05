import fs from 'node:fs';
import path from 'node:path';

/** Renders the client's official logo from /public/brand/logo.(svg|png|webp). Never redrawn or stretched.
 *  Until the file is added, a clearly-marked placeholder is shown. */
export function Logo({ className = '', dark = false }: { className?: string; dark?: boolean }) {
  const file = ['logo.svg', 'logo.png', 'logo.webp'].find(f => fs.existsSync(path.join(process.cwd(), 'public/brand', f)));
  if (file) return <img src={`/brand/${file}`} alt="JK Solar Power Energy" style={{ height: 46, width: 'auto', maxWidth: 220 }} className={className} />;
  return <span className={`logo ${className}`} style={dark ? { color: '#cfe0f3', borderColor: '#cfe0f3' } : undefined}>Logo: add public/brand/logo.png</span>;
}
