-- JK Solar Power Energy – Phase 1 schema. Run in order: 0001 → 0004.
-- Conventions: UUID primary keys, created_at/updated_at on every table, *_en / *_gu for translatable text.

create extension if not exists pgcrypto;

-- ───────── Enumerated types ─────────
create type admin_role      as enum ('super_admin', 'admin', 'staff');
create type booking_status  as enum ('request_received','under_review','contact_pending','site_visit_scheduled','quotation_sent','approved','installation_scheduled','installation_completed','cancelled');
create type property_type   as enum ('residential','commercial','industrial');
create type system_type     as enum ('on_grid','off_grid','hybrid','not_sure');
create type product_category as enum ('panels','inverters','batteries','accessories','mounting','electrical');
create type availability    as enum ('in_stock','out_of_stock','on_request');
create type gallery_category as enum ('residential','commercial','industrial','panel_installation','before_after');
create type media_type      as enum ('image','video');
create type review_status   as enum ('pending','approved','rejected');
create type enquiry_source  as enum ('quote','calculator','product','package','service','general');
create type enquiry_status  as enum ('new','contacted','closed');
create type notification_type as enum ('booking','enquiry','contact','review');
create type email_status    as enum ('pending','sent','failed','not_configured');

-- ───────── Helpers ─────────
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- Booking reference, e.g. JKS-2026-7K3QWM (unambiguous alphabet, no 0/O/1/I)
create or replace function generate_booking_reference() returns text language plpgsql as $$
declare alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; ref text; i int;
begin
  loop
    ref := 'JKS-' || to_char(now(), 'YYYY') || '-';
    for i in 1..6 loop ref := ref || substr(alphabet, 1 + floor(random()*length(alphabet))::int, 1); end loop;
    exit when not exists (select 1 from public.bookings where reference_no = ref);
  end loop;
  return ref;
end $$;

-- ───────── Admin users (linked 1:1 to Supabase Auth) ─────────
create table admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role admin_role not null default 'staff',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ───────── Customers ─────────
create table customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  mobile text not null check (mobile ~ '^[0-9]{10}$'),
  whatsapp text check (whatsapp is null or whatsapp ~ '^[0-9]{10}$'),
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  state text, district text, city text, address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (mobile)
);

