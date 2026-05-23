alter table trades         enable row level security;
alter table chat_messages  enable row level security;
alter table journal_entries enable row level security;

-- Allow all for now (tighten later with auth)
create policy "allow all" on trades          for all using (true);
create policy "allow all" on chat_messages   for all using (true);
create policy "allow all" on journal_entries for all using (true);
