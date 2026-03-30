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
import { useNavigate } from "react-router-dom"; // Sahifalararo o'tish uchun

const MenuPage = () => {
  const { tenantId, user } = useContext(AppContext); // User ma'lumotlarini context'dan olamiz
  const navigate = useNavigate();

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
        apiClient.get("/menu/categories"),
        apiClient.get("/menu/products"),
      ]);

      setCategories(categoriesData || []);
      setProducts(productsData || []);

      if (categoriesData?.length > 0) {
        setActiveCategory(categoriesData[0]._id);
      }
    } catch (err) {
      console.error("[MENU PAGE] ❌ Xato:", err);
      setError("Menyuni yuklashda xatolik yuz berdi. Qayta urinib ko‘ring.");
    } finally {
      setTimeout(() => setIsLoading(false), 650);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchMenuData();
  }, [fetchMenuData]);

  const filteredProducts = useMemo(() => {
    if (!activeCategory) return products;
    return products.filter((p) => p.categoryId === activeCategory);
  }, [products, activeCategory]);

  if (isLoading) return <FastFoodLoader />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <div className="text-6xl mb-6">⚠️</div>
        <p className="text-red-600 font-semibold mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-orange-500 text-white font-bold rounded-2xl shadow-lg"
        >
          Qayta urinish
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* --- ADMIN DASHBOARD TUGMASI --- */}
      {/* Agar foydalanuvchi admin bo'lsa (Backend'dan kelgan flag bo'yicha) */}
      {user?.isAdmin && (
        <div className="bg-gray-900 text-white px-4 py-2 flex justify-between items-center sticky top-0 z-[50]">
          <span className="text-[10px] font-black tracking-widest uppercase">
            Admin Mode
          </span>
          <button
            onClick={() => navigate("/admin")}
            className="bg-orange-500 px-3 py-1 rounded-lg text-[10px] font-bold active:scale-90 transition-transform"
          >
            PANELGA O'TISH ⚙️
          </button>
        </div>
      )}

      {/* Sticky Kategoriyalar Header */}
      <div
        className={`sticky ${user?.isAdmin ? "top-10" : "top-0"} z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100`}
      >
        <div className="flex overflow-x-auto no-scrollbar py-5 px-4 gap-3">
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className={`whitespace-nowrap px-7 py-3 rounded-3xl text-sm font-bold transition-all duration-300 active:scale-95 flex-shrink-0
                ${
                  activeCategory === cat._id
                    ? "bg-orange-500 text-white shadow-xl shadow-orange-300 scale-105"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
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
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                {filteredProducts.length} ta mahsulot topildi
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-28 text-center opacity-40">
            <div className="text-[92px] mb-6">🍔</div>
            <p className="text-gray-400 font-bold text-xl tracking-tighter uppercase">
              Bo'shliq...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