-- ───────── Bookings ─────────
create table bookings (
  id uuid primary key default gen_random_uuid(),
  reference_no text not null unique default generate_booking_reference(),
  customer_id uuid not null references customers(id) on delete restrict,
  property_type property_type not null,
  capacity_kw numeric(4,1) not null check (capacity_kw between 1 and 10),
  system_type system_type not null default 'not_sure',
  state text, district text, city text, address text,
  monthly_bill numeric(10,2) check (monthly_bill is null or monthly_bill >= 0),
  subsidy_info_required boolean not null default false,
  preferred_install_date date,
  message text check (message is null or char_length(message) <= 2000),
  status booking_status not null default 'request_received',
  latest_public_update text,            -- shown to the customer on the tracking page
  site_visit_at timestamptz,
  installation_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ───────── Enquiries / calculator / contact ─────────
create table enquiries (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  source enquiry_source not null default 'general',
  name text not null, mobile text not null check (mobile ~ '^[0-9]{10}$'), email text,
  message text check (message is null or char_length(message) <= 2000),
  related_type text, related_id uuid,
  status enquiry_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null, mobile text, email text, subject text,
  message text not null check (char_length(message) <= 4000),
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Every value is nullable: nothing is invented. The admin fills these in; the calculator refuses to show cost/savings for unset values.
-- A row with state and district both NULL is the default; rows with a state/district override it for that location.
create table calculator_settings (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  state text, district text,
  cost_per_kw numeric(12,2) check (cost_per_kw is null or cost_per_kw >= 0),
  installation_cost numeric(12,2) check (installation_cost is null or installation_cost >= 0),
  monthly_generation_per_kw numeric(8,2) check (monthly_generation_per_kw is null or monthly_generation_per_kw > 0),
  tariff_per_unit numeric(8,2) check (tariff_per_unit is null or tariff_per_unit >= 0),
  system_efficiency_percent numeric(5,2) check (system_efficiency_percent is null or system_efficiency_percent between 1 and 100),
  rooftop_sqft_per_kw numeric(8,2) check (rooftop_sqft_per_kw is null or rooftop_sqft_per_kw > 0),
  subsidy_info_en text, subsidy_info_gu text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index calculator_settings_scope_uq on calculator_settings (coalesce(state,''), coalesce(district,'')) where is_active;

create table calculator_results (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid references enquiries(id) on delete set null,
  settings_id uuid references calculator_settings(id) on delete set null,
  inputs jsonb not null,
  results jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ───────── Catalogue content ─────────
create table products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category product_category not null,
  name_en text not null, name_gu text,
  brand text,
  description_en text, description_gu text,
  specifications jsonb not null default '[]'::jsonb,   -- [{label_en,label_gu,value}]
  price numeric(12,2) check (price is null or price >= 0),
  show_price boolean not null default false,
  availability availability not null default 'on_request',
  image_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_en text not null, title_gu text,
  description_en text, description_gu text,
  benefits_en jsonb not null default '[]'::jsonb, benefits_gu jsonb not null default '[]'::jsonb,
  image_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table solar_packages (
  id uuid primary key default gen_random_uuid(),
  capacity_kw numeric(4,1) not null unique check (capacity_kw between 1 and 10),
  title_en text, title_gu text,
  panel_info_en text, panel_info_gu text,
  inverter_info_en text, inverter_info_gu text,
  installation_details_en text, installation_details_gu text,
  subsidy_info_en text, subsidy_info_gu text,
  estimated_price numeric(12,2) check (estimated_price is null or estimated_price >= 0),
  show_price boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table gallery (
  id uuid primary key default gen_random_uuid(),
  media_type media_type not null default 'image',
  category gallery_category not null,
  title_en text, title_gu text,
  url text not null, storage_path text, thumbnail_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  photo_url text,
  rating smallint not null check (rating between 1 and 5),
  review_text text not null check (char_length(review_text) <= 2000),
  project_type text,
  review_date date not null default current_date,
  status review_status not null default 'pending',
  is_featured boolean not null default false,
  submitted_by_customer boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table faqs (
  id uuid primary key default gen_random_uuid(),
  question_en text not null, question_gu text,
  answer_en text not null, answer_gu text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table website_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  is_public boolean not null default true,   -- false = admin-only (never readable by visitors)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ───────── Notifications, history, notes ─────────
create table notifications (
  id uuid primary key default gen_random_uuid(),
  type notification_type not null,
  title text not null, body text,
  entity_type text, entity_id uuid,
  is_read boolean not null default false, read_at timestamptz,
  email_status email_status not null default 'pending',   -- only 'sent' when the mail provider confirmed delivery
  email_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table booking_status_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  old_status booking_status, new_status booking_status not null,
  public_note text,
  changed_by uuid references admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table admin_notes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  customer_id uuid references customers(id) on delete cascade,
  enquiry_id uuid references enquiries(id) on delete cascade,
  note text not null check (char_length(note) <= 4000),
  author_id uuid references admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (booking_id is not null or customer_id is not null or enquiry_id is not null)
);

-- ───────── Indexes ─────────
create index bookings_customer_idx on bookings (customer_id);
create index bookings_status_idx   on bookings (status, created_at desc);
create index bookings_created_idx  on bookings (created_at desc);
create index enquiries_status_idx  on enquiries (status, created_at desc);
create index enquiries_customer_idx on enquiries (customer_id);
create index contact_unread_idx    on contact_messages (is_read, created_at desc);
create index products_cat_idx      on products (category, sort_order) where is_active;
create index services_sort_idx     on services (sort_order) where is_active;
create index gallery_cat_idx       on gallery (category, sort_order) where is_active;
create index testimonials_pub_idx  on testimonials (status, is_featured, review_date desc);
create index faqs_sort_idx         on faqs (sort_order) where is_active;
create index notif_unread_idx      on notifications (is_read, created_at desc);
create index history_booking_idx   on booking_status_history (booking_id, created_at desc);
create index notes_booking_idx     on admin_notes (booking_id);
create index notes_customer_idx    on admin_notes (customer_id);
create index calc_results_enq_idx  on calculator_results (enquiry_id);

-- ───────── updated_at triggers ─────────
do $$ declare t text; begin
  for t in select unnest(array['admin_users','customers','bookings','enquiries','contact_messages','calculator_settings','calculator_results','products','services','solar_packages','gallery','testimonials','faqs','website_settings','notifications','booking_status_history','admin_notes'])
  loop execute format('create trigger %I before update on %I for each row execute function set_updated_at()', 'trg_'||t||'_updated', t); end loop;
end $$;

-- ───────── Booking status history is written automatically ─────────
create or replace function log_booking_status() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into booking_status_history (booking_id, old_status, new_status) values (new.id, null, new.status);
  elsif new.status is distinct from old.status then
    insert into booking_status_history (booking_id, old_status, new_status, public_note, changed_by)
    values (new.id, old.status, new.status, new.latest_public_update, (select id from admin_users where id = auth.uid()));
  end if;
  return new;
end $$;
create trigger trg_bookings_status_log after insert or update of status on bookings for each row execute function log_booking_status();
