-- Migration Script: Implement Two-Stage Booking Verification + Provisional Receipt + Admin-Confirmed Final Invoice System

-- 1. Add verification and snapshot columns to booking_requests table safely
ALTER TABLE public.booking_requests
ADD COLUMN IF NOT EXISTS booking_verification_status TEXT DEFAULT 'Pending Verification',
ADD COLUMN IF NOT EXISTS payment_verification_status TEXT DEFAULT 'Pending Verification',
ADD COLUMN IF NOT EXISTS customer_submitted_amount NUMERIC(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS admin_verified_amount NUMERIC(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_verified_by TEXT,
ADD COLUMN IF NOT EXISTS admin_payment_notes TEXT,
ADD COLUMN IF NOT EXISTS booking_confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS booking_confirmed_by TEXT,
ADD COLUMN IF NOT EXISTS final_invoice_generated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS invoice_snapshot JSONB;

-- 2. Backfill existing historical bookings to maintain backward compatibility
-- If historical booking was already confirmed/completed or paid, set verification status to Confirmed/Verified
UPDATE public.booking_requests
SET 
  booking_verification_status = 'Confirmed',
  payment_verification_status = 'Verified',
  customer_submitted_amount = COALESCE(advance_amount, 0),
  admin_verified_amount = COALESCE(advance_amount, 0),
  booking_confirmed_at = COALESCE(booking_confirmed_at, updated_at, created_at),
  final_invoice_generated_at = COALESCE(final_invoice_generated_at, invoice_issued_at, created_at)
WHERE (booking_status IN ('Confirmed', 'Completed') OR payment_status IN ('Paid', 'Partially Paid'))
  AND (booking_verification_status IS NULL OR booking_verification_status = 'Pending Verification');

-- For remaining pending bookings, set defaults
UPDATE public.booking_requests
SET 
  booking_verification_status = 'Pending Verification',
  payment_verification_status = 'Pending Verification',
  customer_submitted_amount = COALESCE(advance_amount, 0),
  admin_verified_amount = COALESCE(admin_verified_amount, 0)
WHERE booking_verification_status IS NULL OR booking_verification_status = '';
