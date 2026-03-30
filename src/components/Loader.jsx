import React from "react";

const FastFoodLoader = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-orange-50 z-[9999] px-10">
      {/* Burger Animatsiyasi */}
      <div className="relative mb-6">
        <div className="text-8xl animate-bounce">🍔</div>
        {/* Burger tagidagi soya */}
        <div className="w-16 h-2 bg-black/10 rounded-full blur-sm animate-pulse mx-auto mt-2"></div>
      </div>

      {/* Yuklanish Matni */}
      <h2 className="text-xl font-black text-orange-600 tracking-tighter uppercase italic">
        Burgeringiz pishmoqda...
      </h2>

      {/* Mini Progress Bar */}
      <div className="w-full max-w-[200px] h-1.5 bg-orange-200 rounded-full mt-4 overflow-hidden">
        <div className="h-full bg-orange-500 animate-[loading_1.5s_infinite_ease-in-out]"></div>
      </div>

      <style>{`
        @keyframes loading {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 100%; transform: translateX(0%); }
          100% { width: 0%; transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default FastFoodLoader;
