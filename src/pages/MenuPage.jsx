import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import apiClient from "../services/api";
import ProductCard from "../components/ProductCard";

const MenuPage = () => {
  const { tenantId } = useContext(AppContext);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenuData = async () => {
      if (!tenantId) return;

      console.log(
        `[MENU PAGE] 🚀 Ma'lumotlarni yuklash boshlandi. Tenant: ${tenantId}`,
      );
      setIsLoading(true);

      try {
        const [categoriesData, productsData] = await Promise.all([
          apiClient.get("/categories"),
          apiClient.get("/products"),
        ]);

        // .data olib tashlandi, chunki apiClient o'zi toza datani qaytaradi!
        console.log("[MENU PAGE] ✅ Kategoriyalar keldi:", categoriesData);
        console.log("[MENU PAGE] ✅ Mahsulotlar keldi:", productsData);

        setCategories(categoriesData || []);
        setProducts(productsData || []);

        // Birinchi kategoriyani faol (active) qilib qo'yamiz
        if (categoriesData && categoriesData.length > 0) {
          setActiveCategory(categoriesData[0]._id);
        }
      } catch (err) {
        console.error("[MENU PAGE] ❌ Xato:", err);
        setError("Menyuni yuklashda xatolik yuz berdi.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuData();
  }, [tenantId]);

  // ZERIKARLI YUKLANISH O'RNIGA ZAMONAVIY SKELETON LOADER
  if (isLoading) {
    return (
      <div className="menu-page" style={{ padding: "10px" }}>
        {/* Tepadagi kategoriyalar uchun miltillovchi qutilar */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
            overflowX: "hidden",
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="skeleton-box"
              style={{ minWidth: "80px", height: "35px", borderRadius: "20px" }}
            ></div>
          ))}
        </div>

        {/* Mahsulotlar uchun miltillovchi kartochkalar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px",
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                border: "1px solid #eee",
                borderRadius: "15px",
                padding: "10px",
                backgroundColor: "#fff",
              }}
            >
              {/* Rasm o'rni */}
              <div
                className="skeleton-box"
                style={{
                  width: "100%",
                  height: "120px",
                  borderRadius: "10px",
                  marginBottom: "10px",
                }}
              ></div>
              {/* Sarlavha o'rni */}
              <div
                className="skeleton-box"
                style={{ width: "80%", height: "15px", marginBottom: "8px" }}
              ></div>
              {/* Narx o'rni */}
              <div
                className="skeleton-box"
                style={{ width: "50%", height: "15px", marginBottom: "15px" }}
              ></div>
              {/* Tugma o'rni */}
              <div
                className="skeleton-box"
                style={{ width: "100%", height: "32px", borderRadius: "8px" }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (error)
    return (
      <div style={{ color: "red", textAlign: "center", padding: "20px" }}>
        {error}
      </div>
    );

  const filteredProducts = products.filter(
    (p) => p.categoryId === activeCategory,
  );

  return (
    <div className="menu-page" style={{ paddingBottom: "80px" }}>
      {/* Kategoriyalar */}
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          padding: "10px",
          gap: "10px",
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat._id}
            className="tap-effect" // <-- Mobile bosilish effekti
            onClick={() => setActiveCategory(cat._id)}
            style={{
              padding: "8px 18px",
              borderRadius: "20px",
              border: "none",
              whiteSpace: "nowrap",
              fontSize: "14px",
              fontWeight: activeCategory === cat._id ? "bold" : "normal",
              backgroundColor: activeCategory === cat._id ? "#FF9800" : "#fff",
              color: activeCategory === cat._id ? "#fff" : "#555",
              boxShadow:
                activeCategory === cat._id
                  ? "0 4px 8px rgba(255,152,0,0.3)"
                  : "0 2px 4px rgba(0,0,0,0.05)",
              cursor: "pointer",
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Mahsulotlar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "15px",
          padding: "10px",
        }}
      >
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <p style={{ textAlign: "center", gridColumn: "span 2" }}>
            Bu bo'limda hozircha mahsulot yo'q 😕
          </p>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
