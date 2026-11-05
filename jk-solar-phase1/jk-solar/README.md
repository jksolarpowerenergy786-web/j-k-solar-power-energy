# JK Solar Power Energy – Phase 1 (Backend Foundation)

Next.js 15 · TypeScript · Tailwind CSS · Supabase (Postgres, Auth, Storage) · English + Gujarati.

## What is in Phase 1
| Area | Status |
|---|---|
| Project structure, TypeScript, Tailwind, security headers | Done |
| Approved homepage ported to React (`/en`, `/gu`, language kept in URL + cookie) | Done |
| 17-table schema, migrations, RLS, storage bucket, seed | Done (see tests below) |
| Supabase Auth: admin login, logout, password reset, protected routes, roles | Done, **needs your Supabase project to run** |
| Admin dashboard: responsive sidebar, overview, 11 section pages | Done (read-only lists; forms arrive in Phase 4) |
| Booking form, calculator persistence, tracking, email | **Not in Phase 1** (Phase 3) |

## Folder structure
```
supabase/migrations/   0001 schema · 0002 RLS · 0003 storage · 0004 seed
supabase/tests/        rls_test.sql (rolled-back security test)
scripts/               verify-schema.mjs · create-admin.mjs
src/app/(site)/[lang]  public site (en | gu)         src/app/(admin)/admin  admin app
src/components/{site,admin}   src/lib (auth, env, supabase/*)   src/i18n   src/styles
```

## Setup
1. **Install:** `npm install`
2. **Create a Supabase project** at supabase.com (free tier is fine).
3. **Environment:** `cp .env.example .env.local`, then fill `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` from *Project Settings → API*. The service-role key is server-only and must never get a `NEXT_PUBLIC_` prefix.
4. **Apply migrations** (pick one):
   - Dashboard: open *SQL Editor* and run `0001_schema.sql`, `0002_rls.sql`, `0003_storage.sql`, `0004_seed.sql` in that order.
   - CLI: `npx supabase link --project-ref <ref>` then `npx supabase db push`.
5. **Auth settings** (Supabase → Authentication): turn **off** "Allow new users to sign up"; set *Site URL* to your site URL; add `<site>/auth/callback` to *Redirect URLs*. Password resets use Supabase's built-in email (rate-limited); configure custom SMTP there for production.
6. **Create the first admin:** `npm run create:admin -- you@example.com "Your Name" super_admin` (loads `.env.local`; prompts for a 12+ character password). Roles: `super_admin` (everything, manages admins) · `admin` (content + operations) · `staff` (bookings/customers/enquiries only; content is read-only).
7. **Logo:** put the supplied file at `public/brand/logo.png` (or `.svg` / `.webp`). It is shown as-is, never redrawn. Until then a labelled placeholder appears.
8. **Run:** `npm run dev` → http://localhost:3000 (site) and http://localhost:3000/admin (admin).

## Test it
```bash
npm run verify:schema     # static checks: 17 tables, UUID PKs, timestamps, triggers, RLS + policies (no DB needed)
npm run typecheck         # after npm install
# Execute the migrations on a throwaway local database and run the security test:
npx supabase start        # needs Docker
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f supabase/migrations/0001_schema.sql   # …then 0002, 0003, 0004
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f supabase/tests/rls_test.sql
```
Manual auth checks: (1) `/admin` while signed out redirects to `/admin/login`; (2) a Supabase user that is not in `admin_users` is refused; (3) a `staff` user is redirected away from `/admin/calculator` and `/admin/settings`; (4) sign out ends the session; (5) the reset link opens `/admin/reset-password`.

## Security notes
- RLS is enabled on every table. Visitors can read only published catalogue rows and approved reviews; **customer data has no public policy at all**.
- Public forms and booking tracking will use server routes with the service-role client (`src/lib/supabase/admin.ts`, `server-only`) after validation (Phase 3), verifying reference **and** mobile before returning anything.
- Admin pages are guarded in middleware (session) **and** in the server layout (active `admin_users` row + role).
- No online payment code exists; the schema leaves room to add it later.

## Deploy (Vercel)
Import the repo, add every variable from `.env.example` in *Project → Settings → Environment Variables* (service-role key as a server variable), set `NEXT_PUBLIC_SITE_URL=https://jksolarpowerenergy.com`, deploy, then add the domain under *Settings → Domains* and set the DNS records Vercel shows. Update Supabase *Site URL* and redirect URLs to the production domain. Full guide is completed in Phase 5.
