-- Fix: Add missing trigger for handle_new_user on auth.users
-- This ensures new signups automatically get a profile and customer role
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();