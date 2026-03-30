import React, { createContext, useState, useEffect } from "react";
import { useTelegram } from "../hooks/useTelegram";
import apiClient from "../services/api";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { initData, user: tgUser } = useTelegram();
  const [tenantId, setTenantId] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // 1. URL dan tenantId ni olamiz
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("tenantId");

    if (id) {
      setTenantId(id);
    }

    // 2. Foydalanuvchini backend orqali tekshiramiz (Xavfsiz Kirish)
    const verifyUser = async () => {
      if (!tgUser) {
        setAuthLoading(false);
        return;
      }

      try {
        // Backend'da /api/auth/me yoki shunga o'xshash yo'l bo'lishi kerak
        // Bu so'rovda twaAuth middleware ishlaydi va foydalanuvchini tekshiradi
        const response = await apiClient.get("/auth/verify-admin");

        setUser(tgUser);
        setIsAdmin(response.isAdmin); // Backend faqat haqiqiy adminlarga true qaytaradi
      } catch (err) {
        console.error("[AUTH] Tekshiruvda xato yoki foydalanuvchi admin emas");
        setUser(tgUser);
        setIsAdmin(false);
      } finally {
        setAuthLoading(false);
      }
    };

    verifyUser();
  }, [tgUser]);

  return (
    <AppContext.Provider
      value={{
        tenantId,
        initData,
        user: { ...user, isAdmin }, // Adminlik flagini qo'shib yuboramiz
        authLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
