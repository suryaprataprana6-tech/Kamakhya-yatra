-- Migration Script: Add invoice fields to booking_requests and create sequence + trigger for invoice_number

-- 1. Create sequence for invoice numbers
CREATE SEQUENCE IF NOT EXISTS booking_invoice_seq START WITH 1;

-- 2. Add new invoice columns to booking_requests table if they don't exist
ALTER TABLE public.booking_requests
ADD COLUMN IF NOT EXISTS invoice_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS invoice_issued_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS rate_per_person NUMERIC(10,2) DEFAULT 0;

-- 3. Function & Trigger to auto-generate unique invoice_number: KY-INV-2026-000001
CREATE OR REPLACE FUNCTION set_booking_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    -- Mirror reference sequence/id padding or use sequence
    NEW.invoice_number := 'KY-INV-' || to_char(COALESCE(NEW.created_at, now()), 'YYYY') || '-' || lpad(nextval('booking_invoice_seq')::text, 6, '0');
  END IF;
  IF NEW.invoice_issued_at IS NULL THEN
    NEW.invoice_issued_at := COALESCE(NEW.created_at, now());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_booking_invoice_number ON public.booking_requests;

CREATE TRIGGER trg_set_booking_invoice_number
BEFORE INSERT ON public.booking_requests
FOR EACH ROW
EXECUTE FUNCTION set_booking_invoice_number();

-- 4. Backfill existing legacy bookings missing invoice_number
UPDATE public.booking_requests
SET invoice_number = REPLACE(booking_reference, 'KY-BKG-', 'KY-INV-')
WHERE invoice_number IS NULL AND booking_reference IS NOT NULL AND booking_reference LIKE 'KY-BKG-%';

UPDATE public.booking_requests
SET invoice_number = 'KY-INV-' || to_char(created_at, 'YYYY') || '-' || lpad(id::text, 6, '0')
WHERE invoice_number IS NULL;
