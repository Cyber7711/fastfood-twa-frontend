import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";

import { AppProvider } from "./context/AppContext";
import { CartProvider } from "./context/CartContext";

import MenuPage from "./pages/MenuPage";
import CheckoutPage from "./pages/CheckoutPage";

const App = () => {
  console.log("[APP] Dastur ishga tushmoqda... React DOM chizilmoqda.");

  return (
    <AppProvider>
      <CartProvider>
        <HashRouter>
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
        </HashRouter>
      </CartProvider>
    </AppProvider>
  );
};

export default App;
