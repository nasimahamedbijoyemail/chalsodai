import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCartStore } from '@/lib/cartStore';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

export interface RiceProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  packSize: string;
  description: string;
  image: string;
}

interface ProductCardProps {
  product: RiceProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCartStore((s) => s.addItem);
  const setBuyNowItem = useCartStore((s) => s.setBuyNowItem);
  const navigate = useNavigate();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      packSize: product.packSize,
    });
    toast.success(`${product.name} কার্টে যোগ করা হয়েছে!`);
  };

  const handleBuyNow = () => {
    setBuyNowItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      packSize: product.packSize,
    });
    navigate('/checkout');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -6 }}
    >
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl premium-card border-border/50 hover:border-primary/20">
        <Link to={`/product/${product.id}`} className="block relative">
          <div className="aspect-square overflow-hidden bg-muted relative">
            <img
              src={product.image}
              alt={product.name}
              width={400}
              height={400}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              loading="lazy"
            />
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {/* Price badge on hover */}
            <div className="absolute bottom-2 right-2 bg-primary text-primary-foreground px-2.5 py-1 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow-lg">
              ৳{product.price}
            </div>
          </div>
        </Link>
        <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
          <Link to={`/product/${product.id}`}>
            <span className="text-xs font-medium text-secondary transition-colors duration-200 group-hover:text-primary">{product.category}</span>
            <h3 className="font-bold text-foreground mt-1 text-sm sm:text-base line-clamp-1 transition-colors duration-200 group-hover:text-primary">{product.name}</h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
          </Link>
          <div>
            <span className="text-base sm:text-lg font-bold text-primary">৳{product.price}</span>
            <span className="text-xs text-muted-foreground ml-1">/ {product.packSize}</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleBuyNow}
              className="flex-1 transition-all duration-200 group-hover:shadow-md"
              size="sm"
            >
              অর্ডার করুন
            </Button>
            <Button
              onClick={handleAddToCart}
              variant="outline"
              size="sm"
              className="transition-all duration-200 group-hover:border-primary/40"
            >
              <ShoppingCart className="h-4 w-4 sm:mr-1" />
              <span className="sm:inline hidden">কার্টে</span>
              <span className="sm:hidden">কার্টে যোগ</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
