
CREATE OR REPLACE FUNCTION public.generate_order_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.order_number := 'CS-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$function$;

-- Add delivery_charge column to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_charge numeric NOT NULL DEFAULT 0;
