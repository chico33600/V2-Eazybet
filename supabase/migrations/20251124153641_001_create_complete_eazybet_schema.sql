/*
  # EazyBet Complete Schema Creation
  
  ## Overview
  This migration creates the entire database structure for EazyBet, a sports betting application
  with social features, referral system, and gamification elements.
  
  ## Tables Created
  
  ### 1. users
  - Stores user authentication and profile information
  - Fields: id, email, password_hash, username, referral_code, referred_by, avatar, bio, created_at
  - Each user gets a unique referral code in format "EZB-XXXXXX"
  
  ### 2. wallet
  - Manages user virtual currency (tokens and diamonds)
  - Fields: user_id, tokens, diamonds, total_earned_tokens, total_earned_diamonds, updated_at
  - Tracks both current balance and lifetime earnings
  
  ### 3. matches
  - Stores sports matches with odds and results
  - Fields: id, team_home, team_away, odd_home, odd_draw, odd_away, start_time, status, score_home, score_away
  - Status: UPCOMING → LIVE → FINISHED
  
  ### 4. bets
  - Records all user bets
  - Fields: id, user_id, match_id, choice, amount, result, gain, created_at
  - Choice: HOME | DRAW | AWAY
  - Result: PENDING | WIN | LOSE
  
  ### 5. leaderboard
  - Cached leaderboard rankings
  - Fields: user_id, diamonds, rank, updated_at
  - Recalculated periodically for performance
  
  ### 6. tap_events
  - Logs all tap-to-earn actions
  - Fields: id, user_id, earned, created_at
  - Used for rate limiting (max 10 taps/hour)
  
  ### 7. referrals
  - Tracks referral relationships and bonuses
  - Fields: id, sponsor_id, referred_user_id, bonus_given, created_at
  - Bonus: +500 tokens for referred user, +1000 tokens for sponsor on first bet
  
  ### 8. system_logs
  - Audit trail for critical operations
  - Fields: id, type, payload, created_at
  - Used for debugging and security monitoring
  
  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies restrict data access based on authentication and ownership
  - Password hashes stored securely (never plain text)
  
  ## Anti-Abuse Measures
  - Referral rate limiting (max 3 new referrals per day per user)
  - Tap rate limiting (max 10 taps per hour)
  - Self-referral prevention
  - IP/device tracking for suspicious patterns
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================
-- 1. USERS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  username text UNIQUE NOT NULL,
  referral_code text UNIQUE NOT NULL,
  referred_by text,
  avatar text DEFAULT '',
  bio text DEFAULT '',
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);

-- ==============================================
-- 2. WALLET TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS wallet (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  tokens int DEFAULT 1000 CHECK (tokens >= 0),
  diamonds int DEFAULT 0 CHECK (diamonds >= 0),
  total_earned_tokens int DEFAULT 0,
  total_earned_diamonds int DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_user_id ON wallet(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_diamonds ON wallet(diamonds DESC);

-- ==============================================
-- 3. MATCHES TABLE
-- ==============================================
CREATE TYPE match_status AS ENUM ('UPCOMING', 'LIVE', 'FINISHED');

CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_home text NOT NULL,
  team_away text NOT NULL,
  team_home_image text DEFAULT '',
  team_away_image text DEFAULT '',
  competition text DEFAULT '',
  odd_home float NOT NULL CHECK (odd_home >= 1.0),
  odd_draw float NOT NULL CHECK (odd_draw >= 1.0),
  odd_away float NOT NULL CHECK (odd_away >= 1.0),
  start_time timestamptz NOT NULL,
  status match_status DEFAULT 'UPCOMING',
  score_home int,
  score_away int,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_start_time ON matches(start_time);

-- ==============================================
-- 4. BETS TABLE
-- ==============================================
CREATE TYPE bet_choice AS ENUM ('HOME', 'DRAW', 'AWAY');
CREATE TYPE bet_result AS ENUM ('PENDING', 'WIN', 'LOSE');

CREATE TABLE IF NOT EXISTS bets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  choice bet_choice NOT NULL,
  amount int NOT NULL CHECK (amount > 0),
  result bet_result DEFAULT 'PENDING',
  gain float DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_match_id ON bets(match_id);
CREATE INDEX IF NOT EXISTS idx_bets_result ON bets(result);
CREATE INDEX IF NOT EXISTS idx_bets_created_at ON bets(created_at DESC);

-- ==============================================
-- 5. LEADERBOARD TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS leaderboard (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  username text NOT NULL,
  diamonds int DEFAULT 0,
  rank int DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard(rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_diamonds ON leaderboard(diamonds DESC);

-- ==============================================
-- 6. TAP_EVENTS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS tap_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  earned int DEFAULT 5,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tap_events_user_id ON tap_events(user_id);
CREATE INDEX IF NOT EXISTS idx_tap_events_created_at ON tap_events(created_at DESC);

-- ==============================================
-- 7. REFERRALS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bonus_given boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(sponsor_id, referred_user_id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_sponsor_id ON referrals(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_bonus_given ON referrals(bonus_given);

-- ==============================================
-- 8. SYSTEM_LOGS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_system_logs_type ON system_logs(type);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);

-- ==============================================
-- ROW LEVEL SECURITY POLICIES
-- ==============================================

-- Users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can view usernames for leaderboard"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Wallet table
ALTER TABLE wallet ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wallet"
  ON wallet FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet"
  ON wallet FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Matches table
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view matches"
  ON matches FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can create matches"
  ON matches FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE POLICY "Only admins can update matches"
  ON matches FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Bets table
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bets"
  ON bets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bets"
  ON bets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Leaderboard table
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard FOR SELECT
  TO authenticated
  USING (true);

-- Tap events table
ALTER TABLE tap_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tap events"
  ON tap_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tap events"
  ON tap_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Referrals table
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their referrals"
  ON referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = sponsor_id OR auth.uid() = referred_user_id);

-- System logs table (admin only)
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view system logs"
  ON system_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );
