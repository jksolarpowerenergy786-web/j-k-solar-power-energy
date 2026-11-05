-- Seed only facts supplied by the business. No prices, specs, reviews, statistics or addresses are invented.
insert into website_settings (key, value) values
  ('business', jsonb_build_object('name','JK Solar Power Energy','phone','8141953601','whatsapp','8141953601','email','jksolarpowerenergy@gmail.com','location','Gujarat, India','domain','https://jksolarpowerenergy.com','address',null,'business_hours',null,'google_maps_embed_url',null)),
  ('social', jsonb_build_object('facebook',null,'instagram',null,'youtube',null)),
  ('whatsapp_default_message', to_jsonb('Hello JK Solar Power Energy, I am interested in your solar solutions. Please share more details.'::text)),
  ('subsidy', jsonb_build_object('title_en','Government Solar Subsidy','official_url','https://pmsuryaghar.gov.in/','body_en',null,'body_gu',null))
on conflict (key) do nothing;

-- Package capacities requested by the business; every descriptive field and price stays empty until the admin fills it in.
insert into solar_packages (capacity_kw, sort_order)
select kw, row_number() over (order by kw) from unnest(array[1,2,3,4,5,7,10]::numeric[]) as kw
on conflict (capacity_kw) do nothing;
