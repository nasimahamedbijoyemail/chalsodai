import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  sort_order: number | null;
  is_active: boolean | null;
}

const AdminFAQs = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [saving, setSaving] = useState(false);

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);

  const fetchFaqs = async () => {
    const { data } = await supabase
      .from('faqs')
      .select('*')
      .order('sort_order', { ascending: true });
    setFaqs(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const resetForm = () => {
    setQuestion('');
    setAnswer('');
    setSortOrder('0');
    setIsActive(true);
    setEditingFaq(null);
  };

  const openEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setSortOrder(faq.sort_order?.toString() || '0');
    setIsActive(faq.is_active ?? true);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) {
      toast.error('প্রশ্ন ও উত্তর দিন');
      return;
    }

    setSaving(true);
    try {
      const data = {
        question,
        answer,
        sort_order: parseInt(sortOrder) || 0,
        is_active: isActive,
      };

      if (editingFaq) {
        const { error } = await supabase.from('faqs').update(data).eq('id', editingFaq.id);
        if (error) throw error;
        toast.success('FAQ আপডেট হয়েছে');
      } else {
        const { error } = await supabase.from('faqs').insert(data);
        if (error) throw error;
        toast.success('FAQ যোগ হয়েছে');
      }

      setDialogOpen(false);
      resetForm();
      fetchFaqs();
    } catch (error) {
      toast.error('সেভ করতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('এই FAQ ডিলিট করতে চান?')) return;

    const { error } = await supabase.from('faqs').delete().eq('id', id);
    if (error) {
      toast.error('ডিলিট করতে সমস্যা হয়েছে');
    } else {
      toast.success('FAQ ডিলিট হয়েছে');
      fetchFaqs();
    }
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">FAQ ম্যানেজমেন্ট</h1>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              FAQ যোগ করুন
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingFaq ? 'FAQ এডিট' : 'নতুন FAQ'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>প্রশ্ন *</Label>
                <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="প্রশ্ন লিখুন" />
              </div>
              <div className="space-y-2">
                <Label>উত্তর *</Label>
                <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="উত্তর লিখুন" rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ক্রম নম্বর</Label>
                  <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
                </div>
                <div className="flex items-center gap-2 pt-7">
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                  <Label>Active</Label>
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingFaq ? 'আপডেট' : 'সেভ'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {faqs.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">কোনো FAQ যোগ করা হয়নি</p>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className={`rounded-xl border bg-card p-4 ${!faq.is_active ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-bold">{faq.question}</p>
                  <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(faq)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(faq.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFAQs;
