import React, { createContext, useState, useEffect } from "react";
import { useTelegram } from "../hooks/useTelegram";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Telegram hook'ini chaqiramiz (Tugmani boshqarish uchun)
  const { showMainButton, hideMainButton, tg } = useTelegram();

  // 1. Savatga mahsulot qo'shish
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      // Mahsulot savatda bor-yo'qligini tekshiramiz
      const existingItem = prevItems.find((item) => item._id === product._id);

      if (existingItem) {
        console.log(
          `[CART CONTEXT] 🔄 Mahsulot soni oshirildi: ${product.name}`,
        );
        return prevItems.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      console.log(
        `[CART CONTEXT] ➕ Yangi mahsulot qo'shildi: ${product.name}`,
      );
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  // 2. Savatdan mahsulotni ayirish / o'chirish
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item._id === productId);

      if (existingItem.quantity === 1) {
        console.log(`[CART CONTEXT] ❌ Mahsulot o'chirildi: ID=${productId}`);
        return prevItems.filter((item) => item._id !== productId);
      }

      console.log(
        `[CART CONTEXT] ➖ Mahsulot soni kamaytirildi: ID=${productId}`,
      );
      return prevItems.map((item) =>
        item._id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      );
    });
  };

  // 3. Jami hisob-kitoblar (Doimiy yangilanib turuvchi o'zgaruvchilar)
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // 4. TELEGRAM BILAN ALOQA (Eng sehrli qismi!)
  useEffect(() => {
    // Agar savatda narsalar bo'lsa, Telegramning pastki tugmasini yoqamiz
    if (totalQuantity > 0) {
      console.log(
        `[CART CONTEXT] 🔘 MainButton yoqildi. Jami summa: ${totalPrice}`,
      );

      showMainButton(
        `Savatga o'tish: ${totalPrice.toLocaleString()} so'm`,
        () => {
          console.log(
            `[CART CONTEXT] 🚀 MainButton bosildi! Checkout sahifasiga o'tish kerak.`,
          );
          // Kelajakda shu yerda Route orqali "navigate('/checkout')" qilamiz
        },
      );
    } else {
      // Savat bo'sh bo'lsa, tugmani yashiramiz
      console.log(`[CART CONTEXT] 🚫 Savat bo'sh. MainButton yashirildi.`);
      hideMainButton();
    }

    // Unmount bo'lganda click eventlarni tozalab tashlaymiz (Memory leak oldini olish)
    return () => {
      tg.MainButton.offClick();
    };
  }, [cartItems, totalPrice, showMainButton, hideMainButton, tg]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        totalPrice,
        totalQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
