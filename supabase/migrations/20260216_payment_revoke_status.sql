-- Add 'revoked' status to payment_requests
-- This migration adds support for revoking payment requests

-- Update the comment on the status column to include 'revoked'
COMMENT ON COLUMN public.payment_requests.status IS 'pending, approved, rejected, revoked';

-- Optional: Add a check constraint to ensure only valid statuses
-- (Only run this if you want to enforce status values at the database level)
-- ALTER TABLE public.payment_requests 
-- DROP CONSTRAINT IF EXISTS payment_requests_status_check;

-- ALTER TABLE public.payment_requests 
-- ADD CONSTRAINT payment_requests_status_check 
-- CHECK (status IN ('pending', 'approved', 'rejected', 'revoked'));
