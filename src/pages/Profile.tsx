import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Trash2, KeyRound, LogOut, User, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHead from '@/components/PageHead';
import PageTransition from '@/components/PageTransition';

const Profile = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deletionRequested, setDeletionRequested] = useState(false);
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
        const [profileRes, deletionRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('account_deletion_requests').select('id').eq('user_id', user.id).eq('status', 'pending').maybeSingle(),
        ]);

        if (profileRes.data) {
          setFullName(profileRes.data.full_name || '');
          setPhone(profileRes.data.phone || '');
          setAddress(profileRes.data.address || '');
        }
        setDeletionRequested(!!deletionRes.data);
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

  const handleDeleteRequest = async () => {
    if (!user) return;
    setRequesting(true);
    try {
      const { error: reqError } = await supabase.from('account_deletion_requests').insert({
        user_id: user.id,
        reason: deleteReason || null,
      });
      if (reqError) throw reqError;

      // Notification is now handled by admin-only broadcast policy
      // The admin will see the deletion request in the admin panel

      toast.success('অ্যাকাউন্ট ডিলিট রিকোয়েস্ট পাঠানো হয়েছে।');
      setDeletionRequested(true);
      setDeleteDialogOpen(false);
      setDeleteReason('');
    } catch {
      toast.error('রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে');
    } finally {
      setRequesting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="container py-8 sm:py-10 pb-24 md:pb-10 max-w-lg">
        <PageHead title="আমার প্রোফাইল" />
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">আমার প্রোফাইল</h1>

        <form onSubmit={handleSave} className="space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-1.5 text-muted-foreground">
              ইমেইল
            </Label>
            <Input id="email" value={user?.email || ''} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> নাম
            </Label>
            <Input id="fullName" placeholder="আপনার পুরো নাম" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> ফোন নম্বর
            </Label>
            <Input id="phone" placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={15} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> ঠিকানা
            </Label>
            <Textarea id="address" placeholder="আপনার সম্পূর্ণ ঠিকানা" value={address} onChange={(e) => setAddress(e.target.value)} rows={3} maxLength={500} />
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />সেভ হচ্ছে...</>) : 'সেভ করুন'}
          </Button>
        </form>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={async () => { await signOut(); navigate('/'); }}
          >
            <LogOut className="h-4 w-4" /> লগআউট
          </Button>
        </div>

        {/* Password Change Section */}
        <div className="mt-8 pt-6 border-t">
          <h2 className="text-base sm:text-lg font-bold mb-3">পাসওয়ার্ড পরিবর্তন</h2>
          <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <KeyRound className="h-4 w-4" />
                পাসওয়ার্ড পরিবর্তন করুন
              </Button>
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
        </div>

        {/* Account Deletion */}
        <div className="mt-6 pt-6 border-t">
          <h2 className="text-base sm:text-lg font-bold text-destructive mb-3">বিপদ জোন</h2>
          {deletionRequested ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm text-muted-foreground">
                আপনার অ্যাকাউন্ট ডিলিট রিকোয়েস্ট পাঠানো হয়েছে। অ্যাডমিন শীঘ্রই ব্যবস্থা নেবেন।
              </p>
            </div>
          ) : (
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  অ্যাকাউন্ট ডিলিট করুন
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>অ্যাকাউন্ট ডিলিট রিকোয়েস্ট</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  আপনার অ্যাকাউন্ট ডিলিট করার রিকোয়েস্ট অ্যাডমিনের কাছে পাঠানো হবে।
                </p>
                <div className="space-y-2">
                  <Label>কারণ (ঐচ্ছিক)</Label>
                  <Textarea value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} placeholder="কেন ডিলিট করতে চান..." rows={3} maxLength={500} />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>বাতিল</Button>
                  <Button variant="destructive" onClick={handleDeleteRequest} disabled={requesting}>
                    {requesting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    রিকোয়েস্ট পাঠান
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Profile;