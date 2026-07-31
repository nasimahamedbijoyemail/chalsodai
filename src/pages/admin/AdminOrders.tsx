import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Loader2, Search, Eye, Phone, MapPin, CreditCard, Calendar,
  Package, User, Hash, Banknote, Truck, Clock, CheckCircle,
  XCircle, ShoppingBag, ArrowUpDown,
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type OrderStatus = Database['public']['Enums']['order_status'];

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  payment_method: string;
  total_amount: number;
  delivery_charge: number;
  status: OrderStatus;
  admin_notes: string | null;
  created_at: string;
  user_id: string | null;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  pack_size: string;
}

// Cash on delivery only — no payment verification stage
const statusLabels: Record<OrderStatus, string> = {
  pending: 'অর্ডার গৃহীত',
  payment_received: 'প্রস্তুত হচ্ছে',
  processing: 'প্রস্তুত হচ্ছে',
  shipped: 'ডেলিভারিতে',
  delivered: 'ডেলিভারি সম্পন্ন',
  cancelled: 'বাতিল',
};

const getStatusLabel = (status: OrderStatus) => statusLabels[status];

const statusIcons: Record<OrderStatus, React.ElementType> = {
  pending: Clock,
  payment_received: Package,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

const statusColorClasses: Record<OrderStatus, string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  payment_received: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  processing: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
  shipped: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  delivered: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
};

const statusBadgeVariants: Record<OrderStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  payment_received: 'default',
  processing: 'default',
  shipped: 'default',
  delivered: 'outline',
  cancelled: 'destructive',
};

