import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Trash2, KeyRound, LogOut, User, Phone, MapPin, Mail, Shield, ShoppingBag, ChevronRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHead from '@/components/PageHead';
import PageTransition from '@/components/PageTransition';
import { Skeleton } from '@/components/ui/skeleton';

const ProfileSkeleton = () => (
  <div className="space-y-6">
    <div className="relative rounded-2xl overflow-hidden border bg-card">
      <Skeleton className="h-28 w-full" />
      <div className="px-5 pb-5 -mt-10 relative z-10">
        <Skeleton className="h-20 w-20 rounded-full border-4 border-background" />
        <Skeleton className="h-5 w-40 mt-3" />
        <Skeleton className="h-4 w-52 mt-2" />
      </div>
    </div>
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  </div>
);

const Profile = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      const fetchData = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
        if (data) {
          setFullName(data.full_name || '');
          setPhone(data.phone || '');
          setAddress(data.address || '');
        }
        setLoading(false);
      };
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, phone, address })
        .eq('user_id', user.id);
      if (error) throw error;
      toast.success('প্রোফাইল আপডেট হয়েছে!');
    } catch {
      toast.error('আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setRequesting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/self-delete-account`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ reason: deleteReason }),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to delete');
      toast.success('আপনার অ্যাকাউন্ট সফলভাবে মুছে ফেলা হয়েছে।');
      await signOut();
      navigate('/');
    } catch {
      toast.error('অ্যাকাউন্ট মুছতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setRequesting(false);
    }
  };

  const getInitials = () => {
    if (fullName) return fullName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  if (authLoading || loading) {
    return (
      <div className="container py-8 sm:py-10 pb-24 md:pb-10 max-w-lg">
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="container py-6 sm:py-10 pb-24 md:pb-10 max-w-lg">
        <PageHead title="আমার প্রোফাইল" />

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="overflow-hidden border-border/50 mb-6">
            {/* Gradient Banner */}
            <div className="h-28 bg-gradient-to-br from-primary via-primary/80 to-secondary relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-secondary blur-2xl" />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-accent blur-2xl" />
              </div>
              {isAdmin && (
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/20 backdrop-blur-sm text-[10px] font-bold text-secondary uppercase tracking-wider">
                    <Shield className="h-3 w-3" /> Admin
                  </span>
                </div>
              )}
            </div>

            {/* Avatar & Info */}
            <div className="px-5 pb-5 -mt-10 relative z-10">
              <motion.div
                className="h-20 w-20 rounded-full border-4 border-background bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
              >
                <span className="text-2xl font-bold text-primary-foreground">{getInitials()}</span>
              </motion.div>
              <div className="mt-3">
                <h1 className="text-lg sm:text-xl font-bold">{fullName || 'নাম সেট করুন'}</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Mail className="h-3.5 w-3.5" />
                  {user?.email}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="grid grid-cols-2 gap-3 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <Link to="/my-orders">
            <Card className="p-4 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 cursor-pointer group">
              <ShoppingBag className="h-5 w-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium">আমার অর্ডার</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-0.5">
                অর্ডার ট্র্যাক করুন <ChevronRight className="h-3 w-3" />
              </p>
            </Card>
          </Link>
          <Link to="/messages">
            <Card className="p-4 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 cursor-pointer group">
              <Mail className="h-5 w-5 text-secondary mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium">মেসেজ</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-0.5">
                সাপোর্ট টিম <ChevronRight className="h-3 w-3" />
              </p>
            </Card>
          </Link>
        </motion.div>

        {/* Edit Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <Card className="mb-6">
            <CardContent className="p-5 sm:p-6">
              <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                প্রোফাইল তথ্য
              </h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-xs font-medium text-muted-foreground">নাম</Label>
                  <Input id="fullName" placeholder="আপনার পুরো নাম" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" /> ফোন নম্বর
                  </Label>
                  <Input id="phone" placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={15} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> ঠিকানা
                  </Label>
                  <Textarea id="address" placeholder="আপনার সম্পূর্ণ ঠিকানা" value={address} onChange={(e) => setAddress(e.target.value)} rows={3} maxLength={500} />
                </div>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />সেভ হচ্ছে...</>) : 'প্রোফাইল আপডেট করুন'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          <Card className="mb-6">
            <CardContent className="p-5 sm:p-6">
              <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary" />
                সিকিউরিটি
              </h2>

              <div className="space-y-3">
                {/* Password Change */}
                <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="w-full flex items-center justify-between p-3 rounded-xl border border-border/60 hover:border-primary/30 hover:bg-muted/30 transition-all duration-200 group">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <KeyRound className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium">পাসওয়ার্ড পরিবর্তন</p>
                          <p className="text-[10px] text-muted-foreground">নতুন পাসওয়ার্ড সেট করুন</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>নতুন পাসওয়ার্ড সেট করুন</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>নতুন পাসওয়ার্ড</Label>
                        <Input type="password" placeholder="ন্যূনতম ৬ অক্ষর" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} />
                      </div>
                      <div className="space-y-2">
                        <Label>পাসওয়ার্ড নিশ্চিত করুন</Label>
                        <Input type="password" placeholder="আবার পাসওয়ার্ড দিন" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => { setPasswordDialogOpen(false); setNewPassword(''); setConfirmPassword(''); }}>বাতিল</Button>
                      <Button
                        onClick={async () => {
                          if (newPassword.length < 6) { toast.error('পাসওয়ার্ড ন্যূনতম ৬ অক্ষর হতে হবে'); return; }
                          if (newPassword !== confirmPassword) { toast.error('পাসওয়ার্ড মিলছে না'); return; }
                          setChangingPassword(true);
                          const { error } = await supabase.auth.updateUser({ password: newPassword });
                          if (error) { toast.error('পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে'); }
                          else { toast.success('পাসওয়ার্ড পরিবর্তন হয়েছে!'); setPasswordDialogOpen(false); setNewPassword(''); setConfirmPassword(''); }
                          setChangingPassword(false);
                        }}
                        disabled={changingPassword}
                      >
                        {changingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        পরিবর্তন করুন
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Logout */}
                <button
                  onClick={async () => { await signOut(); navigate('/'); }}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-border/60 hover:border-primary/30 hover:bg-muted/30 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                      <LogOut className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">লগআউট</p>
                      <p className="text-[10px] text-muted-foreground">অ্যাকাউন্ট থেকে বের হন</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
        >
          <Card className="border-destructive/20">
            <CardContent className="p-5 sm:p-6">
              <h2 className="text-base font-bold text-destructive mb-3 flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                বিপদ জোন
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                অ্যাকাউন্ট ডিলিট করলে আপনার সকল ডেটা স্থায়ীভাবে মুছে যাবে। এই কাজটি অপরিবর্তনীয়।
              </p>
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    অ্যাকাউন্ট ডিলিট করুন
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>অ্যাকাউন্ট ডিলিট করুন</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-muted-foreground">
                    ⚠️ এই কাজটি অপরিবর্তনীয়! আপনার অ্যাকাউন্ট, প্রোফাইল, এবং সকল ডেটা স্থায়ীভাবে মুছে ফেলা হবে। আপনার অর্ডার ইতিহাস রেকর্ড হিসেবে থাকবে।
                  </p>
                  <div className="space-y-2">
                    <Label>কারণ (ঐচ্ছিক)</Label>
                    <Textarea value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} placeholder="কেন ডিলিট করতে চান..." rows={3} maxLength={500} />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>বাতিল</Button>
                    <Button variant="destructive" onClick={handleDeleteAccount} disabled={requesting}>
                      {requesting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      স্থায়ীভাবে ডিলিট করুন
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Profile;
