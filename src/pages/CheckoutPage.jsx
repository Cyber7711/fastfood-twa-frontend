import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { CartContext } from "../context/CartContext";
import { useTelegram } from "../hooks/useTelegram";
import apiClient from "../services/api";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { tenantId, user } = useContext(AppContext);

  const {
    cartItems = [],
    totalPrice = 0,
    totalQuantity = 0,
    clearCart,
  } = useContext(CartContext) || {};

  const { tg, showMainButton, hideMainButton } = useTelegram();

  const [formData, setFormData] = useState({
    customerName: user?.first_name || "",
    customerPhone: "",
    deliveryAddress: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Input o'zgarishi
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Buyurtma yuborish
  const submitOrder = useCallback(async () => {
    if (!formData.customerPhone || !formData.deliveryAddress) {
      tg.showAlert(
        "Iltimos, telefon raqam va yetkazib berish manzilini to'ldiring!",
      );
      return;
    }

    setIsSubmitting(true);
    tg.MainButton.showProgress();

    try {
      const orderPayload = {
        tenantId,
        telegramId: user?.id || 123456789,
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        items: cartItems.map((item) => ({
          productId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalPrice,
        deliveryType: "DELIVERY",
        deliveryAddress: { text: formData.deliveryAddress.trim() },
        paymentMethod: "CASH",
      };

      const response = await apiClient.post("/orders", orderPayload);

      if (response.success) {
        tg.showConfirm(
          "✅ Buyurtmangiz muvaffaqiyatli qabul qilindi!\nSavat tozalanmoqda...",
          () => {
            clearCart();
            tg.close();
          },
        );
      }
    } catch (error) {
      console.error("[CHECKOUT ERROR]", error);
      tg.showAlert("Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
      tg.MainButton.hideProgress();
    }
  }, [formData, cartItems, tenantId, user, totalPrice, tg, clearCart]);

  // Telegram tugmasi va redirect
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      const timer = setTimeout(() => navigate("/"), 800);
      return () => clearTimeout(timer);
    }

    showMainButton(
      `TASDIQLASH — ${totalPrice.toLocaleString("ru-RU")} so'm`,
      submitOrder,
    );

    return () => {
      tg.MainButton.offClick(submitOrder);
      hideMainButton();
    };
  }, [
    cartItems,
    totalPrice,
    submitOrder,
    navigate,
    showMainButton,
    hideMainButton,
    tg,
  ]);

  // Agar savat bo'sh bo'lsa hech narsa ko'rsatmaymiz
  if (!cartItems || cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 px-4 pt-4">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-orange-500 font-semibold text-lg mb-6 hover:text-orange-600 transition-colors"
      >
        ← Menyuga qaytish
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Buyurtmani tasdiqlash
      </h1>

      {/* Buyurtma haqida qisqa ma'lumot */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <div className="flex justify-between py-3 border-b border-gray-100">
          <span className="text-gray-600">Jami mahsulotlar</span>
          <span className="font-semibold">{totalQuantity} ta</span>
        </div>
        <div className="flex justify-between py-3">
          <span className="text-gray-600">Umumiy summa</span>
          <span className="font-bold text-2xl text-orange-500">
            {totalPrice.toLocaleString("ru-RU")} so'm
          </span>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ismingiz
          </label>
          <input
            type="text"
            name="customerName"
            placeholder="Ismingizni kiriting"
            value={formData.customerName}
            onChange={handleInputChange}
            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-orange-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefon raqamingiz <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="customerPhone"
            placeholder="+998 90 123 45 67"
            value={formData.customerPhone}
            onChange={handleInputChange}
            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-orange-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Yetkazib berish manzili <span className="text-red-500">*</span>
          </label>
          <textarea
            name="deliveryAddress"
            placeholder="Ko'cha, uy raqami, mo'ljal..."
            value={formData.deliveryAddress}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-orange-400 resize-none"
          />
        </div>
      </div>

      <p className="text-center text-gray-500 text-sm mt-10">
        To'lov yetkazib berish paytida naqd pul orqali amalga oshiriladi
      </p>
    </div>
  );
};

export default CheckoutPage;
