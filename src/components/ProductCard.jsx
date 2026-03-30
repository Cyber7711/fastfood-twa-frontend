import React, { useContext } from "react";
import { CartContext } from "../context/CartContext"; // Miyani chaqiramiz

const ProductCard = ({ product }) => {
  // 1. Context'dan kerakli funksiya va ma'lumotlarni olamiz
  const { cartItems, addToCart, removeFromCart } = useContext(CartContext);

  // 2. Ushbu aniq mahsulot savatda bormi? Agar bo'lsa soni (quantity) nechta?
  const cartItem = cartItems.find((item) => item._id === product._id);
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <div
      style={{
        border: "1px solid #eaeaea",
        borderRadius: "12px",
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
      }}
    >
      {/* Rasm */}
      <img
        src={product.imageUrl || "https://via.placeholder.com/150"}
        alt={product.name}
        style={{
          width: "100%",
          height: "120px",
          objectFit: "cover",
          borderRadius: "8px",
        }}
      />

      {/* Ma'lumotlar */}
      <h3 style={{ fontSize: "16px", margin: "10px 0 5px 0" }}>
        {product.name}
      </h3>
      <p
        style={{
          color: "#888",
          fontSize: "12px",
          margin: "0 0 10px 0",
          flexGrow: 1,
        }}
      >
        {product.description?.substring(0, 40)}...
      </p>

      {/* Narx va Boshqaruv tugmalari */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "auto",
        }}
      >
        <span style={{ fontWeight: "bold" }}>
          {product.price.toLocaleString()} so'm
        </span>

        {/* Agar savatda bo'lsa - [1] + qilib ko'rsatamiz, yo'qsa faqat + */}
        {quantity > 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Ayirish tugmasi */}
            <button
              onClick={() => {
                console.log(`[UI] "-" bosildi: ${product.name}`);
                removeFromCart(product._id);
              }}
              style={buttonStyle}
            >
              -
            </button>

            {/* Soni */}
            <span style={{ fontWeight: "bold", fontSize: "16px" }}>
              {quantity}
            </span>

            {/* Qo'shish tugmasi */}
            <button
              onClick={() => {
                console.log(`[UI] "+" bosildi (yana): ${product.name}`);
                addToCart(product);
              }}
              style={buttonStyle}
            >
              +
            </button>
          </div>
        ) : (
          /* Birinchi marta qo'shish tugmasi */
          <button
            onClick={() => {
              console.log(`[UI] "Qo'shish" bosildi: ${product.name}`);
              addToCart(product);
            }}
            style={{
              ...buttonStyle,
              padding: "0 15px",
              width: "auto",
              borderRadius: "20px",
            }}
          >
            Qo'shish
          </button>
        )}
      </div>
    </div>
  );
};

// Takrorlanmasligi uchun tugma dizaynini alohida o'zgaruvchiga oldik
const buttonStyle = {
  backgroundColor: "#FF9800",
  color: "white",
  border: "none",
  borderRadius: "50%",
  width: "30px",
  height: "30px",
  cursor: "pointer",
  fontSize: "18px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

export default ProductCard;
