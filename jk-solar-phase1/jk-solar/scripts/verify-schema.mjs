// Static checks on the SQL migrations (no database needed). Real execution test: see docs/SETUP.md "Test the migrations".
import { readFileSync, readdirSync } from 'node:fs';
const dir = new URL('../supabase/migrations/', import.meta.url);
const files = readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
const sql = Object.fromEntries(files.map(f => [f, readFileSync(new URL(f, dir), 'utf8')]));
const schema = sql['0001_schema.sql'], rls = sql['0002_rls.sql'];
const required = ['admin_users','customers','bookings','enquiries','products','services','solar_packages','gallery','testimonials','faqs','website_settings','contact_messages','calculator_settings','calculator_results','notifications','booking_status_history','admin_notes'];
const errors = [];
const tables = {};
for (const m of schema.matchAll(/create table (\w+) \(([\s\S]*?)\n\);/g)) tables[m[1]] = m[2];
for (const t of required) {
  const body = tables[t];
  if (!body) { errors.push(`missing table ${t}`); continue; }
  if (!/\bid uuid primary key/.test(body)) errors.push(`${t}: no UUID primary key`);
  if (!/created_at timestamptz/.test(body)) errors.push(`${t}: no created_at`);
  if (!/updated_at timestamptz/.test(body)) errors.push(`${t}: no updated_at`);
  if (!new RegExp(`'${t}'`).test(schema.split('updated_at triggers')[1] || '')) errors.push(`${t}: no updated_at trigger`);
  if (!new RegExp(`'${t}'`).test(rls.split('enable row level security')[0])) errors.push(`${t}: not in RLS enable list`);
  if (!new RegExp(`(on ${t}\\b)|('${t}')`).test(rls.split('enable row level security')[1] || '')) errors.push(`${t}: no policies`);
}
for (const t of Object.keys(tables)) if (!required.includes(t)) errors.push(`unexpected table ${t}`);
const open = (s) => (s.match(/\(/g) || []).length - (s.match(/\)/g) || []).length;
for (const f of files) { if (open(sql[f]) !== 0) errors.push(`${f}: unbalanced parentheses`); if ((sql[f].match(/\$\$/g) || []).length % 2) errors.push(`${f}: unbalanced $$`); }
if (/anon/.test(rls.replace(/--.*$/gm, '').match(/create policy (customers|bookings)[^;]*;/g)?.join('') || '')) errors.push('anon policy on private table');
console.log(`Checked ${files.length} migration files, ${Object.keys(tables).length} tables.`);
if (errors.length) { console.error('FAILED:\n - ' + errors.join('\n - ')); process.exit(1); }
console.log('Schema checks passed: all 17 tables have UUID PK, timestamps, updated_at trigger, RLS enabled and policies.');
