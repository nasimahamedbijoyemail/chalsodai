import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useCartStore } from '@/lib/cartStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ShoppingCart, ArrowLeft, Loader2, Share2 } from 'lucide-react';
import PageHead from '@/components/PageHead';
import PageTransition from '@/components/PageTransition';
import ProductReviews from '@/components/ProductReviews';

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
  const setBuyNowItem = useCartStore((s) => s.setBuyNowItem);
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
    setBuyNowItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.image_url || '/placeholder.svg',
      packSize: product.pack_size,
    });
    navigate('/checkout');
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `${product.name} — ৳${product.price} | চাল সদাই`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('লিংক কপি হয়েছে!');
      }
    } catch {
      // User cancelled share
    }
  };

  return (
    <PageTransition>
      <div className="container py-6 sm:py-10 pb-24 md:pb-10">
        <PageHead title={product.name} description={product.description || `${product.name} — চাল সদাই`} />
        
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> পেছনে
          </Button>
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="aspect-square overflow-hidden rounded-2xl bg-muted group cursor-zoom-in premium-card">
              <img src={selectedImage} alt={product.name} width={600} height={600} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-125" />
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === img ? 'border-primary shadow-md' : 'border-transparent hover:border-muted-foreground/30'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            className="space-y-4 sm:space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {product.rice_categories && (
              <Badge variant="secondary">{product.rice_categories.name}</Badge>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold">{product.name}</h1>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-primary">৳{product.price}</span>
              <span className="text-muted-foreground text-sm">/ {product.pack_size}</span>
            </div>

            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">বিবরণ</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">{product.description}</p>
              </div>
            )}

            {product.is_available === false ? (
              <Badge variant="destructive" className="text-sm py-1 px-3">স্টকে নেই</Badge>
            ) : (
              <div className="flex gap-3 pt-2 sm:pt-4">
                <Button onClick={handleBuyNow} size="lg" className="flex-1">
                  অর্ডার করুন
                </Button>
                <Button onClick={handleAddToCart} variant="outline" size="lg">
                  <ShoppingCart className="h-5 w-5 sm:mr-2" />
                  <span className="hidden sm:inline">কার্টে যোগ করুন</span>
                </Button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Reviews Section */}
        <ProductReviews productId={product.id} />
      </div>
    </PageTransition>
  );
};

export default ProductDetail;