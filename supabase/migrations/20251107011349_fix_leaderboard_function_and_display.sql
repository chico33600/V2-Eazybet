/*
  # Fix Leaderboard System Issues

  ## Overview
  Fixes two critical issues preventing the leaderboard from displaying users:
  1. Fixes type mismatch in get_leaderboard function (rank should return bigint)
  2. Shows all users in leaderboard, even those with 0 score
  3. Ensures proper ordering and ranking

  ## Changes
  - Recreate get_leaderboard function with correct return type
  - Remove WHERE clause that filters out users with 0 score
  - Update get_user_rank to also show users with 0 score
*/

-- Drop and recreate get_leaderboard function with correct structure
DROP FUNCTION IF EXISTS get_leaderboard(integer, integer);

CREATE OR REPLACE FUNCTION get_leaderboard(
  limit_input integer DEFAULT 100,
  offset_input integer DEFAULT 0
)
RETURNS TABLE(
  user_id uuid,
  username text,
  avatar_url text,
  leaderboard_score bigint,
  rank bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.avatar_url,
    p.leaderboard_score,
    RANK() OVER (ORDER BY p.leaderboard_score DESC, p.username ASC) as user_rank
  FROM profiles p
  ORDER BY p.leaderboard_score DESC, p.username ASC
  LIMIT limit_input
  OFFSET offset_input;
END;
$$ LANGUAGE plpgsql STABLE;

-- Update get_user_rank to show all users
DROP FUNCTION IF EXISTS get_user_rank(uuid);

CREATE OR REPLACE FUNCTION get_user_rank(user_id_input uuid)
RETURNS TABLE(
  user_id uuid,
  username text,
  avatar_url text,
  leaderboard_score bigint,
  rank bigint
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked_users AS (
    SELECT 
      p.id,
      p.username,
      p.avatar_url,
      p.leaderboard_score,
      RANK() OVER (ORDER BY p.leaderboard_score DESC, p.username ASC) as user_rank
    FROM profiles p
  )
  SELECT 
    ru.id,
    ru.username,
    ru.avatar_url,
    ru.leaderboard_score,
    ru.user_rank
  FROM ranked_users ru
  WHERE ru.id = user_id_input;
END;
$$ LANGUAGE plpgsql STABLE;
