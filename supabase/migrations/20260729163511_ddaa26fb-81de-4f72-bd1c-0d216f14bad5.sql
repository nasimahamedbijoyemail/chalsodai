DROP POLICY IF EXISTS "Anyone can view guest orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create guest orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view guest order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can insert guest order items" ON public.order_items;
REVOKE ALL ON public.orders FROM anon;
REVOKE ALL ON public.order_items FROM anon;
GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.order_items TO service_role;