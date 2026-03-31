import axios from "axios";

// 1. .env fayldan API manzilini olamiz (Vite'da shunday olinadi)
const API_URL = import.meta.env.VITE_API_BASE_URL;

// 2. Axios uchun asosiy shablon (Client) yaratamiz
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 soniyada javob kelmasa xato beradi
});

// 3. INTERCEPTOR (So'rovni ushlab qolib, unga "pasport" qo'shib yuborish)
apiClient.interceptors.request.use(
  (config) => {
    // Telegramdan xavfsizlik qatori (initData) ni olamiz
    const initData = window.Telegram?.WebApp?.initData || "";

    // 1. URL dan tenantId ni izlaymiz
    const urlParams = new URLSearchParams(window.location.search);
    let tenantId = urlParams.get("tenantId");

    // 2. Agar URL da bo'lsa, xotiraga (sessionStorage) saqlaymiz
    if (tenantId) {
      sessionStorage.setItem("fastfood_tenant_id", tenantId);
    } else {
      // 3. Agar URL dan o'chib ketgan bo'lsa (navigate bo'lganda), xotiradan tortib olamiz
      tenantId = sessionStorage.getItem("fastfood_tenant_id") || "";
    }

    // Backend kutayotgan headerlarni aniq nom bilan biriktiramiz
    config.headers["Authorization"] = initData;
    config.headers["x-tenant-id"] = tenantId;
    config.headers["ngrok-skip-browser-warning"] = "true";

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 4. Javoblarni (Response) ushlab olish uchun ham Interceptor yozamiz
apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `[API XIZMATI] ✅ Javob keldi (${response.status}):`,
      response.data,
    );
    return response.data; // Faqat toza datani qaytaramiz
  },
  (error) => {
    console.error(
      `[API XIZMATI] ❌ Backenddan xato qaytdi:`,
      error.response?.data || error.message,
    );
    return Promise.reject(error);
  },
);

export default apiClient;
