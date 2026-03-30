import React, { createContext, useState, useEffect } from "react";
import { useTelegram } from "../hooks/useTelegram";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { showMainButton, hideMainButton, tg } = useTelegram();

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item._id === product._id);
      if (existingItem) {
        return prevItems.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item._id === productId);
      if (!existingItem) return prevItems;
      if (existingItem.quantity === 1) {
        return prevItems.filter((item) => item._id !== productId);
      }
      return prevItems.map((item) =>
        item._id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      );
    });
  };

  // BU FUNKSIYA QOLIB KETGAN EDI:
  const clearCart = () => {
    console.log("[CART CONTEXT] 🧹 Savat tozalandi.");
    setCartItems([]);
  };

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // MainButton boshqaruvi
  useEffect(() => {
    if (totalQuantity > 0) {
      // Diqqat: Bu tugma faqat "/" (Menyu) sahifasida chiqishi kerak.
      // CheckoutPage o'z tugmasini o'zi boshqaradi.
      if (window.location.hash === "#/" || window.location.pathname === "/") {
        showMainButton(
          `Savatga o'tish: ${totalPrice.toLocaleString()} so'm`,
          () => {
            window.location.href = window.location.origin + "/checkout";
          },
        );
      }
    } else {
      hideMainButton();
    }
    return () => tg.MainButton.offClick();
  }, [
    cartItems,
    totalPrice,
    totalQuantity,
    showMainButton,
    hideMainButton,
    tg,
  ]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        totalPrice,
        totalQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
