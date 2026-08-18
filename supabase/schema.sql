-- Golden Esthetics production schema for Supabase.
-- Public writes receive only the minimum grants required by validated API routes.
-- Dashboard reads and updates require an active owner/admin allowlist record.

create extension if not exists pgcrypto;
create schema if not exists extensions;
create extension if not exists citext with schema extensions;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.services (
  id text primary key,
  name text not null check (char_length(name) between 1 and 120),
  category text not null check (char_length(category) between 1 and 60),
  price numeric(10,2) not null check (price >= 0),
  price_label text not null,
  description text not null,
  goals text[] not null default '{}',
  booking_url text,
  active boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.consultations (
  id uuid primary key default gen_random_uuid(),
  goals text[] not null default '{}' check (cardinality(goals) <= 15),
  skin_type text check (char_length(skin_type) <= 40),
  sensitivity text check (char_length(sensitivity) <= 40),
  recommended_service_id text check (char_length(recommended_service_id) <= 80),
  photo_used boolean not null default false,
  analysis_mode text check (char_length(analysis_mode) <= 20),
  created_at timestamptz not null default now()
);

create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  consultation_id uuid references public.consultations(id) on delete cascade,
  service_id text,
  add_on_ids text[] not null default '{}',
  explanation text,
  created_at timestamptz not null default now()
);

create table public.booking_clicks (
  id uuid primary key default gen_random_uuid(),
  service_id text check (char_length(service_id) <= 80),
  path text check (char_length(path) <= 200),
  referrer text check (char_length(referrer) <= 200),
  created_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text check (char_length(email) <= 254),
  phone text check (char_length(phone) <= 25),
  interest text check (char_length(interest) <= 120),
  message text not null check (char_length(message) between 1 and 2000),
  help_choose boolean not null default false,
  consultation_summary jsonb,
  status text not null default 'New' check (status in ('New','Contacted','Booked','Closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (email is not null or phone is not null)
);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email extensions.citext not null unique check (char_length(email::text) <= 254),
  first_name text check (char_length(first_name) <= 80),
  source text check (char_length(source) <= 80),
  active boolean not null default true,
  unsubscribe_token uuid not null default gen_random_uuid() unique,
  created_at timestamptz not null default now()
);

create table public.newsletter_campaigns (
  id uuid primary key default gen_random_uuid(),
  month_key text not null unique check (month_key ~ '^[0-9]{4}-[0-9]{2}$'),
  subject text not null check (char_length(subject) between 1 and 200),
  preview_text text check (char_length(preview_text) <= 300),
  status text not null default 'draft' check (status in ('draft','sending','sent','partial','failed')),
  sent_count integer not null default 0 check (sent_count >= 0),
  failed_count integer not null default 0 check (failed_count >= 0),
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.newsletter_deliveries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.newsletter_campaigns(id) on delete cascade,
  subscriber_id uuid not null references public.newsletter_subscribers(id) on delete cascade,
  status text not null check (status in ('sent','failed')),
  provider_message_id text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, subscriber_id)
);

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  service_performed text,
  caption text,
  service_date date,
  before_image_path text,
  before_image_url text,
  after_image_path text,
  after_image_url text,
  featured boolean not null default false,
  active boolean not null default false,
  photo_consent_confirmed boolean not null default false,
  sort_order integer not null default 0,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.approved_products (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  brand text,
  category text not null,
  price numeric(10,2) check (price >= 0),
  image_url text,
  description text,
  suitable_goals text[] not null default '{}',
  approved_by_mckinnley boolean not null default false,
  active boolean not null default false,
  purchase_url text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.analytics_events (
  id bigint generated always as identity primary key,
  event_name text not null check (char_length(event_name) between 1 and 80),
  path text check (char_length(path) <= 200),
  referrer text check (char_length(referrer) <= 200),
  properties jsonb not null default '{}' check (jsonb_typeof(properties) = 'object'),
  created_at timestamptz not null default now()
);

create table public.business_settings (
  key text primary key,
  value jsonb not null,
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  email extensions.citext not null unique,
  role text not null check (role in ('owner','admin')),
  display_name text check (char_length(display_name) <= 100),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index analytics_events_name_created_idx on public.analytics_events(event_name, created_at desc);
create index consultations_created_idx on public.consultations(created_at desc);
create index leads_status_created_idx on public.leads(status, created_at desc);
create index gallery_consent_active_idx on public.gallery_items(photo_consent_confirmed, active);
create index gallery_items_uploaded_by_idx on public.gallery_items(uploaded_by) where uploaded_by is not null;
create index admin_users_active_user_idx on public.admin_users(user_id) where active and user_id is not null;
create index recommendations_consultation_idx on public.recommendations(consultation_id);
create index newsletter_subscribers_active_idx on public.newsletter_subscribers(created_at) where active;
create index newsletter_campaigns_created_idx on public.newsletter_campaigns(created_at desc);
create index newsletter_deliveries_campaign_idx on public.newsletter_deliveries(campaign_id, status);
create index newsletter_deliveries_subscriber_idx on public.newsletter_deliveries(subscriber_id);

alter table public.services enable row level security;
alter table public.consultations enable row level security;
alter table public.recommendations enable row level security;
alter table public.booking_clicks enable row level security;
alter table public.leads enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.newsletter_campaigns enable row level security;
alter table public.newsletter_deliveries enable row level security;
alter table public.gallery_items enable row level security;
alter table public.approved_products enable row level security;
alter table public.analytics_events enable row level security;
alter table public.business_settings enable row level security;
alter table public.admin_users enable row level security;

create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid()) and active and role in ('owner','admin')
  );
