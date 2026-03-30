import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { CartProvider } from "./context/CartContext";
import PageWrapper from "./components/PageWrapper";
import MenuPage from "./pages/MenuPage";
import CheckoutPage from "./pages/CheckOutPage";
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
