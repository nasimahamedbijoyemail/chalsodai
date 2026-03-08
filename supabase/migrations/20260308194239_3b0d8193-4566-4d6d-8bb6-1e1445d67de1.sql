-- Fix 1: Restrict chat_messages UPDATE to only allow marking own messages as read (not modifying content)
DROP POLICY IF EXISTS "Users can mark messages as read in own conversations" ON public.chat_messages;

CREATE POLICY "Users can mark messages as read in own conversations"
ON public.chat_messages
FOR UPDATE
TO authenticated
USING (
  is_admin = true
  AND EXISTS (
    SELECT 1 FROM chat_conversations
    WHERE chat_conversations.id = chat_messages.conversation_id
    AND chat_conversations.user_id = auth.uid()
  )
)
WITH CHECK (
  is_admin = true
  AND EXISTS (
    SELECT 1 FROM chat_conversations
    WHERE chat_conversations.id = chat_messages.conversation_id
    AND chat_conversations.user_id = auth.uid()
  )
);

-- Fix 2: Restrict broadcast notification INSERT/UPDATE to admins only
DROP POLICY IF EXISTS "Authenticated users can insert broadcast notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

CREATE POLICY "Users can insert own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND (is_broadcast IS NULL OR is_broadcast = false));

CREATE POLICY "Admins can insert broadcast notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND is_broadcast = true
);

CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND (is_broadcast IS NULL OR is_broadcast = false))
WITH CHECK (auth.uid() = user_id AND (is_broadcast IS NULL OR is_broadcast = false));

CREATE POLICY "Users can mark broadcast notifications as read"
ON public.notifications
FOR UPDATE
TO authenticated
USING (is_broadcast = true)
WITH CHECK (is_broadcast = true);

-- Fix 3: Remove overly permissive "Anyone can insert order items" policy
DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;