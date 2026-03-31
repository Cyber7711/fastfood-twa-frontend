import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { CartProvider } from "./context/CartContext";
import PageWrapper from "./components/PageWrapper";

// Sahifalar
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage"; // SAVAT SAHIFASI QO'SHILDI ✅
import CheckoutPage from "./pages/CheckoutPage";
import AdminPage from "./pages/AdminPage";

const App = () => {
  return (
    <AppProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <PageWrapper>
                  <MenuPage />
                </PageWrapper>
              }
            />
            {/* SAVAT YO'NALISHI QO'SHILDI ✅ */}
            <Route
              path="/cart"
              element={
                <PageWrapper>
                  <CartPage />
                </PageWrapper>
              }
            />
            <Route
              path="/checkout"
              element={
                <PageWrapper>
                  <CheckoutPage />
                </PageWrapper>
              }
            />
            <Route
              path="/admin"
              element={
                <PageWrapper>
                  <AdminPage />
                </PageWrapper>
              }
            />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AppProvider>
  );
};

export default App;
