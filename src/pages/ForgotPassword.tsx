import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import PageHead from '@/components/PageHead';

const ForgotPassword = () => {
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOrEmail.trim()) {
      toast.error('ফোন নম্বর বা ইমেইল দিন');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('password_reset_requests')
        .insert({ phone_or_email: phoneOrEmail.trim() });
      if (error) throw error;
      setSubmitted(true);
      toast.success('রিকোয়েস্ট পাঠানো হয়েছে!');
    } catch {
      toast.error('সমস্যা হয়েছে, আবার চেষ্টা করুন');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-16 max-w-md">
      <div className="rounded-xl border bg-card p-8">
        <PageHead title="পাসওয়ার্ড রিসেট" />
        <h1 className="text-2xl font-bold text-center mb-2">পাসওয়ার্ড ভুলে গেছেন?</h1>
        <p className="text-center text-sm text-muted-foreground mb-6">
          আপনার ফোন নম্বর বা ইমেইল দিন। অ্যাডমিন আপনাকে নতুন পাসওয়ার্ড পাঠাবেন।
        </p>

        {submitted ? (
          <div className="text-center space-y-4">
            <div className="text-4xl">✅</div>
            <p className="font-medium">আপনার রিকোয়েস্ট পাঠানো হয়েছে!</p>
            <p className="text-sm text-muted-foreground">
              অ্যাডমিন শীঘ্রই আপনার সাথে যোগাযোগ করবেন এবং নতুন পাসওয়ার্ড জানাবেন।
            </p>
            <Link to="/auth">
              <Button variant="outline" className="mt-4">← লগইনে ফিরুন</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>ফোন নম্বর বা ইমেইল</Label>
              <Input
                placeholder="01XXXXXXXXX বা your@email.com"
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                maxLength={255}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'অপেক্ষা করুন...' : 'রিকোয়েস্ট পাঠান'}
            </Button>
            <div className="text-center">
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary">
                ← লগইনে ফিরুন
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
