/*
  # Database Functions and Triggers
  
  ## Functions Created
  
  ### 1. generate_referral_code()
  - Generates unique referral code in format "EZB-XXXXXX"
  - Called automatically on user creation
  
  ### 2. create_wallet_for_new_user()
  - Creates wallet with 1000 initial tokens when user registers
  - Triggered automatically after user insertion
  
  ### 3. handle_referral_signup()
  - Processes referral signup bonus (+500 tokens for referred user)
  - Creates referral relationship entry
  - Triggered on user creation if referred_by is set
  
  ### 4. handle_first_bet_referral_bonus()
  - Gives +1000 tokens to sponsor when referred user places first bet
  - Marks bonus_given as true to prevent double payment
  - Triggered on bet insertion
  
  ### 5. update_wallet_on_bet_win()
  - Automatically adds winnings to user wallet when bet result changes to WIN
  - Updates total_earned_tokens
  - Triggered on bet update
  
  ### 6. refresh_leaderboard()
  - Recalculates entire leaderboard rankings based on diamonds
  - Can be called manually or via cron job
  
  ### 7. calculate_bet_results()
  - Automatically calculates bet results when match score is updated
  - Updates bet.result and bet.gain fields
  - Updates user wallets for winning bets
  
  ## Triggers
  
  - before_user_insert: Generate referral code
  - after_user_insert: Create wallet + handle referral bonus
  - after_bet_insert: Handle first bet referral bonus
  - after_bet_update: Update wallet on win
  - after_match_update: Calculate bet results when score changes
*/

