import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { CartContext } from "../context/CartContext";
import { useTelegram } from "../hooks/useTelegram";
import apiClient from "../services/api";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { tenantId, user } = useContext(AppContext);
  const { cartItems, totalPrice, totalQuantity } = useContext(CartContext);
  const { tg, showMainButton, hideMainButton } = useTelegram();

  // Mijoz kiritadigan ma'lumotlar (State)
  const [formData, setFormData] = useState({
    customerName: user?.first_name || "", // Telegramdan kelgan ismni avtomatik qo'yamiz
    customerPhone: "",
    deliveryAddress: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inputlar o'zgarganda ishlaydigan funksiya
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Asosiy buyurtma yuborish funksiyasi
  const submitOrder = async () => {
    // 1. Oddiy tekshiruv (Validation)
    if (!formData.customerPhone || !formData.deliveryAddress) {
      tg.showAlert("Iltimos, telefon raqam va manzilni kiriting!");
      return;
    }

    console.log("[CHECKOUT] 🚀 Buyurtma backendga yuborilmoqda...");
    setIsSubmitting(true);
    tg.MainButton.showProgress(); // Telegram tugmasida "Aylanayotgan loader" chiqaramiz

    try {
      // 2. Backend kutayotgan Zod sxemasiga moslab obyekt yig'amiz
      const orderPayload = {
        tenantId: tenantId,
        telegramId: user?.id || 123456789, // Test uchun fallback
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        items: cartItems.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
        })),
        deliveryType: "DELIVERY",
        deliveryAddress: { text: formData.deliveryAddress },
        paymentMethod: "CASH",
      };

      // 3. Biz yozgan xavfsiz Axios (apiClient) orqali jo'natamiz
      const response = await apiClient.post("/orders", orderPayload);

      console.log("[CHECKOUT] ✅ Buyurtma qabul qilindi:", response);

      // 4. Mijozga xabar berib, TWA ni yopamiz
      tg.showAlert(
        "Buyurtmangiz muvaffaqiyatli qabul qilindi! Kuryer siz bilan bog'lanadi.",
        () => {
          tg.close(); // Telegram ilovasini yopish
        },
      );
    } catch (error) {
      console.error("[CHECKOUT] ❌ Xatolik yuz berdi:", error);
      tg.showAlert("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
      tg.MainButton.hideProgress();
    }
  };

  // Telegram MainButton ni sozlash
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/"); // Savat bo'sh bo'lsa, orqaga qaytarib yuboramiz
      return;
    }

    console.log('[CHECKOUT] 🔘 MainButton "Tasdiqlash" ga o\'zgartirildi.');
    showMainButton(
      `Tasdiqlash: ${totalPrice.toLocaleString()} so'm`,
      submitOrder,
    );

    // Komponent yopilganda clickni tozalaymiz
    return () => tg.MainButton.offClick(submitOrder);
  }, [cartItems, totalPrice, formData]); // formData o'zgarganda ham tugma logikasi yangilanishi kerak

  return (
    <div style={{ padding: "20px", paddingBottom: "80px" }}>
      <button
        onClick={() => navigate("/")}
        style={{ marginBottom: "15px", padding: "5px 10px" }}
      >
        ← Orqaga
      </button>

      <h2>Buyurtmani rasmiylashtirish</h2>

      <div
        style={{
          backgroundColor: "#fff",
          padding: "15px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <p>
          Jami mahsulotlar: <b>{totalQuantity} ta</b>
        </p>
        <p>
          Umumiy summa: <b>{totalPrice.toLocaleString()} so'm</b>
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input
          type="text"
          name="customerName"
          placeholder="Ismingiz"
          value={formData.customerName}
          onChange={handleInputChange}
          style={inputStyle}
        />
        <input
          type="tel"
          name="customerPhone"
          placeholder="Telefon raqam (+998...)"
          value={formData.customerPhone}
          onChange={handleInputChange}
          style={inputStyle}
        />
        <textarea
          name="deliveryAddress"
          placeholder="Manzilni aniq kiriting (Mo'ljal...)"
          value={formData.deliveryAddress}
          onChange={handleInputChange}
          style={{ ...inputStyle, minHeight: "80px" }}
        />
      </div>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  boxSizing: "border-box",
};

export default CheckoutPage;
