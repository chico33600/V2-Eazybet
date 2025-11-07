import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

function getSupabaseUrl(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  }
  return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}

function getSupabaseKey(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  }
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

function initSupabase(): SupabaseClient {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseKey();

  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined') {
      console.warn('Supabase env vars missing during build - returning stub client');
      return {} as SupabaseClient;
    }
    throw new Error('Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = initSupabase();
  }
  return supabaseInstance;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = client[prop as keyof SupabaseClient];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
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
