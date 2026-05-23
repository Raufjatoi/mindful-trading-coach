-- 1. Enable Row Level Security (RLS) if not already enabled
alter table trades enable row level security;

-- 2. Create the policies (if they don't already exist)
create policy "Allow individual insert" on trades
  for insert with check (auth.uid() = user_id);

create policy "Allow individual select" on trades
  for select using (auth.uid() = user_id);

create policy "Allow individual delete" on trades
  for delete using (auth.uid() = user_id);