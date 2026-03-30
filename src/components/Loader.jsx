import React from "react";

const FastFoodLoader = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999]">
      {/* Markaziy animatsiya bloki */}
      <div className="relative flex flex-col items-center">
        {/* Burger sakrashi va aylanishi */}
        <div className="text-8xl animate-bounce select-none">
          <span className="inline-block hover:rotate-12 transition-transform">
            🍔
          </span>
        </div>

        {/* Dinamik soya */}
        <div className="w-16 h-2 bg-orange-100 rounded-[100%] blur-sm animate-pulse mt-2"></div>

        {/* Yuklanish Progress-bari */}
        <div className="mt-8 w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
          <div className="h-full bg-orange-500 rounded-full animate-progress-fast"></div>
        </div>

        {/* Kreativ matn */}
        <div className="mt-4 flex flex-col items-center">
          <p className="text-orange-600 font-black italic tracking-widest text-sm uppercase animate-pulse">
            Oshpaz burgerga pishloq qo'ymoqda...
          </p>
          <p className="text-gray-400 text-[10px] mt-1 font-medium">
            FAST FOOD SaaS v1.0
          </p>
        </div>
      </div>

      {/* Tailwind Config'ga qo'shish o'rniga, shu yerda keyframes yozamiz */}
      <style>{`
        @keyframes progress-fast {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 50%; margin-left: 25%; }
          100% { width: 0%; margin-left: 100%; }
        }
        .animate-progress-fast {
          animation: progress-fast 1.2s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default FastFoodLoader;
