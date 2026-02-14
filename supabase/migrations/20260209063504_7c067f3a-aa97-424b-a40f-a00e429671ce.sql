-- Make order_number have a default so we don't need to pass it
ALTER TABLE public.orders ALTER COLUMN order_number SET DEFAULT '';