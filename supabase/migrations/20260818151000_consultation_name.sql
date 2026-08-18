-- Optional first name captured on the Sparrow Skin Match quiz (opt-in only).
-- Clients may add a first name so McKinnley can personalize their result.
alter table public.consultations
  add column if not exists name text check (char_length(name) <= 80);
