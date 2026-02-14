import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingBag, Users, HelpCircle } from 'lucide-react';

interface Stats {
  customers: number;
  orders: number;
  products: number;
  pendingOrders: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({ customers: 0, orders: 0, products: 0, pendingOrders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [customersRes, ordersRes, productsRes, pendingRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('rice_products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      setStats({
        customers: customersRes.count || 0,
        orders: ordersRes.count || 0,
        products: productsRes.count || 0,
        pendingOrders: pendingRes.count || 0,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'মোট কাস্টমার', value: stats.customers, icon: Users, color: 'text-blue-600' },
    { title: 'মোট অর্ডার', value: stats.orders, icon: ShoppingBag, color: 'text-green-600' },
    { title: 'পেন্ডিং অর্ডার', value: stats.pendingOrders, icon: ShoppingBag, color: 'text-orange-600' },
    { title: 'মোট চাল', value: stats.products, icon: Package, color: 'text-purple-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ড্যাশবোর্ড</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '...' : stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
