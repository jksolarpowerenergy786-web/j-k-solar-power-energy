-- Row Level Security. Principle: visitors (anon) can read only published catalogue content.
-- All customer data is private. Public forms (booking, enquiry, contact, review, tracking) go through
-- server-side API routes using the service-role key after validation, so there are NO anon insert policies on customer tables.

create or replace function current_admin_role() returns admin_role language sql stable security definer set search_path = public as $$
  select role from admin_users where id = auth.uid() and is_active
$$;
create or replace function is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from admin_users where id = auth.uid() and is_active)
$$;
-- staff = operations only; admin = content + operations; super_admin = everything incl. admin accounts
create or replace function is_content_admin() returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(current_admin_role() in ('admin','super_admin'), false)
$$;
create or replace function is_super_admin() returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(current_admin_role() = 'super_admin', false)
$$;
revoke all on function current_admin_role(), is_admin(), is_content_admin(), is_super_admin() from public;
grant execute on function current_admin_role(), is_admin(), is_content_admin(), is_super_admin() to anon, authenticated;

do $$ declare t text; begin
  for t in select unnest(array['admin_users','customers','bookings','enquiries','contact_messages','calculator_settings','calculator_results','products','services','solar_packages','gallery','testimonials','faqs','website_settings','notifications','booking_status_history','admin_notes'])
  loop execute format('alter table %I enable row level security', t); end loop;
end $$;

-- Admin accounts
create policy admin_users_self_read on admin_users for select to authenticated using (id = auth.uid() or is_super_admin());
create policy admin_users_super_write on admin_users for all to authenticated using (is_super_admin()) with check (is_super_admin());

-- Private operational data: any active admin role (staff included)
do $$ declare t text; begin
  for t in select unnest(array['customers','bookings','enquiries','contact_messages','calculator_results','notifications','booking_status_history','admin_notes'])
  loop
    execute format('create policy %I on %I for select to authenticated using (is_admin())', t||'_admin_read', t);
    execute format('create policy %I on %I for insert to authenticated with check (is_admin())', t||'_admin_insert', t);
    execute format('create policy %I on %I for update to authenticated using (is_admin()) with check (is_admin())', t||'_admin_update', t);
    execute format('create policy %I on %I for delete to authenticated using (is_content_admin())', t||'_admin_delete', t);
  end loop;
end $$;

-- Public catalogue content: visitors read published rows; content admins write; staff read all
do $$ declare t text; begin
  for t in select unnest(array['products','services','solar_packages','gallery','faqs'])
  loop
    execute format('create policy %I on %I for select to anon, authenticated using (is_active or is_admin())', t||'_read', t);
    execute format('create policy %I on %I for all to authenticated using (is_content_admin()) with check (is_content_admin())', t||'_write', t);
  end loop;
end $$;

create policy testimonials_read on testimonials for select to anon, authenticated using (status = 'approved' or is_admin());
create policy testimonials_write on testimonials for all to authenticated using (is_content_admin()) with check (is_content_admin());

create policy website_settings_read on website_settings for select to anon, authenticated using (is_public or is_admin());
create policy website_settings_write on website_settings for all to authenticated using (is_content_admin()) with check (is_content_admin());

create policy calculator_settings_read on calculator_settings for select to anon, authenticated using (is_active or is_admin());
create policy calculator_settings_write on calculator_settings for all to authenticated using (is_content_admin()) with check (is_content_admin());

-- Table privileges: nothing for anon on private tables (defence in depth on top of RLS)
revoke all on customers, bookings, enquiries, contact_messages, calculator_results, notifications, booking_status_history, admin_notes, admin_users from anon;
