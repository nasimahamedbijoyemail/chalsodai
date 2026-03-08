import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/cartStore';
import PageHead from '@/components/PageHead';
import PageTransition from '@/components/PageTransition';
import { DELIVERY_CHARGE } from '@/lib/constants';

const Cart = () => {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();
  const subtotal = totalPrice();
  const grandTotal = subtotal + (items.length > 0 ? DELIVERY_CHARGE : 0);

  if (items.length === 0) {
    return (
      <PageTransition>
        <div className="container py-20 text-center">
          <PageHead title="কার্ট" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
            <h1 className="text-2xl font-bold mb-2">আপনার কার্ট খালি</h1>
            <p className="text-muted-foreground mb-6">চাল দেখুন এবং কার্টে যোগ করুন</p>
            <Button asChild size="lg">
              <Link to="/categories">
                চাল দেখুন <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container py-10 pb-24 md:pb-10">
        <PageHead title="কার্ট" />
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">আপনার কার্ট</h1>

        <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-3 sm:gap-4 rounded-xl border bg-card p-3 sm:p-4 premium-card"
              >
                <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm sm:text-base line-clamp-1">{item.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{item.packSize}</p>
                  <p className="font-semibold text-primary mt-1 text-sm sm:text-base">৳{item.price}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Button variant="outline" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 sm:w-8 text-center font-medium text-sm">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border bg-card p-5 sm:p-6 h-fit lg:sticky lg:top-20 space-y-4"
          >
            <h2 className="text-lg font-bold">অর্ডার সারাংশ</h2>
            <div className="space-y-2 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-muted-foreground truncate mr-2">{item.name} × {item.quantity}</span>
                  <span className="shrink-0">৳{item.price * item.quantity}</span>
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
              <Link to="/checkout">
                অর্ডার করুন <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Cart;