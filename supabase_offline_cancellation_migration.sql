-- Migration Script: Support Offline / Counter Booking Cancellations in booking_cancellations

ALTER TABLE public.booking_cancellations 
ADD COLUMN IF NOT EXISTS cancellation_request_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS booking_source TEXT DEFAULT 'online',
ADD COLUMN IF NOT EXISTS offline_booking_reference TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS offline_customer_name TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS offline_phone TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS offline_email TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS offline_package_name TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS offline_travel_date TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS offline_travel_class TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS offline_travellers INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS offline_package_amount NUMERIC(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS offline_amount_paid NUMERIC(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS offline_payment_mode TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS offline_booking_office TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS booking_verification_status TEXT DEFAULT 'Pending Verification',
ADD COLUMN IF NOT EXISTS invoice_file_path TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS invoice_file_name TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS invoice_file_type TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS invoice_file_size BIGINT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS invoice_uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS invoice_verification_status TEXT DEFAULT 'Pending Verification';

-- Backfill NULL booking_source with 'online' for existing legacy records
UPDATE public.booking_cancellations
SET booking_source = 'online'
WHERE booking_source IS NULL;

-- Backfill NULL booking_verification_status with 'Verified' for legacy online records
UPDATE public.booking_cancellations
SET booking_verification_status = 'Verified'
WHERE (booking_verification_status IS NULL OR booking_verification_status = 'Pending Verification') AND booking_source = 'online';

-- Indexes for quick filtering
CREATE INDEX IF NOT EXISTS idx_booking_cancellations_source ON public.booking_cancellations (booking_source);
CREATE INDEX IF NOT EXISTS idx_booking_cancellations_req_id ON public.booking_cancellations (cancellation_request_id);
CREATE INDEX IF NOT EXISTS idx_booking_cancellations_offline_ref ON public.booking_cancellations (offline_booking_reference);
CREATE INDEX IF NOT EXISTS idx_booking_cancellations_bkg_verification ON public.booking_cancellations (booking_verification_status);
