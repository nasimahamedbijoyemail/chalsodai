import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type AuthMethod = 'email' | 'phone';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<AuthMethod>('phone');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const getAuthEmail = () => {
    if (authMethod === 'email') return email;
    return `${phone}@phone.local`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authMethod === 'email' && !email.trim()) {
      toast.error('ইমেইল দিন');
      return;
    }
    if (authMethod === 'phone' && !phone.trim()) {
      toast.error('ফোন নম্বর দিন');
      return;
    }
    if (!password.trim()) {
      toast.error('পাসওয়ার্ড দিন');
      return;
    }
    if (!isLogin && !fullName.trim()) {
      toast.error('আপনার নাম দিন');
      return;
    }

    setLoading(true);
    try {
      const authEmail = getAuthEmail();
      if (isLogin) {
        const { error } = await signIn(authEmail, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('ফোন নম্বর/ইমেইল বা পাসওয়ার্ড ভুল');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('লগইন সফল!');
          navigate('/');
        }
      } else {
        const { error } = await signUp(authEmail, password, fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('এই ফোন নম্বর/ইমেইল আগে থেকেই রেজিস্টার করা আছে');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('অ্যাকাউন্ট তৈরি হয়েছে!');
          navigate('/');
        }
      }
    } catch (err) {
      toast.error('কিছু একটা সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-16 max-w-md">
      <div className="rounded-xl border bg-card p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          {isLogin ? 'চাল দোকানে লগইন করুন' : 'অ্যাকাউন্ট তৈরি করুন'}
        </h1>

        {/* Auth method toggle */}
        <div className="flex rounded-lg border bg-muted p-1 mb-6">
          <button
            type="button"
            onClick={() => setAuthMethod('phone')}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
              authMethod === 'phone' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
            }`}
          >
            ফোন নম্বর
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('email')}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
              authMethod === 'email' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'
            }`}
          >
            ইমেইল
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="fullName">আপনার নাম</Label>
              <Input
                id="fullName"
                placeholder="পুরো নাম"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={100}
              />
            </div>
          )}

          {authMethod === 'phone' ? (
            <div className="space-y-2">
              <Label htmlFor="phone">ফোন নম্বর</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={15}
              />
            </div>
          ) : (
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
          )}

          <div className="space-y-2">
            <Label htmlFor="password">পাসওয়ার্ড</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'অপেক্ষা করুন...' : isLogin ? 'লগইন' : 'রেজিস্টার'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          {isLogin ? (
            <p>
              অ্যাকাউন্ট নেই?{' '}
              <button onClick={() => setIsLogin(false)} className="text-primary font-medium hover:underline">
                রেজিস্টার করুন
              </button>
            </p>
          ) : (
            <p>
              আগে থেকে অ্যাকাউন্ট আছে?{' '}
              <button onClick={() => setIsLogin(true)} className="text-primary font-medium hover:underline">
                লগইন করুন
              </button>
            </p>
          )}
        </div>

        {isLogin && (
          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              পাসওয়ার্ড ভুলে গেছেন?
            </Link>
          </div>
        )}

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← হোমে ফিরুন
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
