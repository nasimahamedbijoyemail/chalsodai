import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCartStore } from '@/lib/cartStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ShoppingCart, ArrowLeft, Loader2 } from 'lucide-react';
import PageHead from '@/components/PageHead';

interface Product {
  id: string;
  name: string;
  price: number;
  pack_size: string;
  description: string | null;
  image_url: string | null;
  additional_images: string[] | null;
  is_available: boolean | null;
  rice_categories: { name: string } | null;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const { data } = await supabase
        .from('rice_products')
        .select('*, rice_categories(name)')
        .eq('id', id)
        .maybeSingle();
      setProduct(data);
      setSelectedImage(data?.image_url || '/placeholder.svg');
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground mb-4">পণ্যটি পাওয়া যায়নি</p>
        <Button asChild variant="outline">
          <Link to="/categories">চালের ধরণ দেখুন</Link>
        </Button>
      </div>
    );
  }

  const allImages = [product.image_url || '/placeholder.svg', ...(product.additional_images || []).filter(Boolean)];

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image_url || '/placeholder.svg',
      packSize: product.pack_size,
    });
    toast.success(`${product.name} কার্টে যোগ করা হয়েছে!`);
  };

  const handleBuyNow = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image_url || '/placeholder.svg',
      packSize: product.pack_size,
    });
    navigate('/checkout');
  };

  return (
    <div className="container py-10">
      <PageHead title={product.name} description={product.description || `${product.name} — চাল সদাই`} />
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" /> পেছনে যান
      </Button>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-2xl bg-muted">
            <img src={selectedImage} alt={product.name} className="h-full w-full object-cover" />
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`h-16 w-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === img ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {product.rice_categories && (
            <Badge variant="secondary">{product.rice_categories.name}</Badge>
          )}
          <h1 className="text-3xl font-bold">{product.name}</h1>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">৳{product.price}</span>
            <span className="text-muted-foreground">/ {product.pack_size}</span>
          </div>

          {product.description && (
            <div>
              <h3 className="font-semibold mb-2">বিবরণ</h3>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          )}

          {product.is_available === false ? (
            <Badge variant="destructive">স্টকে নেই</Badge>
          ) : (
            <div className="flex gap-3 pt-4">
              <Button onClick={handleBuyNow} size="lg" className="flex-1">
                অর্ডার করুন
              </Button>
              <Button onClick={handleAddToCart} variant="outline" size="lg">
                <ShoppingCart className="h-5 w-5 mr-2" />
                কার্টে যোগ করুন
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
