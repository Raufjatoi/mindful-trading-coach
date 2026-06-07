import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Returns null when env vars aren't set yet — callers should guard with `if (!supabase)`
export const supabase = url && key ? createClient(url, key) : null;

export type DbTrade = {
  id: number;
  created_at: string;
  time: string;
  pair: string;
  result: "win" | "loss" | "draw";
  amount: number;
  pnl: number;
  duration?: string;
  is_live?: boolean;
};

export type DbTarget = {
  id: number;
  created_at: string;
  title: string;
  completed: boolean;
};

export type DbTradingNote = {
  user_id: string;
  created_at: string;
  updated_at: string;
  content: string;
};


