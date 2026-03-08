import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useCartStore } from '@/lib/cartStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  ShoppingCart, ArrowLeft, Loader2, Share2, Truck, ShieldCheck,
  Package, Wheat, ChevronRight, Minus, Plus, Zap, Star,
} from 'lucide-react';
import PageHead from '@/components/PageHead';
import PageTransition from '@/components/PageTransition';
import ProductReviews from '@/components/ProductReviews';
import { DELIVERY_CHARGE } from '@/lib/constants';

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

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  pack_size: string;
  image_url: string | null;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const setBuyNowItem = useCartStore((s) => s.setBuyNowItem);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [imageZoom, setImageZoom] = useState(false);

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
      setQuantity(1);
      setLoading(false);

      // Fetch related products
      if (data?.rice_categories) {
        const { data: relData } = await supabase
          .from('rice_products')
          .select('id, name, price, pack_size, image_url')
          .neq('id', id)
          .eq('is_available', true)
          .limit(4);
        setRelated(relData || []);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
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
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.image_url || '/placeholder.svg',
        packSize: product.pack_size,
      });
    }
    toast.success(`${product.name} × ${quantity} কার্টে যোগ করা হয়েছে!`);
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
      // User cancelled
    }
  };

  const totalPrice = Number(product.price) * quantity;

  return (
    <PageTransition>
      <div className="container py-4 sm:py-8 pb-24 md:pb-10">
        <PageHead title={product.name} description={product.description || `${product.name} — চাল সদাই`} />

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4 sm:mb-6 overflow-x-auto">
          <Link to="/" className="hover:text-foreground transition-colors shrink-0">হোম</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link to="/categories" className="hover:text-foreground transition-colors shrink-0">চালের ধরণ</Link>
          {product.rice_categories && (
            <>
              <ChevronRight className="h-3 w-3 shrink-0" />
              <span className="shrink-0">{product.rice_categories.name}</span>
            </>
          )}
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="text-foreground font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid gap-6 sm:gap-10 md:grid-cols-2">
          {/* Image Gallery */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div
              className="relative aspect-square overflow-hidden rounded-2xl bg-muted group cursor-zoom-in"
              onClick={() => setImageZoom(!imageZoom)}
            >
              <motion.img
                key={selectedImage}
                src={selectedImage}
                alt={product.name}
                width={600}
                height={600}
                className="h-full w-full object-cover"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: imageZoom ? 1.4 : 1 }}
                transition={{ duration: 0.3 }}
                style={{ transformOrigin: 'center' }}
              />

              {/* Badges on image */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.is_available !== false && (
                  <Badge className="bg-primary/90 backdrop-blur-sm text-primary-foreground text-[10px] px-2 py-0.5">
                    স্টকে আছে
                  </Badge>
                )}
                {product.rice_categories && (
                  <Badge variant="secondary" className="backdrop-blur-sm text-[10px] px-2 py-0.5">
                    {product.rice_categories.name}
                  </Badge>
                )}
              </div>

              {/* Share button */}
              <Button
                variant="secondary"
                size="icon"
                onClick={(e) => { e.stopPropagation(); handleShare(); }}
                className="absolute top-3 right-3 h-8 w-8 rounded-full backdrop-blur-sm bg-background/70 hover:bg-background/90 shadow-sm"
              >
                <Share2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedImage(img); setImageZoom(false); }}
                    className={`h-16 w-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === img
                        ? 'border-primary shadow-md ring-2 ring-primary/20'
                        : 'border-transparent hover:border-muted-foreground/30'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            className="space-y-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-3.5 w-3.5" />
                <span>প্যাক সাইজ: {product.pack_size}</span>
              </div>
            </div>

            {/* Price Block */}
            <div className="rounded-xl border bg-gradient-to-r from-primary/5 to-secondary/5 p-4">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl sm:text-4xl font-bold text-primary">৳{product.price}</span>
                <span className="text-sm text-muted-foreground">/ {product.pack_size}</span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Truck className="h-3 w-3" />
                ডেলিভারি চার্জ ৳{DELIVERY_CHARGE} সারা বাংলাদেশে
              </p>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Wheat className="h-4 w-4 text-secondary" />
                  বিবরণ
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: ShieldCheck, text: '১০০% খাঁটি চাল', color: 'text-primary' },
                { icon: Truck, text: 'দ্রুত ডেলিভারি', color: 'text-blue-600' },
                { icon: Package, text: 'নিরাপদ প্যাকেজিং', color: 'text-secondary' },
                { icon: Star, text: 'সেরা মানের নিশ্চয়তা', color: 'text-amber-500' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 rounded-lg border bg-card/50 p-2.5 text-xs">
                  <item.icon className={`h-4 w-4 shrink-0 ${item.color}`} />
                  <span className="text-muted-foreground">{item.text}</span>
                </div>
              ))}
            </div>

            <Separator />

            {/* Quantity & Actions */}
            {product.is_available === false ? (
              <Badge variant="destructive" className="text-sm py-2 px-4">স্টকে নেই</Badge>
            ) : (
              <div className="space-y-4">
                {/* Quantity Selector */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">পরিমাণ</span>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between rounded-lg bg-muted/60 px-4 py-2.5">
                  <span className="text-sm text-muted-foreground">মোট মূল্য</span>
                  <span className="text-xl font-bold text-primary">৳{totalPrice}</span>
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-3">
                  <Button onClick={handleBuyNow} size="lg" className="flex-1 gap-2">
                    <Zap className="h-4 w-4" />
                    এখনই অর্ডার করুন
                  </Button>
                  <Button onClick={handleAddToCart} variant="outline" size="lg" className="gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    <span className="hidden sm:inline">কার্টে যোগ</span>
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-secondary" />
              আরও চাল দেখুন
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {related.map((item) => (
                <Link
                  key={item.id}
                  to={`/product/${item.id}`}
                  className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={item.image_url || '/placeholder.svg'}
                      alt={item.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{item.name}</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="font-bold text-primary">৳{item.price}</span>
                      <span className="text-[10px] text-muted-foreground">/ {item.pack_size}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Reviews Section */}
        <ProductReviews productId={product.id} />
      </div>
    </PageTransition>
  );
};

export default ProductDetail;
