-- Golden Esthetics FAQs. Admin-authored questions & answers shown on /faq.
-- Public reads published rows only; owner/admin manage everything.

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null check (char_length(question) between 1 and 300),
  answer text not null check (char_length(answer) between 1 and 4000),
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index faqs_published_order_idx on public.faqs(published, sort_order, created_at);

alter table public.faqs enable row level security;

-- Public site reads published FAQs only.
create policy faqs_public_read on public.faqs
  for select to anon using (published);

-- Owner/admin manage every FAQ.
create policy faqs_admin_all on public.faqs
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

grant select on public.faqs to anon;
grant select, insert, update, delete on public.faqs to authenticated;

-- Seed with the current static FAQs so the page looks identical after migration,
-- but is now fully editable from the dashboard.
insert into public.faqs (question, answer, sort_order, published) values
  ('What should I book for my first visit?', 'If you''re not sure where to start, take the Sparrow Skin Match quiz — it recommends a facial based on your skin goals. The Quick Fix or a Customized Facial are both great first appointments. You can also message McKinnley and she''ll help you choose.', 1, true),
  ('How do I book an appointment?', 'All appointments are booked through Golden Esthetics'' Square page — just tap "Book now" anywhere on the site. You''ll choose your service, date, and time, and receive a confirmation with the details.', 2, true),
  ('Where are you located?', 'Golden Esthetics is based in the Upstate South Carolina area. Your exact studio address and parking details are included when you book through Square, so you''ll have everything you need before your appointment.', 3, true),
  ('What is your cancellation policy?', 'Life happens! McKinnley just asks for at least 24 hours'' notice to cancel or reschedule so the spot can be offered to someone else. Arriving late may mean a shortened service so the day stays on schedule for everyone.', 4, true),
  ('Do students receive a discount?', 'Yes — students receive 15% off with a valid student ID. Final pricing is confirmed at your appointment.', 5, true),
  ('How should I prep for a facial?', 'Come with clean skin if you can, and if your skin is sensitive, skip strong actives like retinol or exfoliating acids for a couple of days beforehand. Let McKinnley know about any new products, recent treatments, or medications so she can keep your service safe and comfortable.', 6, true),
  ('How should I prep for waxing?', 'For the best results, let hair grow to about a quarter inch — roughly two weeks of growth. Avoid retinoids and strong exfoliants on the area for a few days before and after your appointment.', 7, true),
  ('Are your services medical treatments?', 'No — Golden Esthetics offers cosmetic skincare and beauty services, not medical care or diagnosis. If you have a skin condition that needs medical attention, McKinnley will always recommend seeing a dermatologist.', 8, true);
