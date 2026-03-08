import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, ShoppingBag, Users, TrendingUp, Clock, Crown, UserPlus, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

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

interface OrderRaw {
  total_amount: number;
  status: string;
  created_at: string;
}

interface RecentCustomer {
  user_id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

interface TopProduct {
  product_name: string;
  total_qty: number;
  total_revenue: number;
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

const MONTH_NAMES_BN = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রি', 'মে', 'জুন', 'জুলা', 'আগ', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({ customers: 0, orders: 0, products: 0, pendingOrders: 0, totalRevenue: 0, deliveredOrders: 0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [allOrders, setAllOrders] = useState<OrderRaw[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [customersRes, ordersRes, productsRes, pendingRes, allOrdersRes, recentRes, recentCustRes, orderItemsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('rice_products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('orders').select('total_amount, status, created_at').order('created_at', { ascending: true }),
        supabase.from('orders').select('id, order_number, customer_name, total_amount, status, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('profiles').select('user_id, full_name, phone, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('order_items').select('product_name, quantity, product_price'),
      ]);

      const orders = allOrdersRes.data || [];
      const deliveredOrders = orders.filter(o => o.status === 'delivered');
      const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

      // Calculate top products
      const productMap = new Map<string, { total_qty: number; total_revenue: number }>();
      (orderItemsRes.data || []).forEach((item) => {
        const existing = productMap.get(item.product_name) || { total_qty: 0, total_revenue: 0 };
        existing.total_qty += item.quantity;
        existing.total_revenue += item.product_price * item.quantity;
        productMap.set(item.product_name, existing);
      });
      const sortedProducts = Array.from(productMap.entries())
        .map(([product_name, data]) => ({ product_name, ...data }))
        .sort((a, b) => b.total_qty - a.total_qty)
        .slice(0, 5);

      setStats({
        customers: customersRes.count || 0,
        orders: ordersRes.count || 0,
        products: productsRes.count || 0,
        pendingOrders: pendingRes.count || 0,
        totalRevenue,
        deliveredOrders: deliveredOrders.length,
      });
      setAllOrders(orders);
      setRecentOrders(recentRes.data || []);
      setRecentCustomers(recentCustRes.data || []);
      setTopProducts(sortedProducts);
      setLoading(false);
    };
    fetchStats();
  }, []);

  const monthlyData = useMemo(() => {
    const map = new Map<string, { revenue: number; orders: number; month: string }>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map.set(key, { revenue: 0, orders: 0, month: MONTH_NAMES_BN[d.getMonth()] });
    }
    allOrders.forEach((order) => {
      const d = new Date(order.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const entry = map.get(key);
      if (entry) {
        entry.orders += 1;
        if (order.status === 'delivered') {
          entry.revenue += order.total_amount || 0;
        }
      }
    });
    return Array.from(map.values());
  }, [allOrders]);

  const statusDistribution = useMemo(() => {
    const countMap = new Map<string, number>();
    allOrders.forEach((o) => {
      countMap.set(o.status, (countMap.get(o.status) || 0) + 1);
    });
    return Array.from(countMap.entries()).map(([status, count]) => ({
      name: statusLabels[status] || status,
      value: count,
    }));
  }, [allOrders]);

  const PIE_COLORS = [
    'hsl(38, 60%, 55%)',   // secondary/gold
    'hsl(145, 45%, 28%)',  // primary/green
    'hsl(220, 60%, 55%)',  // blue
    'hsl(25, 50%, 40%)',   // accent/earth
    'hsl(0, 84%, 60%)',    // destructive
    'hsl(270, 50%, 55%)',  // violet
  ];

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

      {/* Monthly Charts */}
      {!loading && monthlyData.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">মাসভিত্তিক রেভেনিউ</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" tickFormatter={(v) => `৳${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                  <Tooltip
                    formatter={(value: number) => [`৳${value.toLocaleString('bn-BD')}`, 'রেভেনিউ']}
                    contentStyle={{ borderRadius: '8px', fontSize: '13px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">মাসভিত্তিক অর্ডার</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthlyData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" allowDecimals={false} />
                  <Tooltip
                    formatter={(value: number) => [value, 'অর্ডার']}
                    contentStyle={{ borderRadius: '8px', fontSize: '13px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: 'hsl(var(--primary))' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Order Status Pie Chart */}
          {statusDistribution.length > 0 && (
            <Card className="md:col-span-2 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">অর্ডার স্ট্যাটাস</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                      style={{ fontSize: '11px' }}
                    >
                      {statusDistribution.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [value, name]}
                      contentStyle={{ borderRadius: '8px', fontSize: '13px', border: '1px solid hsl(var(--border))' }}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Bottom grid: Recent Orders + Top Products + Recent Customers */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base sm:text-lg">সাম্প্রতিক অর্ডার</CardTitle>
            <Link to="/admin/orders" className="text-xs text-primary hover:underline flex items-center gap-1">
              সব দেখুন <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">লোড হচ্ছে...</p>
            ) : recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-sm">কোনো অর্ডার নেই</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between gap-2 py-2 border-b last:border-0">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{order.order_number}</p>
                      <p className="text-xs text-muted-foreground truncate">{order.customer_name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-primary block">৳{order.total_amount}</span>
                      <Badge variant={statusColors[order.status] || 'secondary'} className="text-[10px]">
                        {statusLabels[order.status] || order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Crown className="h-4 w-4 text-secondary" />
              টপ সেলিং চাল
            </CardTitle>
            <Link to="/admin/products" className="text-xs text-primary hover:underline flex items-center gap-1">
              সব দেখুন <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">লোড হচ্ছে...</p>
            ) : topProducts.length === 0 ? (
              <p className="text-muted-foreground text-sm">এখনো কোনো বিক্রি হয়নি</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product, i) => (
                  <div key={product.product_name} className="flex items-center gap-3 py-2 border-b last:border-0">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                      i === 0 ? 'bg-secondary/20 text-secondary' :
                      i === 1 ? 'bg-muted text-muted-foreground' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{product.product_name}</p>
                      <p className="text-xs text-muted-foreground">{product.total_qty} বার বিক্রি</p>
                    </div>
                    <span className="text-sm font-bold text-primary shrink-0">৳{product.total_revenue.toLocaleString('bn-BD')}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Customers */}
        <Card className="lg:col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              নতুন কাস্টমার
            </CardTitle>
            <Link to="/admin/customers" className="text-xs text-primary hover:underline flex items-center gap-1">
              সব দেখুন <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">লোড হচ্ছে...</p>
            ) : recentCustomers.length === 0 ? (
              <p className="text-muted-foreground text-sm">কোনো কাস্টমার নেই</p>
            ) : (
              <div className="space-y-3">
                {recentCustomers.map((cust) => (
                  <div key={cust.user_id} className="flex items-center justify-between gap-2 py-2 border-b last:border-0">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{cust.full_name || 'নাম দেওয়া হয়নি'}</p>
                      <p className="text-xs text-muted-foreground truncate">{cust.phone || '—'}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(cust.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
