import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Check, X } from 'lucide-react';

interface DeletionRequest {
  id: string;
  user_id: string;
  reason: string | null;
  status: string;
  created_at: string;
  profile?: { full_name: string | null; phone: string | null } | null;
}

const AdminDeletionRequests = () => {
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('account_deletion_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      // Fetch profile info for each request
      const enriched = await Promise.all(
        data.map(async (req) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, phone')
            .eq('user_id', req.user_id)
            .maybeSingle();
          return { ...req, profile };
        })
      );
      setRequests(enriched);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('account_deletion_requests')
      .update({ status })
      .eq('id', id);
    if (error) {
      toast.error('আপডেট করতে সমস্যা হয়েছে');
    } else {
      toast.success(status === 'approved' ? 'রিকোয়েস্ট অনুমোদিত' : 'রিকোয়েস্ট প্রত্যাখ্যাত');
      fetchRequests();
    }
  };

  const statusLabels: Record<string, string> = {
    pending: 'পেন্ডিং',
    approved: 'অনুমোদিত',
    rejected: 'প্রত্যাখ্যাত',
  };

  const statusVariant = (status: string) => {
    if (status === 'pending') return 'default' as const;
    if (status === 'approved') return 'destructive' as const;
    return 'secondary' as const;
  };

  if (loading) {
    return (
      <div className="py-10 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">অ্যাকাউন্ট ডিলিট রিকোয়েস্ট</h1>

      {requests.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">কোনো ডিলিট রিকোয়েস্ট নেই</p>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="rounded-xl border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-bold">{req.profile?.full_name || 'নাম নেই'}</p>
                  <p className="text-sm text-muted-foreground">{req.profile?.phone || ''}</p>
                  {req.reason && (
                    <p className="text-sm text-muted-foreground mt-1">কারণ: {req.reason}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(req.created_at).toLocaleDateString('bn-BD')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant(req.status)}>
                    {statusLabels[req.status] || req.status}
                  </Badge>
                  {req.status === 'pending' && (
                    <>
                      <Button size="sm" variant="destructive" onClick={() => updateStatus(req.id, 'approved')}>
                        <Check className="h-4 w-4 mr-1" /> অনুমোদন
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => updateStatus(req.id, 'rejected')}>
                        <X className="h-4 w-4 mr-1" /> প্রত্যাখ্যান
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDeletionRequests;
