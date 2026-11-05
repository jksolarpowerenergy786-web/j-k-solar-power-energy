-- Security test for the migrations. Run AFTER 0001–0004 on a local/dev database (never production):
--   psql "$DATABASE_URL" -f supabase/tests/rls_test.sql
-- Everything runs in one transaction that is rolled back. Any failed check raises an exception.
begin;
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000a1','staff@test.local'), ('00000000-0000-0000-0000-0000000000a2','admin@test.local'), ('00000000-0000-0000-0000-0000000000a3','plain-user@test.local');
insert into admin_users (id, email, role) values ('00000000-0000-0000-0000-0000000000a1','staff@test.local','staff'), ('00000000-0000-0000-0000-0000000000a2','admin@test.local','admin');
insert into customers (id, full_name, mobile) values ('00000000-0000-0000-0000-0000000000c1','Test Customer','9999999999');
insert into bookings (customer_id, property_type, capacity_kw) values ('00000000-0000-0000-0000-0000000000c1','residential',3);
insert into products (slug, category, name_en, is_active) values ('t-pub','panels','Published',true), ('t-draft','panels','Draft',false);
insert into testimonials (customer_name, rating, review_text, status) values ('A',5,'x','approved'), ('B',5,'x','pending');

-- helper: run a statement as a role/user and report whether it was denied
create function pg_temp.denied(sql text) returns boolean language plpgsql as $$
begin execute sql; return false; exception when insufficient_privilege or others then return true; end $$;
create function pg_temp.n(sql text) returns bigint language plpgsql as $$ declare c bigint; begin execute 'select count(*) from (' || sql || ') s' into c; return c; end $$;

-- ===== visitor (anon) =====
set local role anon; select set_config('request.jwt.claims', '{"role":"anon"}', true);
do $$ begin
  assert pg_temp.denied('select * from customers'),  'FAIL anon can read customers';
  assert pg_temp.denied('select * from bookings'),   'FAIL anon can read bookings';
  assert pg_temp.denied('insert into bookings (customer_id, property_type, capacity_kw) values (gen_random_uuid(),''residential'',2)'), 'FAIL anon can insert bookings';
  assert pg_temp.n('select 1 from products') = 1,    'FAIL anon should see only the published product';
  assert pg_temp.n('select 1 from testimonials') = 1,'FAIL anon should see only approved testimonials';
  assert pg_temp.n('select 1 from admin_users') = 0 or pg_temp.denied('select * from admin_users'), 'FAIL anon can read admin_users';
end $$;
reset role;

-- ===== signed-in user who is NOT an admin =====
set local role authenticated; select set_config('request.jwt.claims', '{"role":"authenticated","sub":"00000000-0000-0000-0000-0000000000a3"}', true);
do $$ begin
  assert pg_temp.n('select 1 from customers') = 0,  'FAIL non-admin user can read customers';
  assert pg_temp.n('select 1 from bookings') = 0,   'FAIL non-admin user can read bookings';
  assert pg_temp.n('select 1 from products') = 1,   'FAIL non-admin should see only published products';
  assert pg_temp.denied('insert into products (slug, category, name_en) values (''x'',''panels'',''x'')'), 'FAIL non-admin can write products';
end $$;
reset role;

-- ===== staff =====
set local role authenticated; select set_config('request.jwt.claims', '{"role":"authenticated","sub":"00000000-0000-0000-0000-0000000000a1"}', true);
do $$ begin
  assert pg_temp.n('select 1 from customers') = 1,  'FAIL staff cannot read customers';
  assert pg_temp.n('select 1 from products') = 2,   'FAIL staff should see drafts too';
  assert pg_temp.denied('insert into products (slug, category, name_en) values (''y'',''panels'',''y'')'), 'FAIL staff can write products';
  assert pg_temp.n('select 1 from admin_users') = 1,'FAIL staff should see only own admin row';
end $$;
update bookings set status = 'under_review';
reset role;

-- ===== admin =====
set local role authenticated; select set_config('request.jwt.claims', '{"role":"authenticated","sub":"00000000-0000-0000-0000-0000000000a2"}', true);
do $$ begin
  assert not pg_temp.denied('insert into products (slug, category, name_en) values (''z'',''panels'',''z'')'), 'FAIL admin cannot write products';
  assert pg_temp.denied('insert into admin_users (id,email,role) values (gen_random_uuid(),''e@e.e'',''admin'')'), 'FAIL admin can create admin accounts (super_admin only)';
end $$;
reset role;

-- ===== triggers =====
do $$ begin
  assert (select count(*) from booking_status_history) = 2, 'FAIL status history should hold the initial row plus one change';
  assert (select reference_no from bookings limit 1) ~ '^JKS-[0-9]{4}-[A-Z2-9]{6}$', 'FAIL booking reference format';
end $$;
select 'ALL RLS / TRIGGER CHECKS PASSED' as result;
rollback;
