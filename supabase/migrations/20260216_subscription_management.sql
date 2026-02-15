-- Migration: Subscription Management Improvements
-- Date: 2026-02-16
-- Description: Add RLS policies for admin operations and automatic expiration function

-- ============================================================================
-- PART 1: RLS Policies for Admin Operations on Subscriptions
-- ============================================================================

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can update subscriptions" ON public.subscriptions;

-- Allow service role to bypass RLS (this is default, but making it explicit)
-- Service role operations will bypass RLS automatically

-- Allow admins (users in admin_roles table) to update any subscription
CREATE POLICY "Admins can update subscriptions" 
ON public.subscriptions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE user_id = auth.uid()
  )
);

-- Allow admins to view all subscriptions
CREATE POLICY "Admins can view all subscriptions" 
ON public.subscriptions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE user_id = auth.uid()
  )
);

-- Allow users to view their own subscriptions
CREATE POLICY "Users can view own subscriptions" 
ON public.subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

-- ============================================================================
-- PART 2: Automatic Subscription Expiration Function
-- ============================================================================

-- Function to expire subscriptions that have passed their current_period_end
CREATE OR REPLACE FUNCTION public.expire_old_subscriptions()
RETURNS TABLE(expired_count INTEGER) AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  -- Update subscriptions table
  WITH updated_subs AS (
    UPDATE public.subscriptions
    SET 
      status = 'expired',
      updated_at = NOW()
    WHERE 
      status = 'active' 
      AND current_period_end < NOW()
    RETURNING user_id
  )
  -- Update users table to match
  UPDATE public.users
  SET 
    subscription_status = 'expired',
    updated_at = NOW()
  FROM updated_subs
  WHERE users.id = updated_subs.user_id;
  
  -- Get count of affected rows
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  -- Log the expiration
  RAISE NOTICE 'Expired % subscriptions at %', affected_rows, NOW();
  
  RETURN QUERY SELECT affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 3: Function to Expire a Specific User's Subscription
-- ============================================================================

CREATE OR REPLACE FUNCTION public.expire_user_subscription(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  sub_exists BOOLEAN;
BEGIN
  -- Check if user has an active subscription
  SELECT EXISTS(
    SELECT 1 FROM public.subscriptions 
    WHERE user_id = target_user_id AND status = 'active'
  ) INTO sub_exists;
  
  IF NOT sub_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Update subscription
  UPDATE public.subscriptions
  SET 
    status = 'expired',
    current_period_end = NOW(),
    updated_at = NOW()
  WHERE user_id = target_user_id AND status = 'active';
  
  -- Update user record
  UPDATE public.users
  SET 
    subscription_status = 'expired',
    updated_at = NOW()
  WHERE id = target_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 4: Add indexes for performance
-- ============================================================================

-- Index for faster expiration checks
CREATE INDEX IF NOT EXISTS idx_subscriptions_status_period_end 
ON public.subscriptions(status, current_period_end) 
WHERE status = 'active';

-- Index for admin role checks
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_id 
ON public.admin_roles(user_id);

-- ============================================================================
-- PART 5: Grant execute permissions
-- ============================================================================

-- Allow authenticated users to call the expiration functions
GRANT EXECUTE ON FUNCTION public.expire_old_subscriptions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.expire_user_subscription(UUID) TO authenticated;

-- ============================================================================
-- VERIFICATION QUERIES (Run these after migration to test)
-- ============================================================================

-- Test 1: Check if policies are created
-- SELECT policyname, tablename FROM pg_policies WHERE tablename = 'subscriptions';

-- Test 2: Test the expiration function
-- SELECT * FROM public.expire_old_subscriptions();

-- Test 3: Check for expired subscriptions
-- SELECT id, user_id, status, current_period_end FROM public.subscriptions WHERE status = 'expired';
