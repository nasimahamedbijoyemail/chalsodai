import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, PackageSearch } from 'lucide-react';
import PageHead from '@/components/PageHead';
import PageTransition from '@/components/PageTransition';
import OrderTimeline from '@/components/OrderTimeline';

interface TrackedItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  pack_size: string;
}

interface TrackedOrder {
  order_number: string;
  status: string;
  payment_method: string;
  total_amount: number;
  delivery_charge: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  created_at: string;
  admin_notes: string | null;
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'অর্ডার গৃহীত', variant: 'secondary' },
  payment_received: { label: 'প্রস্তুত হচ্ছে', variant: 'default' },
  processing: { label: 'প্রস্তুত হচ্ছে', variant: 'default' },
  shipped: { label: 'ডেলিভারিতে', variant: 'default' },
  delivered: { label: 'ডেলিভারি সম্পন্ন', variant: 'outline' },
  cancelled: { label: 'বাতিল', variant: 'destructive' },
};

const getStatusInfo = (status: string) => statusLabels[status] || statusLabels.pending;

const TrackOrder = () => {
  const [params] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get('order') || '');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [items, setItems] = useState<TrackedItem[]>([]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);
    const { data, error: fnError } = await supabase.functions.invoke('track-order', {
      body: { order_number: orderNumber, phone },
    });
    setLoading(false);
    if (fnError || !data || data.error) {
      setError(data?.error || 'অর্ডারটি পাওয়া যায়নি। নম্বরগুলো মিলিয়ে দেখুন।');
      return;
    }
    setOrder(data.order);
    setItems(data.items || []);
  };

  const subtotal = items.reduce((s, i) => s + i.product_price * i.quantity, 0);
  const status = order ? getStatusInfo(order.status) : null;

  return (
    <PageTransition>
      <div className="container py-10 max-w-2xl pb-24 md:pb-10">
        <PageHead
          title="অর্ডার ট্র্যাক করুন — চাল সদাই"
          description="অর্ডার নম্বর ও ফোন নম্বর দিয়ে আপনার চাল সদাই অর্ডারের বর্তমান অবস্থা দেখুন।"
        />

        <div className="text-center mb-8">
          <PackageSearch className="mx-auto h-12 w-12 text-primary mb-3" />
          <h1 className="text-2xl font-bold">অর্ডার ট্র্যাক করুন</h1>
          <p className="text-sm text-muted-foreground mt-1">
            অর্ডার নম্বর ও অর্ডারে দেওয়া ফোন নম্বর দিন
          </p>
        </div>

        <form onSubmit={handleTrack} className="rounded-xl border bg-card p-5 space-y-4 premium-card">
          <div className="space-y-2">
            <Label htmlFor="order_number">অর্ডার নম্বর</Label>
            <Input
              id="order_number"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="CS-20250101-1234"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">ফোন নম্বর</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            ট্র্যাক করুন
          </Button>
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
        </form>

        {order && status && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{order.order_number}</h2>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString('bn-BD', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
              </div>
              <Badge variant={status.variant} className="text-sm">{status.label}</Badge>
            </div>

            <OrderTimeline currentStatus={order.status} />

            <div className="rounded-xl border bg-card p-5 premium-card">
              <h3 className="font-bold mb-4">পণ্যসমূহ</h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-muted-foreground">{item.pack_size} × {item.quantity}</p>
                    </div>
                    <p className="font-semibold">৳{item.product_price * item.quantity}</p>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">সাবটোটাল</span>
                  <span>৳{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ডেলিভারি চার্জ</span>
                  <span>{order.delivery_charge > 0 ? `৳${order.delivery_charge}` : 'ফ্রি'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">পেমেন্ট পদ্ধতি</span>
                  <span>ক্যাশ অন ডেলিভারি</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-1 border-t">
                  <span>মোট</span>
                  <span className="text-primary">৳{order.total_amount}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 premium-card">
              <h3 className="font-bold mb-3">ডেলিভারি তথ্য</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">নাম</span>
                  <span>{order.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ফোন</span>
                  <span>{order.customer_phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ঠিকানা</span>
                  <span className="text-right max-w-[60%]">{order.customer_address}</span>
                </div>
              </div>
            </div>

            {order.admin_notes && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                <h3 className="font-bold mb-2">নোট</h3>
                <p className="text-sm text-muted-foreground">{order.admin_notes}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};

export default TrackOrder;
