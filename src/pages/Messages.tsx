import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Send, Plus, ArrowLeft, MessageCircle } from 'lucide-react';
import PageHead from '@/components/PageHead';

interface Conversation {
  id: string;
  subject: string;
  subject_type: string;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
  is_read: boolean;
}

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newType, setNewType] = useState('general');
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchConversations();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!selectedConv) return;
    const channel = supabase
      .channel(`chat-${selectedConv.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${selectedConv.id}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedConv]);

  const fetchConversations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('chat_conversations')
      .select('*')
      .order('updated_at', { ascending: false });
    setConversations(data || []);

    // Get unread counts in a single query
    if (data && data.length > 0) {
      const convIds = data.map(c => c.id);
      const { data: unreadMessages } = await supabase
        .from('chat_messages')
        .select('conversation_id')
        .in('conversation_id', convIds)
        .eq('is_admin', true)
        .eq('is_read', false);
      
      const counts: Record<string, number> = {};
      unreadMessages?.forEach(msg => {
        counts[msg.conversation_id] = (counts[msg.conversation_id] || 0) + 1;
      });
      setUnreadCounts(counts);
    }
    setLoading(false);
  };

  const openConversation = async (conv: Conversation) => {
    setSelectedConv(conv);
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conv.id)
      .order('created_at');
    setMessages(data || []);

    // Mark admin messages as read
    if (user) {
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', conv.id)
        .eq('is_admin', true)
        .eq('is_read', false);
      setUnreadCounts((prev) => {
        const updated = { ...prev };
        delete updated[conv.id];
        return updated;
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConv || !user) return;
    setSending(true);
    const { error } = await supabase.from('chat_messages').insert({
      conversation_id: selectedConv.id,
      sender_id: user.id,
      is_admin: false,
      message: newMessage.trim(),
    });
    if (error) {
      toast.error('মেসেজ পাঠাতে সমস্যা হয়েছে');
    } else {
      setNewMessage('');
    }
    setSending(false);
  };

  const createConversation = async () => {
    if (!newSubject.trim() || !user) return;
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({ user_id: user.id, subject: newSubject.trim(), subject_type: newType })
      .select()
      .single();
    if (error) {
      toast.error('কথোপকথন তৈরি করতে সমস্যা হয়েছে');
    } else {
      setShowNew(false);
      setNewSubject('');
      fetchConversations();
      openConversation(data);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    general: 'সাধারণ',
    order: 'অর্ডার সংক্রান্ত',
    product: 'পণ্য সংক্রান্ত',
  };

  if (selectedConv) {
    return (
      <div className="container py-6 max-w-2xl flex flex-col" style={{ height: 'calc(100vh - 5rem)' }}>
        <Button variant="ghost" onClick={() => setSelectedConv(null)} className="mb-2 self-start">
          <ArrowLeft className="h-4 w-4 mr-2" /> কথোপকথন তালিকা
        </Button>
        <div className="rounded-xl border bg-card overflow-hidden flex flex-col flex-1 min-h-0">
          <div className="border-b p-4">
            <h3 className="font-bold">{selectedConv.subject}</h3>
            <Badge variant="secondary" className="text-xs">{typeLabels[selectedConv.subject_type] || 'সাধারণ'}</Badge>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-10">কোনো মেসেজ নেই। প্রথম মেসেজ পাঠান!</p>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[75%] rounded-xl px-4 py-2 text-sm ${msg.is_admin ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                  {msg.is_admin && <p className="text-xs font-semibold mb-1 text-primary">কাস্টমার কেয়ার</p>}
                  <p>{msg.message}</p>
                  <p className={`text-xs mt-1 ${msg.is_admin ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          {!selectedConv.is_closed ? (
            <div className="border-t p-3 flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="মেসেজ লিখুন..."
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              />
              <Button onClick={sendMessage} disabled={sending || !newMessage.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-t p-3 text-center text-sm text-muted-foreground">এই কথোপকথন বন্ধ করা হয়েছে</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 pb-24 md:pb-10 max-w-2xl">
      <PageHead title="মেসেজ" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">মেসেজ</h1>
        <Button onClick={() => setShowNew(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" /> নতুন কথোপকথন
        </Button>
      </div>

      {showNew && (
        <div className="rounded-xl border bg-card p-5 mb-6 space-y-4">
          <h3 className="font-bold">নতুন কথোপকথন শুরু করুন</h3>
          <div className="space-y-2">
            <Label>বিষয়ের ধরণ</Label>
            <Select value={newType} onValueChange={setNewType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="general">সাধারণ জিজ্ঞাসা</SelectItem>
                <SelectItem value="order">অর্ডার সংক্রান্ত</SelectItem>
                <SelectItem value="product">পণ্য সংক্রান্ত</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>বিষয়</Label>
            <Input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="আপনার প্রশ্ন বা সমস্যার বিষয়" />
          </div>
          <div className="flex gap-2">
            <Button onClick={createConversation} disabled={!newSubject.trim()}>শুরু করুন</Button>
            <Button variant="outline" onClick={() => setShowNew(false)}>বাতিল</Button>
          </div>
        </div>
      )}

      {conversations.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">কোনো কথোপকথন নেই</p>
          <p className="text-sm text-muted-foreground">কাস্টমার কেয়ারে মেসেজ পাঠাতে "নতুন কথোপকথন" বাটনে ক্লিক করুন</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => openConversation(conv)}
              className="w-full text-left rounded-xl border bg-card p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{conv.subject}</h3>
                <div className="flex items-center gap-2">
                  {unreadCounts[conv.id] && (
                    <Badge variant="destructive" className="text-xs">
                      {unreadCounts[conv.id]} নতুন
                    </Badge>
                  )}
                  {conv.is_closed && <Badge variant="secondary">বন্ধ</Badge>}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">{typeLabels[conv.subject_type] || 'সাধারণ'}</Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(conv.updated_at).toLocaleDateString('bn-BD')}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Messages;
