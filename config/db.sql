-- =========================================================
-- Blog CMS Admin - Supabase Schema
-- Run this in the Supabase SQL Editor (Project > SQL Editor)
-- =========================================================

create extension if not exists "uuid-ossp";

-- =========================
-- Categories table
-- =========================
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- Posts table
-- =========================
create table if not exists posts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  category_id uuid references categories(id) on delete set null,
  content text,
  featured_image text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_posts_status on posts(status);
create index if not exists idx_posts_category on posts(category_id);
create index if not exists idx_posts_title on posts using gin (to_tsvector('english', title));
create index if not exists idx_categories_name on categories using gin (to_tsvector('english', name));

-- =========================
-- Sample seed data (optional)
-- =========================
insert into categories (name, slug, description) values
  ('Technology', 'technology', 'Posts about tech, programming and gadgets'),
  ('Lifestyle', 'lifestyle', 'Posts about everyday life and wellness'),
  ('Travel', 'travel', 'Travel guides and stories')
on conflict (slug) do nothing;
