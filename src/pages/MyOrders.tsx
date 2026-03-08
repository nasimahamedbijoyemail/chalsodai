import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHead from '@/components/PageHead';
import PageTransition from '@/components/PageTransition';

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  payment_method: string;
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
          .select('id, order_number, total_amount, status, created_at, payment_method')
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
      <PageTransition>
        <div className="container py-20 text-center">
          <PageHead title="আমার অর্ডার" />
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Package className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
            <h1 className="text-2xl font-bold mb-2">কোনো অর্ডার নেই</h1>
            <p className="text-muted-foreground mb-6">আপনি এখনো কোনো অর্ডার করেননি</p>
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
      <div className="container py-8 sm:py-10 pb-24 md:pb-10">
        <PageHead title="আমার অর্ডার" />
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">আমার অর্ডার</h1>

        <div className="space-y-3">
          {orders.map((order, i) => {
            const status = statusLabels[order.status] || statusLabels.pending;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
              >
                <Link
                  to={`/order/${order.id}`}
                  className="block rounded-xl border bg-card p-4 sm:p-5 premium-card"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-sm sm:text-base">{order.order_number}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('bn-BD', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                        {' · '}
                        {order.payment_method === 'cod' ? 'ক্যাশ' : 'বিকাশ'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-primary text-sm sm:text-base">৳{order.total_amount}</p>
                      <Badge variant={status.variant} className="text-xs">{status.label}</Badge>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
};

export default MyOrders;