import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cartItems = [],
    addToCart,
    removeFromCart,
    totalPrice,
    clearCart,
  } = useContext(CartContext);

  // 1. BO'SH SAVAT HOLATI
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <span className="text-6xl opacity-40 grayscale">🛒</span>
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">
          Savatingiz bo'sh
        </h2>
        <p className="text-gray-500 font-medium text-sm mb-10 px-4">
          Hali hech qanday taom tanlamadingiz. Keling, mazali menyuni ko'zdan
          kechiramiz!
        </p>
        <button
          onClick={() => navigate("/")}
          className="w-full max-w-xs py-4 bg-orange-500 active:bg-orange-600 text-white font-black text-[15px] uppercase tracking-widest rounded-2xl shadow-xl shadow-orange-200 transition-transform active:scale-95"
        >
          Menyuga o'tish
        </button>
      </div>
    );
  }

  // Yordamchi funksiya: Bitta mahsulotning qo'shimchalar bilan birgalikdagi narxini hisoblash
  const calculateItemUnitPrice = (item) => {
    const basePrice = item.price || 0;
    const modifiersPrice =
      item.selectedModifiers?.reduce((sum, mod) => sum + (mod.price || 0), 0) ||
      0;
    return basePrice + modifiersPrice;
  };

  // 2. SAVAT TO'LA HOLATI
  return (
    <div className="min-h-screen bg-gray-50 pb-32 flex flex-col">
      {/* --- HEADER --- */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
        >
          <span className="text-lg leading-none">←</span> Menyu
        </button>
        <h1 className="text-lg font-black text-gray-900 tracking-tight uppercase">
          Savat
        </h1>
        <button
          onClick={() => {
            if (window.confirm("Savatni tozalashni xohlaysizmi?")) clearCart();
          }}
          className="text-xs font-bold text-red-500 bg-red-50 px-3 py-2 rounded-xl active:bg-red-100 transition-colors"
        >
          Tozalash
        </button>
      </div>

      {/* --- ASOSIY KONTENT: Mahsulotlar ro'yxati --- */}
      <div className="p-4 flex-grow animate-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
          {cartItems.map((item) => {
            const unitPrice = calculateItemUnitPrice(item);
            const lineTotal = unitPrice * item.quantity;
            // Agar CartContext'da alohida cartItemId qilingan bo'lsa o'shani ishlatamiz, yo'qsa _id
            const uniqueKey = item.cartItemId || item._id;

            return (
              <div key={uniqueKey} className="p-4 flex gap-4 items-start">
                {/* Mahsulot rasmi */}
                <div className="w-20 h-20 shrink-0 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 mt-1">
                  <img
                    src={
                      item.imageUrl ||
                      "https://placehold.co/100x100/orange/white?text=No+Img"
                    }
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Ma'lumotlar va tugmalar */}
                <div className="flex-1 flex flex-col justify-between min-h-[5rem]">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 leading-tight">
                        {item.name}
                      </h3>

                      {/* 🔥 QO'SHIMCHALAR (MODIFIERS) RO'YXATI */}
                      {item.selectedModifiers &&
                        item.selectedModifiers.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {item.selectedModifiers.map((mod, idx) => (
                              <p
                                key={idx}
                                className="text-[10px] text-gray-500 flex items-center gap-1 font-medium"
                              >
                                <span
                                  className={`font-black ${mod.type === "add" ? "text-green-500" : mod.type === "remove" ? "text-red-500" : "text-blue-500"}`}
                                >
                                  {mod.type === "add"
                                    ? "+"
                                    : mod.type === "remove"
                                      ? "−"
                                      : "⇿"}
                                </span>
                                {mod.name}
                                {mod.price > 0 && (
                                  <span className="text-gray-400">
                                    ({mod.price.toLocaleString()} so'm)
                                  </span>
                                )}
                              </p>
                            ))}
                          </div>
                        )}
                    </div>

                    {/* Narx */}
                    <div className="text-right flex flex-col items-end">
                      <span className="font-black text-gray-900 text-sm whitespace-nowrap">
                        {lineTotal.toLocaleString("uz-UZ")}{" "}
                        <span className="text-[10px] text-gray-400">so'm</span>
                      </span>
                      {/* Agar qo'shimcha qo'shilgan bo'lsa, dona narxini ko'rsatib qo'yamiz */}
                      {(item.selectedModifiers?.length > 0 ||
                        item.quantity > 1) && (
                        <span className="text-[9px] text-gray-400 font-medium">
                          {item.quantity} x {unitPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* + va - Boshqaruv paneli */}
                  <div className="flex items-center justify-end mt-auto">
                    <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl p-1 w-28">
                      <button
                        // removeFromCart ga uniqueKey berish xavfsizroq (CartContext ni qanday yozganingizga bog'liq)
                        onClick={() => removeFromCart(uniqueKey)}
                        className="w-8 h-7 flex items-center justify-center bg-white rounded-lg text-lg font-bold text-gray-800 shadow-sm active:scale-90 transition-transform"
                      >
                        −
                      </button>
                      <span className="flex-1 text-center font-black text-sm text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => addToCart(item)}
                        className="w-8 h-7 flex items-center justify-center bg-orange-500 text-white rounded-lg text-lg font-bold shadow-sm active:scale-90 transition-transform"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- FOOTER: Jami summa va Tasdiqlash tugmasi --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-6 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50">
        <div className="flex justify-between items-end mb-4 px-2">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            Jami hisob:
          </span>
          <span className="text-3xl font-black text-gray-900 tracking-tighter">
            {totalPrice.toLocaleString("uz-UZ")}{" "}
            <span className="text-base text-orange-500">so'm</span>
          </span>
        </div>

        <button
          onClick={() => navigate("/checkout")}
          className="w-full py-4 bg-gray-900 hover:bg-black active:bg-gray-800 text-white font-black text-[15px] uppercase tracking-widest rounded-2xl shadow-xl transition-all tap-effect flex items-center justify-center gap-3"
        >
          Rasmiylashtirish <span className="text-lg">→</span>
        </button>
      </div>
    </div>
  );
};

export default CartPage;
