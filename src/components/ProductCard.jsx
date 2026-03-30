import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const {
    cartItems = [],
    addToCart,
    removeFromCart,
  } = useContext(CartContext) || {};

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Savatdagi mahsulotni topish
  const cartItem = Array.isArray(cartItems)
    ? cartItems.find((item) => item._id === product._id)
    : null;

  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <>
      {/* ===================== ASOSIY KARTOCHKA ===================== */}
      <div
        className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full active:scale-[0.985] transition-all duration-200 cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        {/* Rasm qismi */}
        <div className="relative w-full h-40 bg-gray-100 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Savatdagi soni */}
          {quantity > 0 && (
            <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-black w-7 h-7 flex items-center justify-center rounded-full shadow-lg border-2 border-white">
              {quantity}
            </div>
          )}
        </div>

        {/* Ma'lumotlar qismi */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-bold text-base text-gray-900 line-clamp-2 min-h-[44px]">
            {product.name}
          </h3>

          <p className="text-xs text-gray-500 line-clamp-2 mt-1 mb-4 flex-grow leading-snug">
            {product.description}
          </p>

          <div className="mt-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl font-black text-orange-500 tracking-tight">
                {product.price?.toLocaleString()} so'm
              </span>
            </div>

            {/* Qo'shish / Sonni boshqarish */}
            <div onClick={(e) => e.stopPropagation()}>
              {quantity === 0 ? (
                <button
                  onClick={() => addToCart(product)}
                  className="w-full py-3 bg-gray-900 hover:bg-black active:bg-gray-800 text-white text-sm font-bold rounded-2xl transition-all tap-effect"
                >
                  Savatga qo'shish
                </button>
              ) : (
                <div className="flex items-center justify-between bg-gray-100 rounded-2xl p-1">
                  <button
                    onClick={() => removeFromCart(product._id)}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-xl font-bold text-gray-700 active:bg-gray-50 transition-all tap-effect"
                  >
                    −
                  </button>

                  <span className="font-bold text-lg text-gray-900 px-4">
                    {quantity}
                  </span>

                  <button
                    onClick={() => addToCart(product)}
                    className="w-10 h-10 flex items-center justify-center bg-orange-500 text-white rounded-xl text-xl font-bold active:bg-orange-600 transition-all tap-effect"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== BATAFSIL MODAL ===================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
          <div
            className="absolute inset-0"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-2 duration-300">
            {/* Mobil uchun yopish chizig'i */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-4 mb-2 sm:hidden" />

            {/* Yopish tugmasi */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 z-10 w-9 h-9 bg-black/10 hover:bg-black/20 text-white rounded-full flex items-center justify-center text-xl transition-all"
            >
              ✕
            </button>

            {/* Rasm */}
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-72 object-cover"
            />

            {/* Modal kontenti */}
            <div className="p-6">
              <div className="flex justify-between items-start gap-4 mb-5">
                <h2 className="text-2xl font-bold text-gray-900 leading-tight tracking-tight">
                  {product.name}
                </h2>
                <span className="text-2xl font-black text-orange-500 whitespace-nowrap">
                  {product.price?.toLocaleString()} so'm
                </span>
              </div>

              <p className="text-gray-600 leading-relaxed mb-8 text-[15px]">
                {product.description ||
                  "Ushbu mahsulot haqida batafsil ma'lumot yo‘q."}
              </p>

              {/* Modal ichidagi tugma */}
              <button
                onClick={() => {
                  addToCart(product);
                  setIsModalOpen(false);
                }}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-orange-200 transition-all tap-effect"
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
