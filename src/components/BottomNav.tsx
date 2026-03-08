import { Link, useLocation } from 'react-router-dom';
import { Home, Grid3X3, ShoppingCart, User, Search } from 'lucide-react';
import { useCartStore } from '@/lib/cartStore';
import { useAuth } from '@/contexts/AuthContext';

const BottomNav = () => {
  const location = useLocation();
  const totalItems = useCartStore((s) => s.totalItems());
  const { user } = useAuth();

  // Hide on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  const links = [
    { to: '/', icon: Home, label: 'হোম' },
    { to: '/categories', icon: Grid3X3, label: 'ক্যাটাগরি' },
    { to: '/cart', icon: ShoppingCart, label: 'কার্ট', badge: totalItems },
    { to: user ? '/profile' : '/auth', icon: User, label: user ? 'প্রোফাইল' : 'লগইন' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`relative flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className="relative">
                <link.icon className="h-5 w-5" />
                {link.badge && link.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                    {link.badge > 9 ? '9+' : link.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{link.label}</span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
