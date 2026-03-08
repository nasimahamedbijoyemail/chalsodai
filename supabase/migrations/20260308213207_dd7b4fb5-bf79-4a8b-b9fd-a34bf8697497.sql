
CREATE POLICY "Anyone can view guest orders" ON public.orders
FOR SELECT TO public
USING (user_id IS NULL);
