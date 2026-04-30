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
];

const DELIVERY_FEE = 10000; // Yetkazib berish narxi (Doimiy konstanta)

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
    customerPhone: "+998 ", // Boshlang'ich qiymat yo'nalish berish uchun
    district: "",
    addressDetails: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formDataRef = useRef(formData);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Jami hisob (Mahsulotlar + Dostavka)
  const finalTotalAmount = Number(totalPrice) + DELIVERY_FEE;

  // 1. O'zbekiston telefon raqami uchun Maxsus Handler
  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, ""); // Faqat raqamlarni olamiz

    // Agar 998 dan boshlansa, uni olib tashlaymiz (chunki o'zimiz qo'shamiz)
    if (val.startsWith("998")) val = val.substring(3);
    val = val.substring(0, 9); // Maksimal 9 ta raqam (kod + raqam)

    // Formatlash: +998 90 123 45 67
    let formatted = "+998";
    if (val.length > 0) formatted += " " + val.substring(0, 2);
    if (val.length > 2) formatted += " " + val.substring(2, 5);
    if (val.length > 5) formatted += " " + val.substring(5, 7);
    if (val.length > 7) formatted += " " + val.substring(7, 9);

    setFormData((prev) => ({ ...prev, customerPhone: formatted }));
    if (fieldErrors.customerPhone)
      setFieldErrors((prev) => ({ ...prev, customerPhone: null }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name])
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
  };

  const submitOrder = useCallback(async () => {
    const currentData = formDataRef.current;
    setFieldErrors({});

    // Validatsiya
    let localErrors = {};
    if (currentData.customerPhone.length < 17)
      // "+998 90 123 45 67" uzunligi 17 ta belgi
      localErrors.customerPhone = "Telefon raqamni to'liq kiriting";
    if (!currentData.district) localErrors.district = "Tuman tanlanishi shart";
    if (!currentData.addressDetails)
      localErrors.addressDetails = "Manzil kiritilishi shart";

    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      tg.showAlert("Iltimos, barcha maydonlarni to'g'ri to'ldiring!");
      return;
    }

    setIsSubmitting(true);
    tg.MainButton.showProgress();

    try {
      const fullAddress = `${currentData.district} tumani, ${currentData.addressDetails.trim()}`;

      // 2. 🔥 TO'G'RILANGAN PAYLOAD: Modifikatorlar va barcha narxlar
      const orderPayload = {
        tenantId,
        customerId: user?.id || 123456789,
        customerName: currentData.customerName.trim(),
        customerPhone: currentData.customerPhone.replace(/\s/g, ""), // Bo'shliqlarni olib yuboramiz (+998901234567)
        items: cartItems.map((item) => {
          const modsSum =
            item.selectedModifiers?.reduce(
              (sum, m) => sum + (Number(m.price) || 0),
              0,
            ) || 0;
          const itemBasePrice = Number(item.price) || 0;

          return {
            productId: item._id,
            productName: item.name,
            quantity: Number(item.quantity),
            unitPrice: itemBasePrice,
            selectedModifiers: item.selectedModifiers || [],
            itemTotal: (itemBasePrice + modsSum) * Number(item.quantity),
          };
        }),
        subTotal: Number(totalPrice),
        deliveryFee: DELIVERY_FEE,
        totalAmount: finalTotalAmount,
        deliveryType: "DELIVERY",
        deliveryAddress: { text: fullAddress },
        paymentMethod: "CASH",
      };

      const response = await apiClient.post("/orders", orderPayload);

      if (response.success || response.order) {
        tg.showConfirm(
          "✅ Buyurtmangiz qabul qilindi!\nTez orada siz bilan bog'lanamiz.",
          (buttonPressed) => {
            if (buttonPressed) {
              clearCart();
              tg.close();
            }
          },
        );
      }
    } catch (error) {
      console.error("[CHECKOUT ERROR]", error);
      if (error.response?.data?.details) {
        const errors = {};
        error.response.data.details.forEach((err) => {
          errors[err.field] = err.message;
        });
        setFieldErrors(errors);
        tg.showAlert("Ma'lumotlarda xatolik bor. Qayta tekshiring.");
      } else {
        tg.showAlert(
          "Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.",
        );
      }
    } finally {
      setIsSubmitting(false);
      tg.MainButton.hideProgress();
    }
  }, [cartItems, tenantId, user, totalPrice, finalTotalAmount, tg, clearCart]);

  // MainButton ni jami summa bilan ko'rsatish
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate("/");
      return;
    }

    const priceText = finalTotalAmount.toLocaleString("uz-UZ");
    showMainButton(`TASDIQLASH — ${priceText} so'm`, submitOrder);

    return () => {
      tg.MainButton.offClick(submitOrder);
      hideMainButton();
    };
  }, [
    cartItems.length,
    finalTotalAmount,
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
        onClick={() => navigate("/cart")}
        className="flex items-center gap-2 text-orange-500 font-bold text-sm mb-6 active:scale-95 transition-transform uppercase tracking-widest"
      >
        ← Savatga qaytish
      </button>

      <h1 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">
        Buyurtmani tasdiqlash
      </h1>

      {/* 3. 🔥 SHAFFOF CHEK UI */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-6 divide-y divide-gray-50">
        <div className="flex justify-between py-2 items-center">
          <span className="text-gray-500 font-medium text-sm">
            Mahsulotlar ({totalQuantity} ta)
          </span>
          <span className="font-bold text-gray-800">
            {totalPrice.toLocaleString("uz-UZ")} so'm
          </span>
        </div>
        <div className="flex justify-between py-2 items-center">
          <span className="text-gray-500 font-medium text-sm">
            Yetkazib berish haqi
          </span>
          <span className="font-bold text-gray-800">
            {DELIVERY_FEE.toLocaleString("uz-UZ")} so'm
          </span>
        </div>
        <div className="flex justify-between pt-4 pb-1 items-end mt-2">
          <span className="text-gray-900 font-black text-sm uppercase tracking-wider">
            Jami to'lov
          </span>
          <span className="font-black text-2xl text-orange-500">
            {finalTotalAmount.toLocaleString("uz-UZ")}{" "}
            <span className="text-sm">so'm</span>
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Ism */}
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
            className={`w-full px-4 py-4 bg-white border ${
              fieldErrors.customerName ? "border-red-500" : "border-gray-100"
            } rounded-2xl focus:outline-none focus:border-orange-500 font-bold text-gray-800 transition-colors shadow-sm`}
          />
        </div>

        {/* Telefon raqam maskasi bilan */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
            Telefon raqam <span className="text-orange-500">*</span>
          </label>
          <input
            type="tel"
            name="customerPhone"
            placeholder="+998 90 123 45 67"
            value={formData.customerPhone}
            onChange={handlePhoneChange} // Maxsus handler ulandi
            maxLength={17}
            className={`w-full px-4 py-4 bg-white border ${
              fieldErrors.customerPhone ? "border-red-500" : "border-gray-100"
            } rounded-2xl focus:outline-none focus:border-orange-500 font-bold text-gray-900 tracking-wider transition-colors shadow-sm`}
          />
          {fieldErrors.customerPhone && (
            <p className="text-red-500 text-[10px] font-bold mt-2 ml-2 animate-in fade-in">
              ⚠️ {fieldErrors.customerPhone}
            </p>
          )}
        </div>

        {/* Tuman tanlash */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
            Tumaningizni tanlang <span className="text-orange-500">*</span>
          </label>
          <div className="relative">
            <select
              name="district"
              value={formData.district}
              onChange={handleInputChange}
              className={`w-full px-4 py-4 bg-white border ${
                fieldErrors.district ? "border-red-500" : "border-gray-100"
              } rounded-2xl focus:outline-none focus:border-orange-500 font-bold text-gray-800 transition-colors shadow-sm appearance-none`}
            >
              <option value="" disabled>
                Toshkent shahri...
              </option>
              {TASHKENT_DISTRICTS.map((district) => (
                <option key={district} value={district}>
                  {district} tumani
                </option>
              ))}
            </select>
            {/* ... select icon ... */}
          </div>
          {fieldErrors.district && (
            <p className="text-red-500 text-[10px] font-bold mt-2 ml-2 animate-in fade-in">
              ⚠️ {fieldErrors.district}
            </p>
          )}
        </div>

        {/* Aniq manzil */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
            Aniq manzil <span className="text-orange-500">*</span>
          </label>
          <textarea
            name="addressDetails"
            placeholder="Ko'cha, uy, xonadon, mo'ljal..."
            value={formData.addressDetails}
            onChange={handleInputChange}
            rows={2}
            className={`w-full px-4 py-4 bg-white border ${
              fieldErrors.addressDetails ? "border-red-500" : "border-gray-100"
            } rounded-2xl focus:outline-none focus:border-orange-500 font-bold text-gray-800 transition-colors shadow-sm resize-none`}
          />
          {fieldErrors.addressDetails && (
            <p className="text-red-500 text-[10px] font-bold mt-2 ml-2 animate-in fade-in">
              ⚠️ {fieldErrors.addressDetails}
            </p>
          )}
        </div>
      </div>

      <p className="text-center text-gray-400 font-medium text-xs mt-8 mb-4 flex items-center justify-center gap-2">
        <span className="text-lg">💵</span> To'lov yetkazib berilgandan so'ng
        amalga oshiriladi
      </p>
    </div>
  );
};

export default CheckoutPage;
