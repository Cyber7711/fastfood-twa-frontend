import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { CartProvider } from "./context/CartContext";
import PageWrapper from "./components/PageWrapper";

import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AdminPage from "./pages/AdminPage";

const App = () => {
  return (
    // DIQQAT: BrowserRouter hamma narsani o'rab turishi kerak!
    <BrowserRouter>
      <AppProvider>
        <CartProvider>
          <Routes>
            <Route
              path="/"
              element={
                <PageWrapper>
                  <MenuPage />
                </PageWrapper>
              }
            />
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
        </CartProvider>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
