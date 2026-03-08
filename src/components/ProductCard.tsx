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
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </Link>
      <CardContent className="p-4 space-y-3">
        <Link to={`/product/${product.id}`}>
          <span className="text-xs font-medium text-secondary">{product.category}</span>
          <h3 className="font-bold text-foreground mt-1">{product.name}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-primary">৳{product.price}</span>
            <span className="text-xs text-muted-foreground ml-1">/ {product.packSize}</span>
          </div>
        </div>
        <div className="flex gap-2">
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
            <ShoppingCart className="h-4 w-4 mr-1" />
            কার্টে যোগ করুন
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
