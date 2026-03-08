-- Fix permissive INSERT policy on password_reset_requests: restrict to anon+authenticated, keep open but explicit
DROP POLICY IF EXISTS "Anyone can create reset request" ON public.password_reset_requests;

CREATE POLICY "Anyone can create reset request"
ON public.password_reset_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (phone_or_email IS NOT NULL AND phone_or_email <> '');