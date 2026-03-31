import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import apiClient from "../services/api";
import FastFoodLoader from "../components/Loader";

const AdminPage = () => {
  const { user, tenantId } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, products, orders

  // Ma'lumotlar state'lari
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal (Forma) uchun state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    imageUrl: "",
  });
  const [editingId, setEditingId] = useState(null);

  // 1. MA'LUMOTLARNI YUKLASH (Asinxron)
  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, productsRes, categoriesRes] = await Promise.all([
        apiClient.get("/admin/stats"),
        apiClient.get("/menu/products"), // Oddiy /menu/products dan olamiz
        apiClient.get("/menu/categories"),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      setProducts(productsRes || []);
      setCategories(categoriesRes || []);
    } catch (error) {
      console.error("Admin ma'lumotlarini yuklashda xato:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) fetchData();
  }, [tenantId]);

  // 2. MAHSULOT QO'SHISH / TAHRIRLASH
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiClient.put(`/admin/products/${editingId}`, formData);
        alert("Mahsulot yangilandi!");
      } else {
        await apiClient.post("/admin/products", formData);
        alert("Yangi mahsulot qo'shildi!");
      }
      setIsModalOpen(false);
      setFormData({
        name: "",
        description: "",
        price: "",
        categoryId: "",
        imageUrl: "",
      });
      setEditingId(null);
      fetchData(); // Ro'yxatni yangilash
    } catch (error) {
      alert("Xatolik yuz berdi!");
    }
  };

  // 3. MAHSULOTNI O'CHIRISH
  const handleDelete = async (id) => {
    if (window.confirm("Rostdan ham bu mahsulotni o'chirmoqchimisiz?")) {
      try {
        await apiClient.delete(`/admin/products/${id}`);
        fetchData();
      } catch (error) {
        alert("O'chirishda xatolik!");
      }
    }
  };

  const openEditModal = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId || "",
      imageUrl: product.imageUrl || "",
    });
    setEditingId(product._id);
    setIsModalOpen(true);
  };

  if (loading) return <FastFoodLoader />;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* --- ADMIN HEADER --- */}
      <div className="bg-gray-900 pt-8 pb-12 px-4 rounded-b-[40px] shadow-lg text-white">
        <h1 className="text-2xl font-black uppercase tracking-widest mb-1">
          Admin Panel
        </h1>
        <p className="text-sm text-gray-400">
          Boshqaruvchi:{" "}
          <span className="text-orange-500 font-bold">
            {user?.firstName || "Admin"}
          </span>
        </p>

        {/* TAB NAVIGATION */}
        <div className="flex gap-2 mt-6 bg-gray-800 p-1 rounded-2xl">
          {["dashboard", "products", "orders"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                activeTab === tab
                  ? "bg-orange-500 text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab === "dashboard"
                ? "Statistika"
                : tab === "products"
                  ? "Mahsulotlar"
                  : "Buyurtmalar"}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 -mt-6">
        {/* --- 1-TAB: DASHBOARD --- */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-500">
            <div className="col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
                Bugungi Tushum
              </p>
              <h2 className="text-3xl font-black text-green-500">
                {stats.totalRevenue.toLocaleString()}{" "}
                <span className="text-sm">so'm</span>
              </h2>
            </div>
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
              <p className="text-gray-400 text-xs font-bold uppercase mb-1">
                Buyurtmalar
              </p>
              <h2 className="text-2xl font-black text-gray-800">
                {stats.totalOrders} <span className="text-sm">ta</span>
              </h2>
            </div>
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
              <p className="text-gray-400 text-xs font-bold uppercase mb-1">
                Kutilmoqda
              </p>
              <h2 className="text-2xl font-black text-orange-500">
                {stats.pendingOrders} <span className="text-sm">ta</span>
              </h2>
            </div>
          </div>
        )}

        {/* --- 2-TAB: MAHSULOTLAR (CRUD) --- */}
        {activeTab === "products" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  name: "",
                  description: "",
                  price: "",
                  categoryId: "",
                  imageUrl: "",
                });
                setIsModalOpen(true);
              }}
              className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black uppercase shadow-lg shadow-orange-200 mb-6 tap-effect"
            >
              + Yangi Mahsulot Qo'shish
            </button>

            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
                >
                  <img
                    src={product.imageUrl}
                    className="w-16 h-16 rounded-xl object-cover bg-gray-100"
                    alt="img"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-sm leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-orange-500 font-black text-xs">
                      {product.price.toLocaleString()} so'm
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="w-8 h-8 bg-blue-50 text-blue-500 rounded-lg flex justify-center items-center tap-effect"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex justify-center items-center tap-effect"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- 3-TAB: BUYURTMALAR --- */}
        {activeTab === "orders" && (
          <div className="text-center py-20 animate-in fade-in duration-500">
            <div className="text-6xl mb-4 opacity-30">🛵</div>
            <p className="text-gray-400 font-bold uppercase tracking-widest">
              Buyurtmalar tez kunda...
            </p>
          </div>
        )}
      </div>

      {/* --- MAHSULOT QO'SHISH / TAHRIRLASH MODALI --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center animate-in fade-in">
          <div className="bg-white w-full rounded-t-[32px] p-6 animate-in slide-in-from-bottom max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black">
                {editingId ? "Mahsulotni tahrirlash" : "Yangi Mahsulot"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 bg-gray-100 rounded-full font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Nomi
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full mt-1 bg-gray-50 p-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none font-medium"
                  placeholder="Masalan: Double Burger"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Narxi (so'm)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full mt-1 bg-gray-50 p-3 rounded-xl border border-gray-200 outline-none font-medium"
                    placeholder="35000"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Kategoriya
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    className="w-full mt-1 bg-gray-50 p-3 rounded-xl border border-gray-200 outline-none font-medium"
                  >
                    <option value="">Tanlang</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Tarkibi / Ta'rifi
                </label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full mt-1 bg-gray-50 p-3 rounded-xl border border-gray-200 outline-none font-medium"
                  placeholder="Mol go'shti, pishloq..."
                ></textarea>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Rasm URL manzili
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  className="w-full mt-1 bg-gray-50 p-3 rounded-xl border border-gray-200 outline-none font-medium text-xs"
                  placeholder="https://..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase mt-4 tap-effect"
              >
                {editingId ? "Saqlash" : "Qo'shish"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
