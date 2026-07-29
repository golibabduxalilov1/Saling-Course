import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { captureUtm } from './utils/utm';

import PublicLayout from './components/PublicLayout';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';

import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import ProductForm from './pages/admin/ProductForm';
import Categories from './pages/admin/Categories';
import Orders from './pages/admin/Orders';
import OrderDetail from './pages/admin/OrderDetail';
import Customers from './pages/admin/Customers';
import PromoCodes from './pages/admin/PromoCodes';
import AdLinks from './pages/admin/AdLinks';
import Reviews from './pages/admin/Reviews';
import Leads from './pages/admin/Leads';
import AbandonedCheckouts from './pages/admin/AbandonedCheckouts';
import Analytics from './pages/admin/Analytics';

function App() {
  useEffect(() => {
    captureUtm();
  }, []);

  return (
    <BrowserRouter>
      <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/katalog" element={<Catalog />} />
              <Route path="/mahsulot/:slug" element={<ProductDetail />} />
              <Route path="/savat" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/buyurtma/:orderNumber" element={<OrderSuccess />} />
            </Route>

            <Route path="/admin/login" element={<Login />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:id" element={<ProductForm />} />
              <Route path="categories" element={<Categories />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="customers" element={<Customers />} />
              <Route path="promo-codes" element={<PromoCodes />} />
              <Route path="ad-links" element={<AdLinks />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="leads" element={<Leads />} />
              <Route path="abandoned-checkouts" element={<AbandonedCheckouts />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
