import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  MapPin,
  Navigation,
  ArrowLeft,
  CreditCard,
} from "lucide-react";
import { AppContext } from "../context/AppContext";
import { CartContext } from "../context/CartContext";
import { useTelegram } from "../hooks/useTelegram";
import apiClient from "../services/api";

const TASHKENT_DISTRICTS = [
  "Bektemir",
  "Chilonzor",
  "Mirobod",
  "Mirzo Ulug'bek",
  "Olmazor",
  "Sergeli",
  "Shayxontohur",
  "Uchtepa",
  "Yakkasaroy",
  "Yashnobod",
  "Yunusobod",
  "Zangiota",
  "Yangihayot",
].sort();

// SaaS tizimida buni backend'dan (tenant settings) olish ma'qul
const DELIVERY_FEE = 10000;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { tenantId, user } = useContext(AppContext);
  const {
    cartItems = [],
    totalPrice = 0,
    totalQuantity = 0,
    clearCart,
  } = useContext(CartContext) || {};
  const { tg } = useTelegram();

  const [formData, setFormData] = useState({
    customerName: user?.first_name || "",
    customerPhone: "+998 ",
    district: "",
    addressDetails: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Loading holatini saqlash (MainButton handler uchun)
  const loadingRef = useRef(false);

  const finalTotalAmount = useMemo(
    () => Number(totalPrice) + DELIVERY_FEE,
    [totalPrice],
  );

  // 📞 Telefon raqam formati (+998 XX XXX XX XX)
  const formatPhoneNumber = (val) => {
    let digits = val.replace(/\D/g, "");
    if (digits.startsWith("998")) digits = digits.substring(3);
    digits = digits.substring(0, 9);

    let res = "+998";
    if (digits.length > 0) res += " " + digits.substring(0, 2);
    if (digits.length > 2) res += " " + digits.substring(2, 5);
    if (digits.length > 5) res += " " + digits.substring(5, 7);
    if (digits.length > 7) res += " " + digits.substring(7, 9);
    return res;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const formattedValue =
      name === "customerPhone" ? formatPhoneNumber(value) : value;

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    let errors = {};
    if (formData.customerName.trim().length < 3)
      errors.customerName = "Ism juda qisqa";
    if (formData.customerPhone.length < 17)
      errors.customerPhone = "Raqam noto'g'ri";
    if (!formData.district) errors.district = "Tumanni tanlang";
    if (formData.addressDetails.trim().length < 5)
      errors.addressDetails = "Manzilni to'liq yozing";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitOrder = useCallback(async () => {
    if (loadingRef.current) return;

    if (!validate()) {
      tg.HapticFeedback.notificationOccurred("error");
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    tg.MainButton.showProgress();
    tg.MainButton.disable();

    try {
      const orderPayload = {
        tenantId,
        telegramId: user?.id,
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.replace(/\s/g, ""),
        items: cartItems.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
          selectedModifiers: item.selectedModifiers || [],
        })),
        deliveryFee: DELIVERY_FEE,
        deliveryAddress: {
          district: formData.district,
          text: formData.addressDetails,
        },
        paymentMethod: "CASH",
      };

      await apiClient.post("/orders", orderPayload);

      tg.HapticFeedback.notificationOccurred("success");
      clearCart();

      tg.showConfirm(
        "✅ Buyurtma qabul qilindi! Botga qaytasizmi?",
        (confirm) => {
          if (confirm) tg.close();
          else navigate("/");
        },
      );
    } catch (err) {
      console.error("Order Error:", err);
      tg.HapticFeedback.notificationOccurred("error");
      tg.showAlert("⚠️ Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
      tg.MainButton.hideProgress();
      tg.MainButton.enable();
    }
  }, [formData, cartItems, tenantId, user, tg, clearCart, navigate]);

  // 🔘 Telegram MainButton Boshqaruvi
  useEffect(() => {
    if (!cartItems.length) return;

    tg.MainButton.setParams({
      text: `TASDIQLASH (${finalTotalAmount.toLocaleString()} so'm)`,
      color: "#31b545",
      text_color: "#ffffff",
      is_active: true,
      is_visible: true,
    });

    tg.MainButton.onClick(submitOrder);

    return () => {
      tg.MainButton.offClick(submitOrder);
      tg.MainButton.hide();
    };
  }, [finalTotalAmount, cartItems.length, submitOrder, tg]);

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-36 animate-in fade-in duration-500">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-4 py-3 border-b border-gray-100 flex items-center gap-4">
        <button
          onClick={() => navigate("/cart")}
          className="p-2 -ml-2 active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} className="text-gray-900" />
        </button>
        <h1 className="text-lg font-black text-gray-900 uppercase tracking-tight">
          Rasmiylashtirish
        </h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Buyurtma xulosasi */}
        <section className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
            Sizning buyurtmangiz
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-bold text-gray-600">
              <span>Mahsulotlar ({totalQuantity})</span>
              <span>{totalPrice.toLocaleString()} so'm</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-600">
              <span>Yetkazib berish</span>
              <span>{DELIVERY_FEE.toLocaleString()} so'm</span>
            </div>
            <div className="pt-3 border-t border-dashed border-gray-200 flex justify-between items-center">
              <span className="text-gray-900 font-black">Jami:</span>
              <span className="text-xl font-black text-green-600">
                {finalTotalAmount.toLocaleString()} so'm
              </span>
            </div>
          </div>
        </section>

        {/* Ma'lumotlar formasi */}
        <div className="space-y-4">
          <InputGroup
            label="Ismingiz"
            icon={<User size={16} />}
            name="customerName"
            value={formData.customerName}
            onChange={handleInputChange}
            error={fieldErrors.customerName}
            placeholder="Masalan: Sarvar"
          />

          <InputGroup
            label="Telefon raqam"
            icon={<Phone size={16} />}
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleInputChange}
            error={fieldErrors.customerPhone}
            type="tel"
          />

          <div className="flex flex-col">
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
              <MapPin size={16} className="text-green-500" /> Tuman
            </label>
            <select
              name="district"
              value={formData.district}
              onChange={handleInputChange}
              className={`w-full bg-white px-5 py-4 rounded-2xl border-2 transition-all outline-none font-bold text-gray-800 shadow-sm appearance-none ${
                fieldErrors.district
                  ? "border-red-400 bg-red-50"
                  : "border-transparent focus:border-green-500"
              }`}
            >
              <option value="">Tumanni tanlang...</option>
              {TASHKENT_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d} tumani
                </option>
              ))}
            </select>
          </div>

          <InputGroup
            label="Aniq manzil"
            icon={<Navigation size={16} />}
            name="addressDetails"
            value={formData.addressDetails}
            onChange={handleInputChange}
            error={fieldErrors.addressDetails}
            placeholder="Ko'cha, uy raqami, xonadon..."
            isTextArea
          />
        </div>

        {/* To'lov turi (Static for now) */}
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-4">
          <div className="bg-green-500 p-2 rounded-xl text-white">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-green-600 uppercase tracking-wider">
              To'lov turi
            </p>
            <p className="text-sm font-bold text-green-900">Naqd pul orqali</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ label, icon, error, isTextArea, ...props }) => (
  <div className="flex flex-col">
    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
      <span className="text-green-500">{icon}</span> {label}
    </label>
    {isTextArea ? (
      <textarea
        {...props}
        className={`w-full bg-white px-5 py-4 rounded-2xl border-2 transition-all outline-none font-bold text-gray-800 shadow-sm resize-none ${
          error
            ? "border-red-400 bg-red-50"
            : "border-transparent focus:border-green-500"
        }`}
        rows="2"
      />
    ) : (
      <input
        {...props}
        className={`w-full bg-white px-5 py-4 rounded-2xl border-2 transition-all outline-none font-bold text-gray-800 shadow-sm ${
          error
            ? "border-red-400 bg-red-50"
            : "border-transparent focus:border-green-500"
        }`}
      />
    )}
    {error && (
      <span className="text-red-500 text-[10px] font-bold mt-1.5 ml-2">
        {error}
      </span>
    )}
  </div>
);

export default CheckoutPage;
