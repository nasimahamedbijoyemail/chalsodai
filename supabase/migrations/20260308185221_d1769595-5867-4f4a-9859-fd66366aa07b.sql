-- Fix 1: Allow users to UPDATE (mark as read) admin messages in their own conversations
CREATE POLICY "Users can mark messages as read in own conversations"
ON public.chat_messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM chat_conversations
    WHERE chat_conversations.id = chat_messages.conversation_id
    AND chat_conversations.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM chat_conversations
    WHERE chat_conversations.id = chat_messages.conversation_id
    AND chat_conversations.user_id = auth.uid()
  )
);

-- Fix 2: Allow authenticated users to insert broadcast notifications (for deletion requests)
CREATE POLICY "Authenticated users can insert broadcast notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  (user_id IS NULL AND is_broadcast = true)
  OR (auth.uid() = user_id)
);

-- Drop the old restrictive insert policy  
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;

-- Fix 3: Add bkash_number to site_settings if not exists
INSERT INTO public.site_settings (key, value) 
VALUES ('bkash_number', '01786698614')
ON CONFLICT (key) DO NOTHING;