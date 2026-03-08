import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminNotificationBell from '@/components/AdminNotificationBell';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  HelpCircle,
  Bell,
  Loader2,
  MessageCircle,
  Settings,
  Trash2,
  KeyRound,
  Image,
  Menu,
} from 'lucide-react';

const adminLinks = [
  { to: '/admin', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
  { to: '/admin/orders', label: 'অর্ডার', icon: ShoppingBag },
  { to: '/admin/products', label: 'চাল ম্যানেজ', icon: Package },
  { to: '/admin/promotions', label: 'প্রমোশন ব্যানার', icon: Image },
  { to: '/admin/customers', label: 'কাস্টমার', icon: Users },
  { to: '/admin/faqs', label: 'FAQ ম্যানেজ', icon: HelpCircle },
  { to: '/admin/notifications', label: 'নোটিফিকেশন', icon: Bell },
  { to: '/admin/messages', label: 'মেসেজ', icon: MessageCircle },
  { to: '/admin/deletion-requests', label: 'ডিলিট রিকোয়েস্ট', icon: Trash2 },
  { to: '/admin/password-resets', label: 'পাসওয়ার্ড রিসেট', icon: KeyRound },
  { to: '/admin/settings', label: 'সেটিংস', icon: Settings },
];

const AdminLayout = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeLabel = adminLinks.find((l) => l.to === location.pathname)?.label || 'অ্যাডমিন';

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen">
      <div className="container py-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-20 rounded-xl border bg-card p-4">
              <div className="flex items-center justify-between mb-4 px-3">
                <h2 className="font-bold text-lg">অ্যাডমিন প্যানেল</h2>
                <AdminNotificationBell />
              </div>
              <nav className="space-y-1">
                {adminLinks.map((link) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Mobile top bar + Sheet nav */}
          <div className="md:hidden w-full mb-2">
            <div className="flex items-center justify-between gap-2 rounded-xl border bg-card p-3">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Menu className="h-4 w-4" />
                    <span className="font-semibold text-sm truncate">{activeLabel}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <SheetHeader className="p-4 pb-2 border-b">
                    <SheetTitle className="text-left">অ্যাডমিন প্যানেল</SheetTitle>
                  </SheetHeader>
                  <nav className="p-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-80px)]">
                    {adminLinks.map((link) => {
                      const isActive = location.pathname === link.to;
                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={() => setSheetOpen(false)}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          <link.icon className="h-4 w-4" />
                          {link.label}
                        </Link>
                      );
                    })}
                  </nav>
                </SheetContent>
              </Sheet>
              <AdminNotificationBell />
            </div>
          </div>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