$$;

create function private.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid()) and active and role = 'owner'
  );
$$;

create function private.bind_approved_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.admin_users
  set user_id = new.id,
      display_name = coalesce(display_name, new.raw_user_meta_data ->> 'display_name'),
      updated_at = now()
  where lower(email::text) = lower(new.email)
    and user_id is null
    and active;
  return new;
end;
$$;

create function public.subscribe_newsletter(p_email text, p_first_name text default null, p_source text default 'website')
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_email is null or char_length(p_email) > 254 or p_email !~* '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$' then
    return false;
  end if;
  insert into public.newsletter_subscribers (email, first_name, source, active, unsubscribe_token)
  values (lower(p_email)::extensions.citext, nullif(left(trim(coalesce(p_first_name, '')), 80), ''), nullif(left(trim(coalesce(p_source, 'website')), 80), ''), true, gen_random_uuid())
  on conflict (email) do update
  set first_name = coalesce(excluded.first_name, public.newsletter_subscribers.first_name),
      source = excluded.source,
      active = true,
      unsubscribe_token = gen_random_uuid();
  return true;
end;
$$;

create function public.unsubscribe_newsletter(p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.newsletter_subscribers set active = false where unsubscribe_token = p_token and active;
  return found;
end;
$$;

create trigger bind_approved_admin_after_signup
after insert on auth.users
for each row execute function private.bind_approved_admin();

grant usage on schema public to anon, authenticated;
grant usage on schema extensions to anon, authenticated;
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant insert on public.consultations, public.booking_clicks, public.leads, public.analytics_events to anon;
grant usage, select on sequence public.analytics_events_id_seq to anon;
grant select on public.services, public.gallery_items, public.approved_products, public.business_settings to anon;

grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_owner() to authenticated;
revoke all on function private.bind_approved_admin() from public, anon, authenticated;
revoke all on function public.subscribe_newsletter(text, text, text) from public, anon, authenticated;
revoke all on function public.unsubscribe_newsletter(uuid) from public, anon, authenticated;
grant execute on function public.subscribe_newsletter(text, text, text) to anon;
grant execute on function public.unsubscribe_newsletter(uuid) to anon;

create policy services_public_read on public.services for select to anon using (active);
create policy gallery_public_read on public.gallery_items for select to anon using (active and photo_consent_confirmed);
create policy approved_products_public_read on public.approved_products for select to anon using (active and approved_by_mckinnley);
create policy business_settings_public_read on public.business_settings for select to anon using (is_public);
create policy consultations_public_insert on public.consultations for insert to anon with check (true);
create policy booking_clicks_public_insert on public.booking_clicks for insert to anon with check (true);
create policy leads_public_insert on public.leads for insert to anon with check (true);
create policy analytics_public_insert on public.analytics_events for insert to anon with check (true);

create policy services_admin_all on public.services for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy consultations_admin_all on public.consultations for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy recommendations_admin_all on public.recommendations for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy booking_clicks_admin_all on public.booking_clicks for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy leads_admin_all on public.leads for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy newsletter_admin_all on public.newsletter_subscribers for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy newsletter_campaigns_admin_all on public.newsletter_campaigns for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy newsletter_deliveries_admin_all on public.newsletter_deliveries for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy gallery_admin_all on public.gallery_items for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy approved_products_admin_all on public.approved_products for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy analytics_admin_all on public.analytics_events for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy business_settings_admin_all on public.business_settings for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy admin_users_admin_read on public.admin_users for select to authenticated using ((select private.is_admin()));
create policy admin_users_owner_insert on public.admin_users for insert to authenticated with check ((select private.is_owner()) and role = 'admin');
create policy admin_users_owner_update on public.admin_users for update to authenticated using ((select private.is_owner())) with check ((select private.is_owner()));
create policy admin_users_owner_delete on public.admin_users for delete to authenticated using ((select private.is_owner()) and role = 'admin');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gallery', 'gallery', true, 8388608, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy gallery_storage_admin_select on storage.objects for select to authenticated
using (bucket_id = 'gallery' and (select private.is_admin()));
create policy gallery_storage_admin_insert on storage.objects for insert to authenticated
with check (bucket_id = 'gallery' and (storage.foldername(name))[1] = 'portfolio' and (select private.is_admin()));
create policy gallery_storage_admin_update on storage.objects for update to authenticated
using (bucket_id = 'gallery' and (select private.is_admin()))
with check (bucket_id = 'gallery' and (storage.foldername(name))[1] = 'portfolio' and (select private.is_admin()));
create policy gallery_storage_admin_delete on storage.objects for delete to authenticated
using (bucket_id = 'gallery' and (select private.is_admin()));

insert into public.business_settings (key, value, is_public)
values
  ('homepage.hero_headline', to_jsonb('Your skin, but golden.'::text), true),
  ('homepage.hero_supporting_copy', to_jsonb('Personalized skincare, brows, lashes & waxing by licensed esthetician McKinnley Golden.'::text), true),
  ('homepage.about_copy', to_jsonb('I’m here to make skincare and beauty services feel personal, comfortable, and easy to understand. We’ll focus on your goals and build an experience that feels entirely your own.'::text), true),
  ('homepage.announcement', to_jsonb(''::text), true)
on conflict (key) do update set is_public = true;

insert into public.admin_users (email, role, display_name)
values
  ('goldenesthetics12@gmail.com', 'owner', 'McKinnley Golden'),
  ('amelianoelbrodiee@gmail.com', 'admin', 'Sparrow Admin')
on conflict (email) do update set role = excluded.role, display_name = excluded.display_name, active = true, updated_at = now();


-- Client testimonials (added 2026-08-18). Public submits via submit_testimonial (unapproved);
-- public reads approved only; owner/admin moderate.
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text not null check (char_length(client_name) between 1 and 80),
  service text check (char_length(service) <= 120),
  rating smallint not null default 5 check (rating between 1 and 5),
  quote text not null check (char_length(quote) between 1 and 1000),
  approved boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index testimonials_approved_created_idx on public.testimonials(approved, created_at desc);
create index testimonials_featured_idx on public.testimonials(featured) where featured;
alter table public.testimonials enable row level security;
create policy testimonials_public_read on public.testimonials for select to anon using (approved);
create policy testimonials_admin_all on public.testimonials for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
grant select on public.testimonials to anon;
grant select, insert, update, delete on public.testimonials to authenticated;

create function public.submit_testimonial(p_client_name text, p_service text default null, p_rating int default 5, p_quote text default null)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if p_client_name is null or char_length(trim(p_client_name)) = 0 then return false; end if;
  if p_quote is null or char_length(trim(p_quote)) = 0 then return false; end if;
  insert into public.testimonials (client_name, service, rating, quote, approved)
  values (left(trim(p_client_name), 80), nullif(left(trim(coalesce(p_service, '')), 120), ''), least(greatest(coalesce(p_rating, 5), 1), 5), left(trim(p_quote), 1000), false);
  return true;
end;
$$;
revoke all on function public.submit_testimonial(text, text, int, text) from public, anon, authenticated;
grant execute on function public.submit_testimonial(text, text, int, text) to anon;
