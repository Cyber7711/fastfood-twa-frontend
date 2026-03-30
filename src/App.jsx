import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";

// 1. Context Providerlarni chaqiramiz
import { AppProvider } from "./context/AppContext";
import { CartProvider } from "./context/CartContext";

// 2. Sahifalarni chaqiramiz
import MenuPage from "./pages/MenuPage";
import CheckoutPage from "./pages/CheckoutPage"; // <-- IZOHDAN CHIQARDIK!

const App = () => {
  console.log("[APP] Dastur ishga tushmoqda... React DOM chizilmoqda.");

  return (
    /* 1-qavat: Telegram va Do'kon ID sini (tenantId) butun dasturga tarqatadi */
    <AppProvider>
      /* 2-qavat: Savat tizimi (Buyurtmalar xotirasi) */
      <CartProvider>
        /* 3-qavat: Sahifalar o'rtasida xavfsiz harakatlanish */
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
            {/* Marshrutlar (Routes) ni belgilaymiz */}
            <Routes>
              {/* Asosiy (bosh) sahifaga MenuPage ni bog'ladik */}
              <Route path="/" element={<MenuPage />} />

              {/* Checkout sahifasi */}
              <Route path="/checkout" element={<CheckoutPage />} />
            </Routes>
          </div>
        </HashRouter>
      </CartProvider>
    </AppProvider>
  );
};

export default App;
