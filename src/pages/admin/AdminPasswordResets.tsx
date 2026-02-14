import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Key, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface ResetRequest {
  id: string;
  phone_or_email: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const AdminPasswordResets = () => {
  const [requests, setRequests] = useState<ResetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ResetRequest | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('password_reset_requests')
      .select('*')
      .order('created_at', { ascending: false });
    setRequests((data as ResetRequest[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleResetPassword = async () => {
    if (!selectedRequest || !newPassword.trim() || newPassword.length < 6) {
      toast.error('কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন');
      return;
    }

    setResetting(true);
    try {
      // Determine the auth email
      const phoneOrEmail = selectedRequest.phone_or_email.trim();
      const isEmail = phoneOrEmail.includes('@');
      const authEmail = isEmail ? phoneOrEmail : `${phoneOrEmail}@phone.local`;

      const { data, error } = await supabase.functions.invoke('admin-reset-password', {
        body: { user_email: authEmail, new_password: newPassword },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Mark request as resolved
      await supabase
        .from('password_reset_requests')
        .update({ status: 'resolved', admin_notes: `পাসওয়ার্ড রিসেট করা হয়েছে` })
        .eq('id', selectedRequest.id);

      toast.success('পাসওয়ার্ড রিসেট সফল!');
      setSelectedRequest(null);
      setNewPassword('');
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message || 'রিসেট করতে সমস্যা হয়েছে');
    } finally {
      setResetting(false);
    }
  };

  const handleDismiss = async (id: string) => {
    await supabase.from('password_reset_requests').update({ status: 'dismissed' }).eq('id', id);
    toast.success('রিকোয়েস্ট বাতিল করা হয়েছে');
    fetchRequests();
  };

  if (loading) {
    return <div className="py-10 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" /></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">পাসওয়ার্ড রিসেট রিকোয়েস্ট</h1>

      {requests.length === 0 ? (
        <p className="text-muted-foreground text-center py-10">কোনো রিকোয়েস্ট নেই</p>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="rounded-lg border bg-card p-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium">{req.phone_or_email}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(req.created_at).toLocaleString('bn-BD')}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={req.status === 'pending' ? 'destructive' : 'secondary'}>
                  {req.status === 'pending' ? 'পেন্ডিং' : req.status === 'resolved' ? 'সমাধান' : 'বাতিল'}
                </Badge>
                {req.status === 'pending' && (
                  <>
                    <Button size="sm" onClick={() => { setSelectedRequest(req); setNewPassword(''); }}>
                      <Key className="h-4 w-4 mr-1" /> রিসেট
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDismiss(req.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>পাসওয়ার্ড রিসেট করুন</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>ফোন/ইমেইল</Label>
              <p className="font-medium">{selectedRequest?.phone_or_email}</p>
            </div>
            <div className="space-y-2">
              <Label>নতুন পাসওয়ার্ড</Label>
              <Input
                type="text"
                placeholder="নতুন পাসওয়ার্ড লিখুন (কমপক্ষে ৬ অক্ষর)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>বাতিল</Button>
            <Button onClick={handleResetPassword} disabled={resetting}>
              {resetting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
              রিসেট করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPasswordResets;
