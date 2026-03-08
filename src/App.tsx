import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BottomNav from "./components/BottomNav";
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import FAQ from "./pages/FAQ";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import MyOrders from "./pages/MyOrders";
import OrderDetail from "./pages/OrderDetail";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminFAQs from "./pages/admin/AdminFAQs";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminDeletionRequests from "./pages/admin/AdminDeletionRequests";
import ProductDetail from "./pages/ProductDetail";
import Contact from "./pages/Contact";
import Messages from "./pages/Messages";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminPasswordResets from "./pages/admin/AdminPasswordResets";
import AdminPromotions from "./pages/admin/AdminPromotions";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
    <AnimatePresence mode="wait">
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
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/order/:id" element={<OrderDetail />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="faqs" element={<AdminFAQs />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="deletion-requests" element={<AdminDeletionRequests />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="password-resets" element={<AdminPasswordResets />} />
          <Route path="promotions" element={<AdminPromotions />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
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
              <BackButtonHandler />
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">
                  <AnimatedRoutes />
                </main>
                <Footer />
                <BottomNav />
              </div>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;
