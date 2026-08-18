-- Golden Esthetics client testimonials.
-- Visitors submit reviews through a validated SECURITY DEFINER function; every
-- submission lands unapproved. Only McKinnley/Sparrow (owner/admin) can approve.
-- The public site can read approved testimonials only.

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

-- Public reads only approved reviews.
create policy testimonials_public_read on public.testimonials
  for select to anon using (approved);

-- Owner/admin manage every testimonial.
create policy testimonials_admin_all on public.testimonials
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

grant select on public.testimonials to anon;
grant select, insert, update, delete on public.testimonials to authenticated;

-- Validated public submission. Always inserts as unapproved.
create function public.submit_testimonial(
  p_client_name text,
  p_service text default null,
  p_rating int default 5,
  p_quote text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_client_name is null or char_length(trim(p_client_name)) = 0 then
    return false;
  end if;
  if p_quote is null or char_length(trim(p_quote)) = 0 then
    return false;
  end if;
  insert into public.testimonials (client_name, service, rating, quote, approved)
  values (
    left(trim(p_client_name), 80),
    nullif(left(trim(coalesce(p_service, '')), 120), ''),
    least(greatest(coalesce(p_rating, 5), 1), 5),
    left(trim(p_quote), 1000),
    false
  );
  return true;
end;
$$;

revoke all on function public.submit_testimonial(text, text, int, text) from public, anon, authenticated;
grant execute on function public.submit_testimonial(text, text, int, text) to anon;
