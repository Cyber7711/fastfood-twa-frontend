import React from "react";
// HashRouter o'rniga BrowserRouter chaqiramiz:
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AppProvider } from "./context/AppContext";
import { CartProvider } from "./context/CartContext";

import MenuPage from "./pages/MenuPage";
import CheckoutPage from "./pages/CheckOutPage";

const App = () => {
  console.log("[APP] Dastur ishga tushmoqda... React DOM chizilmoqda.");

  return (
    <AppProvider>
      <CartProvider>
        {/* HashRouter o'rniga BrowserRouter ishlatamiz */}
        <BrowserRouter>
          <div
            className="app-container"
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              backgroundColor: "#f5f5f5",
              minHeight: "100vh",
            }}
          >
            <Routes>
              <Route path="/" element={<MenuPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
            </Routes>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AppProvider>
  );
};

export default App;
