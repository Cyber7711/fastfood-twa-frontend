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
import { useNavigate } from "react-router-dom";

const MenuPage = () => {
  const { tenantId, user } = useContext(AppContext);
  const navigate = useNavigate();

  // Mantiqiy State'lar
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all"); // Default: "Barchasi"
  const [searchQuery, setSearchQuery] = useState(""); // Qidiruv uchun

  // Holat State'lari
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ma'lumotlarni serverdan tortish
  const fetchMenuData = useCallback(async () => {
    if (!tenantId) return;

    setIsLoading(true);
    setError(null);

    try {
      const [categoriesData, productsData] = await Promise.all([
        apiClient.get("/menu/categories"),
        apiClient.get("/menu/products"),
      ]);

      // Kategoriyalar boshiga "Barchasi" degan virtual kategoriya qo'shamiz
      const allCategories = [
        { _id: "all", name: "Barchasi 🍔" },
        ...(categoriesData || []),
      ];

      setCategories(allCategories);
      setProducts(productsData || []);
    } catch (err) {
      console.error("[MENU PAGE] ❌ Xato:", err);
      setError(
        "Menyuni yuklashda xatolik yuz berdi. Internetni tekshirib qayta urinib ko'ring.",
      );
    } finally {
      // UX uchun qisqa pauza (Loader chiroyli ko'rinishi uchun)
      setTimeout(() => setIsLoading(false), 500);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchMenuData();
  }, [fetchMenuData]);

  // "Super" Filtr: Ham qidiruv, ham kategoriya bo'yicha
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Kategoriya bo'yicha tekshiruv
      const matchCategory =
        activeCategory === "all" || p.categoryId === activeCategory;

      // 2. Qidiruv bo'yicha tekshiruv (Harflarni kichik qilib solishtiramiz)
      const matchSearch = p.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return matchCategory && matchSearch;
    });
  }, [products, activeCategory, searchQuery]);

  // LOADER HOLATI
  if (isLoading) return <FastFoodLoader />;

  // XATOLIK HOLATI
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center animate-in fade-in">
        <div className="text-7xl mb-6">🔌</div>
        <h2 className="text-xl font-black text-gray-800 mb-2">
          Ulanishda xatolik!
        </h2>
        <p className="text-gray-500 font-medium mb-8 max-w-xs">{error}</p>
        <button
          onClick={fetchMenuData}
          className="px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-orange-200 active:scale-95 transition-all"
        >
          Qayta yuklash
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* --- 1. ADMIN PANEL HEADER --- */}
      {user?.isAdmin && (
        <div className="bg-gray-900 text-white px-4 py-2.5 flex justify-between items-center sticky top-0 z-[60]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-[10px] font-black tracking-widest uppercase">
              Admin Mode
            </span>
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="bg-orange-500 px-4 py-1.5 rounded-lg text-[10px] font-black active:scale-95 transition-transform uppercase"
          >
            Panelga o'tish ⚙️
          </button>
        </div>
      )}

      {/* --- 2. QIDIRUV VA KATEGORIYALAR (Sticky Container) --- */}
      <div
        className={`sticky ${user?.isAdmin ? "top-10" : "top-0"} z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm pt-4 pb-2`}
      >
        {/* Qidiruv qismi */}
        <div className="px-4 mb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Taom yoki ichimlik qidiring..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100/80 text-gray-800 text-sm font-semibold px-11 py-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500/50 transition-all placeholder:text-gray-400"
            />
            {/* Qidiruv ikonchasi (Oddiy SVG) */}
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            {/* Qidiruvni tozalash tugmasi (Faqat yozilganda chiqadi) */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-300 text-white rounded-full flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Kategoriyalar Slideri */}
        <div className="flex overflow-x-auto no-scrollbar px-4 gap-2 pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300 active:scale-95 flex-shrink-0
                ${
                  activeCategory === cat._id
                    ? "bg-gray-900 text-white shadow-md scale-105"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }
              `}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* --- 3. ASOSIY KONTENT (MAHSULOTLAR) --- */}
      <div className="p-4 pt-6">
        {filteredProducts.length > 0 ? (
          <>
            <div className="mb-5 flex justify-between items-end px-1">
              <h2 className="text-lg font-black text-gray-800 tracking-tight">
                {activeCategory === "all" && !searchQuery
                  ? "Barcha taomlar"
                  : "Natijalar"}
              </h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">
                {filteredProducts.length} ta
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 animate-in fade-in duration-500">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
            <div className="text-[80px] mb-4 opacity-50 grayscale">🔍</div>
            <h3 className="text-xl font-black text-gray-800 mb-1">
              Hech narsa topilmadi
            </h3>
            <p className="text-gray-500 text-sm font-medium">
              "{searchQuery}" bo'yicha mahsulot yo'q. Boshqa nom yozib ko'ring.
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-6 text-orange-500 font-bold uppercase tracking-widest text-xs border border-orange-500 px-6 py-2 rounded-xl active:bg-orange-50"
              >
                Qidiruvni tozalash
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
