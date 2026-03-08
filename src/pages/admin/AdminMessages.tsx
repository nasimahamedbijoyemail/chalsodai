import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Send, ArrowLeft, MessageCircle, Search } from 'lucide-react';

interface Conversation {
  id: string;
  user_id: string;
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

const AdminMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!selectedConv) return;
    const channel = supabase
      .channel(`admin-chat-${selectedConv.id}`)
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
        .eq('is_admin', false)
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

    // Mark customer messages as read
    await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('conversation_id', conv.id)
      .eq('is_admin', false)
      .eq('is_read', false);
    setUnreadCounts((prev) => {
      const updated = { ...prev };
      delete updated[conv.id];
      return updated;
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConv || !user) return;
    setSending(true);
    const { error } = await supabase.from('chat_messages').insert({
      conversation_id: selectedConv.id,
      sender_id: user.id,
      is_admin: true,
      message: newMessage.trim(),
    });
    if (error) {
      toast.error('মেসেজ পাঠাতে সমস্যা হয়েছে');
    } else {
      setNewMessage('');
    }
    setSending(false);
  };

  const toggleClose = async () => {
    if (!selectedConv) return;
    const { error } = await supabase
      .from('chat_conversations')
      .update({ is_closed: !selectedConv.is_closed })
      .eq('id', selectedConv.id);
    if (!error) {
      setSelectedConv({ ...selectedConv, is_closed: !selectedConv.is_closed });
      fetchConversations();
      toast.success(selectedConv.is_closed ? 'কথোপকথন পুনরায় খোলা হয়েছে' : 'কথোপকথন বন্ধ করা হয়েছে');
    }
  };

  const typeLabels: Record<string, string> = {
    general: 'সাধারণ',
    order: 'অর্ডার',
    product: 'পণ্য',
  };

  const filteredConvs = conversations.filter((c) =>
    c.subject.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="py-10 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" /></div>;
  }

  if (selectedConv) {
    return (
      <div className="flex flex-col" style={{ height: 'calc(100vh - 10rem)' }}>
        <Button variant="ghost" onClick={() => setSelectedConv(null)} className="mb-2 self-start">
          <ArrowLeft className="h-4 w-4 mr-2" /> ফিরে যান
        </Button>
        <div className="rounded-xl border bg-card overflow-hidden flex flex-col flex-1 min-h-0">
          <div className="border-b p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold">{selectedConv.subject}</h3>
              <Badge variant="secondary" className="text-xs">{typeLabels[selectedConv.subject_type] || 'সাধারণ'}</Badge>
            </div>
            <Button variant="outline" size="sm" onClick={toggleClose}>
              {selectedConv.is_closed ? 'পুনরায় খুলুন' : 'বন্ধ করুন'}
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && <p className="text-center text-muted-foreground text-sm py-10">কোনো মেসেজ নেই</p>}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-xl px-4 py-2 text-sm ${msg.is_admin ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {!msg.is_admin && <p className="text-xs font-semibold mb-1 text-secondary">কাস্টমার</p>}
                  <p>{msg.message}</p>
                  <p className={`text-xs mt-1 ${msg.is_admin ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t p-3 flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="উত্তর লিখুন..."
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            />
            <Button onClick={sendMessage} disabled={sending || !newMessage.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">কাস্টমার মেসেজ</h1>
      <div className="mb-6 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="বিষয় দিয়ে খুঁজুন..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>
      {filteredConvs.length === 0 ? (
        <div className="text-center py-16">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">কোনো কথোপকথন নেই</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredConvs.map((conv) => (
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
                  {conv.is_closed ? <Badge variant="secondary">বন্ধ</Badge> : <Badge variant="default">সক্রিয়</Badge>}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">{typeLabels[conv.subject_type] || 'সাধারণ'}</Badge>
                <span className="text-xs text-muted-foreground">{new Date(conv.updated_at).toLocaleDateString('bn-BD')}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
