-- Create targets table
create table if not exists targets (
  id         bigserial primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  title      text not null,
  completed  boolean default false not null
);

alter table targets enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'targets' and policyname = 'own targets'
  ) then
    create policy "own targets" on targets for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end
$$;

-- Create trading_notes table
create table if not exists trading_notes (
  user_id    uuid references auth.users(id) on delete cascade primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  content    text not null
);

alter table trading_notes enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'trading_notes' and policyname = 'own trading notes'
  ) then
    create policy "own trading notes" on trading_notes for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end
$$;
