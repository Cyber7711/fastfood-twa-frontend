import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";

const ProductCard = ({ product }) => {
  // 1. cart emas, cartItems deb yozamiz.
  // Shuningdek, xatolikni oldini olish uchun {} || {} himoyasini qo'shamiz
  const {
    cartItems = [],
    addToCart,
    removeFromCart,
  } = useContext(CartContext) || {};

  // 2. cartItems massiv ekanligiga ishonch hosil qilamiz (HIMOYA)
  const cartItem = Array.isArray(cartItems)
    ? cartItems.find((item) => item._id === product._id)
    : null;

  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <div className="product-card fade-in-card">
      {/* 1. Rasm qismi */}
      <div
        style={{
          width: "100%",
          height: "140px",
          overflow: "hidden",
          backgroundColor: "#f9f9f9",
        }}
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* 2. Ma'lumotlar qismi */}
      <div
        style={{
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        <h3
          style={{
            margin: "0 0 4px 0",
            fontSize: "15px",
            fontWeight: "bold",
            color: "#333",
          }}
        >
          {product.name}
        </h3>

        <p
          style={{
            margin: "0 0 10px 0",
            fontSize: "12px",
            color: "#888",
            flexGrow: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.description}
        </p>

        <div
          style={{
            fontWeight: "bold",
            fontSize: "15px",
            color: "#FF9800",
            marginBottom: "12px",
          }}
        >
          {product.price.toLocaleString("uz-UZ")} so'm
        </div>

        {/* 3. Savatga qo'shish yoki Ayirish/Qo'shish tugmalari */}
        {quantity === 0 ? (
          <button
            className="tap-effect"
            onClick={() => addToCart(product)}
            style={{
              backgroundColor: "#FF9800",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "10px",
              fontSize: "14px",
              fontWeight: "bold",
              width: "100%",
              cursor: "pointer",
            }}
          >
            Qo'shish
          </button>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <button
              className="tap-effect"
              onClick={() => removeFromCart(product._id)}
              style={{
                backgroundColor: "#f0f0f0",
                border: "none",
                borderRadius: "8px",
                width: "35px",
                height: "35px",
                fontSize: "18px",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              -
            </button>
            <span style={{ fontWeight: "bold", fontSize: "16px" }}>
              {quantity}
            </span>
            <button
              className="tap-effect"
              onClick={() => addToCart(product)}
              style={{
                backgroundColor: "#FF9800",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                width: "35px",
                height: "35px",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
