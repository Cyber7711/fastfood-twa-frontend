import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const {
    cartItems = [],
    addToCart,
    removeFromCart,
  } = useContext(CartContext) || {};
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Savatda bor-yo'qligini tekshirish (Xavfsiz usulda)
  const cartItem = Array.isArray(cartItems)
    ? cartItems.find((item) => item._id === product._id)
    : null;
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <>
      {/* --- ASOSIY KARTOCKA --- */}
      <div
        className="product-card fade-in-card bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full active:scale-[0.98] transition-transform duration-200"
        onClick={() => setIsModalOpen(true)}
      >
        {/* Rasm qismi */}
        <div className="relative w-full h-36 bg-gray-50 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          {quantity > 0 && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-lg border-2 border-white animate-in zoom-in">
              {quantity}
            </div>
          )}
        </div>

        {/* Ma'lumotlar qismi */}
        <div className="p-3 flex flex-col flex-grow">
          <h3 className="text-sm font-black text-gray-800 line-clamp-1 mb-1">
            {product.name}
          </h3>
          <p className="text-[11px] text-gray-400 line-clamp-2 leading-tight mb-3 flex-grow">
            {product.description}
          </p>

          <div className="flex flex-col gap-2 mt-auto">
            <span className="text-sm font-black text-orange-500 italic">
              {product.price?.toLocaleString()} so'm
            </span>

            {/* Tugmalar qismi (Propagation to'xtatilgan - modal ochilib ketmasligi uchun) */}
            <div onClick={(e) => e.stopPropagation()}>
              {quantity === 0 ? (
                <button
                  onClick={() => addToCart(product)}
                  className="w-full py-2 bg-gray-900 text-white text-[11px] font-black uppercase tracking-widest rounded-xl tap-effect"
                >
                  Qo'shish
                </button>
              ) : (
                <div className="flex items-center justify-between bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => removeFromCart(product._id)}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-800 font-bold tap-effect"
                  >
                    -
                  </button>
                  <span className="text-sm font-black text-gray-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    className="w-8 h-8 flex items-center justify-center bg-orange-500 text-white rounded-lg shadow-sm font-bold tap-effect"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- BATAFSIL MA'LUMOT MODALI --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-500">
            {/* Modal tepasidagi yopish chizig'i (Mobil uchun) */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 z-10 w-8 h-8 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
            >
              ✕
            </button>

            <img
              src={product.imageUrl}
              className="w-full h-64 object-cover"
              alt={product.name}
            />

            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-black text-gray-900 tracking-tighter">
                  {product.name}
                </h2>
                <span className="text-xl font-black text-orange-500 italic">
                  {product.price?.toLocaleString()} so'm
                </span>
              </div>

              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                {product.description ||
                  "Ushbu mahsulot haqida ma'lumot berilmagan."}
              </p>

              <button
                onClick={() => {
                  addToCart(product);
                  setIsModalOpen(false);
                }}
                className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-orange-200 tap-effect"
              >
                Savatga qo'shish — {product.price?.toLocaleString()} so'm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
