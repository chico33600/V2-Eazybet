/*
  # Add automatic referral reward trigger

  1. Changes
    - Creates a trigger function `reward_referral()` that:
      - Prevents self-referral
      - Awards 10 diamonds to both referrer and referred user
      - Creates bidirectional friendship
      - Marks referral as rewarded
    - Creates trigger that executes after inserting a new referral

  2. Security
    - Validates referrer_id ≠ referred_id
    - Uses ON CONFLICT DO NOTHING for friendship creation
    - Atomic operation ensures both users get rewards or neither does

  3. Notes
    - Trigger executes automatically on INSERT into referrals table
    - No manual API calls needed for reward distribution
    - Friendship is bidirectional (both directions inserted)
*/

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS referral_trigger ON referrals;
DROP FUNCTION IF EXISTS reward_referral();

-- Create the trigger function
CREATE OR REPLACE FUNCTION reward_referral()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent self-referral
  IF NEW.referrer_id = NEW.referred_id THEN
    RAISE EXCEPTION 'Cannot refer yourself';
  END IF;

  -- Award 10 diamonds to referrer
  UPDATE profiles
  SET diamonds = diamonds + 10
  WHERE id = NEW.referrer_id;

  -- Award 10 diamonds to referred user
  UPDATE profiles
  SET diamonds = diamonds + 10
  WHERE id = NEW.referred_id;

  -- Create bidirectional friendship
  INSERT INTO friends (user_id, friend_id)
  VALUES
    (NEW.referrer_id, NEW.referred_id),
    (NEW.referred_id, NEW.referrer_id)
  ON CONFLICT (user_id, friend_id) DO NOTHING;

  -- Mark referral as rewarded
  UPDATE referrals
  SET rewarded = true
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER referral_trigger
  AFTER INSERT ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION reward_referral();
