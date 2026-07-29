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
import { Separator } from '@/components/ui/separator';
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
  Wheat,
  ChevronRight,
  Home,
  Search,
} from 'lucide-react';

const adminLinks = [
  { to: '/admin', label: 'ড্যাশবোর্ড', icon: LayoutDashboard, group: 'main' },
  { to: '/admin/orders', label: 'অর্ডার', icon: ShoppingBag, group: 'main' },
  { to: '/admin/products', label: 'চাল ম্যানেজ', icon: Package, group: 'main' },
  { to: '/admin/promotions', label: 'প্রমোশন ব্যানার', icon: Image, group: 'main' },
  { to: '/admin/customers', label: 'কাস্টমার', icon: Users, group: 'main' },
  { to: '/admin/faqs', label: 'FAQ ম্যানেজ', icon: HelpCircle, group: 'tools' },
  { to: '/admin/seo', label: 'SEO স্ট্যাটাস', icon: Search, group: 'tools' },
  { to: '/admin/notifications', label: 'নোটিফিকেশন', icon: Bell, group: 'tools' },
  { to: '/admin/messages', label: 'মেসেজ', icon: MessageCircle, group: 'tools' },
  { to: '/admin/deletion-requests', label: 'ডিলিট রিকোয়েস্ট', icon: Trash2, group: 'tools' },
  { to: '/admin/password-resets', label: 'পাসওয়ার্ড রিসেট', icon: KeyRound, group: 'tools' },
  { to: '/admin/settings', label: 'সেটিংস', icon: Settings, group: 'settings' },
];

const NavItem = ({ link, isActive, onClick }: { link: typeof adminLinks[0]; isActive: boolean; onClick?: () => void }) => (
  <Link
    to={link.to}
    onClick={onClick}
    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group ${
      isActive
        ? 'bg-primary/10 text-primary shadow-sm'
        : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
    }`}
  >
    <link.icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
    <span className="flex-1">{link.label}</span>
    {isActive && <ChevronRight className="h-3.5 w-3.5 text-primary/60" />}
  </Link>
);

const SidebarNav = ({ onLinkClick }: { onLinkClick?: () => void }) => {
  const location = useLocation();
  const mainLinks = adminLinks.filter(l => l.group === 'main');
  const toolLinks = adminLinks.filter(l => l.group === 'tools');
  const settingsLinks = adminLinks.filter(l => l.group === 'settings');

  return (
    <nav className="space-y-4">
      <div className="space-y-0.5">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1.5">প্রধান</p>
        {mainLinks.map(link => (
          <NavItem key={link.to} link={link} isActive={location.pathname === link.to} onClick={onLinkClick} />
        ))}
      </div>
      <Separator className="opacity-50" />
      <div className="space-y-0.5">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1.5">টুলস</p>
        {toolLinks.map(link => (
          <NavItem key={link.to} link={link} isActive={location.pathname === link.to} onClick={onLinkClick} />
        ))}
      </div>
      <Separator className="opacity-50" />
      <div className="space-y-0.5">
        {settingsLinks.map(link => (
          <NavItem key={link.to} link={link} isActive={location.pathname === link.to} onClick={onLinkClick} />
        ))}
      </div>
    </nav>
  );
};

const AdminLayout = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeLabel = adminLinks.find((l) => l.to === location.pathname)?.label || 'অ্যাডমিন';

  useEffect(() => {
    if (!loading && !isAdmin) navigate('/');
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-4 sm:py-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-60 lg:w-64 shrink-0">
            <div className="sticky top-20 rounded-xl border bg-card/80 backdrop-blur-sm overflow-hidden">
              {/* Sidebar Header */}
              <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Wheat className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-bold text-sm">অ্যাডমিন প্যানেল</h2>
                      <p className="text-[10px] text-muted-foreground">চালসদাই ম্যানেজমেন্ট</p>
                    </div>
                  </div>
                  <AdminNotificationBell />
                </div>
              </div>

              {/* Nav Links */}
              <div className="p-3">
                <SidebarNav />
              </div>

              {/* Back to store */}
              <div className="p-3 pt-0">
                <Button variant="outline" size="sm" asChild className="w-full text-xs gap-2 h-8">
                  <Link to="/"><Home className="h-3.5 w-3.5" /> স্টোরে ফিরুন</Link>
                </Button>
              </div>
            </div>
          </aside>

          {/* Mobile top bar */}
          <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-b px-4 py-2.5">
            <div className="flex items-center justify-between">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 -ml-2">
                    <Menu className="h-4 w-4" />
                    <span className="font-semibold text-sm truncate">{activeLabel}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <SheetHeader className="p-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
                    <SheetTitle className="text-left flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Wheat className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">অ্যাডমিন প্যানেল</p>
                        <p className="text-[10px] text-muted-foreground font-normal">চালসদাই ম্যানেজমেন্ট</p>
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="p-3 overflow-y-auto max-h-[calc(100vh-100px)]">
                    <SidebarNav onLinkClick={() => setSheetOpen(false)} />
                    <div className="mt-4">
                      <Button variant="outline" size="sm" asChild className="w-full text-xs gap-2 h-8" onClick={() => setSheetOpen(false)}>
                        <Link to="/"><Home className="h-3.5 w-3.5" /> স্টোরে ফিরুন</Link>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              <AdminNotificationBell />
            </div>
          </div>

          {/* Content */}
          <main className="flex-1 min-w-0 pt-14 md:pt-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
