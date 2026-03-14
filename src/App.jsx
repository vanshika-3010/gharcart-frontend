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
import CheckoutPage from './components/Checkout'
import MyOrders from './components/OrderPage'
import VerifyPaymentPage from './page/VerifyPaymentPage';


// ScrollToTop component: listens to route changes and scrolls window to top
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => {
  // Track auth state here
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem('authToken'))
  );

  // Whenever we dispatch the custom event, update this flag
  useEffect(() => {
    const handler = () => {
      setIsAuthenticated(Boolean(localStorage.getItem('authToken')));
    };
    window.addEventListener('authStateChanged', handler);
    return () => window.removeEventListener('authStateChanged', handler);
  }, []);

  return (
    <CartProvider>
      <ScrollToTop />
      <Navbar isAuthenticated={isAuthenticated} />

      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/items" element={<Items />} />

        {/* Protected Cart: only /cart checks auth */}
        <Route
          path="/cart"
          element={
            isAuthenticated ? <Cart /> : <Navigate replace to="/login" />
          }
        />
        <Route path="/checkout" element={<CheckoutPage />} />

        {/* Payment verification */}
        <Route path="/myorders/verify" element={<VerifyPaymentPage />} />
        <Route path="/myorders" element={<MyOrders />} />

        {/* Auth routes (always available) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Logout page (if you still want a dedicated route) */}
        <Route path="/logout" element={<Logout />} />

        {/* Fallback: redirect to home */}
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </CartProvider>
  );
};

export default App;
