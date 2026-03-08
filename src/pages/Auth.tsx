import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, Wheat, Eye, EyeOff, ArrowRight, Sparkles, Truck, Shield } from 'lucide-react';
import PageHead from '@/components/PageHead';
import PageTransition from '@/components/PageTransition';

type AuthMethod = 'email' | 'phone';

const floatingIcons = [
  { icon: '🌾', x: '10%', y: '20%', delay: 0 },
  { icon: '🍚', x: '85%', y: '15%', delay: 0.5 },
  { icon: '🌿', x: '75%', y: '75%', delay: 1 },
  { icon: '🛒', x: '15%', y: '80%', delay: 1.5 },
];

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<AuthMethod>('phone');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const getAuthEmail = () => {
    if (authMethod === 'email') return email;
    return `${phone}@phone.local`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMethod === 'email' && !email.trim()) { toast.error('ইমেইল দিন'); return; }
    if (authMethod === 'phone' && !phone.trim()) { toast.error('ফোন নম্বর দিন'); return; }
    if (!password.trim()) { toast.error('পাসওয়ার্ড দিন'); return; }
    if (!isLogin && !fullName.trim()) { toast.error('আপনার নাম দিন'); return; }

    setLoading(true);
    try {
      const authEmail = getAuthEmail();
      if (isLogin) {
        const { error } = await signIn(authEmail, password);
        if (error) {
          toast.error(error.message.includes('Invalid login credentials') ? 'ফোন নম্বর/ইমেইল বা পাসওয়ার্ড ভুল' : error.message);
        } else {
          toast.success('লগইন সফল!');
          navigate('/');
        }
      } else {
        const { error } = await signUp(authEmail, password, fullName);
        if (error) {
          toast.error(error.message.includes('already registered') ? 'এই ফোন নম্বর/ইমেইল আগে থেকেই রেজিস্টার করা আছে' : error.message);
        } else {
          toast.success('অ্যাকাউন্ট তৈরি হয়েছে!');
          navigate('/');
        }
      }
    } catch {
      toast.error('কিছু একটা সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="container py-8 sm:py-12 pb-24 md:pb-16 max-w-5xl">
        <PageHead title={isLogin ? 'লগইন' : 'রেজিস্টার'} />

        <div className="grid md:grid-cols-2 gap-0 md:gap-0 items-stretch">
          {/* Left: Brand Panel (hidden on mobile, shown on md+) */}
          <motion.div
            className="hidden md:flex flex-col justify-center rounded-l-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-8 lg:p-12 relative overflow-hidden"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Floating decorative emojis */}
            {floatingIcons.map((item, i) => (
              <motion.span
                key={i}
                className="absolute text-2xl pointer-events-none opacity-20"
                style={{ left: item.x, top: item.y }}
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 4,
                  delay: item.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {item.icon}
              </motion.span>
            ))}

            {/* Decorative blurs */}
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-secondary/20 blur-3xl" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-accent/15 blur-3xl" />

            <div className="relative z-10 space-y-6">
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="h-12 w-12 rounded-xl bg-secondary/20 backdrop-blur-sm flex items-center justify-center">
                  <Wheat className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-primary-foreground">CHAL SODAI</h2>
                  <p className="text-[10px] text-primary-foreground/60 uppercase tracking-widest">চাল সদাই</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-2xl lg:text-3xl font-bold text-primary-foreground leading-tight">
                  সেরা মানের চাল,<br />
                  <span className="text-secondary">সরাসরি আপনার ঘরে</span>
                </h3>
                <p className="text-sm text-primary-foreground/70 mt-3 max-w-sm">
                  অ্যাকাউন্ট তৈরি করে অর্ডার ট্র্যাক করুন, স্পেশাল অফার পান, এবং দ্রুত চেকআউট করুন।
                </p>
              </motion.div>

              <motion.div
                className="space-y-3 pt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {[
                  { icon: Sparkles, text: 'স্পেশাল অফার ও ডিসকাউন্ট' },
                  { icon: Truck, text: 'রিয়েল-টাইম অর্ডার ট্র্যাকিং' },
                  { icon: Shield, text: 'নিরাপদ ও সুরক্ষিত পেমেন্ট' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-primary-foreground/80">
                    <div className="h-8 w-8 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-secondary" />
                    </div>
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Auth Form */}
          <motion.div
            className="rounded-2xl md:rounded-l-none md:rounded-r-2xl border bg-card p-6 sm:p-8 premium-card"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Mobile brand header */}
            <div className="md:hidden text-center mb-6">
              <motion.div
                className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <Wheat className="h-7 w-7 text-primary" />
              </motion.div>
              <h1 className="text-xl font-bold">
                {isLogin ? 'চাল সদাইতে লগইন করুন' : 'অ্যাকাউন্ট তৈরি করুন'}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">সেরা মানের চাল, সরাসরি আপনার ঘরে</p>
            </div>

            {/* Desktop heading */}
            <div className="hidden md:block mb-6">
              <h1 className="text-xl sm:text-2xl font-bold">
                {isLogin ? 'স্বাগতম! 👋' : 'অ্যাকাউন্ট তৈরি করুন ✨'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {isLogin ? 'আপনার অ্যাকাউন্টে লগইন করুন' : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
              </p>
            </div>

            {/* Auth method toggle */}
            <div className="flex rounded-xl border bg-muted/50 p-1 mb-6">
              <button
                type="button"
                onClick={() => setAuthMethod('phone')}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-300 ${
                  authMethod === 'phone' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                📱 ফোন নম্বর
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('email')}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-300 ${
                  authMethod === 'email' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                ✉️ ইমেইল
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <Label htmlFor="fullName">আপনার নাম</Label>
                  <Input id="fullName" placeholder="পুরো নাম" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} className="h-11" />
                </motion.div>
              )}

              {authMethod === 'phone' ? (
                <div className="space-y-2">
                  <Label htmlFor="phone">ফোন নম্বর</Label>
                  <Input id="phone" type="tel" placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={15} className="h-11" />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="email">ইমেইল</Label>
                  <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} className="h-11" />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">পাসওয়ার্ড</Label>
                  {isLogin && (
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                      ভুলে গেছেন?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> অপেক্ষা করুন...</>
                ) : (
                  <>{isLogin ? 'লগইন করুন' : 'রেজিস্টার করুন'} <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </form>

            {/* Toggle login/register */}
            <div className="mt-6 text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">অথবা</span>
                </div>
              </div>
              {isLogin ? (
                <p className="text-sm">
                  অ্যাকাউন্ট নেই?{' '}
                  <button onClick={() => setIsLogin(false)} className="text-primary font-semibold hover:underline">
                    রেজিস্টার করুন
                  </button>
                </p>
              ) : (
                <p className="text-sm">
                  আগে থেকে অ্যাকাউন্ট আছে?{' '}
                  <button onClick={() => setIsLogin(true)} className="text-primary font-semibold hover:underline">
                    লগইন করুন
                  </button>
                </p>
              )}
            </div>

            <div className="mt-4 text-center">
              <Link to="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                ← হোমে ফিরুন
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Auth;
