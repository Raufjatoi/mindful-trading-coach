-- Trade log
create table trades (
  id          bigserial primary key,
  created_at  timestamptz default now(),
  time        text        not null,
  pair        text        not null,
  result      text        check (result in ('win','loss')) not null,
  amount      numeric     not null,
  pnl         numeric     not null
);

-- Chat history
create table chat_messages (
  id          bigserial primary key,
  created_at  timestamptz default now(),
  role        text        check (role in ('user','assistant')) not null,
  content     text        not null
);

-- Journal entries
create table journal_entries (
  id          bigserial primary key,
  created_at  timestamptz default now(),
  mood        text        not null,
  pnl         numeric,
  snippet     text        not null,
  insight     text
);