-- ==============================================
-- FUNCTION: Generate unique referral code
-- ==============================================
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    -- Generate code in format EZB-XXXXXX (6 random alphanumeric chars)
    code := 'EZB-' || upper(substring(md5(random()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM users WHERE referral_code = code) INTO exists;
    
    -- If unique, return it
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- TRIGGER: Set referral code before user insert
-- ==============================================
CREATE OR REPLACE FUNCTION trigger_set_referral_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS before_user_insert_set_referral_code ON users;
CREATE TRIGGER before_user_insert_set_referral_code
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_referral_code();

-- ==============================================
-- FUNCTION: Create wallet for new user
-- ==============================================
CREATE OR REPLACE FUNCTION create_wallet_for_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO wallet (user_id, tokens, diamonds, total_earned_tokens, total_earned_diamonds)
  VALUES (NEW.id, 1000, 0, 0, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_user_insert_create_wallet ON users;
CREATE TRIGGER after_user_insert_create_wallet
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_wallet_for_new_user();

-- ==============================================
-- FUNCTION: Handle referral signup bonus
-- ==============================================
CREATE OR REPLACE FUNCTION handle_referral_signup()
RETURNS trigger AS $$
DECLARE
  sponsor_user_id uuid;
BEGIN
  -- Only process if referred_by is set
  IF NEW.referred_by IS NOT NULL AND NEW.referred_by != '' THEN
    -- Find sponsor by referral code
    SELECT id INTO sponsor_user_id
    FROM users
    WHERE referral_code = NEW.referred_by;
    
    -- If sponsor found
    IF sponsor_user_id IS NOT NULL THEN
      -- Prevent self-referral
      IF sponsor_user_id != NEW.id THEN
        -- Give +500 tokens to the new user (referred)
        UPDATE wallet
        SET tokens = tokens + 500,
            total_earned_tokens = total_earned_tokens + 500
        WHERE user_id = NEW.id;
        
        -- Create referral relationship
        INSERT INTO referrals (sponsor_id, referred_user_id, bonus_given)
        VALUES (sponsor_user_id, NEW.id, false)
        ON CONFLICT (sponsor_id, referred_user_id) DO NOTHING;
        
        -- Log the event
        INSERT INTO system_logs (type, payload)
        VALUES ('referral_signup', jsonb_build_object(
          'sponsor_id', sponsor_user_id,
          'referred_user_id', NEW.id,
          'bonus', 500
        ));
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_user_insert_handle_referral ON users;
CREATE TRIGGER after_user_insert_handle_referral
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION handle_referral_signup();

-- ==============================================
-- FUNCTION: Handle first bet referral bonus
-- ==============================================
CREATE OR REPLACE FUNCTION handle_first_bet_referral_bonus()
RETURNS trigger AS $$
DECLARE
  sponsor_user_id uuid;
  is_first_bet boolean;
  bonus_already_given boolean;
BEGIN
  -- Check if this is user's first bet
  SELECT COUNT(*) = 1 INTO is_first_bet
  FROM bets
  WHERE user_id = NEW.user_id;
  
  IF is_first_bet THEN
    -- Check if user was referred
    SELECT sponsor_id, bonus_given INTO sponsor_user_id, bonus_already_given
    FROM referrals
    WHERE referred_user_id = NEW.user_id;
    
    -- If user was referred and bonus not yet given
    IF sponsor_user_id IS NOT NULL AND NOT bonus_already_given THEN
      -- Give +1000 tokens to sponsor
      UPDATE wallet
      SET tokens = tokens + 1000,
          total_earned_tokens = total_earned_tokens + 1000
      WHERE user_id = sponsor_user_id;
      
      -- Mark bonus as given
      UPDATE referrals
      SET bonus_given = true
      WHERE sponsor_id = sponsor_user_id
      AND referred_user_id = NEW.user_id;
      
      -- Log the event
      INSERT INTO system_logs (type, payload)
      VALUES ('referral_first_bet_bonus', jsonb_build_object(
        'sponsor_id', sponsor_user_id,
        'referred_user_id', NEW.user_id,
        'bonus', 1000
      ));
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_bet_insert_handle_referral_bonus ON bets;
CREATE TRIGGER after_bet_insert_handle_referral_bonus
  AFTER INSERT ON bets
  FOR EACH ROW
  EXECUTE FUNCTION handle_first_bet_referral_bonus();

-- ==============================================
-- FUNCTION: Calculate bet results when match finishes
-- ==============================================
CREATE OR REPLACE FUNCTION calculate_bet_results()
RETURNS trigger AS $$
DECLARE
  bet_record RECORD;
  winning_choice bet_choice;
BEGIN
  -- Only process if match is finished and scores are set
  IF NEW.status = 'FINISHED' AND NEW.score_home IS NOT NULL AND NEW.score_away IS NOT NULL THEN
    
    -- Determine winning choice
    IF NEW.score_home > NEW.score_away THEN
      winning_choice := 'HOME';
    ELSIF NEW.score_home < NEW.score_away THEN
      winning_choice := 'AWAY';
    ELSE
      winning_choice := 'DRAW';
    END IF;
    
    -- Update all pending bets for this match
    FOR bet_record IN
      SELECT * FROM bets
      WHERE match_id = NEW.id
      AND result = 'PENDING'
    LOOP
      IF bet_record.choice = winning_choice THEN
        -- Calculate gain based on choice
        DECLARE
          winning_odd float;
          calculated_gain float;
        BEGIN
          IF winning_choice = 'HOME' THEN
            winning_odd := NEW.odd_home;
          ELSIF winning_choice = 'AWAY' THEN
            winning_odd := NEW.odd_away;
          ELSE
            winning_odd := NEW.odd_draw;
          END IF;
          
          calculated_gain := bet_record.amount * winning_odd;
          
          -- Update bet as WIN
          UPDATE bets
          SET result = 'WIN',
              gain = calculated_gain
          WHERE id = bet_record.id;
          
          -- Add winnings to user wallet
          UPDATE wallet
          SET tokens = tokens + calculated_gain::int,
              total_earned_tokens = total_earned_tokens + calculated_gain::int
          WHERE user_id = bet_record.user_id;
          
          -- Log the win
          INSERT INTO system_logs (type, payload)
          VALUES ('bet_win', jsonb_build_object(
            'bet_id', bet_record.id,
            'user_id', bet_record.user_id,
            'amount', bet_record.amount,
            'gain', calculated_gain
          ));
        END;
      ELSE
        -- Update bet as LOSE
        UPDATE bets
        SET result = 'LOSE',
            gain = 0
        WHERE id = bet_record.id;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_match_update_calculate_bets ON matches;
CREATE TRIGGER after_match_update_calculate_bets
  AFTER UPDATE ON matches
  FOR EACH ROW
  WHEN (NEW.status = 'FINISHED' AND OLD.status != 'FINISHED')
  EXECUTE FUNCTION calculate_bet_results();

-- ==============================================
-- FUNCTION: Refresh leaderboard
-- ==============================================
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS void AS $$
BEGIN
  -- Clear existing leaderboard
  TRUNCATE leaderboard;
  
  -- Rebuild leaderboard from wallet data
  INSERT INTO leaderboard (user_id, username, diamonds, rank)
  SELECT 
    w.user_id,
    u.username,
    w.diamonds,
    ROW_NUMBER() OVER (ORDER BY w.diamonds DESC, u.created_at ASC) as rank
  FROM wallet w
  JOIN users u ON u.id = w.user_id
  WHERE w.diamonds > 0
  ORDER BY w.diamonds DESC
  LIMIT 100;
  
  -- Log refresh
  INSERT INTO system_logs (type, payload)
  VALUES ('leaderboard_refresh', jsonb_build_object(
    'timestamp', now(),
    'entries_count', (SELECT COUNT(*) FROM leaderboard)
  ));
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- FUNCTION: Check tap rate limit
-- ==============================================
CREATE OR REPLACE FUNCTION check_tap_rate_limit(p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  tap_count int;
BEGIN
  -- Count taps in last hour
  SELECT COUNT(*) INTO tap_count
  FROM tap_events
  WHERE user_id = p_user_id
  AND created_at > now() - interval '1 hour';
  
  -- Return true if under limit (10 taps/hour)
  RETURN tap_count < 10;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- FUNCTION: Check referral rate limit
-- ==============================================
CREATE OR REPLACE FUNCTION check_referral_rate_limit(p_sponsor_id uuid)
RETURNS boolean AS $$
DECLARE
  referral_count int;
BEGIN
  -- Count referrals in last 24 hours
  SELECT COUNT(*) INTO referral_count
  FROM referrals
  WHERE sponsor_id = p_sponsor_id
  AND created_at > now() - interval '24 hours';
  
  -- Return true if under limit (3 referrals/day)
  RETURN referral_count < 3;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- FUNCTION: Convert tokens to diamonds
-- ==============================================
CREATE OR REPLACE FUNCTION convert_tokens_to_diamonds(p_user_id uuid, p_token_amount int)
RETURNS jsonb AS $$
DECLARE
  diamonds_earned int;
  current_tokens int;
BEGIN
  -- Check if user has enough tokens
  SELECT tokens INTO current_tokens
  FROM wallet
  WHERE user_id = p_user_id;
  
  IF current_tokens IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;
  
  IF current_tokens < p_token_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient tokens');
  END IF;
  
  -- Calculate diamonds (1 diamond = 100 tokens)
  diamonds_earned := p_token_amount / 100;
  
  IF diamonds_earned < 1 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Minimum 100 tokens required');
  END IF;
  
  -- Update wallet
  UPDATE wallet
  SET tokens = tokens - (diamonds_earned * 100),
      diamonds = diamonds + diamonds_earned,
      total_earned_diamonds = total_earned_diamonds + diamonds_earned
  WHERE user_id = p_user_id;
  
  -- Log conversion
  INSERT INTO system_logs (type, payload)
  VALUES ('tokens_to_diamonds', jsonb_build_object(
    'user_id', p_user_id,
    'tokens_spent', diamonds_earned * 100,
    'diamonds_earned', diamonds_earned
  ));
  
  RETURN jsonb_build_object(
    'success', true,
    'diamonds_earned', diamonds_earned,
    'tokens_spent', diamonds_earned * 100
  );
END;
$$ LANGUAGE plpgsql;
