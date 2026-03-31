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
  const { showMainButton, hideMainButton, tg } = useTelegram();

  // 1. LOCALSTORAGE BILAN STATE YARATISH
  // Foydalanuvchi sahifani yangilasa ham savat saqlanib qoladi
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("fastfood_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Savatni o'qishda xato:", error);
      return [];
    }
  });

  // 2. SAVAT O'ZGARGAN SARI BROWSER XOTIRASIGA YOZISH
  useEffect(() => {
    localStorage.setItem("fastfood_cart", JSON.stringify(cartItems));
  }, [cartItems]);

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

      // DIQQAT: API dan kelgan ma'lumotni Number() ga o'tkazib himoyalaymiz
      return [
        ...prevItems,
        { ...product, price: Number(product.price), quantity: 1 },
      ];
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
    localStorage.removeItem("fastfood_cart"); // Xotiradan ham tozalaymiz
  }, []);

  // 3. HISOB-KITOBLAR (Xatosiz va aniq)
  const totalPrice = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 0;
      return acc + price * qty;
    }, 0);
  }, [cartItems]);

  const totalQuantity = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      return acc + (Number(item.quantity) || 0);
    }, 0);
  }, [cartItems]);

  // 4. TELEGRAM MAIN BUTTON BOSHQARUVI
  useEffect(() => {
    const isMenuPage =
      window.location.pathname === "/" ||
      window.location.hash === "#/" ||
      window.location.pathname === "";

    // Telegram button bosilganda ishlaydigan funksiya
    const handleCheckout = () => {
      window.location.href = "/checkout";
    };

    if (totalQuantity > 0 && isMenuPage) {
      // tugmaga pulni chiroyli qilib chiqaramiz (masalan: 35 000 so'm)
      const formattedPrice = totalPrice.toLocaleString("uz-UZ");

      showMainButton(`Savatga o'tish • ${formattedPrice} so'm`, handleCheckout);
    } else {
      hideMainButton();
    }

    // Cleanup: Eski event listener'larni tozalab tashlash (Memory leak ni oldini oladi)
    return () => {
      tg.MainButton.offClick(handleCheckout);
    };
  }, [totalQuantity, totalPrice, showMainButton, hideMainButton, tg]);

  // Context qiymatlarini keshlaymiz
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
