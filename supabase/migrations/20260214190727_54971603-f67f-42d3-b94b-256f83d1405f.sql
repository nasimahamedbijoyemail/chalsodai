
-- Drop the overly permissive policy
DROP POLICY "Anyone can insert guest order items" ON public.order_items;

-- Replace with a policy that checks the order exists
CREATE POLICY "Anyone can insert order items for existing orders"
ON public.order_items
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM orders WHERE orders.id = order_items.order_id
));
