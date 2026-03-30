// 3. INTERCEPTOR (So'rovni ushlab qolib, unga "pasport" qo'shib yuborish)
apiClient.interceptors.request.use(
  (config) => {
    console.log(
      `\n[API XIZMATI] So'rov tayyorlanmoqda: ${config.method.toUpperCase()} ${config.url}`,
    );

    // Telegramdan xavfsizlik qatori (initData) ni olamiz
    const initData = window.Telegram?.WebApp?.initData || "";

    // URL'dan do'kon ID sini (tenantId) kesib olamiz
    const urlParams = new URLSearchParams(window.location.search);
    const tenantId = urlParams.get("tenantId") || "";

    // Backend kutayotgan headerlarni aniq nom bilan biriktiramiz
    config.headers["Authorization"] = initData;
    config.headers["x-tenant-id"] = tenantId;

    // NGROK TO'SIG'INI CHETLAB O'TISH UCHUN MAXSUS HEADER (Mana shu qator qo'shildi!):
    config.headers["ngrok-skip-browser-warning"] = "true";

    console.log(`[API XIZMATI] Headerlar biriktirildi: tenantId=${tenantId}`);
    return config;
  },
  (error) => {
    console.error(`[API XIZMATI] So'rovni jo'natishda xato:`, error);
    return Promise.reject(error);
  },
);
