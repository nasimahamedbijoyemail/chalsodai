import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, Search, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: 'admin' | 'customer';
}

const AdminCustomers = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Map<string, 'admin' | 'customer'>>(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('user_id, role'),
    ]);

    setProfiles(profilesRes.data || []);
    
    const rolesMap = new Map<string, 'admin' | 'customer'>();
    (rolesRes.data || []).forEach((r: UserRole) => rolesMap.set(r.user_id, r.role));
    setRoles(rolesMap);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleAdmin = async (userId: string, isCurrentlyAdmin: boolean) => {
    try {
      if (isCurrentlyAdmin) {
        await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin');
        toast.success('অ্যাডমিন রোল সরানো হয়েছে');
      } else {
        await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
        toast.success('অ্যাডমিন রোল দেওয়া হয়েছে');
      }
      fetchData();
    } catch (error) {
      toast.error('আপডেট করতে সমস্যা হয়েছে');
    }
  };

  const deleteCustomer = async (userId: string) => {
    setDeletingId(userId);
    try {
      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: { target_user_id: userId },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success('কাস্টমারের অ্যাকাউন্ট সম্পূর্ণ মুছে ফেলা হয়েছে');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'ডিলিট করতে সমস্যা হয়েছে');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProfiles = profiles.filter(
    (p) =>
      (p.full_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (p.phone || '').includes(search)
  );

  if (loading) {
    return (
      <div className="py-10 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">কাস্টমার ম্যানেজমেন্ট</h1>

      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="নাম বা ফোন দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">মোট: {profiles.length} জন কাস্টমার</p>

      {filteredProfiles.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">কোনো কাস্টমার পাওয়া যায়নি</p>
      ) : (
        <div className="space-y-3">
          {filteredProfiles.map((profile) => {
            const isAdmin = roles.get(profile.user_id) === 'admin';
            const isDeleting = deletingId === profile.user_id;
            return (
              <div key={profile.id} className="rounded-xl border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{profile.full_name || 'নাম নেই'}</p>
                      {isAdmin && <Badge variant="default">অ্যাডমিন</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{profile.phone || 'ফোন নেই'}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      যোগদান: {new Date(profile.created_at).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span>অ্যাডমিন</span>
                      <Switch
                        checked={isAdmin}
                        onCheckedChange={() => toggleAdmin(profile.user_id, isAdmin)}
                      />
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={isDeleting || isAdmin}>
                          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>কাস্টমার ডিলিট করুন</AlertDialogTitle>
                          <AlertDialogDescription>
                            <strong>{profile.full_name || 'এই কাস্টমার'}</strong> এর সম্পূর্ণ অ্যাকাউন্ট ও ডাটা মুছে ফেলা হবে। এরপর তিনি নতুন পাসওয়ার্ড দিয়ে আবার সাইন আপ করতে পারবেন। এই কাজটি ফেরানো যাবে না।
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>বাতিল</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteCustomer(profile.user_id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            হ্যাঁ, ডিলিট করুন
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
