import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHead from '@/components/PageHead';

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'পেমেন্ট অপেক্ষায়', variant: 'secondary' },
  payment_received: { label: 'পেমেন্ট গৃহীত', variant: 'default' },
  processing: { label: 'প্রস্তুত হচ্ছে', variant: 'default' },
  shipped: { label: 'ডেলিভারিতে', variant: 'default' },
  delivered: { label: 'ডেলিভারি সম্পন্ন', variant: 'outline' },
  cancelled: { label: 'বাতিল', variant: 'destructive' },
};

const MyOrders = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      const fetchOrders = async () => {
        const { data } = await supabase
          .from('orders')
          .select('id, order_number, total_amount, status, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        setOrders(data || []);
        setLoading(false);
      };
      fetchOrders();
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="container py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container py-20 text-center">
        <PageHead title="আমার অর্ডার" />
        <Package className="mx-auto h-16 w-16 text-muted-foreground/40 mb-4" />
        <h1 className="text-2xl font-bold mb-2">কোনো অর্ডার নেই</h1>
        <p className="text-muted-foreground mb-6">আপনি এখনো কোনো অর্ডার করেননি</p>
        <Button asChild>
          <Link to="/categories">চাল দেখুন</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <PageHead title="আমার অর্ডার" />
      <h1 className="text-3xl font-bold mb-8">আমার অর্ডার</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const status = statusLabels[order.status] || statusLabels.pending;
          return (
            <Link
              key={order.id}
              to={`/order/${order.id}`}
              className="block rounded-xl border bg-card p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-bold">{order.order_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString('bn-BD', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">৳{order.total_amount}</p>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;
