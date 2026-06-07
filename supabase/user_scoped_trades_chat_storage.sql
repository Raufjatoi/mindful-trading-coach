-- Drop old tables (no data yet, safe to wipe)
drop table if exists chat_messages;
drop table if exists journal_entries;
drop table if exists trades;

-- Trades
create table trades (
  id         bigserial primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  time       text not null,
  pair       text not null,
  duration   text default '1 min',
  result     text check (result in ('win','loss','draw')) not null,
  amount     numeric not null,
  pnl        numeric not null,
  is_live    boolean default true
);
alter table trades enable row level security;
create policy "own trades" on trades for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Chat messages
create table chat_messages (
  id         bigserial primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  role       text check (role in ('user','assistant')) not null,
  content    text not null
);
alter table chat_messages enable row level security;
create policy "own messages" on chat_messages for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Journal entries
create table journal_entries (
  id         bigserial primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  mood       text not null,
  pnl        numeric,
  snippet    text not null,
  insight    text
);
alter table journal_entries enable row level security;
create policy "own journal" on journal_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Explore trades
create table explore_trades (
  id         bigserial primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  pair       text not null,
  duration   text not null,
  result     text check (result in ('win', 'loss', 'draw')) not null,
  amount     numeric not null,
  pnl        numeric not null,
  notes      text
);
alter table explore_trades enable row level security;
create policy "own explore trades" on explore_trades for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Targets
create table targets (
  id         bigserial primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  title      text not null,
  completed  boolean default false not null
);
alter table targets enable row level security;
create policy "own targets" on targets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Trading Notes
create table trading_notes (
  user_id    uuid references auth.users(id) on delete cascade primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  content    text not null
);
alter table trading_notes enable row level security;
create policy "own trading notes" on trading_notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

