-- Nurtured Nest schema (Supabase Postgres)
-- Run in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  practitioner_name text not null,
  tagline text not null,
  role text not null,
  phone text not null,
  email text not null,
  whatsapp_number text not null,
  booking_url text not null,
  service_area text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  name text not null,
  relationship text not null,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.resources_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  excerpt text not null,
  slug text not null unique,
  body text,
  published boolean not null default false,
  published_at date not null default current_date,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'lead_status') then
    create type public.lead_status as enum ('new', 'contacted', 'consult-booked', 'closed-won', 'closed-lost');
  end if;
end $$;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  preferred_contact text not null check (preferred_contact in ('phone', 'email', 'whatsapp')),
  city text not null,
  estimated_due_date date not null,
  birth_setting text not null,
  interested_services text[] not null default '{}',
  message text not null,
  status public.lead_status not null default 'new',
  follow_up_date date,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.cta_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  path text,
  payload jsonb,
  created_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
alter table public.service_items enable row level security;
alter table public.faqs enable row level security;
alter table public.testimonials enable row level security;
alter table public.resources_posts enable row level security;
alter table public.leads enable row level security;
alter table public.cta_events enable row level security;

-- Public read policies for website content
create policy if not exists "Public read site settings" on public.site_settings for select using (true);
create policy if not exists "Public read services" on public.service_items for select using (true);
create policy if not exists "Public read faqs" on public.faqs for select using (true);
create policy if not exists "Public read testimonials" on public.testimonials for select using (true);
create policy if not exists "Public read resources" on public.resources_posts for select using (published = true);

-- Public insert policy for lead form
create policy if not exists "Public can insert leads" on public.leads for insert with check (true);

-- Authenticated admin full access policies
create policy if not exists "Admin full site settings" on public.site_settings for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy if not exists "Admin full services" on public.service_items for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy if not exists "Admin full faqs" on public.faqs for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy if not exists "Admin full testimonials" on public.testimonials for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy if not exists "Admin full resources" on public.resources_posts for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy if not exists "Admin full leads" on public.leads for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy if not exists "Admin full events" on public.cta_events for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Seed starter data from flyer
insert into public.site_settings (
  business_name,
  practitioner_name,
  tagline,
  role,
  phone,
  email,
  whatsapp_number,
  booking_url,
  service_area
)
values (
  'Nurtured Nest',
  'Varshitha',
  'Where Birth Feels Safe',
  'Professional Birth Doula',
  '226-755-9978',
  'nurturednestca@gmail.com',
  '12267559978',
  'https://calendly.com/',
  array['Toronto', 'Mississauga', 'Brampton', 'GTA']
)
on conflict do nothing;

insert into public.service_items (title, description, sort_order)
values
  ('Emotional and Physical Support', 'Continuous support for new parents through pregnancy, labor, and immediate postpartum moments.', 1),
  ('Advocacy and Guidance', 'Evidence-informed guidance to help you communicate and honor your birth preferences.', 2),
  ('Comfort Techniques', 'Practical breathing and positioning tools that help increase comfort and confidence during labor.', 3)
on conflict do nothing;
