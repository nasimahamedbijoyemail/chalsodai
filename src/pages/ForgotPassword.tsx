import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import PageHead from '@/components/PageHead';
import PageTransition from '@/components/PageTransition';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('ইমেইল দিন');
      return;
    }
    if (!email.includes('@') || email.endsWith('@phone.local')) {
      toast.error('সঠিক ইমেইল দিন। ফোন নম্বর দিয়ে পাসওয়ার্ড রিসেট করা যায় না।');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch {
      toast.error('সমস্যা হয়েছে, আবার চেষ্টা করুন');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="container py-10 sm:py-16 pb-24 md:pb-16 max-w-md">
        <PageHead title="পাসওয়ার্ড রিসেট" />
        <div className="rounded-2xl border bg-card p-6 sm:p-8 premium-card">
          <div className="text-center mb-6">
            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">পাসওয়ার্ড ভুলে গেছেন?</h1>
            <p className="text-sm text-muted-foreground mt-1">
              আপনার ইমেইলে পাসওয়ার্ড রিসেট লিংক পাঠানো হবে
            </p>
          </div>

          {submitted ? (
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-3xl">✉️</span>
              </div>
              <p className="font-medium">রিসেট লিংক পাঠানো হয়েছে!</p>
              <p className="text-sm text-muted-foreground">
                <strong>{email}</strong> এ একটি পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে।
                ইমেইল চেক করুন এবং লিংকে ক্লিক করে নতুন পাসওয়ার্ড সেট করুন।
              </p>
              <p className="text-xs text-muted-foreground">
                ইমেইল না পেলে স্প্যাম ফোল্ডার চেক করুন।
              </p>
              <Link to="/auth">
                <Button variant="outline" className="mt-4 gap-2">
                  <ArrowLeft className="h-4 w-4" /> লগইনে ফিরুন
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">ইমেইল</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={255}
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> অপেক্ষা করুন...</>
                ) : (
                  'রিসেট লিংক পাঠান'
                )}
              </Button>
              <div className="text-center">
                <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary gap-1 inline-flex items-center">
                  <ArrowLeft className="h-3.5 w-3.5" /> লগইনে ফিরুন
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default ForgotPassword;
