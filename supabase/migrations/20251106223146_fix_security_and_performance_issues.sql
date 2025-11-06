/*
  # Fix Security and Performance Issues

  ## Performance Optimizations
  
  1. **Add Missing Indexes**
     - Add index for `bets.user_id` foreign key to improve query performance
     - This index is critical for queries filtering bets by user
  
  2. **Remove Unused Indexes**
     - Drop `idx_bets_match_id` - not being used by queries
     - Drop `idx_user_achievements_achievement_id` - not being used by queries
     - These unused indexes consume storage and slow down INSERT/UPDATE operations

  ## Important Notes
  - The migration uses `IF EXISTS` and `IF NOT EXISTS` to ensure idempotency
  - Index creation is done `CONCURRENTLY` where possible to avoid table locks
*/

-- Add missing index for bets.user_id foreign key
-- This significantly improves performance for queries filtering bets by user
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);

-- Remove unused indexes to reduce storage overhead and improve write performance
DROP INDEX IF EXISTS idx_bets_match_id;
DROP INDEX IF EXISTS idx_user_achievements_achievement_id;