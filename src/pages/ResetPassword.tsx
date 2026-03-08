import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, KeyRound, CheckCircle } from 'lucide-react';
import PageHead from '@/components/PageHead';
import PageTransition from '@/components/PageTransition';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if this is a valid recovery session
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type === 'recovery') {
      setIsValidSession(true);
      setChecking(false);
      return;
    }

    // Also check via session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsValidSession(true);
      }
      setChecking(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('পাসওয়ার্ড ন্যূনতম ৬ অক্ষর হতে হবে');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('পাসওয়ার্ড মিলছে না');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast.success('পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!');
    } catch {
      toast.error('পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="container py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <PageTransition>
        <div className="container py-16 max-w-md text-center">
          <PageHead title="অবৈধ লিংক" />
          <div className="rounded-2xl border bg-card p-8 premium-card">
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold mb-2">অবৈধ বা মেয়াদোত্তীর্ণ লিংক</h1>
            <p className="text-sm text-muted-foreground mb-6">
              এই পাসওয়ার্ড রিসেট লিংকটি অবৈধ বা মেয়াদ শেষ হয়ে গেছে। আবার চেষ্টা করুন।
            </p>
            <Button onClick={() => navigate('/forgot-password')}>
              আবার রিসেট লিংক পাঠান
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container py-10 sm:py-16 pb-24 md:pb-16 max-w-md">
        <PageHead title="নতুন পাসওয়ার্ড সেট করুন" />
        <div className="rounded-2xl border bg-card p-6 sm:p-8 premium-card">
          <div className="text-center mb-6">
            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <KeyRound className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">নতুন পাসওয়ার্ড সেট করুন</h1>
          </div>

          {success ? (
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <p className="font-medium">পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!</p>
              <p className="text-sm text-muted-foreground">
                এখন আপনি নতুন পাসওয়ার্ড দিয়ে লগইন করতে পারবেন।
              </p>
              <Button onClick={() => navigate('/')} className="mt-2">
                হোমে যান
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">নতুন পাসওয়ার্ড</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="ন্যূনতম ৬ অক্ষর"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">পাসওয়ার্ড নিশ্চিত করুন</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="আবার পাসওয়ার্ড দিন"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> অপেক্ষা করুন...</>
                ) : (
                  'পাসওয়ার্ড সেট করুন'
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default ResetPassword;
