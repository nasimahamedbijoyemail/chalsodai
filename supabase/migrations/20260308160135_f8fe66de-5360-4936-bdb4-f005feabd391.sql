-- Fix 1: Add missing INSERT policy for notifications so users can receive order notifications
CREATE POLICY "Users can insert own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Fix 2: Remove duplicate order_items INSERT policy
DROP POLICY IF EXISTS "Anyone can insert order items for existing orders" ON public.order_items;