const statusFilters: { value: string; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'সব', icon: ShoppingBag },
  { value: 'pending', label: 'নতুন অর্ডার', icon: Clock },
  { value: 'processing', label: 'প্রস্তুত হচ্ছে', icon: Package },
  { value: 'shipped', label: 'ডেলিভারিতে', icon: Truck },
  { value: 'delivered', label: 'সম্পন্ন', icon: CheckCircle },
  { value: 'cancelled', label: 'বাতিল', icon: XCircle },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [sortDesc, setSortDesc] = useState(true);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const openOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setAdminNotes(order.admin_notes || '');
    const { data } = await supabase.from('order_items').select('*').eq('order_id', order.id);
    setOrderItems(data || []);
  };

  const updateOrderStatus = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, admin_notes: adminNotes })
        .eq('id', selectedOrder.id);
      if (error) throw error;

      if (selectedOrder.user_id && newStatus !== selectedOrder.status) {
        await supabase.from('notifications').insert({
          user_id: selectedOrder.user_id,
          title: 'অর্ডার আপডেট',
          message: `আপনার অর্ডার ${selectedOrder.order_number} এর স্ট্যাটাস: ${getStatusLabel(newStatus, selectedOrder.payment_method)}`,
        });
      }

      toast.success('অর্ডার আপডেট হয়েছে');
      setSelectedOrder(null);
      fetchOrders();
    } catch {
      toast.error('আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = useMemo(() => {
    let result = orders.filter((o) => {
      const matchesSearch = o.order_number.toLowerCase().includes(search.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        o.customer_phone.includes(search);
      const matchesFilter = activeFilter === 'all' || o.status === activeFilter;
      return matchesSearch && matchesFilter;
    });
    if (!sortDesc) result = [...result].reverse();
    return result;
  }, [orders, search, activeFilter, sortDesc]);

  // Status counts for filter badges
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    orders.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return counts;
  }, [orders]);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground mt-2">অর্ডার লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">অর্ডার ম্যানেজমেন্ট</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            মোট {orders.length}টি অর্ডার
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setSortDesc(!sortDesc)}>
          <ArrowUpDown className="h-3.5 w-3.5" />
          {sortDesc ? 'নতুন আগে' : 'পুরনো আগে'}
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="অর্ডার নম্বর, নাম বা ফোন দিয়ে খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {statusFilters.map((f) => {
          const count = statusCounts[f.value] || 0;
          const isActive = activeFilter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 border ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
              }`}
            >
              <f.icon className="h-3 w-3" />
              {f.label}
              {count > 0 && (
                <span className={`ml-0.5 text-[10px] px-1.5 py-0 rounded-full ${
                  isActive ? 'bg-primary-foreground/20' : 'bg-muted'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground text-sm">কোনো অর্ডার পাওয়া যায়নি</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredOrders.map((order) => {
            const StatusIcon = statusIcons[order.status];
            return (
              <Card
                key={order.id}
                className="overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group"
                onClick={() => openOrderDetails(order)}
              >
                <CardContent className="p-0">
                  {/* Status indicator bar */}
                  <div className={`h-1 ${statusColorClasses[order.status].split(' ')[0]}`} />

                  <div className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-3">
                      {/* Left: Order info */}
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm sm:text-base group-hover:text-primary transition-colors">
                            {order.order_number}
                          </span>
                          <Badge
                            variant={statusBadgeVariants[order.status]}
                            className="text-[10px] px-1.5 py-0 gap-1"
                          >
                            <StatusIcon className="h-2.5 w-2.5" />
                            {getStatusLabel(order.status)}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {order.customer_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {order.customer_phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(order.created_at).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Banknote className="h-3 w-3" /> ক্যাশ অন ডেলিভারি
                          </span>
                        </div>
                      </div>

                      {/* Right: Price & action */}
                      <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                        <span className="text-lg sm:text-xl font-bold text-primary">৳{order.total_amount}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs gap-1 opacity-60 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => { e.stopPropagation(); openOrderDetails(order); }}
                        >
                          <Eye className="h-3 w-3" /> বিস্তারিত
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
          {selectedOrder && (
            <>
              {/* Dialog Header with status */}
              <div className={`p-4 sm:p-5 border-b ${statusColorClasses[selectedOrder.status]}`}>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-base sm:text-lg">
                      {selectedOrder.order_number}
                    </DialogTitle>
                    <Badge variant={statusBadgeVariants[selectedOrder.status]} className="gap-1 text-xs">
                      {React.createElement(statusIcons[selectedOrder.status], { className: 'h-3 w-3' })}
                      {getStatusLabel(selectedOrder.status)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(selectedOrder.created_at).toLocaleString('bn-BD', {
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </DialogHeader>
              </div>

              <div className="p-4 sm:p-5 space-y-5">
                {/* Customer Info */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">কাস্টমার তথ্য</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2.5">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium">{selectedOrder.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a href={`tel:${selectedOrder.customer_phone}`} className="text-primary hover:underline">
                        {selectedOrder.customer_phone}
                      </a>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <span>{selectedOrder.customer_address}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Payment Info */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">পেমেন্ট তথ্য</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2.5">
                      <Banknote className="h-4 w-4 text-muted-foreground" />
                      <span>ক্যাশ অন ডেলিভারি — ডেলিভারির সময় টাকা সংগ্রহ</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Order Items */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">অর্ডার আইটেম</h4>
                  <div className="rounded-lg border overflow-hidden">
                    {orderItems.map((item, i) => (
                      <div key={item.id} className={`flex items-center justify-between p-3 text-sm ${i > 0 ? 'border-t' : ''}`}>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{item.product_name}</p>
                          <p className="text-xs text-muted-foreground">{item.pack_size} × {item.quantity}</p>
                        </div>
                        <span className="font-semibold shrink-0">৳{item.product_price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="border-t bg-muted/40 p-3 space-y-1">
                      {selectedOrder.delivery_charge > 0 && (
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>ডেলিভারি চার্জ</span>
                          <span>৳{selectedOrder.delivery_charge}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-base">
                        <span>মোট</span>
                        <span className="text-primary">৳{selectedOrder.total_amount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Status Update */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">স্ট্যাটাস আপডেট</h4>
                  <Select value={newStatus} onValueChange={(v) => setNewStatus(v as OrderStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels)
                        .filter(([value]) => value !== 'payment_received')
                        .map(([value, label]) => {
                        const Icon = statusIcons[value as OrderStatus];
                        return (
                          <SelectItem key={value} value={value}>
                            <span className="flex items-center gap-2">
                              <Icon className="h-3.5 w-3.5" />
                              {label}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  <div className="space-y-1.5">
                    <Label className="text-xs">অ্যাডমিন নোট</Label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="অভ্যন্তরীণ নোট লিখুন..."
                      rows={3}
                      className="resize-none text-sm"
                    />
                  </div>

                  <Button onClick={updateOrderStatus} disabled={updating} className="w-full gap-2">
                    {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    আপডেট সেভ করুন
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
