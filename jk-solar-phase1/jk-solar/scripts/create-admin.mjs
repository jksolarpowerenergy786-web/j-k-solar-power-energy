// Creates the first admin account. Run locally only (needs the service-role key). Usage:
//   node --env-file=.env.local scripts/create-admin.mjs you@example.com "Your Name" super_admin
import { createClient } from '@supabase/supabase-js';
import { createInterface } from 'node:readline/promises';
const [email, fullName = '', role = 'super_admin'] = process.argv.slice(2);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!email || !url || !key) { console.error('Usage: node --env-file=.env.local scripts/create-admin.mjs <email> [full name] [super_admin|admin|staff]\nNEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local'); process.exit(1); }
if (!['super_admin','admin','staff'].includes(role)) { console.error('Invalid role'); process.exit(1); }
const rl = createInterface({ input: process.stdin, output: process.stdout });
const password = await rl.question('Password (min 12 chars, shown while typing): '); rl.close();
if (password.length < 12) { console.error('Password too short'); process.exit(1); }
const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
const { data, error } = await sb.auth.admin.createUser({ email, password, email_confirm: true });
if (error) { console.error('Auth error:', error.message); process.exit(1); }
const { error: e2 } = await sb.from('admin_users').insert({ id: data.user.id, email, full_name: fullName || null, role });
if (e2) { await sb.auth.admin.deleteUser(data.user.id); console.error('admin_users insert failed (user rolled back):', e2.message); process.exit(1); }
console.log(`Created ${role}: ${email}`);
