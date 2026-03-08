import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, ShoppingBag, Users, TrendingUp, Clock } from 'lucide-react';

interface Stats {
  customers: number;
  orders: number;
  products: number;
  pendingOrders: number;
  totalRevenue: number;
  deliveredOrders: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

const statusLabels: Record<string, string> = {
  pending: 'পেমেন্ট অপেক্ষায়',
  payment_received: 'পেমেন্ট গৃহীত',
  processing: 'প্রস্তুত হচ্ছে',
  shipped: 'ডেলিভারিতে',
  delivered: 'ডেলিভারি সম্পন্ন',
  cancelled: 'বাতিল',
};

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  payment_received: 'default',
  processing: 'default',
  shipped: 'default',
  delivered: 'outline',
  cancelled: 'destructive',
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({ customers: 0, orders: 0, products: 0, pendingOrders: 0, totalRevenue: 0, deliveredOrders: 0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [customersRes, ordersRes, productsRes, pendingRes, deliveredRes, recentRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('rice_products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('orders').select('total_amount').eq('status', 'delivered'),
        supabase.from('orders').select('id, order_number, customer_name, total_amount, status, created_at').order('created_at', { ascending: false }).limit(5),
      ]);

      const totalRevenue = deliveredRes.data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;

      setStats({
        customers: customersRes.count || 0,
        orders: ordersRes.count || 0,
        products: productsRes.count || 0,
        pendingOrders: pendingRes.count || 0,
        totalRevenue,
        deliveredOrders: deliveredRes.data?.length || 0,
      });
      setRecentOrders(recentRes.data || []);
      setLoading(false);
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'মোট রেভেনিউ', value: `৳${stats.totalRevenue.toLocaleString('bn-BD')}`, icon: TrendingUp, color: 'text-emerald-600' },
    { title: 'পেন্ডিং অর্ডার', value: stats.pendingOrders, icon: Clock, color: 'text-orange-600' },
    { title: 'মোট অর্ডার', value: stats.orders, icon: ShoppingBag, color: 'text-blue-600' },
    { title: 'মোট কাস্টমার', value: stats.customers, icon: Users, color: 'text-violet-600' },
    { title: 'ডেলিভারি সম্পন্ন', value: stats.deliveredOrders, icon: ShoppingBag, color: 'text-emerald-600' },
    { title: 'মোট চাল', value: stats.products, icon: Package, color: 'text-amber-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ড্যাশবোর্ড</h1>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-3xl font-bold">{loading ? '...' : stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">সাম্প্রতিক অর্ডার</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">লোড হচ্ছে...</p>
          ) : recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-sm">কোনো অর্ডার নেই</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-3 py-2 border-b last:border-0">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{order.order_number}</p>
                    <p className="text-xs text-muted-foreground truncate">{order.customer_name}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-primary">৳{order.total_amount}</span>
                    <Badge variant={statusColors[order.status] || 'secondary'} className="text-xs">
                      {statusLabels[order.status] || order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;