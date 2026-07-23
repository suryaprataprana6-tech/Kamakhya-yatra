-- Migration Script: Add invoice upload fields and invoice verification status to booking_cancellations table

ALTER TABLE public.booking_cancellations 
ADD COLUMN IF NOT EXISTS invoice_file_path TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS invoice_file_name TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS invoice_file_type TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS invoice_file_size BIGINT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS invoice_uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS invoice_verification_status TEXT DEFAULT 'Pending Verification';

-- Create index for quick lookup of invoice verification status
CREATE INDEX IF NOT EXISTS idx_booking_cancellations_invoice_status 
ON public.booking_cancellations (invoice_verification_status);
