import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from "react";
import { AppContext } from "../context/AppContext";
import apiClient from "../services/api";
import ProductCard from "../components/ProductCard";
import FastFoodLoader from "../components/Loader";

const MenuPage = () => {
  const { tenantId } = useContext(AppContext);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ma'lumotlarni yuklash
  const fetchMenuData = useCallback(async () => {
    if (!tenantId) return;

    setIsLoading(true);
    setError(null);

    try {
      const [categoriesData, productsData] = await Promise.all([
        apiClient.get("/menu/categories"), // "/categories" o'rniga "/menu/categories"
        apiClient.get("/menu/products"), // "/products" o'rniga "/menu/products"
      ]);

      setCategories(categoriesData || []);
      setProducts(productsData || []);

      // Birinchi kategoriyani avtomatik tanlash
      if (categoriesData?.length > 0) {
        setActiveCategory(categoriesData[0]._id);
      }
    } catch (err) {
      console.error("[MENU PAGE] ❌ Xato:", err);
      setError(
        "Menyuni yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.",
      );
    } finally {
      setTimeout(() => setIsLoading(false), 650);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchMenuData();
  }, [fetchMenuData]);

  // Filtrlash
  const filteredProducts = useMemo(() => {
    if (!activeCategory) return products;
    return products.filter((p) => p.categoryId === activeCategory);
  }, [products, activeCategory]);

  // Yuklanish holati
  if (isLoading) {
    return <FastFoodLoader />;
  }

  // Xatolik holati
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <div className="text-6xl mb-6">⚠️</div>
        <p className="text-red-600 font-semibold text-lg mb-6 max-w-xs">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-orange-200"
        >
          Qayta urinish
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Sticky Kategoriyalar Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="flex overflow-x-auto no-scrollbar py-5 px-4 gap-3 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className={`whitespace-nowrap px-7 py-3 rounded-3xl text-sm font-bold tracking-tight transition-all duration-300 active:scale-95 tap-effect flex-shrink-0
                ${
                  activeCategory === cat._id
                    ? "bg-orange-500 text-white shadow-xl shadow-orange-300 scale-105"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }
              `}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Asosiy kontent */}
      <div className="p-4">
        {filteredProducts.length > 0 ? (
          <>
            <div className="mb-4 px-1">
              <p className="text-gray-500 text-sm">
                {filteredProducts.length} ta mahsulot
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="text-[92px] mb-6 opacity-30">🍔</div>
            <p className="text-gray-400 font-medium text-xl">
              Bu bo‘limda hozircha mahsulot yo‘q
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Boshqa kategoriyani tanlab ko‘ring
            </p>
          </div>
        )}
      </div>

      {/* Floating Cart Area (kelajak uchun joy) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        {/* Bu yerga savat tugmasi qo‘yiladi */}
      </div>
    </div>
  );
};

export default MenuPage;
