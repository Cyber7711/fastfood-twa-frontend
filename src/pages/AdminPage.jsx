import React, { useState, useEffect } from "react";
import apiClient from "../services/api";
import FastFoodLoader from "../components/Loader";

const AdminPage = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("orders"); // 'orders' yoki 'products'
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await apiClient.get("/orders/admin/all");
      setOrders(response.orders || []);
    } catch (error) {
      console.error("Xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000); // Har 15 soniyada yangilash
    return () => clearInterval(interval);
  }, []);

  // --- STATISTIKA HISOB-KITOBI ---
  const today = new Date().toISOString().split("T")[0];
  const todayOrders = orders.filter((o) => o.createdAt.startsWith(today));
  const dailyRevenue = todayOrders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  if (loading) return <FastFoodLoader />;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 1. Header & Stats Area */}
      <div className="bg-orange-500 pt-8 pb-16 px-4 rounded-b-[40px] shadow-lg">
        <div className="flex justify-between items-center mb-6 text-white">
          <h1 className="text-2xl font-black italic tracking-tighter uppercase">
            Admin Dashboard
          </h1>
          <button
            onClick={fetchOrders}
            className="p-2 bg-white/20 rounded-full active:scale-90 transition-transform"
          >
            🔄
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <p className="text-white/70 text-xs font-bold uppercase mb-1">
              Bugungi Savdo
            </p>
            <h2 className="text-white text-xl font-black">
              {dailyRevenue.toLocaleString()}{" "}
              <span className="text-[10px]">so'm</span>
            </h2>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <p className="text-white/70 text-xs font-bold uppercase mb-1">
              Buyurtmalar
            </p>
            <h2 className="text-white text-xl font-black">
              {todayOrders.length} <span className="text-[10px]">ta</span>
            </h2>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex bg-white mx-4 -mt-8 rounded-2xl shadow-sm p-1 border border-gray-100 mb-6">
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex-1 py-3 rounded-xl text-sm font-black uppercase transition-all ${activeTab === "orders" ? "bg-orange-500 text-white shadow-md" : "text-gray-400"}`}
        >
          Buyurtmalar
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`flex-1 py-3 rounded-xl text-sm font-black uppercase transition-all ${activeTab === "products" ? "bg-orange-500 text-white shadow-md" : "text-gray-400"}`}
        >
          Mahsulotlar
        </button>
      </div>

      {/* 3. Content Area */}
      <main className="px-4">
        {activeTab === "orders" ? (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-20 text-gray-400 italic">
                Hali buyurtmalar yo'q...
              </div>
            ) : (
              orders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onUpdate={fetchOrders}
                />
              ))
            )}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400 italic">
            Mahsulotlarni boshqarish tez kunda... 🍔
          </div>
        )}
      </main>
    </div>
  );
};

// --- ALOHIDA COMPONENT: Buyurtma kartochkasi ---
const OrderCard = ({ order, onUpdate }) => {
  const updateStatus = async (newStatus) => {
    try {
      await apiClient.patch(`/orders/${order._id}/status`, {
        status: newStatus,
      });
      onUpdate();
    } catch (e) {
      alert("Xato yuz berdi!");
    }
  };

  return (
    <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            ID: #{order._id.slice(-5)}
          </span>
          <h3 className="text-lg font-black text-gray-800 leading-tight">
            {order.customerName}
          </h3>
          <p className="text-xs text-orange-500 font-bold">
            {order.customerPhone}
          </p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
            order.status === "pending"
              ? "bg-yellow-100 text-yellow-600"
              : order.status === "confirmed"
                ? "bg-blue-100 text-blue-600"
                : "bg-green-100 text-green-600"
          }`}
        >
          {order.status === "pending"
            ? "Kutilmoqda"
            : order.status === "confirmed"
              ? "Tayyorlanmoqda"
              : "Yetkazildi"}
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-3 mb-4">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm py-1">
            <span className="text-gray-600 font-medium">
              {item.name}{" "}
              <span className="text-gray-400 text-xs">x{item.quantity}</span>
            </span>
            <span className="font-bold text-gray-800">
              {(item.price * item.quantity).toLocaleString()}
            </span>
          </div>
        ))}
        <div className="border-t border-dashed border-gray-200 mt-2 pt-2 flex justify-between">
          <span className="text-xs font-bold text-gray-400 uppercase">
            Jami:
          </span>
          <span className="text-orange-500 font-black">
            {(order.totalPrice || 0).toLocaleString()} so'm
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        {order.status === "pending" && (
          <button
            onClick={() => updateStatus("confirmed")}
            className="flex-1 bg-gray-800 text-white py-3 rounded-2xl text-xs font-black uppercase active:scale-95 transition-transform"
          >
            Tasdiqlash
          </button>
        )}
        {order.status === "confirmed" && (
          <button
            onClick={() => updateStatus("delivered")}
            className="flex-1 bg-green-500 text-white py-3 rounded-2xl text-xs font-black uppercase active:scale-95 transition-transform"
          >
            Yetkazildi deb belgilash
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
