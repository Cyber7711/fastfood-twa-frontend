import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const { cartItems = [], addToCart, removeFromCart } = useContext(CartContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  // ==========================================
  // 1. MODAL VA QO'SHIMCHALAR UCHUN STATE
  // ==========================================
  const [selectedMods, setSelectedMods] = useState([]);

  // ==========================================
  // 2. HISOB-KITOBLAR (KART VA MODAL UCHUN)
  // ==========================================
  // Savatdagi shu mahsulotning (barcha modifikatsiyalarini qo'shgandagi) umumiy soni
  const totalQuantityInCart = cartItems
    .filter((item) => item._id === product._id)
    .reduce((sum, item) => sum + item.quantity, 0);

  // Chegirma mantiqi
  const hasDiscount = product.oldPrice && product.oldPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  // Modal ichidagi dinamik narx (Asosiy narx + Tanlangan qo'shimchalar)
  const dynamicModalPrice =
    product.price +
    selectedMods.reduce((sum, mod) => sum + (Number(mod.price) || 0), 0);

  const hasModifiers = product.modifiers && product.modifiers.length > 0;

  // ==========================================
  // 3. ACTION FUNKSIYALAR
  // ==========================================
  const handleCardClick = () => {
    setSelectedMods([]); // Modal ochilganda tanlovlarni tozalaymiz
    setIsModalOpen(true);
  };

  const handleActionClick = (e, action) => {
    e.stopPropagation();
    action();
  };

  // Asosiy kartochkadagi "Qo'shish" tugmasi bosilganda
  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (hasModifiers) {
      // Agar qo'shimchalari bo'lsa, albatta modalni ochish kerak (mijoz tanlashi uchun)
      handleCardClick();
    } else {
      // Yo'qsa, to'g'ridan-to'g'ri savatga qo'shamiz
      addToCart({ ...product, selectedModifiers: [] });
    }
  };

  // Modaldan savatga qo'shish
  const handleModalAddToCart = () => {
    addToCart({ ...product, selectedModifiers: selectedMods });
    setIsModalOpen(false);
    setSelectedMods([]); // Keyingi safar uchun tozalaymiz
  };

  // Qo'shimchani belgilash / olib tashlash
  const toggleModifier = (modifier) => {
    setSelectedMods((prev) => {
      const isSelected = prev.some(
        (m) => m._id === modifier._id || m.name === modifier.name,
      );
      if (isSelected) {
        return prev.filter((m) => m.name !== modifier.name); // O'chirish
      } else {
        return [...prev, modifier]; // Qo'shish
      }
    });
  };

  return (
    <>
      {/* ===================== ASOSIY KARTOCHKA ===================== */}
      <div
        onClick={handleCardClick}
        className="group bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full active:scale-[0.97] transition-all duration-200 cursor-pointer"
      >
        <div className="relative w-full h-36 sm:h-40 bg-gray-50 overflow-hidden flex items-center justify-center">
          {!imgError ? (
            <img
              src={
                product.imageUrl ||
                "https://placehold.co/400x300/orange/white?text=Yummy"
              }
              alt={product.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="text-4xl opacity-20">🍔</div>
          )}

          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-xl shadow-sm tracking-wider">
              -{discountPercent}%
            </div>
          )}

          {totalQuantityInCart > 0 && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-black w-7 h-7 flex items-center justify-center rounded-full shadow-md border-2 border-white animate-in zoom-in duration-200">
              {totalQuantityInCart}
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 flex flex-col flex-grow">
          <h3 className="font-bold text-[15px] text-gray-800 leading-tight mb-1 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-[11px] text-gray-400 line-clamp-2 flex-grow leading-relaxed mb-3">
            {product.description}
          </p>

          <div className="mt-auto">
            <div className="flex flex-col mb-3">
              {hasDiscount && (
                <span className="text-[10px] text-gray-400 line-through font-bold">
                  {product.oldPrice?.toLocaleString()} so'm
                </span>
              )}
              <span className="text-[17px] font-black text-gray-900 tracking-tight">
                {product.price?.toLocaleString()}{" "}
                <span className="text-[11px] text-gray-500 font-bold">
                  so'm
                </span>
              </span>
            </div>

            <div className="h-10">
              {totalQuantityInCart === 0 || hasModifiers ? (
                <button
                  onClick={handleQuickAdd}
                  className="w-full h-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 text-xs font-black uppercase tracking-wider rounded-2xl transition-colors"
                >
                  {hasModifiers ? "Tanlash" : "Qo'shish"}
                </button>
              ) : (
                <div className="flex items-center justify-between bg-orange-50 rounded-2xl h-full px-1 border border-orange-100">
                  <button
                    onClick={(e) =>
                      handleActionClick(e, () => removeFromCart(product._id))
                    }
                    className="w-8 h-8 flex items-center justify-center bg-white rounded-xl text-lg font-bold text-orange-500 shadow-sm active:scale-90 transition-transform"
                  >
                    −
                  </button>
                  <span className="font-black text-sm text-gray-900 w-6 text-center">
                    {totalQuantityInCart}
                  </span>
                  <button
                    onClick={(e) =>
                      handleActionClick(e, () =>
                        addToCart({ ...product, selectedModifiers: [] }),
                      )
                    }
                    className="w-8 h-8 flex items-center justify-center bg-orange-500 text-white rounded-xl text-lg font-bold shadow-sm active:scale-90 transition-transform"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== PREMIUM BOTTOM SHEET (MODAL) ===================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white rounded-t-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full duration-300 max-h-[90vh] flex flex-col">
            <div className="w-10 h-1.5 bg-gray-300/80 rounded-full mx-auto mt-3 mb-2" />

            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 z-10 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center text-sm font-bold backdrop-blur-md active:scale-90"
            >
              ✕
            </button>

            {/* Rasm */}
            <div className="w-full h-56 bg-gray-100 shrink-0 relative">
              <img
                src={
                  product.imageUrl ||
                  "https://placehold.co/400x300/orange/white"
                }
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white to-transparent h-12" />
            </div>

            {/* Kontent qismi (Scroll bo'ladi) */}
            <div className="p-5 overflow-y-auto pb-24">
              <h2 className="text-2xl font-black text-gray-900 leading-tight mb-2 pr-8">
                {product.name}
              </h2>

              <div className="flex items-end gap-3 mb-4">
                <span className="text-2xl font-black text-gray-900 tracking-tighter">
                  {product.price?.toLocaleString()}{" "}
                  <span className="text-lg text-gray-500">so'm</span>
                </span>
                {hasDiscount && (
                  <span className="text-sm text-red-400 line-through font-bold mb-1">
                    {product.oldPrice?.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
                {product.description}
              </p>

              {/* 🔥 TARKIBI (INGREDIENTS) */}
              {product.ingredients && product.ingredients.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                    Tarkibi
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {product.ingredients.map((ing, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-50 border border-gray-100 text-gray-600 text-[11px] font-bold px-3 py-1.5 rounded-lg"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 🔥 QO'SHIMCHALAR (MODIFIERS) */}
              {hasModifiers && (
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                    Qo'shish yoki olib tashlash
                  </h4>
                  <div className="space-y-2">
                    {product.modifiers.map((mod, idx) => {
                      const isChecked = selectedMods.some(
                        (m) => m.name === mod.name,
                      );
                      const isAdd = mod.type === "add" || mod.type === "size";

                      return (
                        <label
                          key={idx}
                          className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all active:scale-[0.98] ${
                            isChecked
                              ? "border-orange-500 bg-orange-50/30"
                              : "border-gray-100 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Chiroyli Custom Checkbox */}
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                                isChecked
                                  ? "bg-orange-500 border-orange-500"
                                  : "bg-gray-50 border-gray-200"
                              }`}
                            >
                              {isChecked && (
                                <span className="text-white text-xs font-bold">
                                  ✓
                                </span>
                              )}
                            </div>

                            <span
                              className={`text-sm font-bold ${isChecked ? "text-gray-900" : "text-gray-600"}`}
                            >
                              {mod.name}
                            </span>
                          </div>

                          {/* Narx qismi */}
                          <span
                            className={`text-xs font-black ${isAdd ? "text-gray-900" : "text-gray-400"}`}
                          >
                            {isAdd && mod.price > 0
                              ? `+${mod.price.toLocaleString()} so'm`
                              : ""}
                          </span>

                          {/* Yashirin haqiqiy checkbox */}
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={isChecked}
                            onChange={() => toggleModifier(mod)}
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 🔥 DINAMIK NARXLI FOOTER */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
              <button
                onClick={handleModalAddToCart}
                className="w-full py-4 bg-orange-500 active:bg-orange-600 text-white font-black text-[15px] uppercase tracking-widest rounded-2xl shadow-xl shadow-orange-200 transition-transform active:scale-95 flex justify-between items-center px-6"
              >
                <span>Savatga</span>
                <span>{dynamicModalPrice.toLocaleString()} so'm</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
