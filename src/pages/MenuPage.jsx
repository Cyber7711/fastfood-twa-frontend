import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import apiClient from "../services/api";
// ProductCard komponentini keyingi qadamda yaratamiz, hozircha chaqirib qo'yamiz
import ProductCard from "../components/ProductCard";

const MenuPage = () => {
  // 1. Global context'dan tenantId (Do'kon IDsi) ni olamiz
  const { tenantId } = useContext(AppContext);

  // 2. Sahifa holatlari (States)
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null); // Qaysi kategoriya tanlangan?
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3. Backenddan ma'lumotlarni tortib olish funksiyasi
  useEffect(() => {
    const fetchMenuData = async () => {
      // Agar tenantId hali kelmagan bo'lsa, kutib turamiz
      if (!tenantId) {
        console.log("[MENU PAGE] ⏳ tenantId kutilmoqda...");
        return;
      }

      console.log(
        `[MENU PAGE] 🚀 Ma'lumotlarni yuklash boshlandi. Tenant: ${tenantId}`,
      );
      setIsLoading(true);

      try {
        // Promise.all orqali ikkita so'rovni bir vaqtda parallel yuboramiz (tezroq ishlashi uchun)
        // Eslatma: apiClient o'zi avtomat tarzda headersga tenantId ni qo'shib beradi!
        const [categoriesRes, productsRes] = await Promise.all([
          apiClient.get("/categories"),
          apiClient.get("/products"),
        ]);

        console.log("[MENU PAGE] ✅ Kategoriyalar keldi:", categoriesRes.data);
        console.log("[MENU PAGE] ✅ Mahsulotlar keldi:", productsRes.data);

        setCategories(categoriesRes.data || []);
        setProducts(productsRes.data || []);

        // Agar kategoriyalar bo'lsa, avtomatik birinchisini "Faol" qilib qo'yamiz
        if (categoriesRes.data && categoriesRes.data.length > 0) {
          setActiveCategory(categoriesRes.data[0]._id);
        }
      } catch (err) {
        console.error("[MENU PAGE] ❌ Ma'lumotlarni yuklashda xato:", err);
        setError(
          "Menyuni yuklashda xatolik yuz berdi. Iltimos qayta urinib ko",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuData();
  }, [tenantId]); // tenantId o'zgarganda (yoki topilganda) useEffect qayta ishlaydi

  // 4. Ekranga chiqarish qismi (Render)

  // A) Yuklanayotgan holat
  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        Yuklanmoqda... ⏳
      </div>
    );
  }

  // B) Xatolik holati
  if (error) {
    return (
      <div style={{ color: "red", textAlign: "center", padding: "20px" }}>
        {error}
      </div>
    );
  }

  // C) Faqat tanlangan kategoriyaga tegishli mahsulotlarni filtrlab olamiz
  const filteredProducts = products.filter(
    (p) => p.categoryId === activeCategory,
  );

  return (
    <div className="menu-page" style={{ paddingBottom: "80px" }}>
      {/* KATEGORIYALAR QISMI (Horizontal Scroll) */}
      <div
        className="categories-container"
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
            onClick={() => {
              console.log(`[MENU PAGE] Kategoriya tanlandi: ${cat.name}`);
              setActiveCategory(cat._id);
            }}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "none",
              whiteSpace: "nowrap",
              // Tanlangan bo'lsa to'q rang, yo'qsa ochiq rang (Telegram ranglariga moslashadi)
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

      {/* MAHSULOTLAR RO'YXATI */}
      <div
        className="products-grid"
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
