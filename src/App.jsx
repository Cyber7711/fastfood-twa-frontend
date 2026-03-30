import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageWrapper from "./components/PageWrapper"; // Yangi wrapper
import MenuPage from "./pages/MenuPage";
import CheckoutPage from "./pages/CheckoutPage";

const App = () => {
  return (
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
      </Routes>
    </BrowserRouter>
  );
};

export default App;
