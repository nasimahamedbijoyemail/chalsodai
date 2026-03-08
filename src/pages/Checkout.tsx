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
import { CheckCircle, Loader2, Banknote, Smartphone, Lock, ArrowLeft } from 'lucide-react';
import PageHead from '@/components/PageHead';
import PageTransition from '@/components/PageTransition';

type PaymentMethod = 'bkash' | 'cod';

const DELIVERY_CHARGE = 60;

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCartStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [guestPassword, setGuestPassword] = useState('');
  const [bkashNumber, setBkashNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [bkashDisplayNumber, setBkashDisplayNumber] = useState('01786698614');

  const subtotal = totalPrice();
  const grandTotal = subtotal + DELIVERY_CHARGE;

  useEffect(() => {
    supabase.from('site_settings').select('key, value').in('key', ['whatsapp_number', 'bkash_number'])
      .then(({ data }) => {
        data?.forEach(s => {
          if (s.key === 'whatsapp_number') setWhatsappNumber(s.value.replace(/[^0-9]/g, ''));
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
    navigate('/cart');
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

      setSubmitted(true);
      clearCart();
      toast.success('আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে!');
      if (!user && currentUser) {
        toast.success('আপনার অ্যাকাউন্টও তৈরি হয়েছে!');
      }

      const whatsappMsg = encodeURIComponent(
        `✅ নতুন অর্ডার!\n\n` +
        `📋 অর্ডার নং: ${order.order_number}\n` +
        `👤 নাম: ${name}\n` +
        `📱 ফোন: ${phone}\n` +
        `📍 ঠিকানা: ${address}\n` +
        `💰 মোট: ৳${grandTotal}\n` +
        `💳 পেমেন্ট: ${paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : 'বিকাশ'}\n` +
        (paymentMethod === 'bkash' ? `🔖 ট্রানজেকশন: ${bkashNumber}\n` : '') +
        `\nপণ্য:\n` +
        items.map(i => `• ${i.name} × ${i.quantity} = ৳${i.price * i.quantity}`).join('\n')
      );
      if (whatsappNumber) {
        setTimeout(() => {
          window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`, '_blank');
        }, 1500);
      }
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
        <div className="container py-20 text-center pb-24 md:pb-20">
          <PageHead title="অর্ডার সফল" />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <CheckCircle className="mx-auto h-16 w-16 text-primary mb-4" />
            <h1 className="text-2xl font-bold mb-2">অর্ডার সফল হয়েছে!</h1>
            <p className="text-muted-foreground mb-6">
              আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে। {paymentMethod === 'bkash' ? 'অ্যাডমিন পেমেন্ট ভেরিফাই করার পর' : 'ডেলিভারির সময়'} আপনার অর্ডার প্রসেস করা হবে।
            </p>
            {user && (
              <p className="text-sm text-muted-foreground mb-6">
                আপনার অর্ডারের আপডেট নোটিফিকেশনে দেখতে পাবেন।
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate('/')}>হোমে ফিরুন</Button>
              {user && (
                <Button variant="outline" onClick={() => navigate('/my-orders')}>
                  আমার অর্ডার দেখুন
                </Button>
              )}
            </div>
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
          <div className="space-y-2 text-sm">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="truncate mr-2">{item.name} × {item.quantity}</span>
                <span className="shrink-0">৳{item.price * item.quantity}</span>
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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="rounded-xl border-2 border-secondary bg-secondary/10 p-4 sm:p-5 mb-6"
          >
            <h2 className="font-bold text-base sm:text-lg mb-2">💳 বিকাশ পেমেন্ট</h2>
            <p className="text-xs sm:text-sm mb-3">
              আপনার অর্ডারের মোট মূল্য <strong className="text-primary">৳{grandTotal}</strong> টাকা
              নিচের বিকাশ নম্বরে পাঠান:
            </p>
            <div className="rounded-lg bg-background p-3 sm:p-4 text-center mb-3">
              <p className="text-xs text-muted-foreground mb-1">বিকাশ নম্বর</p>
              <p className="text-xl sm:text-2xl font-bold text-primary">{bkashDisplayNumber}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bkash">বিকাশ ট্রানজেকশন আইডি লিখুন</Label>
              <Input
                id="bkash"
                placeholder="ট্রানজেকশন আইডি"
                value={bkashNumber}
                onChange={(e) => setBkashNumber(e.target.value)}
                maxLength={30}
              />
            </div>
          </motion.div>
        )}

        {/* COD Info */}
        {paymentMethod === 'cod' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="rounded-xl border-2 border-secondary bg-secondary/10 p-4 sm:p-5 mb-6"
          >
            <h2 className="font-bold text-base sm:text-lg mb-2">💵 ক্যাশ অন ডেলিভারি</h2>
            <p className="text-xs sm:text-sm">
              ডেলিভারি ম্যান আপনার পণ্য পৌঁছে দেওয়ার সময় <strong className="text-primary">৳{grandTotal}</strong> টাকা নগদে পরিশোধ করুন।
            </p>
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
