import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { CartContext } from "../context/CartContext";
import { useTelegram } from "../hooks/useTelegram";
import apiClient from "../services/api";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { tenantId, user } = useContext(AppContext);

  // HIMOYA: cartItems topilmasa, undefined bo'lib qolmasligi uchun default [] beramiz
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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitOrder = useCallback(async () => {
    if (!formData.customerPhone || !formData.deliveryAddress) {
      tg.showAlert("Iltimos, telefon raqam va manzilni kiriting!");
      return;
    }

    setIsSubmitting(true);
    tg.MainButton.showProgress();

    try {
      const orderPayload = {
        tenantId: tenantId,
        telegramId: user?.id || 123456789,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        items: cartItems.map((item) => ({
          productId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalPrice: totalPrice,
        deliveryType: "DELIVERY",
        deliveryAddress: { text: formData.deliveryAddress },
        paymentMethod: "CASH",
      };

      const response = await apiClient.post("/orders", orderPayload);

      if (response.success) {
        tg.showConfirm("Buyurtmangiz qabul qilindi! Savat tozalanadi.", () => {
          clearCart();
          tg.close();
        });
      }
    } catch (error) {
      console.error("[CHECKOUT ERROR]", error);
      tg.showAlert("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
      tg.MainButton.hideProgress();
    }
  }, [formData, cartItems, tenantId, user, totalPrice, tg, clearCart]);

  useEffect(() => {
    // Savat bo'sh bo'lsa yoki context hali yuklanmagan bo'lsa
    if (!cartItems || cartItems.length === 0) {
      const timer = setTimeout(() => navigate("/"), 500);
      return () => clearTimeout(timer);
    }

    showMainButton(
      `TASDIQLASH: ${totalPrice.toLocaleString()} so'm`,
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

  return (
    <div style={containerStyle}>
      <button onClick={() => navigate("/")} style={backBtnStyle}>
        ← Menyu
      </button>
      <h2 style={{ margin: "15px 0" }}>Buyurtmani tasdiqlash</h2>

      <div style={infoCardStyle}>
        <div style={infoRow}>
          <span>Jami mahsulotlar:</span>
          <b>{totalQuantity} ta</b>
        </div>
        <div style={infoRow}>
          <span>Umumiy summa:</span>
          <b style={{ color: "#FF9800", fontSize: "1.1rem" }}>
            {totalPrice.toLocaleString()} so'm
          </b>
        </div>
      </div>

      <div style={formStyle}>
        <div style={inputGroup}>
          <label style={labelStyle}>Ismingiz</label>
          <input
            type="text"
            name="customerName"
            placeholder="Ismingizni kiriting"
            value={formData.customerName}
            onChange={handleInputChange}
            style={inputStyle}
          />
        </div>

        <div style={inputGroup}>
          <label style={labelStyle}>Telefon raqamingiz</label>
          <input
            type="tel"
            name="customerPhone"
            placeholder="+998 90 123 45 67"
            value={formData.customerPhone}
            onChange={handleInputChange}
            style={inputStyle}
          />
        </div>

        <div style={inputGroup}>
          <label style={labelStyle}>Yetkazib berish manzili</label>
          <textarea
            name="deliveryAddress"
            placeholder="Uy, ko'cha, mo'ljal..."
            value={formData.deliveryAddress}
            onChange={handleInputChange}
            style={{ ...inputStyle, minHeight: "80px", resize: "none" }}
          />
        </div>
      </div>
    </div>
  );
};

// --- Inline Styles (Sizning dizayningizga mos) ---
const containerStyle = {
  padding: "20px",
  paddingBottom: "100px",
  backgroundColor: "#f8f9fa",
  minHeight: "100vh",
};
const backBtnStyle = {
  border: "none",
  background: "none",
  color: "#FF9800",
  fontWeight: "bold",
  fontSize: "16px",
  marginBottom: "15px",
  cursor: "pointer",
};
const infoCardStyle = {
  backgroundColor: "#fff",
  padding: "15px",
  borderRadius: "12px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  marginBottom: "20px",
};
const infoRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "8px",
};
const formStyle = { display: "flex", flexDirection: "column", gap: "15px" };
const inputGroup = { display: "flex", flexDirection: "column", gap: "5px" };
const labelStyle = { fontSize: "14px", color: "#666", fontWeight: "500" };
const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #ddd",
  fontSize: "16px",
  outline: "none",
  boxSizing: "border-box",
};

export default CheckoutPage;
