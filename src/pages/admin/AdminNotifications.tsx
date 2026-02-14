import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, Send } from 'lucide-react';

const AdminNotifications = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isBroadcast, setIsBroadcast] = useState(true);
  const [specificUserId, setSpecificUserId] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('টাইটেল ও মেসেজ দিন');
      return;
    }

    if (!isBroadcast && !specificUserId.trim()) {
      toast.error('ইউজার আইডি দিন অথবা ব্রডকাস্ট করুন');
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from('notifications').insert({
        title,
        message,
        is_broadcast: isBroadcast,
        user_id: isBroadcast ? null : specificUserId,
      });

      if (error) throw error;

      toast.success('নোটিফিকেশন পাঠানো হয়েছে!');
      setTitle('');
      setMessage('');
      setSpecificUserId('');
    } catch (error) {
      toast.error('নোটিফিকেশন পাঠাতে সমস্যা হয়েছে');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">নোটিফিকেশন পাঠান</h1>

      <div className="max-w-lg space-y-5">
        <div className="space-y-2">
          <Label>টাইটেল *</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="নোটিফিকেশনের টাইটেল"
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <Label>মেসেজ *</Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="নোটিফিকেশনের বিস্তারিত মেসেজ..."
            rows={4}
            maxLength={500}
          />
        </div>

        <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/50">
          <Switch checked={isBroadcast} onCheckedChange={setIsBroadcast} />
          <div>
            <Label>সবাইকে পাঠান (Broadcast)</Label>
            <p className="text-xs text-muted-foreground">
              এটি চালু থাকলে সব কাস্টমার এই নোটিফিকেশন দেখতে পাবে
            </p>
          </div>
        </div>

        {!isBroadcast && (
          <div className="space-y-2">
            <Label>ইউজার আইডি</Label>
            <Input
              value={specificUserId}
              onChange={(e) => setSpecificUserId(e.target.value)}
              placeholder="নির্দিষ্ট ইউজারের আইডি"
            />
            <p className="text-xs text-muted-foreground">
              কাস্টমার পেজ থেকে ইউজার আইডি কপি করুন
            </p>
          </div>
        )}

        <Button onClick={handleSend} disabled={sending} className="w-full">
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          নোটিফিকেশন পাঠান
        </Button>
      </div>
    </div>
  );
};

export default AdminNotifications;
