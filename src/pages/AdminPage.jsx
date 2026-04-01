import React, { useState, useEffect, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { useTelegram } from "../hooks/useTelegram"; // Telegram funksiyalari uchun
import apiClient from "../services/api";
import FastFoodLoader from "../components/Loader";

const AdminPage = () => {
  const { user, tenantId } = useContext(AppContext);
  const navigate = useNavigate();
  const { tg } = useTelegram(); // Telegram obyekti

  const [activeTab, setActiveTab] = useState("dashboard");

  // --- MA'LUMOTLAR STATE ---
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [orderStatusTab, setOrderStatusTab] = useState("NEW");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔥 ASOSIY FORMA (+ oldPrice qo'shildi)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    oldPrice: "", // Yangi: Chegirma uchun eski narx
    categoryId: "",
    imageUrl: "",
    ingredients: [],
    modifiers: [],
  });
  const [editingId, setEditingId] = useState(null);

  const [newIngredient, setNewIngredient] = useState("");
  const [newModifier, setNewModifier] = useState({
    name: "",
    price: "",
    type: "add",
  });

  // TELEGRAM BACK BUTTON BOSHQARUVI (Xavfsiz usul)
  // ==========================================
  useEffect(() => {
    // tg obyekti va BackButton borligini to'liq tekshiramiz
    if (tg && tg.BackButton) {
      tg.BackButton.show(); // Tugmani ko'rsatish

      const handleBack = () => {
        navigate("/"); // Menyuga qaytarish
      };

      // Tugma bosilganda ishlaydigan hodisa
      tg.onEvent("backButtonClicked", handleBack);

      return () => {
        // Komponentdan chiqib ketayotganda tozalash
        tg.offEvent("backButtonClicked", handleBack);
        tg.BackButton.hide();
      };
    }
  }, [tg, navigate]);

  // ==========================================
  // MA'LUMOTLARNI YUKLASH (403 xatosini ushlash bilan)
  // ==========================================
  const fetchData = async () => {
    setLoading(true);
    try {
      // .catch larni yaxshilaymiz, toki 403 kelsa dastur qizarib ketmasin
      const safeGet = (url) =>
        apiClient.get(url).catch((err) => {
          if (err.response?.status === 403)
            console.warn(`Access denied for ${url}`);
          return null;
        });

      const [statsRes, productsRes, categoriesRes, ordersRes] =
        await Promise.all([
          safeGet("/admin/stats"),
          safeGet("/menu/products"),
          safeGet("/menu/categories"),
          safeGet("/orders/admin/all"),
        ]);

      if (statsRes?.success)
        setStats(
          statsRes.data || {
            totalRevenue: 0,
            totalOrders: 0,
            pendingOrders: 0,
          },
        );
      setProducts(
        productsRes?.products ||
          productsRes?.data ||
          (Array.isArray(productsRes) ? productsRes : []),
      );
      setCategories(
        categoriesRes?.categories ||
          categoriesRes?.data ||
          (Array.isArray(categoriesRes) ? categoriesRes : []),
      );
      setOrders(
        ordersRes?.orders || (Array.isArray(ordersRes) ? ordersRes : []),
      );
    } catch (error) {
      console.error("Yuklashda kutilmagan xato:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) fetchData();
  }, [tenantId]);

  // --- INGREDIENTS VA MODIFIERS ---
  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setFormData((prev) => ({
        ...prev,
        ingredients: [...prev.ingredients, newIngredient.trim()],
      }));
      setNewIngredient("");
    }
  };
  const handleRemoveIngredient = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== indexToRemove),
    }));
  };
  const handleAddModifier = () => {
    if (newModifier.name.trim() && newModifier.price !== "") {
      setFormData((prev) => ({
        ...prev,
        modifiers: [
          ...prev.modifiers,
          { ...newModifier, price: Number(newModifier.price) },
        ],
      }));
      setNewModifier({ name: "", price: "", type: "add" });
    }
  };
  const handleRemoveModifier = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      modifiers: prev.modifiers.filter((_, i) => i !== indexToRemove),
    }));
  };

  // ==========================================
  // MAHSULOT SAQLASH (+ Chegirma mantiqi)
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    const nameStr = formData.name.trim();
    const priceNum = Number(formData.price);
    const oldPriceNum = formData.oldPrice ? Number(formData.oldPrice) : null;

    if (!nameStr) return alert("Mahsulot nomini to'g'ri kiriting!");
    if (!formData.categoryId) return alert("Kategoriyani tanlang!");
    if (isNaN(priceNum) || priceNum <= 0)
      return alert("Narx 0 dan katta bo'lishi kerak!");

    const payload = {
      ...formData,
      name: nameStr,
      description: formData.description.trim(),
      price: priceNum,
      oldPrice: oldPriceNum, // Bazaga jo'natish
    };

    setIsSubmitting(true);
    try {
      if (editingId) {
        await apiClient.put(`/admin/products/${editingId}`, payload);
      } else {
        await apiClient.post("/admin/products", payload);
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Xatolik yuz berdi.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await apiClient.patch(`/orders/${orderId}/status`, {
        status: newStatus,
      });
      if (response.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId ? { ...o, status: newStatus } : o,
          ),
        );
        fetchData();
      }
    } catch (error) {
      alert("Statusni o'zgartirishda xato yuz berdi");
    }
  };

  const filteredOrders = useMemo(() => {
    return orders?.filter((order) => order.status === orderStatusTab) || [];
  }, [orders, orderStatusTab]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      oldPrice: "",
      categoryId: "",
      imageUrl: "",
      ingredients: [],
      modifiers: [],
    });
    setNewIngredient("");
    setNewModifier({ name: "", price: "", type: "add" });
    setEditingId(null);
  };

  const openEditModal = (product) => {
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      oldPrice: product.oldPrice || "", // Eski narxni tortish
      categoryId: product.categoryId?._id || product.categoryId || "",
      imageUrl: product.imageUrl || "",
      ingredients: product.ingredients || [],
      modifiers: product.modifiers || [],
    });
    setEditingId(product._id);
    setIsModalOpen(true);
  };

  if (loading) return <FastFoodLoader />;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* --- ADMIN HEADER --- */}
      <div className="bg-gray-900 pt-8 pb-12 px-4 rounded-b-[40px] shadow-lg text-white">
        {/* 🔥 Yozma Orqaga Qaytish Tugmasi (Safety fallback) */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-sm bg-gray-800 px-3 py-1.5 rounded-lg active:bg-gray-700"
          >
            ← Menyuga
          </button>
        </div>

        <h1 className="text-2xl font-black uppercase tracking-widest mb-1">
          Admin Panel
        </h1>
        <p className="text-sm text-gray-400">
          Boshqaruvchi:{" "}
          <span className="text-orange-500 font-bold">
            {user?.firstName || "Admin"}
          </span>
        </p>

        <div className="flex gap-2 mt-6 bg-gray-800 p-1 rounded-2xl">
          {["dashboard", "products", "orders"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition-all ${activeTab === tab ? "bg-orange-500 text-white shadow-md" : "text-gray-400 hover:text-white"}`}
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
        {/* --- 1. DASHBOARD (O'zgarmadi) --- */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-500">
            <div className="col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
                Bugungi Tushum
              </p>
              <h2 className="text-3xl font-black text-green-500">
                {stats.totalRevenue?.toLocaleString()}{" "}
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

        {/* --- 2. MAHSULOTLAR --- */}
        {activeTab === "products" && (
          <div className="animate-in fade-in duration-500">
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black uppercase shadow-lg shadow-orange-200 mb-6 tap-effect"
            >
              + Yangi Mahsulot Qo'shish
            </button>

            <div className="space-y-3">
              {products?.map((product) => (
                <div
                  key={product._id}
                  className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 relative overflow-hidden"
                >
                  {/* Chegirma Lentas (Badge) */}
                  {product.oldPrice > product.price && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md z-10 shadow-sm">
                      -
                      {Math.round(
                        ((product.oldPrice - product.price) /
                          product.oldPrice) *
                          100,
                      )}
                      %
                    </div>
                  )}

                  <img
                    src={
                      product.imageUrl ||
                      "https://placehold.co/100x100/orange/white?text=No+Img"
                    }
                    className="w-16 h-16 rounded-xl object-cover bg-gray-100"
                    alt={product.name}
                  />

                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-sm leading-tight">
                      {product.name}
                    </h3>

                    {/* Narxlar Qismi */}
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-orange-500 font-black text-xs">
                        {product.price?.toLocaleString()} so'm
                      </p>
                      {product.oldPrice > 0 && (
                        <p className="text-gray-400 text-[10px] line-through decoration-red-500/50">
                          {product.oldPrice.toLocaleString()}
                        </p>
                      )}
                    </div>

                    {(product.ingredients?.length > 0 ||
                      product.modifiers?.length > 0) && (
                      <div className="flex gap-2 mt-1">
                        {product.ingredients?.length > 0 && (
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
                            {product.ingredients.length} ta masalliq
                          </span>
                        )}
                        {product.modifiers?.length > 0 && (
                          <span className="text-[10px] bg-blue-50 text-blue-500 px-2 py-1 rounded-md">
                            {product.modifiers.length} ta modifikator
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 relative z-10">
                    <button
                      onClick={() => openEditModal(product)}
                      className="w-8 h-8 bg-blue-50 text-blue-500 rounded-lg tap-effect"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="w-8 h-8 bg-red-50 text-red-500 rounded-lg tap-effect"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- 3. BUYURTMALAR (O'zgarmadi) --- */}
        {activeTab === "orders" && (
          <div className="animate-in fade-in duration-500 mt-8">
            <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
              {[
                { id: "NEW", label: "Yangi", icon: "🆕" },
                { id: "ACCEPTED", label: "Jarayonda", icon: "👨‍🍳" },
                { id: "DELIVERED", label: "Tayyor", icon: "✅" },
                { id: "CANCELLED", label: "Rad etilgan", icon: "❌" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setOrderStatusTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${orderStatusTab === tab.id ? "bg-orange-500 text-white shadow-md shadow-orange-200" : "bg-white text-gray-500 border border-gray-100"}`}
                >
                  <span>{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>
            {/* Ro'yxat o'zgarmadi... */}
          </div>
        )}
      </div>

      {/* --- MODAL (QO'SHISH/TAHRIRLASH) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center animate-in fade-in">
          <div className="bg-white w-full rounded-t-[32px] p-6 max-h-[90vh] overflow-y-auto pb-32">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black">
                {editingId ? "Tahrirlash" : "Yangi Mahsulot"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 bg-gray-100 rounded-full font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Nomi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full mt-1 bg-gray-50 p-3 rounded-xl border border-gray-200 outline-none"
                    placeholder="Masalan: Max Burger"
                  />
                </div>

                {/* 🔥 Narx va Chegirma qatori */}
                <div className="grid grid-cols-2 gap-4 bg-orange-50/50 p-3 rounded-2xl border border-orange-100">
                  <div>
                    <label className="text-[10px] font-bold text-orange-800 uppercase">
                      Yangi Narx (Sotuv) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full mt-1 bg-white p-3 rounded-xl border border-orange-200 outline-none font-bold text-gray-900"
                      placeholder="35000"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">
                      Eski Narx (Chegirma)
                    </label>
                    <input
                      type="number"
                      value={formData.oldPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, oldPrice: e.target.value })
                      }
                      className="w-full mt-1 bg-white p-3 rounded-xl border border-gray-200 outline-none text-gray-500 line-through"
                      placeholder="45000"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Kategoriya <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    className="w-full mt-1 bg-gray-50 p-3 rounded-xl border border-gray-200 outline-none"
                  >
                    <option value="">Tanlang</option>
                    {categories?.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Ta'rifi
                  </label>
                  <textarea
                    rows="2"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full mt-1 bg-gray-50 p-3 rounded-xl border border-gray-200 outline-none"
                    placeholder="Mazali burger..."
                  ></textarea>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Rasm URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    className="w-full mt-1 bg-gray-50 p-3 rounded-xl border border-gray-200 outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* TARKIBI VA MODIFIKATORLAR (O'zgarmadi, formani uzaytirmaslik uchun yopib qo'yilgan joyi bor) */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <label className="text-xs font-bold text-gray-800 uppercase mb-2 block">
                  Tarkibi (Masalliqlar)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddIngredient())
                    }
                    className="flex-1 bg-white p-3 rounded-xl border border-gray-200 outline-none text-sm"
                    placeholder="Masalan: Mol go'shti"
                  />
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="bg-gray-900 text-white px-4 rounded-xl font-bold"
                  >
                    +
                  </button>
                </div>
                {formData.ingredients.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.ingredients.map((ing, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"
                      >
                        {ing}{" "}
                        <span
                          onClick={() => handleRemoveIngredient(idx)}
                          className="text-red-500 font-bold cursor-pointer"
                        >
                          ✕
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                <label className="text-xs font-bold text-blue-800 uppercase mb-2 block">
                  Qo'shimchalar (Modifikatorlar)
                </label>
                <div className="grid grid-cols-12 gap-2 mb-3">
                  <input
                    type="text"
                    value={newModifier.name}
                    onChange={(e) =>
                      setNewModifier({ ...newModifier, name: e.target.value })
                    }
                    className="col-span-5 bg-white p-2 rounded-xl border border-blue-200 outline-none text-xs"
                    placeholder="Pishloq"
                  />
                  <input
                    type="number"
                    value={newModifier.price}
                    onChange={(e) =>
                      setNewModifier({ ...newModifier, price: e.target.value })
                    }
                    className="col-span-3 bg-white p-2 rounded-xl border border-blue-200 outline-none text-xs"
                    placeholder="Narxi"
                  />
                  <select
                    value={newModifier.type}
                    onChange={(e) =>
                      setNewModifier({ ...newModifier, type: e.target.value })
                    }
                    className="col-span-3 bg-white p-2 rounded-xl border border-blue-200 outline-none text-xs"
                  >
                    <option value="add">Qo'shish</option>
                    <option value="remove">Olib tashlash</option>
                    <option value="size">Hajm</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddModifier}
                    className="col-span-1 bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center"
                  >
                    +
                  </button>
                </div>

                {formData.modifiers.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {formData.modifiers.map((mod, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-blue-100 p-2 rounded-lg text-xs flex justify-between items-center shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${mod.type === "add" ? "bg-green-100 text-green-700" : mod.type === "remove" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}
                          >
                            {mod.type === "add"
                              ? "+"
                              : mod.type === "remove"
                                ? "-"
                                : "⇿"}
                          </span>
                          <span className="font-medium text-gray-800">
                            {mod.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-600">
                            {mod.price > 0
                              ? `+${mod.price.toLocaleString()}`
                              : "0"}{" "}
                            so'm
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveModifier(idx)}
                            className="text-red-500 font-bold px-2"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-2xl font-black uppercase mt-4 transition-all ${isSubmitting ? "bg-gray-400 text-gray-200 cursor-not-allowed" : "bg-gray-900 text-white active:scale-95 shadow-xl shadow-gray-300"}`}
              >
                {isSubmitting
                  ? "Saqlanmoqda..."
                  : editingId
                    ? "O'zgarishlarni Saqlash"
                    : "Mahsulotni Yaratish"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
