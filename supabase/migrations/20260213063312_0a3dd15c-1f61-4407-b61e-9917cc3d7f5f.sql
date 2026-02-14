
-- Add payment_method column to orders
ALTER TABLE public.orders 
  ALTER COLUMN bkash_number DROP NOT NULL,
  ADD COLUMN payment_method text NOT NULL DEFAULT 'bkash';
