-- migration to add duration column to trades table
alter table trades add column duration text default '1 min';
