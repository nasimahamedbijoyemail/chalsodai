import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Loader2, Search, Eye } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type OrderStatus = Database['public']['Enums']['order_status'];

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  bkash_number: string;
  total_amount: number;
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

const statusLabels: Record<OrderStatus, string> = {
  pending: 'পেমেন্ট অপেক্ষায়',
  payment_received: 'পেমেন্ট গৃহীত',
  processing: 'প্রস্তুত হচ্ছে',
  shipped: 'ডেলিভারিতে',
  delivered: 'ডেলিভারি সম্পন্ন',
  cancelled: 'বাতিল',
};

const statusColors: Record<OrderStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  payment_received: 'default',
  processing: 'default',
  shipped: 'default',
  delivered: 'outline',
  cancelled: 'destructive',
};

const statusFilters: { value: string; label: string }[] = [
  { value: 'all', label: 'সব' },
  { value: 'pending', label: 'পেন্ডিং' },
  { value: 'payment_received', label: 'পেমেন্ট গৃহীত' },
  { value: 'processing', label: 'প্রস্তুত হচ্ছে' },
  { value: 'shipped', label: 'ডেলিভারিতে' },
  { value: 'delivered', label: 'সম্পন্ন' },
  { value: 'cancelled', label: 'বাতিল' },
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

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setAdminNotes(order.admin_notes || '');

    const { data } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);
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

      // Send notification to customer
      if (selectedOrder.user_id && newStatus !== selectedOrder.status) {
        await supabase.from('notifications').insert({
          user_id: selectedOrder.user_id,
          title: 'অর্ডার আপডেট',
          message: `আপনার অর্ডার ${selectedOrder.order_number} এর স্ট্যাটাস: ${statusLabels[newStatus]}`,
        });
      }

      toast.success('অর্ডার আপডেট হয়েছে');
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      toast.error('আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search)
  );

  if (loading) {
    return (
      <div className="py-10 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">অর্ডার ম্যানেজমেন্ট</h1>

      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="অর্ডার নম্বর বা নাম দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">কোনো অর্ডার পাওয়া যায়নি</p>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div key={order.id} className="rounded-xl border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-bold">{order.order_number}</p>
                  <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(order as any).payment_method === 'cod' ? 'ক্যাশ অন ডেলিভারি' : `ট্রানজেকশন আইডি: ${order.bkash_number}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-primary">৳{order.total_amount}</p>
                    <Badge variant={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => openOrderDetails(order)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>অর্ডার: {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid gap-2 text-sm">
                <p><strong>নাম:</strong> {selectedOrder.customer_name}</p>
                <p><strong>ফোন:</strong> {selectedOrder.customer_phone}</p>
                <p><strong>ঠিকানা:</strong> {selectedOrder.customer_address}</p>
                <p><strong>পেমেন্ট:</strong> {(selectedOrder as any).payment_method === 'cod' ? 'ক্যাশ অন ডেলিভারি' : 'বিকাশ'}</p>
                {selectedOrder.bkash_number && <p><strong>ট্রানজেকশন আইডি:</strong> {selectedOrder.bkash_number}</p>}
                <p><strong>তারিখ:</strong> {new Date(selectedOrder.created_at).toLocaleDateString('bn-BD')}</p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">অর্ডার আইটেম</h4>
                <div className="space-y-2 text-sm">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.product_name} ({item.pack_size}) × {item.quantity}</span>
                      <span>৳{item.product_price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 font-bold flex justify-between">
                    <span>মোট</span>
                    <span>৳{selectedOrder.total_amount}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="space-y-2">
                  <Label>স্ট্যাটাস পরিবর্তন</Label>
                  <Select value={newStatus} onValueChange={(v) => setNewStatus(v as OrderStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>অ্যাডমিন নোট</Label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="অভ্যন্তরীণ নোট..."
                    rows={3}
                  />
                </div>

                <Button onClick={updateOrderStatus} disabled={updating} className="w-full">
                  {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  আপডেট করুন
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
