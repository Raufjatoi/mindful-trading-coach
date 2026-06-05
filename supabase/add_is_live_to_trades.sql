-- Add is_live column to trades table to differentiate live and demo trades
ALTER TABLE trades ADD COLUMN is_live boolean DEFAULT true;
