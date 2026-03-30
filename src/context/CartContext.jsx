import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useTelegram } from "../hooks/useTelegram";

// Context yaratish
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { showMainButton, hideMainButton, tg } = useTelegram();

  // Savatga qo'shish
  const addToCart = useCallback((product) => {
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
  }, []);

  // Savatdan olib tashlash / kamaytirish
  const removeFromCart = useCallback((productId) => {
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
  }, []);

  // Butun savatni tozalash
  const clearCart = useCallback(() => {
    console.log("[CART CONTEXT] 🧹 Savat tozalandi.");
    setCartItems([]);
  }, []);

  // Hisob-kitoblar (optimallashtirilgan)
  const totalPrice = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  const totalQuantity = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  // Telegram Main Button boshqaruvi
  useEffect(() => {
    // Faqat menyu sahifasida Main Button chiqsin
    const isMenuPage =
      window.location.pathname === "/" ||
      window.location.hash === "#/" ||
      window.location.pathname === "";

    if (totalQuantity > 0 && isMenuPage) {
      showMainButton(
        `Savatga o'tish • ${totalPrice.toLocaleString("ru-RU")} so'm`,
        () => {
          window.location.href = "/checkout";
        },
      );
    } else {
      hideMainButton();
    }

    // Cleanup
    return () => {
      tg.MainButton.offClick();
    };
  }, [totalQuantity, totalPrice, showMainButton, hideMainButton, tg]);

  const contextValue = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      totalPrice,
      totalQuantity,
    }),
    [
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      totalPrice,
      totalQuantity,
    ],
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};
