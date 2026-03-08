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
import { Loader2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHead from '@/components/PageHead';

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
    } catch (error) {
      toast.error('আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRequest = async () => {
    if (!user) return;
    setRequesting(true);
    try {
      // Create deletion request
      const { error: reqError } = await supabase.from('account_deletion_requests').insert({
        user_id: user.id,
        reason: deleteReason || null,
      });
      if (reqError) throw reqError;

      // Notify admin via broadcast
      await supabase.from('notifications').insert({
        title: 'অ্যাকাউন্ট ডিলিট রিকোয়েস্ট',
        message: `${fullName || 'একজন কাস্টমার'} তাদের অ্যাকাউন্ট ডিলিট করতে চান। কারণ: ${deleteReason || 'উল্লেখ করা হয়নি'}`,
        is_broadcast: true,
        user_id: null,
      });

      toast.success('অ্যাকাউন্ট ডিলিট রিকোয়েস্ট পাঠানো হয়েছে। অ্যাডমিন শীঘ্রই ব্যবস্থা নেবেন।');
      setDeletionRequested(true);
      setDeleteDialogOpen(false);
      setDeleteReason('');
    } catch (error) {
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
    <div className="container py-10 max-w-lg">
      <h1 className="text-3xl font-bold mb-8">আমার প্রোফাইল</h1>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">ইমেইল</Label>
          <Input id="email" value={user?.email || ''} disabled className="bg-muted" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fullName">নাম</Label>
          <Input id="fullName" placeholder="আপনার পুরো নাম" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">ফোন নম্বর</Label>
          <Input id="phone" placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={15} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">ঠিকানা</Label>
          <Textarea id="address" placeholder="আপনার সম্পূর্ণ ঠিকানা" value={address} onChange={(e) => setAddress(e.target.value)} rows={3} maxLength={500} />
        </div>
        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />সেভ হচ্ছে...</>) : 'সেভ করুন'}
        </Button>
      </form>

      {/* Account Deletion Section */}
      <div className="mt-10 pt-8 border-t">
        <h2 className="text-lg font-bold text-destructive mb-2">সেটিংস</h2>
        {deletionRequested ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm text-muted-foreground">
              আপনার অ্যাকাউন্ট ডিলিট রিকোয়েস্ট পাঠানো হয়েছে। অ্যাডমিন শীঘ্রই ব্যবস্থা নেবেন।
            </p>
          </div>
        ) : (
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                অ্যাকাউন্ট ডিলিট করুন
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>অ্যাকাউন্ট ডিলিট রিকোয়েস্ট</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                আপনার অ্যাকাউন্ট ডিলিট করার রিকোয়েস্ট অ্যাডমিনের কাছে পাঠানো হবে। অ্যাডমিন রিভিউ করে ব্যবস্থা নেবেন।
              </p>
              <div className="space-y-2">
                <Label>কারণ (ঐচ্ছিক)</Label>
                <Textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="কেন আপনি অ্যাকাউন্ট ডিলিট করতে চান..."
                  rows={3}
                  maxLength={500}
                />
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
  );
};

export default Profile;
