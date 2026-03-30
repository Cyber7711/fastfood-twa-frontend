import { useEffect, useState } from "react";

// Telegram Web App obyekti index.html ga qo'shilgan script orqali keladi
const tg = window.Telegram.WebApp;

export function useTelegram() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // TWA to'liq yuklanganda Telegramga xabar beramiz
    tg.ready();
    setIsReady(true);

    // Debugging uchun muhim log: Foydalanuvchi ma'lumotlari keldimi?
    console.log("[TELEGRAM HOOK] TWA ishga tushdi.", {
      initDataUnsafe: tg.initDataUnsafe,
      themeParams: tg.themeParams,
      version: tg.version,
    });
  }, []);

  // Ilovani yopish funksiyasi
  const onClose = () => {
    console.log("[TELEGRAM HOOK] Ilova yopilmoqda...");
    tg.close();
  };

  // Asosiy tugmani (MainButton) boshqarish funksiyasi (Masalan: "Buyurtma berish")
  const showMainButton = (text, onClickCallback) => {
    console.log(`[TELEGRAM HOOK] MainButton ko'rsatildi: ${text}`);
    tg.MainButton.setText(text);
    tg.MainButton.show();

    // Tugma bosilganda nima yuz berishini ulaymiz
    if (onClickCallback) {
      tg.MainButton.onClick(onClickCallback);
    }
  };

  const hideMainButton = () => {
    console.log(`[TELEGRAM HOOK] MainButton yashirildi`);
    tg.MainButton.hide();
  };

  return {
    tg, // Asosiy obyektni qaytaramiz (agar chuqurroq funksiyalar kerak bo'lsa)
    user: tg.initDataUnsafe?.user, // Foydalanuvchi ma'lumotlari (ism, id)
    initData: tg.initData, // Backendga xavfsizlik tekshiruvi (Auth) uchun yuboriladigan qator
    queryId: tg.initDataUnsafe?.query_id,
    themeParams: tg.themeParams, // Telegramning joriy ranglari (Dark/Light mode)
    onClose,
    showMainButton,
    hideMainButton,
    isReady,
  };
}
