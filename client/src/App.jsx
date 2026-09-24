import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext.jsx';
import { ToastProvider, useToast } from './context/ToastContext.jsx';
import { ProductsProvider } from './context/ProductsContext.jsx';
import { UIProvider } from './context/UIContext.jsx';
import { AdminProvider } from './context/AdminContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import Ticker from './components/Ticker.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Rail from './components/Rail.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import BookingModal from './components/Booking.jsx';
import WhatsAppButton from './components/WhatsAppButton.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import About from './pages/About.jsx';
import Book from './pages/Book.jsx';
import Contact from './pages/Contact.jsx';
import FAQs from './pages/FAQs.jsx';
import ShippingReturns from './pages/ShippingReturns.jsx';
import HairCareGuide from './pages/HairCareGuide.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Account from './pages/Account.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminLayout, { RequireAdmin } from './pages/admin/AdminLayout.jsx';
import AdminOverview from './pages/admin/AdminOverview.jsx';
import AdminProducts from './pages/admin/AdminProducts.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';
import AdminCustomers from './pages/admin/AdminCustomers.jsx';
import AdminAppointments from './pages/admin/AdminAppointments.jsx';
import AdminMessages from './pages/admin/AdminMessages.jsx';
import AdminNewsletter from './pages/admin/AdminNewsletter.jsx';
import AdminSettings from './pages/admin/AdminSettings.jsx';

function CheckoutRedirectHandler() {
  const setToast = useToast();
  const { clear } = useCart();

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('checkout') === 'success') {
      setToast('Payment successful — thank you! A confirmation email is on its way.');
      clear();
      window.history.replaceState({}, '', '/');
    } else if (p.get('checkout') === 'cancel') {
      setToast('Checkout cancelled — your bag is still saved.');
      window.history.replaceState({}, '', '/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function StorefrontShell() {
  const { pathname } = useLocation();
  return (
    <>
      <Ticker />
      <Header />
      {pathname === '/' && <Rail />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/book" element={<Book />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/shipping-returns" element={<ShippingReturns />} />
        <Route path="/hair-care-guide" element={<HairCareGuide />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account" element={<Account />} />
      </Routes>
      <Footer />
      <CartDrawer />
      <BookingModal />
      <WhatsAppButton />
    </>
  );
}

function Shell() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  return (
    <>
      <ScrollToTop />
      {!isAdmin && <CheckoutRedirectHandler />}
      {isAdmin ? (
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
            <Route element={<AdminLayout />}>
              <Route path="/admin/overview" element={<AdminOverview />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/customers" element={<AdminCustomers />} />
              <Route path="/admin/appointments" element={<AdminAppointments />} />
              <Route path="/admin/messages" element={<AdminMessages />} />
              <Route path="/admin/newsletter" element={<AdminNewsletter />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Routes>
      ) : (
        <StorefrontShell />
      )}
    </>
  );
}

export default function App() {
  return (
    <AdminProvider>
      <AuthProvider>
        <SettingsProvider>
          <CartProvider>
            <ToastProvider>
              <ProductsProvider>
                <UIProvider>
                  <Shell />
                </UIProvider>
              </ProductsProvider>
            </ToastProvider>
          </CartProvider>
        </SettingsProvider>
      </AuthProvider>
    </AdminProvider>
  );
}
