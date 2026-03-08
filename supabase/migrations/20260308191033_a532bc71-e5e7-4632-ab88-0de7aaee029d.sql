
-- Fix 1: Allow users to mark broadcast notifications as read
-- Current policy only allows user_id = auth.uid(), but broadcasts have user_id = null
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (
  (auth.uid() = user_id) OR (is_broadcast = true)
)
WITH CHECK (
  (auth.uid() = user_id) OR (is_broadcast = true)
);

-- Fix 2: Remove duplicate order_items INSERT policy (keep the more permissive one for guest checkout)
DROP POLICY IF EXISTS "Users can insert order items" ON public.notifications;
