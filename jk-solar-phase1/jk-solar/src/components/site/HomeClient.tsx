'use client';
import { useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { D, type Lang } from '@/i18n/dictionary';

const NUM = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '918141953601';
const wa = (m: string) => `https://wa.me/${NUM}?text=${encodeURIComponent(m)}`;
const IDS = ['about', 'services', 'products', 'packages', 'calculator', 'gallery', 'reviews', 'faq'];
const KW = [1, 2, 3, 4, 5, 7, 10];
// Sample assumption for the design preview only. In Phase 3 this is read from calculator_settings (admin-configured).
const SAMPLE_UNITS_PER_KW = 120;

const Opt = ({ a }: { a: string[] }) => <>{a.map(x => <option key={x}>{x}</option>)}</>;

export function HomeClient({ lang, logo, footerLogo }: { lang: Lang; logo: ReactNode; footerLogo: ReactNode }) {
  const d = D[lang];
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState(0);
  const [units, setUnits] = useState(300);
  const [sent, setSent] = useState(false);
  const kw = Math.max(1, Math.min(10, Math.ceil(units / SAMPLE_UNITS_PER_KW)));
  const gal = useMemo(() => d.cats.slice(1).map((c: string, i: number) => ({ c, i: i + 1 })).filter((g: { i: number }) => cat === 0 || cat === g.i), [d, cat]);

  const setLang = (l: Lang) => { document.cookie = `jk_lang=${l}; path=/; max-age=31536000; samesite=lax`; router.push(`/${l}`); };
  const links = IDS.map((id, i) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>{d.nav[i]}</a>);

  return (<>
    <header><div className="w hd">
      <a href="#top" className="hl" aria-label="JK Solar Power Energy">{logo}</a>
      <nav className={open ? 'open' : ''}>{links}</nav>
      <div className="lang" role="group" aria-label="Language">
        {(['en', 'gu'] as Lang[]).map(l => <button key={l} className={lang === l ? 'on' : ''} onClick={() => setLang(l)}>{l === 'en' ? 'EN' : 'ગુ'}</button>)}
      </div>
      <button className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>☰</button>
    </div></header>

    <main id="top">
      <div className="hero"><div className="w hg"><div>
        <h1>{d.h1}</h1><p>{d.sub}</p>
        <div className="cta"><a className="btn b1" href="#contact">{d.c1}</a><a className="btn b2" href="#booking">{d.c2}</a><a className="btn b3" href="#calculator">{d.c3}</a></div>
      </div>
        <div className="art"><svg viewBox="0 0 420 340" role="img" aria-label="Rooftop solar panels under the sun">
          <defs><linearGradient id="s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1b5fb0" /><stop offset="1" stopColor="#06275D" /></linearGradient></defs>
          <g stroke="#FFB800" strokeWidth="5" strokeLinecap="round"><path d="M330 20v22M330 120v22M268 81h-22M392 81h22M286 37l-15-15M374 37l15-15M286 125l-15 15M374 125l15 15" /></g>
          <circle cx="330" cy="81" r="38" fill="#FFB800" />
          <path d="M20 330V190L210 100 400 190v140z" fill="#0a3c82" opacity=".6" />
          <g transform="translate(70 170) skewY(-8)"><g fill="url(#s)" stroke="#8fd0ff" strokeWidth="2">
            {[0, 92, 184].flatMap(x => [0, 62].map(y => <rect key={`${x}-${y}`} x={x} y={y} width="86" height="56" />))}</g>
            <path d="M43 0v118M135 0v118M227 0v118M0 28h270M0 90h270" stroke="#8fd0ff" strokeWidth=".8" opacity=".6" /></g>
          <rect x="20" y="318" width="380" height="8" rx="4" fill="#43A51E" /></svg></div>
      </div></div>

      <section id="about"><div className="w two"><div className="sh" style={{ margin: 0 }}><h2>{d.aT}</h2><p>{d.aP}</p>
        <div className="cta" style={{ marginTop: 18 }}><a className="btn b4" href="#services">{d.aB}</a></div></div>
        <div className="tiles">{d.why.map((t: string) => <div className="tile" key={t}>{t}</div>)}</div></div></section>

      <section className="alt" id="services"><div className="w"><div className="sh"><h2>{d.sT}</h2><p>{d.sP}</p></div>
        <div className="grid">{d.sv.map((s: string[]) => <div className="card" key={s[1]}><div className="ic">{s[0]}</div><h3>{s[1]}</h3><p>{s[2]}</p>
          <a className="btn b4" href="#contact">{d.enq}</a><a className="btn b5" target="_blank" rel="noopener" href={wa(`${d.wm} (${s[1]})`)}>WhatsApp</a></div>)}</div></div></section>

      <section id="products"><div className="w"><div className="sh"><h2>{d.pT}</h2><p>{d.pP}</p></div>
        <div className="grid">{d.pd.map((s: string[]) => <div className="card" key={s[1]}><div className="ic">{s[0]}</div><h3>{s[1]}</h3><p>{d.price}</p><a className="btn b4" href="#contact">{d.enq}</a></div>)}</div></div></section>

      <section className="alt" id="packages"><div className="w"><div className="sh"><h2>{d.kT}</h2><p>{d.kP}</p></div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))' }}>{KW.map(k => <div className="card pk" key={k}><div className="kw">{k}kW</div><p>{d.price}</p><a className="btn b2" href="#booking">{d.kwl}</a></div>)}</div></div></section>

      <section id="calculator"><div className="w"><div className="sh"><h2>{d.calT}</h2><p>{d.calP}</p></div>
        <div className="calc"><div>
          <label htmlFor="u">{d.u}</label><input id="u" type="number" min={0} value={units} onChange={e => setUnits(Math.max(0, +e.target.value || 0))} />
          <label htmlFor="pt">{d.pt}</label><select id="pt"><Opt a={d.props} /></select>
          <label htmlFor="ty">{d.ty}</label><select id="ty"><Opt a={d.types} /></select></div>
          <div className="res"><small>{d.r1}</small><b>{units > 0 ? `${kw} kW` : '–'}</b>
            <small>{d.r2}</small><b>{units > 0 ? `~${kw * SAMPLE_UNITS_PER_KW} ${lang === 'gu' ? 'યુનિટ' : 'units'}` : '–'}</b>
            <div className="cta"><a className="btn b1" href="#contact">{d.c1}</a>
              <a className="btn b5" target="_blank" rel="noopener" href={wa(`Hello JK Solar Power Energy, my monthly use is ${units} units. Suggested capacity: ${kw} kW. Please share a quote.`)}>{d.wa}</a></div>
            <p className="disc">{d.disc}</p></div></div></div></section>

      <section className="alt" id="gallery"><div className="w"><div className="sh"><h2>{d.gT}</h2></div>
        <div className="chips">{d.cats.map((c: string, i: number) => <button key={c} className={`chip${i === cat ? ' on' : ''}`} onClick={() => setCat(i)}>{c}</button>)}</div>
        <div className="gal">{[0, 1].flatMap(r => gal.map((g: { c: string; i: number }) => <button className="gi" key={`${r}-${g.i}`}><span>{g.c}</span></button>))}</div>
        <p className="disc">{d.gN}</p></div></section>

      <section id="subsidy"><div className="w"><div className="sub"><div><h2>{d.subT}</h2><p>{d.subP}</p></div>
        <a className="btn b1" href="https://pmsuryaghar.gov.in/" target="_blank" rel="noopener noreferrer">{d.subB}</a></div></div></section>

      <section className="alt" id="reviews"><div className="w"><div className="sh"><h2>{d.rT}</h2></div><div className="empty">{d.rE}</div></div></section>

      <section id="booking"><div className="w two"><div className="sh" style={{ margin: 0 }}><h2>{d.bT}</h2><p>{d.bP}</p></div>
        <form className="card" noValidate onSubmit={e => { e.preventDefault(); setSent(true); }}><div className="bk">
          <div><label htmlFor="n">{d.fn}</label><input id="n" required /></div>
          <div><label htmlFor="m">{d.fm}</label><input id="m" inputMode="tel" required /></div>
          <div><label htmlFor="ci">{d.fc}</label><input id="ci" /></div>
          <div><label htmlFor="cp">{d.fp}</label><select id="cp"><Opt a={KW.map(k => `${k} kW`)} /></select></div></div>
          <button className="btn b2" type="submit" style={{ marginTop: 16, width: '100%' }}>{d.fs}</button>
          <div className="ok" role="status" style={{ display: sent ? 'block' : 'none' }}>{d.ok}</div></form></div></section>

      <section className="alt" id="faq"><div className="w"><div className="sh"><h2>{d.fT}</h2></div>
        {d.fq.map((f: string[]) => <details key={f[0]}><summary>{f[0]}</summary><p>{f[1]}</p></details>)}</div></section>

      <section id="contact"><div className="w"><div className="sub" style={{ background: 'linear-gradient(120deg,var(--navy),var(--blue))' }}>
        <div><h2>{d.ctT}</h2><p style={{ color: '#d6e6f7' }}>{d.ctP}</p></div>
        <div className="cta"><a className="btn b5" target="_blank" rel="noopener" href={wa(d.wm)}>{d.wa}</a><a className="btn b1" href="tel:8141953601">📞 8141953601</a><a className="btn b3" href="mailto:jksolarpowerenergy@gmail.com">✉ Email</a></div></div></div></section>
    </main>

    <footer><div className="w grid">
      <div>{footerLogo}<h3 style={{ marginTop: 10 }}>JK Solar Power Energy</h3><p>{d.fl}</p></div>
      <div><h3>{d.nv}</h3>{links}</div>
      <div><h3>{d.ctc}</h3><a href="tel:8141953601">📞 8141953601</a><a href="mailto:jksolarpowerenergy@gmail.com">✉ jksolarpowerenergy@gmail.com</a><span>{d.loc}</span></div></div></footer>
    <a className="wa" href={wa(d.wm)} target="_blank" rel="noopener" aria-label="WhatsApp">💬</a>
  </>);
}
