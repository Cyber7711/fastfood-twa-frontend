import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react";
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

  // 1. TWA QOPQONINI Aylanib o'tish uchun REF ishlatamiz
  const formDataRef = useRef(formData);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Input o'zgarishi
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 2. Buyurtma yuborish (Endi formData'ga qaram emas!)
  const submitOrder = useCallback(async () => {
    const currentData = formDataRef.current; // Har doim eng oxirgi yozilgan ma'lumotni oladi

    if (!currentData.customerPhone || !currentData.deliveryAddress) {
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
        customerName: currentData.customerName.trim(),
        customerPhone: currentData.customerPhone.trim(),
        items: cartItems.map((item) => ({
          productId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: Number(item.price), // Xavfsizlik uchun Number
        })),
        totalPrice: Number(totalPrice),
        deliveryType: "DELIVERY",
        deliveryAddress: { text: currentData.deliveryAddress.trim() },
        paymentMethod: "CASH",
      };

      const response = await apiClient.post("/orders", orderPayload);

      if (response.success || response.order) {
        tg.showConfirm(
          "✅ Buyurtmangiz muvaffaqiyatli qabul qilindi!\nSavat tozalanmoqda...",
          (buttonPressed) => {
            if (buttonPressed) {
              clearCart();
              tg.close(); // Mini App'ni yopish
            }
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
  }, [cartItems, tenantId, user, totalPrice, tg, clearCart]); // formData yo'q

  // 3. Telegram tugmasini faqat 1 marta ulash
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate("/");
      return;
    }

    const priceText = totalPrice.toLocaleString("uz-UZ");
    showMainButton(`TASDIQLASH — ${priceText} so'm`, submitOrder);

    return () => {
      tg.MainButton.offClick(submitOrder);
      hideMainButton();
    };
  }, [
    cartItems.length,
    totalPrice,
    submitOrder,
    navigate,
    showMainButton,
    hideMainButton,
    tg,
  ]);

  if (!cartItems || cartItems.length === 0) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-28 px-4 pt-4">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-orange-500 font-bold text-sm mb-6 active:scale-95 transition-transform uppercase tracking-widest"
      >
        ← Menyuga qaytish
      </button>

      <h1 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">
        Buyurtmani tasdiqlash
      </h1>

      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-6">
        <div className="flex justify-between py-3 border-b border-gray-50">
          <span className="text-gray-500 font-medium text-sm">
            Jami mahsulotlar
          </span>
          <span className="font-bold text-gray-800">{totalQuantity} ta</span>
        </div>
        <div className="flex justify-between py-3 items-end">
          <span className="text-gray-500 font-medium text-sm">
            Umumiy summa
          </span>
          <span className="font-black text-2xl text-orange-500">
            {totalPrice.toLocaleString("uz-UZ")}{" "}
            <span className="text-sm">so'm</span>
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
            Ismingiz
          </label>
          <input
            type="text"
            name="customerName"
            placeholder="Ismingizni kiriting"
            value={formData.customerName}
            onChange={handleInputChange}
            className="w-full px-4 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:border-orange-500 font-bold text-gray-800 transition-colors shadow-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
            Telefon raqam <span className="text-orange-500">*</span>
          </label>
          <input
            type="tel"
            name="customerPhone"
            placeholder="+998 90 123 45 67"
            value={formData.customerPhone}
            onChange={handleInputChange}
            className="w-full px-4 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:border-orange-500 font-bold text-gray-800 transition-colors shadow-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
            Manzil <span className="text-orange-500">*</span>
          </label>
          <textarea
            name="deliveryAddress"
            placeholder="Ko'cha, uy raqami, mo'ljal..."
            value={formData.deliveryAddress}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:border-orange-500 font-bold text-gray-800 transition-colors shadow-sm resize-none"
          />
        </div>
      </div>

      <p className="text-center text-gray-400 font-medium text-xs mt-8">
        To'lov yetkazib berish paytida naqd pul orqali amalga oshiriladi
      </p>
    </div>
  );
};

export default CheckoutPage;
