import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useTelegram } from "../hooks/useTelegram";
import { useNavigate } from "react-router-dom";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { showMainButton, hideMainButton, tg } = useTelegram();
  const navigate = useNavigate();

  // 1. LOCALSTORAGE BILAN STATE YARATISH
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

  // 🔥 YORDAMCHI FUNKSIYA: Bitta mahsulot uchun noyob ID yaratish (Modifikatorlarni hisobga olib)
  const generateCartItemId = (product) => {
    // Agar qo'shimchalar bo'lmasa, shunchaki mahsulot ID si qolaveradi
    if (!product.selectedModifiers || product.selectedModifiers.length === 0) {
      return product._id;
    }
    // Agar qo'shimchalar bo'lsa, ularning nomini ID ga qoshib yozamiz: "12345-pishloq-ketchup"
    const modString = product.selectedModifiers
      .map((m) => m.name.replace(/\s+/g, ""))
      .sort()
      .join("-");
    return `${product._id}-${modString}`;
  };

  // 3. SAVATGA QO'SHISH (Mukammallashtirilgan)
  const addToCart = useCallback((product) => {
    setCartItems((prevItems) => {
      // 1. Shu kiritilayotgan kombinatsiya uchun ID yaratamiz yoki kelganini ishlatamiz
      const cartItemId = product.cartItemId || generateCartItemId(product);

      const existingItem = prevItems.find(
        (item) => item.cartItemId === cartItemId,
      );

      if (existingItem) {
        // Agar huddi shunday qo'shimchali burger oldin qo'shilgan bo'lsa, sonini oshiramiz
        return prevItems.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      // 2. Modifikatorlar narxini ham hisoblab bitta "Yakuniy dona narx" ni chiqaramiz
      const basePrice = Number(product.price) || 0;
      const modsPrice =
        product.selectedModifiers?.reduce(
          (sum, mod) => sum + (Number(mod.price) || 0),
          0,
        ) || 0;
      const finalUnitPrice = basePrice + modsPrice;

      // 3. Yangi mahsulot sifatida qo'shamiz
      return [
        ...prevItems,
        {
          ...product,
          cartItemId, // 🔥 Endi bizning yangi takrorlanmas kalitimiz shu!
          unitPrice: finalUnitPrice, // Asosiy narx + qo'shimchalar narxi
          quantity: 1,
        },
      ];
    });
  }, []);

  // 4. SAVATDAN OLIB TASHLASH / KAMAYTIRISH
  const removeFromCart = useCallback((cartItemIdToRemove) => {
    // DIQQAT: Endi productId emas, balki cartItemId ni kutamiz
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.cartItemId === cartItemIdToRemove,
      );

      if (!existingItem) return prevItems;

      if (existingItem.quantity === 1) {
        return prevItems.filter(
          (item) => item.cartItemId !== cartItemIdToRemove,
        );
      }

      return prevItems.map((item) =>
        item.cartItemId === cartItemIdToRemove
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      );
    });
  }, []);

  // Butun savatni tozalash
  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem("fastfood_cart");
  }, []);

  // 5. HISOB-KITOBLAR (Xatosiz va aniq)
  const totalPrice = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      // Endi oddiy price emas, balki qo'shimchalar bilan qo'shilgan unitPrice ni ko'paytiramiz
      const price = Number(item.unitPrice) || Number(item.price) || 0;
      const qty = Number(item.quantity) || 0;
      return acc + price * qty;
    }, 0);
  }, [cartItems]);

  const totalQuantity = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      return acc + (Number(item.quantity) || 0);
    }, 0);
  }, [cartItems]);

  // 6. TELEGRAM MAIN BUTTON BOSHQARUVI
  useEffect(() => {
    const isMenuPage =
      window.location.pathname === "/" ||
      window.location.hash === "#/" ||
      window.location.pathname === "";

    const handleCheckout = () => {
      navigate("/cart");
    };

    if (totalQuantity > 0 && isMenuPage) {
      const formattedPrice = totalPrice.toLocaleString("uz-UZ");
      showMainButton(`Savatga o'tish • ${formattedPrice} so'm`, handleCheckout);
    } else {
      hideMainButton();
    }

    return () => {
      tg.MainButton.offClick(handleCheckout);
    };
  }, [totalQuantity, totalPrice, showMainButton, hideMainButton, tg, navigate]);

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
