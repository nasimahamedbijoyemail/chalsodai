-- Drop the existing guest order policy and recreate with anon role included
DROP POLICY IF EXISTS "Anyone can create guest orders" ON public.orders;
CREATE POLICY "Anyone can create guest orders"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (user_id IS NULL);

-- Also ensure order_items allows guest inserts
DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
CREATE POLICY "Anyone can insert order items"
ON public.order_items
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id
  )
);