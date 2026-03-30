import React, { createContext, useState, useEffect } from "react";
import { useTelegram } from "../hooks/useTelegram";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { initData, user } = useTelegram();
  const [tenantId, setTenantId] = useState(null);

  useEffect(() => {
    // 1. URL dan tenantId ni qidirib topamiz
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("tenantId");

    if (id) {
      console.log(`[APP CONTEXT] Do'kon (Tenant) ID si topildi: ${id}`);
      setTenantId(id);
    } else {
      console.error(
        `[APP CONTEXT] XATO: tenantId URL'da yo'q! Ilova qaysi do'konni ochishni bilmaydi.`,
      );
    }
  }, []);

  return (
    // Barcha ichki komponentlarga tenantId, initData va userni tarqatamiz
    <AppContext.Provider value={{ tenantId, initData, user }}>
      {children}
    </AppContext.Provider>
  );
};
