import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Package, ShoppingBag, Users, TrendingUp, Clock, Crown, UserPlus,
  ArrowRight, ArrowUpRight, ArrowDownRight, Wallet,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, Area, AreaChart,
} from 'recharts';

/* ─── types ─── */
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

/* ─── constants ─── */
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

const PIE_COLORS = [
  'hsl(145, 45%, 35%)',
  'hsl(38, 60%, 55%)',
  'hsl(220, 60%, 55%)',
  'hsl(25, 50%, 40%)',
  'hsl(0, 65%, 55%)',
  'hsl(270, 50%, 55%)',
];

/* ─── sub-components ─── */
const StatCard = ({ title, value, icon: Icon, color, trend, loading }: {
  title: string; value: string | number; icon: React.ElementType; color: string; trend?: number; loading: boolean;
}) => (
  <Card className="relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
    <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-[3rem] opacity-[0.07] ${color.replace('text-', 'bg-')}`} />
    <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
      <CardTitle className="text-[11px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {title}
      </CardTitle>
      <div className={`flex items-center justify-center h-8 w-8 rounded-lg bg-muted/80 ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent className="px-4 pb-4 pt-0">
      <div className="text-xl sm:text-2xl font-bold tracking-tight">
        {loading ? <span className="inline-block w-16 h-6 bg-muted animate-pulse rounded" /> : value}
      </div>
      {trend !== undefined && !loading && (
        <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
          {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          <span>{Math.abs(trend)}% গত মাসের তুলনায়</span>
        </div>
      )}
    </CardContent>
  </Card>
);

const SectionHeader = ({ title, linkTo, linkLabel }: { title: string; linkTo: string; linkLabel: string }) => (
  <CardHeader className="flex flex-row items-center justify-between pb-3">
    <CardTitle className="text-sm sm:text-base font-semibold">{title}</CardTitle>
    <Button variant="ghost" size="sm" asChild className="text-xs text-primary hover:text-primary/80 gap-1 h-7 px-2">
      <Link to={linkTo}>
        {linkLabel} <ArrowRight className="h-3 w-3" />
      </Link>
    </Button>
  </CardHeader>
);

/* ─── main ─── */
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

  /* ─── chart data ─── */
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
        if (order.status === 'delivered') entry.revenue += order.total_amount || 0;
      }
    });
    return Array.from(map.values());
  }, [allOrders]);

  const statusDistribution = useMemo(() => {
    const countMap = new Map<string, number>();
    allOrders.forEach((o) => countMap.set(o.status, (countMap.get(o.status) || 0) + 1));
    return Array.from(countMap.entries()).map(([status, count]) => ({
      name: statusLabels[status] || status,
      value: count,
    }));
  }, [allOrders]);

  const statCards = [
    { title: 'মোট রেভেনিউ', value: `৳${stats.totalRevenue.toLocaleString('bn-BD')}`, icon: Wallet, color: 'text-emerald-600' },
    { title: 'পেন্ডিং অর্ডার', value: stats.pendingOrders, icon: Clock, color: 'text-orange-500' },
    { title: 'মোট অর্ডার', value: stats.orders, icon: ShoppingBag, color: 'text-blue-600' },
    { title: 'মোট কাস্টমার', value: stats.customers, icon: Users, color: 'text-violet-600' },
    { title: 'ডেলিভারি সম্পন্ন', value: stats.deliveredOrders, icon: TrendingUp, color: 'text-primary' },
    { title: 'মোট প্রোডাক্ট', value: stats.products, icon: Package, color: 'text-secondary' },
  ];

  const chartTooltipStyle = {
    borderRadius: '10px',
    fontSize: '12px',
    border: '1px solid hsl(var(--border))',
    backgroundColor: 'hsl(var(--card))',
    color: 'hsl(var(--foreground))',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">ড্যাশবোর্ড</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">আপনার ব্যবসার সারাংশ</p>
        </div>
        <Badge variant="outline" className="text-[10px] sm:text-xs gap-1.5 px-2.5 py-1 border-primary/30 text-primary">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
          </span>
          লাইভ
        </Badge>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} loading={loading} />
        ))}
      </div>

      {/* Charts Row */}
      {!loading && monthlyData.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Revenue Chart */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base font-semibold">মাসভিত্তিক রেভেনিউ</CardTitle>
            </CardHeader>
            <CardContent className="pl-1 pr-3">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(145, 45%, 35%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(145, 45%, 35%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `৳${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                  <Tooltip formatter={(value: number) => [`৳${value.toLocaleString('bn-BD')}`, 'রেভেনিউ']} contentStyle={chartTooltipStyle} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(145, 45%, 35%)" strokeWidth={2} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Orders Chart */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base font-semibold">মাসভিত্তিক অর্ডার</CardTitle>
            </CardHeader>
            <CardContent className="pl-1 pr-3">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(38, 60%, 55%)" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="hsl(38, 60%, 45%)" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <Tooltip formatter={(value: number) => [value, 'অর্ডার']} contentStyle={chartTooltipStyle} />
                  <Bar dataKey="orders" fill="url(#barGrad)" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Pie */}
          {statusDistribution.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm sm:text-base font-semibold">অর্ডার স্ট্যাটাস বিন্যাস</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {statusDistribution.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string) => [value, name]} contentStyle={chartTooltipStyle} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Bottom Grid: Orders / Top Products / Customers */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card>
          <SectionHeader title="সাম্প্রতিক অর্ডার" linkTo="/admin/orders" linkLabel="সব দেখুন" />
          <CardContent className="pt-0">
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />)}</div>
            ) : recentOrders.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">কোনো অর্ডার নেই</p>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    to={`/admin/orders`}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-lg hover:bg-muted/60 transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{order.order_number}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{order.customer_name}</p>
                    </div>
                    <div className="text-right shrink-0 space-y-0.5">
                      <span className="text-sm font-bold text-primary block">৳{order.total_amount}</span>
                      <Badge variant={statusColors[order.status] || 'secondary'} className="text-[9px] px-1.5 py-0">
                        {statusLabels[order.status] || order.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <SectionHeader title="টপ সেলিং চাল" linkTo="/admin/products" linkLabel="সব দেখুন" />
          <CardContent className="pt-0">
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />)}</div>
            ) : topProducts.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">এখনো কোনো বিক্রি হয়নি</p>
            ) : (
              <div className="space-y-2">
                {topProducts.map((product, i) => (
                  <div key={product.product_name} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/60 transition-colors">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                      i === 0 ? 'bg-secondary/20 text-secondary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {i === 0 ? <Crown className="h-3.5 w-3.5" /> : i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{product.product_name}</p>
                      <p className="text-[11px] text-muted-foreground">{product.total_qty} বার বিক্রি</p>
                    </div>
                    <span className="text-sm font-bold text-primary shrink-0">৳{product.total_revenue.toLocaleString('bn-BD')}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Customers */}
        <Card className="md:col-span-2 lg:col-span-1">
          <SectionHeader title="নতুন কাস্টমার" linkTo="/admin/customers" linkLabel="সব দেখুন" />
          <CardContent className="pt-0">
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />)}</div>
            ) : recentCustomers.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">কোনো কাস্টমার নেই</p>
            ) : (
              <div className="space-y-2">
                {recentCustomers.map((cust) => (
                  <div key={cust.user_id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/60 transition-colors">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                      <UserPlus className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{cust.full_name || 'নাম দেওয়া হয়নি'}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{cust.phone || '—'}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 bg-muted px-2 py-0.5 rounded-full">
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
