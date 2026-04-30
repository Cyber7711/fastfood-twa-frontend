import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useTelegram } from "../hooks/useTelegram";
import { useNavigate, useLocation } from "react-router-dom";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { showMainButton, hideMainButton, tg } = useTelegram();
  const navigate = useNavigate();
  const location = useLocation(); // URL o'zgarishini kuzatish uchun

  // 1. LOCALSTORAGE BILAN STATE (Xatolikka chidamli)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem("fastfood_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("fastfood_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // 2. NOYOB ID GENERATOR (Xavfsiz hash)
  const generateCartItemId = useCallback((product) => {
    const baseId = product._id;
    if (!product.selectedModifiers || product.selectedModifiers.length === 0) {
      return baseId;
    }
    // Modifikatorlarni tartiblab, nomlarini birlashtiramiz
    const modsKey = product.selectedModifiers
      .map((m) => m.name.trim().toLowerCase())
      .sort()
      .join("|");
    return `${baseId}-${modsKey}`;
  }, []);

  // 3. SAVATGA QO'SHISH (Immutability va Aniq hisob)
  const addToCart = useCallback(
    (product) => {
      setCartItems((prevItems) => {
        // Agar kelyotgan obyektda cartItemId bo'lsa (Savatdan + bosilganda), shuni ishlatamiz
        const cartItemId = product.cartItemId || generateCartItemId(product);

        const existingItemIndex = prevItems.findIndex(
          (item) => item.cartItemId === cartItemId,
        );

        if (existingItemIndex > -1) {
          // Ob'ektni chuqur nusxalash (Deep copy) va miqdorini oshirish
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + 1,
          };
          return updatedItems;
        }

        // Yangi mahsulot: Narxni backend mantig'iga moslab hisoblaymiz
        const basePrice = Number(product.price) || 0;
        const modsPrice = (product.selectedModifiers || []).reduce(
          (sum, m) => sum + (Number(m.price) || 0),
          0,
        );

        // JS float xatolarini oldini olish uchun (15000.0000001 bo'lib ketmasligi uchun)
        const unitPrice = Math.round(basePrice + modsPrice);

        return [
          ...prevItems,
          {
            ...product,
            cartItemId,
            unitPrice,
            quantity: 1,
          },
        ];
      });
    },
    [generateCartItemId],
  );

  // 4. SAVATDAN OLIB TASHLASH (Qat'iy filtrlash)
  const removeFromCart = useCallback((cartItemId) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.cartItemId === cartItemId);
      if (!existingItem) return prevItems;

      if (existingItem.quantity === 1) {
        return prevItems.filter((i) => i.cartItemId !== cartItemId);
      }

      return prevItems.map((i) =>
        i.cartItemId === cartItemId ? { ...i, quantity: i.quantity - 1 } : i,
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // 5. HISOB-KITOBLAR (Performance uchun Memoized)
  const totalPrice = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      return acc + item.unitPrice * item.quantity;
    }, 0);
  }, [cartItems]);

  const totalQuantity = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  // 6. TELEGRAM MAIN BUTTON (Professional mantiq)
  useEffect(() => {
    // Faqat bosh sahifada (Menyuda) bo'lganda ko'rsatamiz
    const isMenuPage = location.pathname === "/";

    const onMainButtonClick = () => {
      navigate("/cart");
    };

    if (totalQuantity > 0 && isMenuPage) {
      const priceStr = totalPrice.toLocaleString("uz-UZ");
      showMainButton(`SAVATGA O'TISH • ${priceStr} so'm`, onMainButtonClick);
    } else {
      hideMainButton();
    }

    return () => {
      // Memory leak bo'lmasligi uchun offClick muhim
      tg.MainButton.offClick(onMainButtonClick);
    };
  }, [
    totalQuantity,
    totalPrice,
    location.pathname,
    showMainButton,
    hideMainButton,
    navigate,
    tg,
  ]);

  const value = useMemo(
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

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
