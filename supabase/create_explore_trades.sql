-- 1. Create the explore_trades table
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

-- 2. Enable Row Level Security (RLS)
alter table explore_trades enable row level security;

-- 3. Create RLS policies to restrict read/write access to the owner
create policy "Allow individual insert" on explore_trades
  for insert with check (auth.uid() = user_id);

create policy "Allow individual select" on explore_trades
  for select using (auth.uid() = user_id);

create policy "Allow individual delete" on explore_trades
  for delete using (auth.uid() = user_id);
