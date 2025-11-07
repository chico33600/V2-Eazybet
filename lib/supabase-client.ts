import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return supabaseInstance;
}

// Legacy export for backward compatibility
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    return getSupabaseClient()[prop as keyof SupabaseClient];
  }
});

// Types for database tables
export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  tokens: number;
  diamonds: number;
  total_bets: number;
  won_bets: number;
  role: 'user' | 'admin';
  has_seen_tutorial: boolean;
  referrer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  team_a: string;
  team_b: string;
  league?: string;
  competition?: string;
  odds_a: number;
  odds_draw: number;
  odds_b: number;
  status: 'upcoming' | 'live' | 'finished';
  result: 'A' | 'Draw' | 'B' | null;
  match_date: string;
  created_at: string;
  updated_at: string;
  team_a_badge?: string | null;
  team_b_badge?: string | null;
  team_a_banner?: string | null;
  team_b_banner?: string | null;
  team_a_stadium?: string | null;
  team_b_stadium?: string | null;
}

export interface Bet {
  id: string;
  user_id: string;
  match_id: string;
  amount: number;
  choice: 'A' | 'Draw' | 'B';
  odds: number;
  potential_diamonds: number;
  is_win: boolean | null;
  diamonds_won: number;
  created_at: string;
}

export interface TapEarning {
  id: string;
  user_id: string;
  tokens_earned: number;
  created_at: string;
}
