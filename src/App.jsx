import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { CartProvider } from './CartContext';
import Navbar from './components/Navbar';
import Home from './page/Home';
import Contact from './page/Contact';
import Items from './page/Items';
import Cart from './page/Cart';
import Login from './components/Login';
import Signup from './components/Signup';
import Logout from './components/Logout';
import CheckoutPage from './components/Checkout';
import MyOrders from './components/OrderPage';
import VerifyPaymentPage from './page/VerifyPaymentPage';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
};

// Protected Route wrapper
const ProtectedRoute = ({ isAuthenticated, children }) =>
  isAuthenticated ? children : <Navigate replace to="/login" />;

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem('authToken'))
  );

  // Listen for custom auth change events
  useEffect(() => {
    const handler = () => setIsAuthenticated(Boolean(localStorage.getItem('authToken')));
    window.addEventListener('authStateChanged', handler);
    return () => window.removeEventListener('authStateChanged', handler);
  }, []);

  return (
    <CartProvider>
      <ScrollToTop />
      <Navbar isAuthenticated={isAuthenticated} />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/items" element={<Items />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/logout" element={<Logout />} />

        {/* Protected */}
        <Route path="/cart" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute isAuthenticated={isAuthenticated}><CheckoutPage /></ProtectedRoute>} />
        <Route path="/myorders" element={<ProtectedRoute isAuthenticated={isAuthenticated}><MyOrders /></ProtectedRoute>} />
        <Route path="/myorders/verify" element={<ProtectedRoute isAuthenticated={isAuthenticated}><VerifyPaymentPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </CartProvider>
  );
};

export default App;