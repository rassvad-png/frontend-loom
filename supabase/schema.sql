-- Enable required extension (for gen_random_uuid)
create extension if not exists pgcrypto;

-- =====================================================
-- PROFILES
-- =====================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text,
  avatar text,
  auth_provider text,
  created_at timestamp without time zone default now(),
  role text not null default 'user' check (role = any (array['user', 'developer', 'admin'])),
  first_name text,
  last_name text,
  birth_date date,
  country text,
  language text default 'en',
  favorite_categories uuid[] default '{}'::uuid[]
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Trigger to create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public 
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================
-- DEV ACCOUNTS (заявки на аккаунт разработчика)
-- =====================================================
create table if not exists public.dev_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  org_name text,
  website text,
  contact_email text,
  github_url text,
  status text default 'pending',
  created_at timestamp without time zone default now(),
  reviewed_at timestamp without time zone,
  slug text not null unique check (length(slug) < 100),
  legal_address text,
  tax_identifier text,
  phone text,
  type text default 'unverified' check (type = any (array['unverified', 'individual', 'official']))
);

-- Enable RLS
alter table public.dev_accounts enable row level security;

-- Policies
create policy "Users can view own dev account"
  on public.dev_accounts for select
  using (auth.uid() = user_id);

create policy "Users can insert own dev account"
  on public.dev_accounts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own dev account"
  on public.dev_accounts for update
  using (auth.uid() = user_id);

-- =====================================================
-- APPS
-- =====================================================
create table if not exists public.apps (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  dev_account_id uuid references public.dev_accounts(id) on delete cascade,
  icon_url text,
  screenshots text[],
  categories text[],
  rating double precision default 0,
  install_url text,
  manifest_url text,
  verified boolean default false,
  views int default 0,
  installs int default 0,
  created_at timestamp without time zone default now(),
  updated_at timestamp without time zone default now(),
  name text,
  url text
);

-- =====================================================
-- APP TRANSLATIONS (мультиязычность для приложений)
-- =====================================================
create table if not exists public.app_translations (
  id uuid primary key default gen_random_uuid(),
  app_id uuid references public.apps(id) on delete cascade,
  lang text not null,
  tagline text,
  description text,
  whats_new text,
  created_at timestamp without time zone default now(),
  updated_at timestamp without time zone default now()
);

-- =====================================================
-- COLLECTIONS (коллекции приложений)
-- =====================================================
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  created_at timestamp without time zone default now(),
  updated_at timestamp without time zone default now()
);

-- =====================================================
-- COLLECTION APPS (связь коллекций и приложений)
-- =====================================================
create table if not exists public.collection_apps (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid references public.collections(id) on delete cascade,
  app_id uuid references public.apps(id) on delete cascade,
  country_code text,
  created_at timestamp without time zone default now()
);

-- =====================================================
-- FAVORITES
-- =====================================================
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  app_id uuid references public.apps(id) on delete cascade,
  created_at timestamp without time zone default now(),
  unique (user_id, app_id)
);

-- =====================================================
-- LIKES
-- =====================================================
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  app_id uuid references public.apps(id) on delete cascade,
  created_at timestamp without time zone default now(),
  unique (user_id, app_id)
);

-- =====================================================
-- COMMENTS
-- =====================================================
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  app_id uuid references public.apps(id) on delete cascade,
  text text not null,
  created_at timestamp without time zone default now(),
  updated_at timestamp without time zone default now()
);

-- =====================================================
-- DONATIONS (пожертвования)
-- =====================================================
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid references public.profiles(id) on delete cascade,
  amount numeric not null,
  currency text default 'USD',
  message text,
  status text default 'completed',
  transaction_id text unique,
  source text default 'web',
  internal_currency boolean default false,
  created_at timestamp without time zone default now(),
  updated_at timestamp without time zone default now()
);

-- =====================================================
-- ANALYTICS (просмотры, клики, установки)
-- =====================================================
create table if not exists public.analytics (
  id uuid primary key default gen_random_uuid(),
  app_id uuid references public.apps(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  event text not null,
  meta jsonb,
  created_at timestamp without time zone default now()
);

-- =====================================================
-- CATEGORIES
-- =====================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  created_at timestamp without time zone default now(),
  updated_at timestamp without time zone default now()
);

-- Enable RLS
alter table public.categories enable row level security;

-- Anyone can read categories
create policy "Anyone can view categories"
  on public.categories for select
  using (true);

-- =====================================================
-- STORAGE STRUCTURE (Bucket: media, avatars)
-- =====================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage policies for media bucket (includes avatars)
create policy "Anyone can view media"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "Users can upload own media"
  on storage.objects for insert
  with check (
    bucket_id = 'media' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update own media"
  on storage.objects for update
  using (
    bucket_id = 'media' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies for avatars
create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );