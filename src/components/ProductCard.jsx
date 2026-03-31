import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const { cartItems = [], addToCart, removeFromCart } = useContext(CartContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false); // Rasm xatosi uchun state

  // Savatdagi holatini tekshirish
  const cartItem = cartItems.find((item) => item._id === product._id);
  const quantity = cartItem ? cartItem.quantity : 0;

  // Chegirma mantiqi
  const hasDiscount = product.oldPrice && product.oldPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  // Kartochka bosilganda modalni ochish
  const handleCardClick = () => setIsModalOpen(true);

  // Tugmalar bosilganda kartochka bosilib ketmasligi uchun (Stop Propagation)
  const handleActionClick = (e, action) => {
    e.stopPropagation();
    action();
  };

  return (
    <>
      {/* ===================== ASOSIY KARTOCHKA ===================== */}
      <div
        onClick={handleCardClick}
        className="group bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full active:scale-[0.97] transition-all duration-200 cursor-pointer"
      >
        {/* Rasm qismi */}
        <div className="relative w-full h-36 sm:h-40 bg-gray-50 overflow-hidden flex items-center justify-center">
          {!imgError ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="text-4xl opacity-20">🍔</div> // Rasm ochilmasa chiquvchi belgi
          )}

          {/* Chegirma badge */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-xl shadow-sm tracking-wider">
              -{discountPercent}%
            </div>
          )}

          {/* Savatdagi son (Burchakda) */}
          {quantity > 0 && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-black w-7 h-7 flex items-center justify-center rounded-full shadow-md border-2 border-white animate-in zoom-in duration-200">
              {quantity}
            </div>
          )}
        </div>

        {/* Ma'lumotlar qismi */}
        <div className="p-3 sm:p-4 flex flex-col flex-grow">
          <h3 className="font-bold text-[15px] text-gray-800 leading-tight mb-1 line-clamp-2">
            {product.name}
          </h3>

          <p className="text-[11px] text-gray-400 line-clamp-2 flex-grow leading-relaxed mb-3">
            {product.description}
          </p>

          <div className="mt-auto">
            {/* Narx */}
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

            {/* Harakat tugmalari */}
            <div className="h-10">
              {quantity === 0 ? (
                <button
                  onClick={(e) =>
                    handleActionClick(e, () => addToCart(product))
                  }
                  className="w-full h-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 text-xs font-black uppercase tracking-wider rounded-2xl transition-colors"
                >
                  Qo'shish
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
                    {quantity}
                  </span>
                  <button
                    onClick={(e) =>
                      handleActionClick(e, () => addToCart(product))
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

      {/* ===================== NATIVE BOTTOM SHEET (MODAL) ===================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200">
          {/* Orqa fonni bosganda yopilishi */}
          <div
            className="absolute inset-0"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full duration-300 max-h-[90vh] flex flex-col">
            {/* Mobil quloqcha (Swipe indicator) */}
            <div className="w-10 h-1.5 bg-gray-300/80 rounded-full mx-auto mt-3 mb-2 sm:hidden" />

            {/* Yopish tugmasi */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 z-10 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center text-sm font-bold backdrop-blur-md active:scale-90"
            >
              ✕
            </button>

            {/* Rasm */}
            <div className="w-full h-64 bg-gray-100 shrink-0">
              {!imgError ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">
                  🍔
                </div>
              )}
            </div>

            {/* Scroll bo'ladigan kontent */}
            <div className="p-5 overflow-y-auto">
              <h2 className="text-2xl font-black text-gray-900 leading-tight mb-2 pr-8">
                {product.name}
              </h2>

              <div className="flex items-end gap-3 mb-4">
                <span className="text-3xl font-black text-orange-500 tracking-tighter">
                  {product.price?.toLocaleString()}{" "}
                  <span className="text-lg">so'm</span>
                </span>
                {hasDiscount && (
                  <span className="text-base text-gray-400 line-through font-bold mb-1">
                    {product.oldPrice?.toLocaleString()} so'm
                  </span>
                )}
              </div>

              <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
                {product.description ||
                  "Ushbu mahsulot haqida batafsil ma'lumot berilmagan."}
              </p>
            </div>

            {/* Pastki qotirilgan tugma bloki (Sticky Footer) */}
            <div className="p-5 pt-2 bg-white border-t border-gray-100 shrink-0">
              {quantity === 0 ? (
                <button
                  onClick={() => addToCart(product)}
                  className="w-full py-4 bg-orange-500 active:bg-orange-600 text-white font-black text-[15px] uppercase tracking-widest rounded-2xl shadow-xl shadow-orange-200 transition-all flex justify-center items-center"
                >
                  Savatga qo'shish
                </button>
              ) : (
                <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl p-2 h-14">
                  <button
                    onClick={() => removeFromCart(product._id)}
                    className="w-12 h-10 flex items-center justify-center bg-white rounded-xl text-2xl font-bold text-gray-800 shadow-sm active:scale-90 transition-transform"
                  >
                    −
                  </button>
                  <span className="font-black text-xl text-gray-900">
                    {quantity}{" "}
                    <span className="text-xs text-gray-400 ml-1">ta</span>
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    className="w-12 h-10 flex items-center justify-center bg-orange-500 text-white rounded-xl text-2xl font-bold shadow-sm active:scale-90 transition-transform"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
