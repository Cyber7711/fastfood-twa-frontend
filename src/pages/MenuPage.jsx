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

  if (isLoading)
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        Yuklanmoqda... ⏳
      </div>
    );
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
            onClick={() => setActiveCategory(cat._id)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "none",
              whiteSpace: "nowrap",
              backgroundColor:
                activeCategory === cat._id ? "#FF9800" : "#f0f0f0",
              color: activeCategory === cat._id ? "#fff" : "#000",
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
