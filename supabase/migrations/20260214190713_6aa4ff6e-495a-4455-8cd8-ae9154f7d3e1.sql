
-- Allow guest users (not logged in) to create orders with null user_id
CREATE POLICY "Anyone can create guest orders"
ON public.orders
FOR INSERT
WITH CHECK (user_id IS NULL);

-- Allow guest users to insert order items for their orders
CREATE POLICY "Anyone can insert guest order items"
ON public.order_items
FOR INSERT
WITH CHECK (true);
