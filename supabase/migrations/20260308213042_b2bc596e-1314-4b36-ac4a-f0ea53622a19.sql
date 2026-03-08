
-- Fix orders INSERT policies: change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Anyone can create guest orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;

CREATE POLICY "Anyone can create guest orders" ON public.orders
FOR INSERT TO public
WITH CHECK (user_id IS NULL);

CREATE POLICY "Users can create orders" ON public.orders
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Fix order_items INSERT policies
DROP POLICY IF EXISTS "Anyone can insert guest order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert order items" ON public.order_items;

CREATE POLICY "Anyone can insert guest order items" ON public.order_items
FOR INSERT TO public
WITH CHECK (EXISTS (
  SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id IS NULL
));

CREATE POLICY "Users can insert order items" ON public.order_items
FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
));

-- Fix orders SELECT policies
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;

CREATE POLICY "Users can view own orders" ON public.orders
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON public.orders
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage orders" ON public.orders
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix order_items SELECT policies
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can view guest order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;

CREATE POLICY "Users can view own order items" ON public.order_items
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
));

CREATE POLICY "Anyone can view guest order items" ON public.order_items
FOR SELECT TO public
USING (EXISTS (
  SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id IS NULL
));

CREATE POLICY "Admins can view all order items" ON public.order_items
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage order items" ON public.order_items
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix notifications INSERT policy for order notifications
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;

CREATE POLICY "Users can insert own notifications" ON public.notifications
FOR INSERT TO authenticated
WITH CHECK ((auth.uid() = user_id) AND ((is_broadcast IS NULL) OR (is_broadcast = false)));
