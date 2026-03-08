import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Package } from 'lucide-react';

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  pack_size: string;
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  delivery_charge: number;
  status: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  payment_method: string;
  bkash_number: string | null;
  admin_notes: string | null;
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'পেমেন্ট অপেক্ষায়', variant: 'secondary' },
  payment_received: { label: 'পেমেন্ট গৃহীত', variant: 'default' },
  processing: { label: 'প্রস্তুত হচ্ছে', variant: 'default' },
  shipped: { label: 'ডেলিভারিতে', variant: 'default' },
  delivered: { label: 'ডেলিভারি সম্পন্ন', variant: 'outline' },
  cancelled: { label: 'বাতিল', variant: 'destructive' },
};

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user && id) {
      const fetchOrder = async () => {
        const [orderRes, itemsRes] = await Promise.all([
          supabase.from('orders').select('*').eq('id', id).eq('user_id', user.id).maybeSingle(),
          supabase.from('order_items').select('*').eq('order_id', id),
        ]);
        setOrder(orderRes.data);
        setItems(itemsRes.data || []);
        setLoading(false);
      };
      fetchOrder();
    }
  }, [user, authLoading, id, navigate]);

  if (authLoading || loading) {
    return (
      <div className="container py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-20 text-center">
        <Package className="mx-auto h-16 w-16 text-muted-foreground/40 mb-4" />
        <p className="text-muted-foreground mb-4">অর্ডারটি পাওয়া যায়নি</p>
        <Button asChild variant="outline">
          <Link to="/my-orders">আমার অর্ডারে ফিরুন</Link>
        </Button>
      </div>
    );
  }

  const status = statusLabels[order.status] || statusLabels.pending;
  const subtotal = items.reduce((sum, i) => sum + i.product_price * i.quantity, 0);

  return (
    <div className="container py-10 max-w-2xl">
      <Helmet>
        <title>অর্ডার {order.order_number} — চাল সদাই</title>
      </Helmet>

      <Button variant="ghost" onClick={() => navigate('/my-orders')} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" /> আমার অর্ডারে ফিরুন
      </Button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{order.order_number}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(order.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Badge variant={status.variant} className="text-sm">{status.label}</Badge>
      </div>

      {/* Order Items */}
      <div className="rounded-xl border bg-card p-5 mb-6">
        <h2 className="font-bold mb-4">পণ্যসমূহ</h2>
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
          <div className="flex justify-between font-bold text-base pt-1 border-t">
            <span>মোট</span>
            <span className="text-primary">৳{order.total_amount}</span>
          </div>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="rounded-xl border bg-card p-5 mb-6">
        <h2 className="font-bold mb-3">ডেলিভারি তথ্য</h2>
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

      {/* Payment Info */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="font-bold mb-3">পেমেন্ট তথ্য</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">পদ্ধতি</span>
            <span>{order.payment_method === 'bkash' ? 'বিকাশ' : 'ক্যাশ অন ডেলিভারি'}</span>
          </div>
          {order.bkash_number && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">ট্রানজেকশন আইডি</span>
              <span>{order.bkash_number}</span>
            </div>
          )}
        </div>
      </div>

      {order.admin_notes && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mt-6">
          <h2 className="font-bold mb-2">অ্যাডমিন নোট</h2>
          <p className="text-sm text-muted-foreground">{order.admin_notes}</p>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
