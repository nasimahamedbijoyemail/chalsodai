import { useEffect, useState, useRef, useCallback } from 'react';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [open, setOpen] = useState(false);
  const fetchedRef = useRef(false);
  const userIdRef = useRef<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${user.id},is_broadcast.eq.true`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    }

    const { data: convData } = await supabase
      .from('chat_conversations')
      .select('id')
      .eq('user_id', user.id);

    if (convData && convData.length > 0) {
      const convIds = convData.map((c) => c.id);
      const { count } = await supabase
        .from('chat_messages')
        .select('id', { count: 'exact', head: true })
        .in('conversation_id', convIds)
        .eq('is_admin', true)
        .eq('is_read', false);
      setUnreadMessages(count || 0);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      fetchedRef.current = false;
      userIdRef.current = null;
      return;
    }

    // Only fetch once per user session
    if (userIdRef.current === user.id && fetchedRef.current) return;
    userIdRef.current = user.id;
    fetchedRef.current = true;

    fetchNotifications();

    const channel = supabase
      .channel('user-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
      }, () => fetchNotifications())
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
      }, () => fetchNotifications())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchNotifications]);

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  if (!user) return null;

  const totalUnread = unreadCount + unreadMessages;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="নোটিফিকেশন"
        >
          <Bell className="h-5 w-5" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground animate-pulse">
              {totalUnread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b p-3">
          <h3 className="font-semibold">নোটিফিকেশন</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>সব পড়া হয়েছে</Button>
          )}
        </div>
        {unreadMessages > 0 && (
          <div className="border-b p-3 bg-primary/5">
            <p className="text-sm font-medium text-primary">
              📩 {unreadMessages}টি নতুন মেসেজ আছে
            </p>
          </div>
        )}
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">কোনো নোটিফিকেশন নেই</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className={`border-b p-3 transition-colors ${!n.is_read ? 'bg-muted/50' : ''}`}>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(n.created_at).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                  {!n.is_read && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => markAsRead(n.id)}>
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
