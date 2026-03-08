import { ShoppingCart } from 'lucide-react';
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
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      packSize: product.packSize,
    });
    navigate('/checkout');
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 premium-card">
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        </div>
      </Link>
      <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        <Link to={`/product/${product.id}`}>
          <span className="text-xs font-medium text-secondary">{product.category}</span>
          <h3 className="font-bold text-foreground mt-1 text-sm sm:text-base line-clamp-1">{product.name}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
        </Link>
        <div>
          <span className="text-base sm:text-lg font-bold text-primary">৳{product.price}</span>
          <span className="text-xs text-muted-foreground ml-1">/ {product.packSize}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleBuyNow}
            className="flex-1"
            size="sm"
          >
            অর্ডার করুন
          </Button>
          <Button
            onClick={handleAddToCart}
            variant="outline"
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 sm:mr-1" />
            <span className="sm:inline hidden">কার্টে</span>
            <span className="sm:hidden">কার্টে যোগ</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
