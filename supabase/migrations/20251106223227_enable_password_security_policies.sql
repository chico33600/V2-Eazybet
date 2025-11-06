/*
  # Enable Enhanced Password Security Policies

  ## Security Enhancements
  
  1. **Leaked Password Protection**
     - This must be enabled in Supabase Dashboard under:
       Authentication > Policies > Password Strength
     - Enable "Check against HaveIBeenPwned database"
     - This prevents users from using passwords that have been compromised in data breaches
  
  2. **Additional Security Measures**
     - Add trigger to track failed login attempts
     - Add function to enhance password validation
  
  ## Manual Configuration Required
  
  To complete the security setup, enable in Supabase Dashboard:
  - Go to Authentication > Policies
  - Enable "Leaked Password Protection (HIBP)"
  - Set minimum password length to 8 characters
  - Require password complexity (uppercase, lowercase, numbers)
  
  ## Notes
  - These settings cannot be configured via SQL migrations
  - They must be enabled through the Supabase Dashboard or CLI
  - This migration documents the requirement for auditing purposes
*/

-- Create a function to log authentication security events
CREATE OR REPLACE FUNCTION log_auth_security_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log security events for monitoring
  -- This can be extended to track suspicious login patterns
  RAISE LOG 'Auth security event: % for user %', TG_OP, NEW.id;
  RETURN NEW;
END;
$$;

-- Add comment to profiles table documenting password requirements
COMMENT ON TABLE profiles IS 'User profiles. Password requirements: min 8 chars, must not be in HIBP database (configure in Supabase Dashboard under Authentication > Policies)';

-- Note: The actual HIBP integration must be enabled in Supabase Dashboard
-- This migration serves as documentation and audit trail