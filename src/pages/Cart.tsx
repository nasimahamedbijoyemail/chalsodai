import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/cartStore';
import PageHead from '@/components/PageHead';

const DELIVERY_CHARGE = 60;

const Cart = () => {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();
  const subtotal = totalPrice();
  const grandTotal = subtotal + (items.length > 0 ? DELIVERY_CHARGE : 0);

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <PageHead title="কার্ট" />
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/40 mb-4" />
        <h1 className="text-2xl font-bold mb-2">আপনার কার্ট খালি</h1>
        <p className="text-muted-foreground mb-6">চাল দেখুন এবং কার্টে যোগ করুন</p>
        <Button asChild>
          <Link to="/categories">চাল দেখুন</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <PageHead title="কার্ট" />
      <h1 className="text-3xl font-bold mb-8">আপনার কার্ট</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-xl border bg-card p-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.packSize}</p>
                <p className="font-semibold text-primary mt-1">৳{item.price}</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border bg-card p-6 h-fit space-y-4">
          <h2 className="text-lg font-bold">অর্ডার সারাংশ</h2>
          <div className="space-y-2 text-sm">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                <span>৳{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">সাবটোটাল</span>
              <span>৳{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">ডেলিভারি চার্জ</span>
              <span>৳{DELIVERY_CHARGE}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>মোট</span>
              <span className="text-primary">৳{grandTotal}</span>
            </div>
          </div>
          <Button asChild className="w-full" size="lg">
            <Link to="/checkout">অর্ডার করুন</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
