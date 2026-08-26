-- StyleCheck AI — Supabase schema
-- The MVP ships with a localStorage-backed demo store (lib/storage.ts).
-- Point NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY at a project
-- with this schema to move persistence server-side without UI changes.

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  display_name text,
  created_at timestamptz default now()
);

create table if not exists style_analyses (
  id text primary key,
  user_id uuid references users(id) on delete cascade,
  occasion text not null,
  companion text,
  place text,
  mood text,
  season text,
  note text,
  image_url text,
  is_sample boolean default false,
  overall_score int not null,
  summary text,
  favorite boolean default false,
  created_at timestamptz default now()
);

create table if not exists analysis_scores (
  analysis_id text references style_analyses(id) on delete cascade,
  dimension text not null, -- occasion | formality | color | silhouette | seasonal | detail
  score int not null,
  primary key (analysis_id, dimension)
);

create table if not exists recommendations (
  id bigint generated always as identity primary key,
  analysis_id text references style_analyses(id) on delete cascade,
  kind text not null, -- primary | alternative | positive | improvement
  title text,
  body text,
  score_before int,
  score_after int
);

create table if not exists wardrobe_items (
  id bigint generated always as identity primary key,
  user_id uuid references users(id) on delete cascade,
  slot text not null, -- 상의/하의/아우터/신발/가방/액세서리
  name text not null,
  color text,
  created_at timestamptz default now()
);

create table if not exists favorites (
  user_id uuid references users(id) on delete cascade,
  analysis_id text references style_analyses(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, analysis_id)
);
