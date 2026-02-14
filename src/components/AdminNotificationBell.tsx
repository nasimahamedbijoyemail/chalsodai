import { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface AdminAlert {
  id: string;
  type: 'order' | 'message' | 'customer' | 'deletion';
  title: string;
  message: string;
  created_at: string;
}

const AdminNotificationBell = () => {
  const { user, isAdmin } = useAuth();
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [deletionRequests, setDeletionRequests] = useState(0);
  const [passwordResets, setPasswordResets] = useState(0);

  const fetchAlerts = async () => {
    if (!user || !isAdmin) return;

    const [msgRes, orderRes, delRes, pwRes] = await Promise.all([
      supabase.from('chat_messages').select('id', { count: 'exact', head: true }).eq('is_admin', false).eq('is_read', false),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('account_deletion_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('password_reset_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

    setUnreadMessages(msgRes.count || 0);
    setPendingOrders(orderRes.count || 0);
    setDeletionRequests(delRes.count || 0);
    setPasswordResets(pwRes.count || 0);
  };

  useEffect(() => {
    fetchAlerts();

    if (!user || !isAdmin) return;
    const channel = supabase
      .channel('admin-alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => fetchAlerts())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, () => fetchAlerts())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'account_deletion_requests' }, () => fetchAlerts())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, () => fetchAlerts())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, isAdmin]);

  if (!isAdmin) return null;

  const totalAlerts = unreadMessages + pendingOrders + deletionRequests + passwordResets;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {totalAlerts > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
              {totalAlerts > 99 ? '99+' : totalAlerts}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="end">
        <div className="border-b p-3">
          <h3 className="font-semibold">অ্যাডমিন আপডেট</h3>
        </div>
        <div className="p-2 space-y-1">
          {pendingOrders > 0 && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-orange-500/10">
              <span className="text-lg">📦</span>
              <p className="text-sm font-medium">{pendingOrders}টি পেন্ডিং অর্ডার</p>
            </div>
          )}
          {unreadMessages > 0 && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/10">
              <span className="text-lg">💬</span>
              <p className="text-sm font-medium">{unreadMessages}টি নতুন মেসেজ</p>
            </div>
          )}
          {deletionRequests > 0 && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-destructive/10">
              <span className="text-lg">🗑️</span>
              <p className="text-sm font-medium">{deletionRequests}টি ডিলিট রিকোয়েস্ট</p>
            </div>
          )}
          {passwordResets > 0 && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-yellow-500/10">
              <span className="text-lg">🔑</span>
              <p className="text-sm font-medium">{passwordResets}টি পাসওয়ার্ড রিসেট রিকোয়েস্ট</p>
            </div>
          )}
          {totalAlerts === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">কোনো নতুন আপডেট নেই</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AdminNotificationBell;
