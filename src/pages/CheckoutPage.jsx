import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, MapPin, Navigation, ArrowLeft } from "lucide-react";
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

  // Ref orqali callback ichida eng oxirgi loading holatini tekshiramiz
  const loadingRef = useRef(loading);
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  const finalTotalAmount = Number(totalPrice) + DELIVERY_FEE;

  // 📞 Telefon raqam formati (+998 XX XXX XX XX)
  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.startsWith("998")) val = val.substring(3);
    val = val.substring(0, 9);

    let formatted = "+998";
    if (val.length > 0) formatted += " " + val.substring(0, 2);
    if (val.length > 2) formatted += " " + val.substring(2, 5);
    if (val.length > 5) formatted += " " + val.substring(5, 7);
    if (val.length > 7) formatted += " " + val.substring(7, 9);

    setFormData((prev) => ({ ...prev, customerPhone: formatted }));
    setFieldErrors((prev) => ({ ...prev, customerPhone: null }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: null }));
  };

  const submitOrder = useCallback(async () => {
    // Loading holatini ref orqali tekshirish (closure xatoligini oldini oladi)
    if (loadingRef.current) return;

    let errors = {};
    if (formData.customerName.trim().length < 3)
      errors.customerName = "Ism juda qisqa";
    if (formData.customerPhone.length < 17)
      errors.customerPhone = "Raqam to'liq emas";
    if (!formData.district) errors.district = "Tumanni tanlang";
    if (formData.addressDetails.trim().length < 5)
      errors.addressDetails = "Manzilni to'liqroq yozing";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      tg.HapticFeedback.notificationOccurred("error");
      return;
    }

    setLoading(true);
    tg.MainButton.showProgress();
    tg.MainButton.disable();

    try {
      const orderPayload = {
        tenantId,
        customerId: user?.id || 0,
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.replace(/\s/g, ""),
        items: cartItems.map((item) => ({
          productId: item._id,
          productName: item.name,
          quantity: Number(item.quantity),
          unitPrice: Number(item.price),
          selectedModifiers: item.selectedModifiers || [],
          itemTotal:
            (Number(item.price) +
              (item.selectedModifiers?.reduce(
                (s, m) => s + Number(m.price),
                0,
              ) || 0)) *
            item.quantity,
        })),
        subTotal: totalPrice,
        deliveryFee: DELIVERY_FEE,
        totalAmount: finalTotalAmount,
        deliveryType: "DELIVERY",
        deliveryAddress: {
          text: `${formData.district} tumani, ${formData.addressDetails}`,
        },
        paymentMethod: "CASH",
      };

      const res = await apiClient.post("/orders", orderPayload);

      if (res.data) {
        tg.HapticFeedback.notificationOccurred("success");
        clearCart();
        tg.showConfirm(
          "✅ Buyurtmangiz qabul qilindi! Botga qaytasizmi?",
          (confirm) => {
            if (confirm) tg.close();
            else navigate("/");
          },
        );
      }
    } catch (err) {
      console.error("Order Error:", err);
      tg.showAlert(
        "⚠️ Server bilan bog'lanishda xato. Iltimos qayta urinib ko'ring.",
      );
    } finally {
      setLoading(false);
      tg.MainButton.hideProgress();
      tg.MainButton.enable();
    }
  }, [
    formData,
    cartItems,
    tenantId,
    user,
    totalPrice,
    finalTotalAmount,
    tg,
    clearCart,
    navigate,
  ]);

  // 🔘 Telegram MainButton Boshqaruvi
  useEffect(() => {
    if (!cartItems.length) {
      navigate("/");
      return;
    }

    const priceText = finalTotalAmount.toLocaleString("uz-UZ") + " so'm";

    tg.MainButton.setParams({
      text: `TASDIQLASH (${priceText})`,
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
  }, [finalTotalAmount, cartItems.length, submitOrder, tg, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 pb-32 animate-in fade-in duration-500">
      <div className="p-4">
        {/* Back Button */}
        <button
          onClick={() => navigate("/cart")}
          className="flex items-center gap-2 text-gray-500 font-bold text-sm mb-6 active:scale-95 transition-transform"
        >
          <ArrowLeft size={16} /> Savatga qaytish
        </button>

        <h1 className="text-2xl font-black text-gray-900 mb-6">
          Rasmiylashtirish
        </h1>

        {/* CHEK */}
        <div className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100 mb-8">
          <div className="space-y-3">
            <div className="flex justify-between text-gray-500 font-medium">
              <span>Mahsulotlar ({totalQuantity})</span>
              <span>{totalPrice.toLocaleString()} so'm</span>
            </div>
            <div className="flex justify-between text-gray-500 font-medium">
              <span>Yetkazib berish</span>
              <span>{DELIVERY_FEE.toLocaleString()} so'm</span>
            </div>
            <div className="h-[1px] bg-gray-100 my-2" />
            <div className="flex justify-between items-end">
              <span className="text-gray-900 font-bold">Jami:</span>
              <span className="text-2xl font-black text-green-600">
                {finalTotalAmount.toLocaleString()}{" "}
                <small className="text-sm font-bold">so'm</small>
              </span>
            </div>
          </div>
        </div>

        {/* FORM SECTION */}
        <div className="space-y-5">
          <InputGroup
            label="Ismingiz"
            icon={<User size={14} className="text-orange-500" />}
            name="customerName"
            value={formData.customerName}
            onChange={handleInputChange}
            error={fieldErrors.customerName}
            placeholder="Ismingizni kiriting"
          />

          <InputGroup
            label="Telefon raqam"
            icon={<Phone size={14} className="text-orange-500" />}
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handlePhoneChange}
            error={fieldErrors.customerPhone}
            type="tel"
          />

          <div className="flex flex-col">
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-2">
              <MapPin size={14} className="text-orange-500" /> Tuman
            </label>
            <select
              name="district"
              value={formData.district}
              onChange={handleInputChange}
              className={`w-full bg-white px-5 py-4 rounded-2xl border-2 transition-all outline-none font-bold text-gray-800 appearance-none shadow-sm ${
                fieldErrors.district
                  ? "border-red-400 bg-red-50"
                  : "border-transparent focus:border-orange-500"
              }`}
            >
              <option value="">Tumanni tanlang...</option>
              {TASHKENT_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d} tumani
                </option>
              ))}
            </select>
            {fieldErrors.district && (
              <span className="text-red-500 text-[10px] font-bold mt-1 ml-2">
                {fieldErrors.district}
              </span>
            )}
          </div>

          <InputGroup
            label="Aniq manzil"
            icon={<Navigation size={14} className="text-orange-500" />}
            name="addressDetails"
            value={formData.addressDetails}
            onChange={handleInputChange}
            error={fieldErrors.addressDetails}
            placeholder="Ko'cha, uy, xonadon, mo'ljal..."
            isTextArea
          />
        </div>

        <p className="text-center text-gray-400 text-[11px] mt-10 font-medium leading-relaxed px-10">
          Tugmani bosish orqali siz buyurtmani tasdiqlaysiz. To'lov naqd
          ko'rinishda qabul qilinadi.
        </p>
      </div>
    </div>
  );
};

// 🏗 Yordamchi Component
const InputGroup = ({ label, icon, error, isTextArea, ...props }) => (
  <div className="flex flex-col">
    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-2">
      {icon} {label}
    </label>
    {isTextArea ? (
      <textarea
        {...props}
        className={`w-full bg-white px-5 py-4 rounded-2xl border-2 transition-all outline-none font-bold text-gray-800 shadow-sm resize-none ${
          error
            ? "border-red-400 bg-red-50"
            : "border-transparent focus:border-orange-500"
        }`}
        rows="2"
      />
    ) : (
      <input
        {...props}
        className={`w-full bg-white px-5 py-4 rounded-2xl border-2 transition-all outline-none font-bold text-gray-800 shadow-sm ${
          error
            ? "border-red-400 bg-red-50"
            : "border-transparent focus:border-orange-500"
        }`}
      />
    )}
    {error && (
      <span className="text-red-500 text-[10px] font-bold mt-1 ml-2">
        {error}
      </span>
    )}
  </div>
);

export default CheckoutPage;
