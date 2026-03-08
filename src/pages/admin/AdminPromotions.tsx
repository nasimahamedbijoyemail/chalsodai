import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Image, ArrowUpDown } from 'lucide-react';

interface Promotion {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

const AdminPromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('/');
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    const { data } = await supabase
      .from('promotions')
      .select('*')
      .order('sort_order', { ascending: true });
    setPromotions(data || []);
    setLoading(false);
  };

  const openDialog = (promo?: Promotion) => {
    if (promo) {
      setEditing(promo);
      setTitle(promo.title);
      setImageUrl(promo.image_url);
      setLinkUrl(promo.link_url);
      setIsActive(promo.is_active);
      setSortOrder(promo.sort_order);
    } else {
      setEditing(null);
      setTitle('');
      setImageUrl('');
      setLinkUrl('/');
      setIsActive(true);
      setSortOrder(0);
    }
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `promotions/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (uploadError) {
      toast.error('ছবি আপলোড করতে সমস্যা হয়েছে');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    setImageUrl(urlData.publicUrl);
    setUploading(false);
    toast.success('ছবি আপলোড হয়েছে');
  };

  const handleSave = async () => {
    if (!imageUrl.trim()) {
      toast.error('ছবি আপলোড করুন');
      return;
    }

    setSaving(true);
    const payload = {
      title: title.trim(),
      image_url: imageUrl,
      link_url: linkUrl.trim() || '/',
      is_active: isActive,
      sort_order: sortOrder,
    };

    if (editing) {
      const { error } = await supabase
        .from('promotions')
        .update(payload)
        .eq('id', editing.id);
      if (error) {
        toast.error('আপডেট করতে সমস্যা হয়েছে');
      } else {
        toast.success('প্রমোশন আপডেট হয়েছে');
      }
    } else {
      const { error } = await supabase
        .from('promotions')
        .insert(payload);
      if (error) {
        toast.error('প্রমোশন যোগ করতে সমস্যা হয়েছে');
      } else {
        toast.success('প্রমোশন যোগ হয়েছে');
      }
    }

    setSaving(false);
    setDialogOpen(false);
    fetchPromotions();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('এই প্রমোশন ডিলিট করতে চান?')) return;
    const { error } = await supabase.from('promotions').delete().eq('id', id);
    if (error) {
      toast.error('ডিলিট করতে সমস্যা হয়েছে');
    } else {
      toast.success('প্রমোশন ডিলিট হয়েছে');
      fetchPromotions();
    }
  };

  const toggleActive = async (promo: Promotion) => {
    await supabase
      .from('promotions')
      .update({ is_active: !promo.is_active })
      .eq('id', promo.id);
    fetchPromotions();
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
        <div>
          <h1 className="text-2xl font-bold">প্রমোশন ব্যানার</h1>
          <p className="text-sm text-muted-foreground">হোমপেজের হিরো সেকশনে প্রমোশন ছবি ম্যানেজ করুন</p>
        </div>
        <Button onClick={() => openDialog()} size="sm">
          <Plus className="h-4 w-4 mr-2" /> নতুন প্রমোশন
        </Button>
      </div>

      {promotions.length === 0 ? (
        <div className="text-center py-16 rounded-xl border bg-card">
          <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">কোনো প্রমোশন যোগ করা হয়নি</p>
          <p className="text-sm text-muted-foreground mb-4">প্রমোশন যোগ করলে হোমপেজে হিরো ইমেজ হিসেবে দেখাবে</p>
          <Button onClick={() => openDialog()} size="sm">
            <Plus className="h-4 w-4 mr-2" /> প্রথম প্রমোশন যোগ করুন
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {promotions.map((promo) => (
            <div key={promo.id} className="rounded-xl border bg-card p-4 flex gap-4 items-center">
              <div className="h-20 w-32 shrink-0 rounded-lg overflow-hidden bg-muted">
                <img src={promo.image_url} alt={promo.title} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{promo.title || 'শিরোনাম নেই'}</h3>
                <p className="text-sm text-muted-foreground truncate">লিংক: {promo.link_url}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${promo.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {promo.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </span>
                  <span className="text-xs text-muted-foreground">ক্রম: {promo.sort_order}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch checked={promo.is_active} onCheckedChange={() => toggleActive(promo)} />
                <Button variant="ghost" size="icon" onClick={() => openDialog(promo)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(promo.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'প্রমোশন এডিট করুন' : 'নতুন প্রমোশন যোগ করুন'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>শিরোনাম (ঐচ্ছিক)</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="প্রমোশনের শিরোনাম" maxLength={200} />
            </div>

            <div className="space-y-2">
              <Label>ছবি *</Label>
              {imageUrl && (
                <div className="rounded-lg overflow-hidden bg-muted max-h-48">
                  <img src={imageUrl} alt="Preview" className="w-full object-cover" />
                </div>
              )}
              <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              {uploading && <p className="text-sm text-muted-foreground">আপলোড হচ্ছে...</p>}
            </div>

            <div className="space-y-2">
              <Label>লিংক URL</Label>
              <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="/categories বা /product/id" />
              <p className="text-xs text-muted-foreground">
                ক্লিক করলে কোন পেজে যাবে। যেমন: /categories, /product/abc123, /contact
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ক্রম নম্বর</Label>
                <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <Label>সক্রিয়</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>বাতিল</Button>
            <Button onClick={handleSave} disabled={saving || !imageUrl}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editing ? 'আপডেট করুন' : 'যোগ করুন'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPromotions;
