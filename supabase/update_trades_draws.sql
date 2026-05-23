-- migration to add 'draw' to result check constraint in trades table
alter table trades drop constraint if exists trades_result_check;
alter table trades add constraint trades_result_check check (result in ('win', 'loss', 'draw'));
