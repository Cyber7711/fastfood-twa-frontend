import React, { useState, useEffect, useContext, useMemo } from "react";
import { AppContext } from "../context/AppContext";
import apiClient from "../services/api";
import ProductCard from "../components/ProductCard";
import FastFoodLoader from "../components/Loader"; // O'zimizning "Burger" loader

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

      setIsLoading(true);
      try {
        // Ikkala so'rovni parallel yuboramiz (Tezroq yuklanadi)
        const [categoriesData, productsData] = await Promise.all([
          apiClient.get("/categories"),
          apiClient.get("/products"),
        ]);

        setCategories(categoriesData || []);
        setProducts(productsData || []);

        // Birinchi kategoriyani avtomatik tanlash
        if (categoriesData && categoriesData.length > 0) {
          setActiveCategory(categoriesData[0]._id);
        }
      } catch (err) {
        console.error("[MENU PAGE] ❌ Xato:", err);
        setError("Menyuni yuklashda xatolik yuz berdi.");
      } finally {
        // Animatsiyani foydalanuvchi ko'rishi uchun biroz ushlab turamiz
        setTimeout(() => setIsLoading(false), 600);
      }
    };

    fetchMenuData();
  }, [tenantId]);

  // Mahsulotlarni filtrlash (useMemo hisoblashni optimallashtiradi)
  const filteredProducts = useMemo(() => {
    if (!activeCategory) return products;
    return products.filter((p) => p.categoryId === activeCategory);
  }, [products, activeCategory]);

  // 1. Yuklanish holati (Siz aytgan Loader)
  if (isLoading) return <FastFoodLoader />;

  // 2. Xatolik holati
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-red-500 font-bold">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-xl font-bold"
        >
          Qayta urinish
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* --- KATEGORIYALAR (Sticky header) --- */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="flex overflow-x-auto no-scrollbar py-4 px-4 gap-3">
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className={`
                whitespace-nowrap px-6 py-2.5 rounded-2xl text-sm font-black tracking-tight transition-all duration-300 tap-effect
                ${
                  activeCategory === cat._id
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-200 scale-105"
                    : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
                }
              `}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* --- MAHSULOTLAR GRID --- */}
      <div className="p-4">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4 opacity-30">🍕</div>
            <p className="text-gray-400 font-medium italic">
              Bu bo'limda hozircha mahsulot yo'q...
            </p>
          </div>
        )}
      </div>

      {/* --- BOTTOM FLOATING STATS (Optional) --- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        {/* Bu yerda savatga o'tish tugmasi chiqadi (CartContext orqali) */}
      </div>
    </div>
  );
};

export default MenuPage;
