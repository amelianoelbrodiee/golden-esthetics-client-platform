alter table public.newsletter_subscribers
  add column if not exists unsubscribe_token uuid;

update public.newsletter_subscribers
set unsubscribe_token = gen_random_uuid()
where unsubscribe_token is null;

alter table public.newsletter_subscribers
  alter column unsubscribe_token set default gen_random_uuid(),
  alter column unsubscribe_token set not null;

create unique index if not exists newsletter_subscribers_unsubscribe_token_key
  on public.newsletter_subscribers(unsubscribe_token);
create index if not exists newsletter_subscribers_active_idx
  on public.newsletter_subscribers(created_at) where active;

create table if not exists public.newsletter_campaigns (
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

create table if not exists public.newsletter_deliveries (
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

create index if not exists newsletter_campaigns_created_idx on public.newsletter_campaigns(created_at desc);
create index if not exists newsletter_deliveries_campaign_idx on public.newsletter_deliveries(campaign_id, status);
create index if not exists newsletter_deliveries_subscriber_idx on public.newsletter_deliveries(subscriber_id);

alter table public.newsletter_campaigns enable row level security;
alter table public.newsletter_deliveries enable row level security;

grant select, insert, update, delete on public.newsletter_campaigns, public.newsletter_deliveries to authenticated;

drop policy if exists newsletter_public_insert on public.newsletter_subscribers;
revoke insert on public.newsletter_subscribers from anon;

drop policy if exists newsletter_campaigns_admin_all on public.newsletter_campaigns;
create policy newsletter_campaigns_admin_all on public.newsletter_campaigns for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists newsletter_deliveries_admin_all on public.newsletter_deliveries;
create policy newsletter_deliveries_admin_all on public.newsletter_deliveries for all to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));

create or replace function public.subscribe_newsletter(p_email text, p_first_name text default null, p_source text default 'website')
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

create or replace function public.unsubscribe_newsletter(p_token uuid)
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

revoke all on function public.subscribe_newsletter(text, text, text) from public, anon, authenticated;
revoke all on function public.unsubscribe_newsletter(uuid) from public, anon, authenticated;
grant execute on function public.subscribe_newsletter(text, text, text) to anon;
grant execute on function public.unsubscribe_newsletter(uuid) to anon;

