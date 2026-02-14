
-- Add product_images column to rice_products (array of up to 3 image URLs)
ALTER TABLE public.rice_products ADD COLUMN IF NOT EXISTS additional_images text[] DEFAULT '{}';

-- Create account deletion requests table
CREATE TABLE public.account_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create own deletion request"
ON public.account_deletion_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own deletion request"
ON public.account_deletion_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage deletion requests"
ON public.account_deletion_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all deletion requests"
ON public.account_deletion_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_deletion_requests_updated_at
BEFORE UPDATE ON public.account_deletion_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
