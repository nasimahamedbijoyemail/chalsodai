import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LogOut, Shield, Wheat, ChevronRight, Package, MessageSquare, UserCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/cartStore';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import NotificationBell from '@/components/NotificationBell';
import SearchDialog from '@/components/SearchDialog';
import ThemeToggle from '@/components/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navLinks = [
  { to: '/', label: 'হোম' },
  { to: '/categories', label: 'চালের ধরণ' },
  { to: '/faq', label: 'সাধারণ জিজ্ঞাসা' },
  { to: '/contact', label: 'যোগাযোগ' },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const totalItems = useCartStore((s) => s.totalItems());
  const { user, isAdmin, signOut, loading } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/95 backdrop-blur-xl shadow-sm border-b border-border/50'
          : 'bg-background/80 backdrop-blur-md border-b border-transparent'
      }`}
    >
      <div className="container flex h-14 sm:h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors duration-200">
            <Wheat className="h-4.5 w-4.5 text-primary" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base sm:text-lg font-bold text-primary tracking-tight">চাল সদাই</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-primary bg-primary/8'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <SearchDialog />
          <ThemeToggle />
          {user && <NotificationBell />}
          
          {/* Cart */}
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative group">
              <ShoppingCart className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground shadow-sm animate-scale-in">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

          {/* User menu */}
          {!loading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative group">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
                    {user.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <UserCircle className="h-4 w-4" /> আমার প্রোফাইল
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-orders" className="flex items-center gap-2">
                      <Package className="h-4 w-4" /> আমার অর্ডার
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/messages" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" /> মেসেজ
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2 text-primary">
                          <Shield className="h-4 w-4" />
                          অ্যাডমিন প্যানেল
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    লগআউট
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="ml-1 hidden sm:inline-flex">
                <Link to="/auth">লগইন</Link>
              </Button>
            )
          )}

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <div className="relative h-5 w-5">
              <span className={`absolute left-0 block h-0.5 w-5 bg-current rounded transition-all duration-300 ${mobileOpen ? 'top-2.5 rotate-45' : 'top-1'}`} />
              <span className={`absolute left-0 top-2.5 block h-0.5 w-5 bg-current rounded transition-all duration-300 ${mobileOpen ? 'opacity-0 scale-0' : 'opacity-100'}`} />
              <span className={`absolute left-0 block h-0.5 w-5 bg-current rounded transition-all duration-300 ${mobileOpen ? 'top-2.5 -rotate-45' : 'top-4'}`} />
            </div>
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t bg-background/95 backdrop-blur-xl px-4 py-3 space-y-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-primary bg-primary/8'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <span>{link.label}</span>
                <ChevronRight className={`h-4 w-4 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground/40'}`} />
              </Link>
            );
          })}

          {!loading && !user && (
            <div className="pt-2">
              <Button asChild className="w-full" size="sm">
                <Link to="/auth">লগইন / সাইন আপ</Link>
              </Button>
            </div>
          )}

          {user && (
            <div className="pt-2 border-t border-border/50 mt-2 space-y-1">
              <Link to="/profile" className="flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <UserCircle className="h-4 w-4" /> আমার প্রোফাইল
              </Link>
              <Link to="/my-orders" className="flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <Package className="h-4 w-4" /> আমার অর্ডার
              </Link>
              <Link to="/messages" className="flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <MessageSquare className="h-4 w-4" /> মেসেজ
              </Link>
              {isAdmin && (
                <Link to="/admin" className="flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-sm font-medium text-primary hover:bg-primary/8 transition-colors">
                  <Shield className="h-4 w-4" /> অ্যাডমিন প্যানেল
                </Link>
              )}
              <button
                onClick={signOut}
                className="flex items-center gap-2.5 w-full py-2.5 px-3 rounded-lg text-sm text-destructive hover:bg-destructive/8 transition-colors"
              >
                <LogOut className="h-4 w-4" /> লগআউট
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
