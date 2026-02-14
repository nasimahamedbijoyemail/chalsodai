import { useEffect, useState, useRef } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Trash2, X, Upload, Image } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  pack_size: string;
  image_url: string | null;
  additional_images: string[] | null;
  is_available: boolean | null;
  category_id: string | null;
  rice_categories: Category | null;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [packSize, setPackSize] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [additionalImages, setAdditionalImages] = useState<string[]>(['', '', '']);
  const [categoryId, setCategoryId] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  // File input refs
  const mainImageRef = useRef<HTMLInputElement>(null);
  const additionalImageRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  // Category form
  const [newCategoryName, setNewCategoryName] = useState('');

  const fetchData = async () => {
    const [prodRes, catRes] = await Promise.all([
      supabase.from('rice_products').select('*, rice_categories(id, name)').order('name'),
      supabase.from('rice_categories').select('id, name').order('name'),
    ]);
    setProducts(prodRes.data || []);
    setCategories(catRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setPackSize('');
    setImageUrl('');
    setAdditionalImages(['', '', '']);
    setCategoryId('');
    setIsAvailable(true);
    setEditingProduct(null);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description || '');
    setPrice(product.price.toString());
    setPackSize(product.pack_size);
    setImageUrl(product.image_url || '');
    const imgs = product.additional_images || [];
    setAdditionalImages([imgs[0] || '', imgs[1] || '', imgs[2] || '']);
    setCategoryId(product.category_id || '');
    setIsAvailable(product.is_available ?? true);
    setDialogOpen(true);
  };

  const uploadImage = async (file: File, target: 'main' | number) => {
    const uploadKey = target === 'main' ? 'main' : `additional-${target}`;
    setUploading(uploadKey);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      if (target === 'main') {
        setImageUrl(publicUrl);
      } else {
        setAdditionalImages((prev) => {
          const updated = [...prev];
          updated[target] = publicUrl;
          return updated;
        });
      }
      toast.success('ছবি আপলোড হয়েছে');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('ছবি আপলোড করতে সমস্যা হয়েছে');
    } finally {
      setUploading(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'main' | number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('শুধুমাত্র ছবি আপলোড করুন');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('ছবির সাইজ ৫ MB এর কম হতে হবে');
      return;
    }
    uploadImage(file, target);
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!name.trim() || !price || !packSize.trim()) {
      toast.error('নাম, দাম ও প্যাক সাইজ দিন');
      return;
    }

    setSaving(true);
    try {
      const filteredImages = additionalImages.filter((url) => url.trim());
      const data = {
        name,
        description: description || null,
        price: parseFloat(price),
        pack_size: packSize,
        image_url: imageUrl || null,
        additional_images: filteredImages,
        category_id: categoryId || null,
        is_available: isAvailable,
      };

      if (editingProduct) {
        const { error } = await supabase.from('rice_products').update(data).eq('id', editingProduct.id);
        if (error) throw error;
        toast.success('চাল আপডেট হয়েছে');
      } else {
        const { error } = await supabase.from('rice_products').insert(data);
        if (error) throw error;
        toast.success('চাল যোগ হয়েছে');
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error('সেভ করতে সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('এই চাল ডিলিট করতে চান?')) return;

    const { error } = await supabase.from('rice_products').delete().eq('id', id);
    if (error) {
      toast.error('ডিলিট করতে সমস্যা হয়েছে');
    } else {
      toast.success('চাল ডিলিট হয়েছে');
      fetchData();
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('ক্যাটাগরির নাম দিন');
      return;
    }

    const { error } = await supabase.from('rice_categories').insert({ name: newCategoryName });
    if (error) {
      toast.error('ক্যাটাগরি যোগ করতে সমস্যা হয়েছে');
    } else {
      toast.success('ক্যাটাগরি যোগ হয়েছে');
      setNewCategoryName('');
      setCategoryDialogOpen(false);
      fetchData();
    }
  };

  const updateAdditionalImage = (index: number, value: string) => {
    setAdditionalImages((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
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
        <h1 className="text-2xl font-bold">চাল ম্যানেজমেন্ট</h1>
        <div className="flex gap-2">
          <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                ক্যাটাগরি
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>নতুন ক্যাটাগরি</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>ক্যাটাগরির নাম</Label>
                  <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="যেমন: মিনিকেট" />
                </div>
                <Button onClick={handleAddCategory} className="w-full">যোগ করুন</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                চাল যোগ করুন
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'চাল এডিট' : 'নতুন চাল'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>নাম *</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="চালের নাম" />
                </div>
                <div className="space-y-2">
                  <Label>ক্যাটাগরি</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="ক্যাটাগরি সিলেক্ট করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>দাম (টাকা) *</Label>
                    <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="৭৫" />
                  </div>
                  <div className="space-y-2">
                    <Label>প্যাক সাইজ *</Label>
                    <Input value={packSize} onChange={(e) => setPackSize(e.target.value)} placeholder="১ কেজি" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>বিবরণ</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="চালের বিবরণ..." rows={3} />
                </div>

                {/* Main Image Upload */}
                <div className="space-y-2">
                  <Label>প্রধান ছবি</Label>
                  <input type="file" ref={mainImageRef} accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'main')} />
                  {imageUrl ? (
                    <div className="relative rounded-lg border overflow-hidden">
                      <img src={imageUrl} alt="প্রধান ছবি" className="w-full h-40 object-cover" />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => mainImageRef.current?.click()} disabled={uploading === 'main'}>
                          {uploading === 'main' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Pencil className="h-3 w-3" />}
                        </Button>
                        <Button size="icon" variant="secondary" className="h-7 w-7" onClick={() => setImageUrl('')}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full h-32 border-dashed flex flex-col gap-2"
                      onClick={() => mainImageRef.current?.click()}
                      disabled={uploading === 'main'}
                    >
                      {uploading === 'main' ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <>
                          <Upload className="h-6 w-6" />
                          <span className="text-sm">ছবি আপলোড করুন</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Additional Images Upload */}
                <div className="space-y-2">
                  <Label>অতিরিক্ত ছবি (সর্বোচ্চ ৩টি)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {additionalImages.map((url, index) => {
                      const uploadKey = `additional-${index}`;
                      return (
                        <div key={index}>
                          <input
                            type="file"
                            ref={additionalImageRefs[index]}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, index)}
                          />
                          {url ? (
                            <div className="relative rounded-lg border overflow-hidden">
                              <img src={url} alt={`ছবি ${index + 1}`} className="w-full h-24 object-cover" />
                              <div className="absolute top-1 right-1 flex gap-0.5">
                                <Button size="icon" variant="secondary" className="h-6 w-6" onClick={() => additionalImageRefs[index].current?.click()} disabled={uploading === uploadKey}>
                                  {uploading === uploadKey ? <Loader2 className="h-3 w-3 animate-spin" /> : <Pencil className="h-3 w-3" />}
                                </Button>
                                <Button size="icon" variant="secondary" className="h-6 w-6" onClick={() => updateAdditionalImage(index, '')}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              className="w-full h-24 border-dashed flex flex-col gap-1 text-xs"
                              onClick={() => additionalImageRefs[index].current?.click()}
                              disabled={uploading === uploadKey}
                            >
                              {uploading === uploadKey ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Image className="h-4 w-4" />
                                  <span>ছবি {index + 1}</span>
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
                  <Label>Available</Label>
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingProduct ? 'আপডেট' : 'সেভ'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">কোনো চাল যোগ করা হয়নি</p>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="rounded-xl border bg-card p-4 flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 rounded-lg bg-muted overflow-hidden">
                <img src={product.image_url || '/placeholder.svg'} alt={product.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  {product.rice_categories?.name} • {product.pack_size}
                  {(product.additional_images?.length || 0) > 0 && ` • ${product.additional_images!.length}টি ছবি`}
                </p>
                <p className="text-sm font-semibold text-primary">৳{product.price}</p>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" onClick={() => openEdit(product)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(product.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
