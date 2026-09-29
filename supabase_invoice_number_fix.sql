-- Migration Script: Fix duplicate invoice number collisions and synchronize sequence

-- 1. Ensure sequence exists
CREATE SEQUENCE IF NOT EXISTS public.booking_invoice_seq START WITH 1;

-- 2. Synchronize sequence above highest existing invoice number and booking ID
SELECT setval('public.booking_invoice_seq', GREATEST(
  (
    SELECT COALESCE(MAX(
      CASE 
        WHEN invoice_number ~ '^KY-INV-[0-9]{4}-[0-9]+$' 
        THEN (regexp_match(invoice_number, '-([0-9]+)$'))[1]::BIGINT 
        ELSE 0 
      END
    ), 0) FROM public.booking_requests
  ),
  (
    SELECT COALESCE(MAX(
      CASE 
        WHEN booking_reference ~ '^KY-BKG-[0-9]{4}-[0-9]+$' 
        THEN (regexp_match(booking_reference, '-([0-9]+)$'))[1]::BIGINT 
        ELSE 0 
      END
    ), 0) FROM public.booking_requests
  ),
  (SELECT COALESCE(MAX(id), 0) FROM public.booking_requests),
  10
));

-- 3. Create function to generate guaranteed unique invoice number atomically
CREATE OR REPLACE FUNCTION public.generate_next_invoice_number()
RETURNS TEXT AS $$
DECLARE
  next_val BIGINT;
  new_inv_num TEXT;
  curr_year TEXT := to_char(now(), 'YYYY');
  max_existing BIGINT;
BEGIN
  -- Get highest existing numeric sequence in database
  SELECT COALESCE(MAX(
    CASE 
      WHEN invoice_number ~ '^KY-INV-[0-9]{4}-[0-9]+$' 
      THEN (regexp_match(invoice_number, '-([0-9]+)$'))[1]::BIGINT 
      ELSE 0 
    END
  ), 0) INTO max_existing FROM public.booking_requests;

  -- Get next sequence value atomically
  next_val := nextval('public.booking_invoice_seq');

  -- If sequence value is less than or equal to max_existing, advance sequence past max_existing
  IF next_val <= max_existing THEN
    PERFORM setval('public.booking_invoice_seq', max_existing + 1);
    next_val := max_existing + 1;
  END IF;

  new_inv_num := 'KY-INV-' || curr_year || '-' || lpad(next_val::text, 6, '0');
  RETURN new_inv_num;
END;
$$ LANGUAGE plpgsql;

-- 4. Update BEFORE INSERT trigger on booking_requests
CREATE OR REPLACE FUNCTION public.set_booking_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := public.generate_next_invoice_number();
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
EXECUTE FUNCTION public.set_booking_invoice_number();
