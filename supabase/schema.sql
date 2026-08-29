create extension if not exists "pgcrypto";

create table if not exists public.journeys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  title text not null,
  destination text not null,
  country text default '',
  start_date date not null,
  end_date date not null,
  companion text default 'solo' check (companion in ('solo', 'couple', 'friends', 'family')),
  cover_url text,
  cover_unsplash_id text,
  cover_photographer_name text,
  cover_photographer_username text,
  cover_photographer_url text,
  cover_unsplash_url text,
  cover_download_location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint journey_date_order check (start_date <= end_date)
);

create table if not exists public.days (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.journeys(id) on delete cascade,
  day_number integer not null,
  date date not null,
  title text,
  summary text,
  created_at timestamptz not null default now(),
  unique (journey_id, day_number),
  unique (journey_id, date)
);

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references public.days(id) on delete cascade,
  place text not null,
  content text default '',
  photo_url text,
  photo_source text default 'url',
  unsplash_photo_id text,
  photographer_name text,
  photographer_url text,
  latitude numeric,
  longitude numeric,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists days_journey_id_idx on public.days(journey_id);
create index if not exists entries_day_id_idx on public.entries(day_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_journeys_updated_at on public.journeys;
create trigger set_journeys_updated_at
before update on public.journeys
for each row execute function public.set_updated_at();

drop trigger if exists set_entries_updated_at on public.entries;
create trigger set_entries_updated_at
before update on public.entries
for each row execute function public.set_updated_at();
