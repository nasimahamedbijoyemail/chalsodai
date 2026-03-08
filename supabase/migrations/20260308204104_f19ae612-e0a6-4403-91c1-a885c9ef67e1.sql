CREATE POLICY "Anyone can view guest order items"
ON public.order_items
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id IS NULL
  )
);