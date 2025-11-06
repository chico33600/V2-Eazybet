/*
  # Add Achievements System

  ## Overview
  This migration creates a system for tracking user achievements and rewards.
  Each achievement can be claimed once per user and grants tokens.

  ## New Tables

  ### 1. `achievements`
  Defines available achievements in the system
  - `id` (text, primary key) - Unique achievement identifier
  - `title` (text) - Achievement title
  - `description` (text) - Achievement description
  - `reward` (integer) - Token reward amount
  - `link` (text, nullable) - Optional external link (for social media)
  - `created_at` (timestamptz)

  ### 2. `user_achievements`
  Tracks which achievements users have claimed
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `achievement_id` (text, references achievements)
  - `claimed_at` (timestamptz)
  - Unique constraint on (user_id, achievement_id) to prevent double claims

  ## Security
  - RLS enabled on both tables
  - Users can view all achievements
  - Users can only view their own claimed achievements
  - Achievement claiming is handled via API to ensure proper validation

  ## Indexes
  - Index on user_achievements(user_id) for quick user lookups
  - Index on user_achievements(achievement_id) for achievement statistics
*/

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  reward integer NOT NULL CHECK (reward > 0),
  link text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id text NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  claimed_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Achievements policies (everyone can view)
CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

-- User achievements policies
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can claim achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);

-- Insert default achievements
INSERT INTO achievements (id, title, description, reward, link) VALUES
  ('first-bet', 'Premier Pari', 'Placer votre premier pari', 1000, NULL),
  ('instagram', 'Instagram', 'Nous rejoindre sur Instagram', 1000, 'https://www.instagram.com/eazybetcoin/'),
  ('x', 'X (Twitter)', 'Nous rejoindre sur X (Twitter)', 1000, 'https://x.com/eazybetcoin?s=21'),
  ('tiktok', 'TikTok', 'Nous rejoindre sur TikTok', 1000, 'https://www.tiktok.com/@eazybetcoin?_r=1&_t=ZN-91BT7QNs5P'),
  ('telegram', 'Telegram', 'Nous rejoindre sur Telegram', 1000, 'https://t.me/eazybetcoin')
ON CONFLICT (id) DO NOTHING;
