import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";

import { Suspense, lazy } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BottomNav from "./components/BottomNav";
import ErrorBoundary from "./components/ErrorBoundary";
import PageSkeleton from "./components/PageSkeleton";
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import FAQ from "./pages/FAQ";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import MyOrders from "./pages/MyOrders";
import OrderDetail from "./pages/OrderDetail";
import ProductDetail from "./pages/ProductDetail";
import Contact from "./pages/Contact";
import Messages from "./pages/Messages";
import ForgotPassword from "./pages/ForgotPassword";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";

// Lazy load admin routes
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminFAQs = lazy(() => import("./pages/admin/AdminFAQs"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications"));
const AdminDeletionRequests = lazy(() => import("./pages/admin/AdminDeletionRequests"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminPasswordResets = lazy(() => import("./pages/admin/AdminPasswordResets"));
const AdminPromotions = lazy(() => import("./pages/admin/AdminPromotions"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 min cache
      refetchOnWindowFocus: false,
    },
  },
});

const BackButtonHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (location.pathname === '/') {
        window.history.pushState(null, '', '/');
      }
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.pathname]);

  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Index />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/install" element={<Install />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/my-orders" element={<MyOrders />} />
      <Route path="/order/:id" element={<OrderDetail />} />
      <Route path="/admin" element={
        <Suspense fallback={<PageSkeleton />}>
          <AdminLayout />
        </Suspense>
      }>
        <Route index element={<Suspense fallback={<PageSkeleton />}><AdminDashboard /></Suspense>} />
        <Route path="orders" element={<Suspense fallback={<PageSkeleton />}><AdminOrders /></Suspense>} />
        <Route path="products" element={<Suspense fallback={<PageSkeleton />}><AdminProducts /></Suspense>} />
        <Route path="customers" element={<Suspense fallback={<PageSkeleton />}><AdminCustomers /></Suspense>} />
        <Route path="faqs" element={<Suspense fallback={<PageSkeleton />}><AdminFAQs /></Suspense>} />
        <Route path="notifications" element={<Suspense fallback={<PageSkeleton />}><AdminNotifications /></Suspense>} />
        <Route path="messages" element={<Suspense fallback={<PageSkeleton />}><AdminMessages /></Suspense>} />
        <Route path="deletion-requests" element={<Suspense fallback={<PageSkeleton />}><AdminDeletionRequests /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={<PageSkeleton />}><AdminSettings /></Suspense>} />
        <Route path="password-resets" element={<Suspense fallback={<PageSkeleton />}><AdminPasswordResets /></Suspense>} />
        <Route path="promotions" element={<Suspense fallback={<PageSkeleton />}><AdminPromotions /></Suspense>} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <ErrorBoundary>
                <BackButtonHandler />
                <div className="flex min-h-screen flex-col">
                  <Navbar />
                  <main className="flex-1">
                    <AnimatedRoutes />
                  </main>
                  <Footer />
                  <BottomNav />
                </div>
              </ErrorBoundary>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;
