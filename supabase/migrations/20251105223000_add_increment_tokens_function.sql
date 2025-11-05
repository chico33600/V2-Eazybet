/*
  # Add Atomic Token Increment Function

  1. New Functions
    - `increment_tokens(user_id, amount)` - Atomically increments user tokens
      - Prevents race conditions
      - Returns the new balance
      - Ensures thread-safe updates

  2. Purpose
    - Eliminate race conditions when multiple operations update tokens
    - Provide atomic increment/decrement operations
    - Ensure data consistency
*/

CREATE OR REPLACE FUNCTION increment_tokens(
  p_user_id uuid,
  p_amount integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_balance integer;
BEGIN
  UPDATE profiles
  SET tokens = tokens + p_amount
  WHERE id = p_user_id
  RETURNING tokens INTO v_new_balance;

  RETURN v_new_balance;
END;
$$;
