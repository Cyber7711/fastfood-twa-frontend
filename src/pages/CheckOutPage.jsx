import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { CartContext } from "../context/CartContext";
import { useTelegram } from "../hooks/useTelegram";
import apiClient from "../services/api";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { tenantId, user } = useContext(AppContext);
  const { cartItems, totalPrice, totalQuantity, clearCart } =
    useContext(CartContext);
  const { tg, showMainButton, hideMainButton } = useTelegram();

  const [formData, setFormData] = useState({
    customerName: user?.first_name || "",
    customerPhone: "",
    deliveryAddress: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Buyurtma yuborish funksiyasi (useCallback xatolar oldini oladi)
  const submitOrder = useCallback(async () => {
    if (!formData.customerPhone || !formData.deliveryAddress) {
      tg.showAlert("Iltimos, barcha maydonlarni to'ldiring!");
      return;
    }

    tg.MainButton.showProgress();

    try {
      const orderPayload = {
        tenantId: tenantId,
        telegramId: user?.id,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        items: cartItems.map((item) => ({
          productId: item._id,
          name: item.name, // PDF chek uchun ismini ham yuboramiz
          quantity: item.quantity,
          price: item.price,
        })),
        totalPrice: totalPrice,
        deliveryAddress: { text: formData.deliveryAddress },
        paymentMethod: "CASH",
      };

      const response = await apiClient.post("/orders", orderPayload);

      if (response.success) {
        tg.showConfirm("Buyurtma qabul qilindi! Adminga xabar berildi.", () => {
          clearCart();
          tg.close();
        });
      }
    } catch (error) {
      tg.showAlert("Backend bilan aloqa o'rnatib bo'lmadi!");
    } finally {
      tg.MainButton.hideProgress();
    }
  }, [formData, cartItems, tenantId, user, totalPrice, tg, clearCart]);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/");
      return;
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
    tg,
    navigate,
    showMainButton,
    hideMainButton,
  ]);

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <button onClick={() => navigate("/")} style={backBtnStyle}>
        ← Menyu
      </button>

      <h2 style={{ margin: "10px 0" }}>Rasmiylashtirish</h2>

      <div style={cardStyle}>
        <p>
          Mahsulotlar: <b>{totalQuantity} ta</b>
        </p>
        <p>
          Jami summa:{" "}
          <b style={{ color: "#FF9800" }}>{totalPrice.toLocaleString()} so'm</b>
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
          placeholder="Telefon (+998...)"
          value={formData.customerPhone}
          onChange={handleInputChange}
          style={inputStyle}
        />
        <textarea
          name="deliveryAddress"
          placeholder="Manzil va mo'ljal"
          value={formData.deliveryAddress}
          onChange={handleInputChange}
          style={{ ...inputStyle, minHeight: "80px" }}
        />
      </div>
    </div>
  );
};

// --- Styles ---
const backBtnStyle = {
  border: "none",
  background: "none",
  color: "#FF9800",
  fontWeight: "bold",
  padding: "5px 0",
};
const cardStyle = {
  backgroundColor: "#fff",
  padding: "15px",
  borderRadius: "12px",
  marginBottom: "20px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};
const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #ddd",
  outline: "none",
};

export default CheckoutPage;
