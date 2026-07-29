import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCartStore } from '@/lib/cartStore';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, Loader2, Banknote, Smartphone, Lock, ArrowLeft, Plus, Minus, Trash2 } from 'lucide-react';
import PageHead from '@/components/PageHead';
import PageTransition from '@/components/PageTransition';
import { DELIVERY_CHARGE } from '@/lib/constants';

type PaymentMethod = 'bkash' | 'cod';

const Checkout = () => {
  const { items: cartItems, totalPrice: cartTotalPrice, clearCart, updateQuantity: updateCartQuantity, removeItem: removeCartItem } = useCartStore();
  const { buyNowItems, buyNowTotal, updateBuyNowQuantity, clearBuyNow } = useCartStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [guestPassword, setGuestPassword] = useState('');
  const [bkashNumber, setBkashNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');
  const [submitted, setSubmitted] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<{
    orderNumber: string;
    items: { name: string; packSize: string; quantity: number; price: number }[];
    subtotal: number;
    total: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [bkashDisplayNumber, setBkashDisplayNumber] = useState('01786698614');

  // Determine if this is a direct buy or cart checkout
  const isBuyNow = buyNowItems.length > 0;
  const items = isBuyNow ? buyNowItems : cartItems;
  const subtotal = isBuyNow ? buyNowTotal() : cartTotalPrice();
  const grandTotal = subtotal + DELIVERY_CHARGE;

  useEffect(() => {
    supabase.from('site_settings').select('key, value').in('key', ['bkash_number'])
      .then(({ data }) => {
        data?.forEach(s => {
          if (s.key === 'bkash_number') setBkashDisplayNumber(s.value);
        });
      });

    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, phone, address')
          .eq('user_id', user.id)
          .maybeSingle();
        if (data) {
          setName(data.full_name || '');
          setPhone(data.phone || '');
          setAddress(data.address || '');
        }
      };
      fetchProfile();
    }
  }, [user]);

  if (items.length === 0 && !submitted) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      toast.error('সব তথ্য পূরণ করুন।');
      return;
    }
    if (paymentMethod === 'bkash' && !bkashNumber.trim()) {
      toast.error('বিকাশ ট্রানজেকশন আইডি দিন।');
      return;
    }

    setLoading(true);
    try {
      let currentUser = user;

      if (!user && guestPassword.trim() && guestPassword.length >= 6) {
        const authEmail = `${phone.trim()}@phone.local`;
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: authEmail,
          password: guestPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: name },
          },
        });
        if (signUpError) {
          if (!signUpError.message.includes('already registered')) {
            console.error('Auto signup error:', signUpError);
          }
        } else if (signUpData?.user) {
          currentUser = signUpData.user;
          await supabase.from('profiles').upsert({
            user_id: signUpData.user.id,
            full_name: name,
            phone: phone,
            address: address,
          }, { onConflict: 'user_id' });
        }
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: currentUser?.id || null,
          customer_name: name,
          customer_phone: phone,
          customer_address: address,
          bkash_number: paymentMethod === 'bkash' ? bkashNumber : null,
          payment_method: paymentMethod,
          total_amount: grandTotal,
          delivery_charge: DELIVERY_CHARGE,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        pack_size: item.packSize,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      if (currentUser) {
        await supabase.from('notifications').insert({
          user_id: currentUser.id,
          title: 'অর্ডার সফল!',
          message: `আপনার অর্ডার ${order.order_number} সফলভাবে গ্রহণ করা হয়েছে। পেমেন্ট: ${paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : 'বিকাশ'}`,
        });
      }

      setPlacedOrder({
        orderNumber: order.order_number,
        items: items.map((i) => ({
          name: i.name,
          packSize: i.packSize,
          quantity: i.quantity,
          price: i.price,
        })),
        subtotal,
        total: grandTotal,
      });
      setSubmitted(true);
      if (isBuyNow) {
        clearBuyNow();
      } else {
        clearCart();
      }
      toast.success('আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে!');
      if (!user && currentUser) {
        toast.success('আপনার অ্যাকাউন্টও তৈরি হয়েছে!');
      }

      // Send order confirmation to the store owner's WhatsApp (server-side, no redirect)
      supabase.functions.invoke('order-whatsapp-notify', {
        body: {
          orderNumber: order.order_number,
          customerName: name,
          customerPhone: phone,
          customerAddress: address,
          paymentMethod,
          bkashNumber: paymentMethod === 'bkash' ? bkashNumber : null,
          deliveryCharge: DELIVERY_CHARGE,
          totalAmount: grandTotal,
          items: items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price,
            packSize: i.packSize,
          })),
        },
      }).catch((e) => console.error('WhatsApp notify failed', e));
    } catch (error) {
      console.error('Order error:', error);
      toast.error('অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <PageTransition>
        <div className="container py-16 text-center pb-24 md:pb-20 max-w-lg mx-auto relative overflow-hidden">
          <PageHead title="অর্ডার সফল" />

          {/* Confetti particles */}
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2.5 h-2.5 rounded-full pointer-events-none"
              style={{
                background: ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'][i % 7],
                left: `${10 + Math.random() * 80}%`,
                top: '-5%',
              }}
              initial={{ y: 0, opacity: 1, scale: 0, rotate: 0 }}
              animate={{
                y: [0, 300 + Math.random() * 400],
                opacity: [1, 1, 0],
                scale: [0, 1.2, 0.8],
                rotate: [0, 360 + Math.random() * 720],
                x: [0, (Math.random() - 0.5) * 200],
              }}
              transition={{
                duration: 2 + Math.random() * 1.5,
                delay: Math.random() * 0.8,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Animated rings behind icon */}
          <div className="relative mx-auto mb-6 w-24 h-24">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/20"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.8], opacity: [0.6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/15"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 2.2], opacity: [0.4, 0] }}
              transition={{ duration: 1.5, delay: 0.3, repeat: Infinity, repeatDelay: 1 }}
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            >
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-primary" />
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 150 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">অর্ডার সফল হয়েছে! 🎉</h1>
            <p className="text-muted-foreground mb-6 text-sm sm:text-base leading-relaxed">
              আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে।{' '}
              {paymentMethod === 'bkash' ? 'অ্যাডমিন পেমেন্ট ভেরিফাই করার পর' : 'ডেলিভারির সময়'}{' '}
              আপনার অর্ডার প্রসেস করা হবে।
            </p>
          </motion.div>

          {user && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="rounded-xl border border-primary/15 bg-gradient-to-r from-primary/5 to-secondary/5 p-4 mb-6 text-sm text-muted-foreground"
            >
              🔔 আপনার অর্ডারের আপডেট নোটিফিকেশনে দেখতে পাবেন।
            </motion.div>
          )}

          <motion.div
            className="flex gap-3 justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Button onClick={() => navigate('/')} size="lg">হোমে ফিরুন</Button>
            {user && (
              <Button variant="outline" size="lg" onClick={() => navigate('/my-orders')}>
                আমার অর্ডার দেখুন
              </Button>
            )}
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container py-8 sm:py-10 pb-24 md:pb-10 max-w-2xl">
        <PageHead title="চেকআউট" />

        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> পেছনে
        </Button>

        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">অর্ডার সম্পন্ন করুন</h1>

        {!user && (
          <div className="rounded-xl border border-secondary bg-secondary/10 p-4 mb-6">
            <p className="text-sm">
              💡 অর্ডারের সাথে সাথে আপনার অ্যাকাউন্ট তৈরি হবে। পরে লগইন করে অর্ডার ট্র্যাক করতে পারবেন।
            </p>
          </div>
        )}

        {/* Order Summary */}
        <motion.div
          className="rounded-xl border bg-card p-4 sm:p-5 mb-6 premium-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="font-bold mb-3">আপনার অর্ডার</h2>
          <div className="space-y-3 text-sm">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-muted">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.packSize} — ৳{item.price}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    type="button"
                    onClick={() => {
                      if (item.quantity <= 1) {
                        if (isBuyNow) {
                          // Don't allow removing last buy-now item
                          toast.error('কমপক্ষে ১টি পণ্য প্রয়োজন');
                        } else {
                          removeCartItem(item.id);
                        }
                      } else {
                        isBuyNow ? updateBuyNowQuantity(item.id, item.quantity - 1) : updateCartQuantity(item.id, item.quantity - 1);
                      }
                    }}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    type="button"
                    onClick={() => isBuyNow ? updateBuyNowQuantity(item.id, item.quantity + 1) : updateCartQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <span className="ml-1 font-semibold text-sm shrink-0">৳{item.price * item.quantity}</span>
                </div>
              </div>
            ))}
            <div className="border-t pt-2 space-y-1">
              <div className="flex justify-between text-muted-foreground">
                <span>সাবটোটাল</span>
                <span>৳{subtotal}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>ডেলিভারি চার্জ</span>
                <span>৳{DELIVERY_CHARGE}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-1 text-base">
                <span>মোট</span>
                <span className="text-primary">৳{grandTotal}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <h2 className="font-bold mb-3">পেমেন্ট পদ্ধতি বাছাই করুন</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('bkash')}
              className={`rounded-xl border-2 p-3 sm:p-4 text-left transition-all ${
                paymentMethod === 'bkash'
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <Smartphone className={`h-5 w-5 sm:h-6 sm:w-6 mb-1.5 sm:mb-2 ${paymentMethod === 'bkash' ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="font-bold text-xs sm:text-sm">বিকাশ পেমেন্ট</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">আগে পে করুন</p>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('cod')}
              className={`rounded-xl border-2 p-3 sm:p-4 text-left transition-all ${
                paymentMethod === 'cod'
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <Banknote className={`h-5 w-5 sm:h-6 sm:w-6 mb-1.5 sm:mb-2 ${paymentMethod === 'cod' ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="font-bold text-xs sm:text-sm">ক্যাশ অন ডেলিভারি</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">ডেলিভারির সময় পে করুন</p>
            </button>
          </div>
        </div>

        {/* bKash Payment Info */}
        {paymentMethod === 'bkash' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-5 sm:p-6 mb-6 shadow-sm"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary/10">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-base sm:text-lg leading-tight">বিকাশ পেমেন্ট</h2>
                <p className="text-[11px] sm:text-xs text-muted-foreground">Send Money করে পেমেন্ট করুন</p>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">১</span>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  নিচের বিকাশ নম্বরে <strong className="text-foreground">৳{grandTotal}</strong> টাকা Send Money করুন
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">২</span>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  পেমেন্টের পর ট্রানজেকশন আইডি নিচে লিখুন
                </p>
              </div>
            </div>

            {/* bKash Number Card */}
            <div className="rounded-xl bg-background border border-border p-4 text-center mb-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/3 to-secondary/3 pointer-events-none" />
              <p className="text-[11px] text-muted-foreground mb-1.5 uppercase tracking-wider font-medium relative z-10">বিকাশ নম্বর</p>
              <p className="text-2xl sm:text-3xl font-bold text-primary tracking-wide relative z-10">{bkashDisplayNumber}</p>
              <p className="text-[11px] text-muted-foreground mt-1.5 relative z-10">মোট পরিশোধযোগ্য: <span className="font-semibold text-foreground">৳{grandTotal}</span></p>
            </div>

            {/* Transaction ID Input */}
            <div className="space-y-2">
              <Label htmlFor="bkash" className="text-sm font-semibold">ট্রানজেকশন আইডি</Label>
              <div className="relative">
                <Input
                  id="bkash"
                  placeholder="যেমন: TXN1234ABCD"
                  value={bkashNumber}
                  onChange={(e) => setBkashNumber(e.target.value)}
                  maxLength={30}
                  className="h-11 text-base pl-3 pr-3 rounded-lg border-primary/20 focus-visible:ring-primary/30"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">বিকাশ অ্যাপ থেকে ট্রানজেকশন আইডি কপি করে পেস্ট করুন</p>
            </div>
          </motion.div>
        )}

        {/* COD Info */}
        {paymentMethod === 'cod' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/10 via-background to-accent/5 p-5 sm:p-6 mb-6 shadow-sm"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex items-center justify-center h-9 w-9 rounded-full bg-secondary/20">
                <Banknote className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-base sm:text-lg leading-tight">ক্যাশ অন ডেলিভারি</h2>
                <p className="text-[11px] sm:text-xs text-muted-foreground">পণ্য হাতে পেয়ে পেমেন্ট করুন</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-secondary text-secondary-foreground text-xs font-bold shrink-0 mt-0.5">১</span>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  অর্ডার কনফার্ম করুন — আমরা আপনার ঠিকানায় পণ্য পাঠিয়ে দেব
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-secondary text-secondary-foreground text-xs font-bold shrink-0 mt-0.5">২</span>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  ডেলিভারি ম্যানের কাছ থেকে পণ্য বুঝে নিয়ে টাকা পরিশোধ করুন
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-background border border-border p-4 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-accent/5 pointer-events-none" />
              <p className="text-[11px] text-muted-foreground mb-1.5 uppercase tracking-wider font-medium relative z-10">মোট পরিশোধযোগ্য</p>
              <p className="text-2xl sm:text-3xl font-bold text-primary tracking-wide relative z-10">৳{grandTotal}</p>
              <p className="text-[11px] text-muted-foreground mt-1.5 relative z-10">ডেলিভারির সময় নগদে পরিশোধ করুন</p>
            </div>
          </motion.div>
        )}

        {/* Customer Info */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">আপনার নাম</Label>
            <Input id="name" placeholder="আপনার পুরো নাম" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">ফোন নম্বর</Label>
            <Input id="phone" placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={15} />
          </div>
          {!user && (
            <div className="space-y-2">
              <Label htmlFor="guestPassword" className="flex items-center gap-1">
                <Lock className="h-3.5 w-3.5" />
                পাসওয়ার্ড (অ্যাকাউন্ট তৈরির জন্য)
              </Label>
              <Input
                id="guestPassword"
                type="password"
                placeholder="কমপক্ষে ৬ অক্ষর"
                value={guestPassword}
                onChange={(e) => setGuestPassword(e.target.value)}
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">ফোন নম্বর ও পাসওয়ার্ড দিয়ে পরে লগইন করতে পারবেন</p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="address">সম্পূর্ণ ঠিকানা (বিস্তারিত লিখুন)</Label>
            <Textarea
              id="address"
              placeholder="বাড়ি নং, রোড নং, এলাকা, থানা — বিস্তারিত ঠিকানা লিখুন"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={4}
              maxLength={500}
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                অপেক্ষা করুন...
              </>
            ) : (
              'অর্ডার নিশ্চিত করুন'
            )}
          </Button>
        </form>
      </div>
    </PageTransition>
  );
};

export default Checkout;
