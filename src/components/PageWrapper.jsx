import React, { useState, useEffect } from "react";
import FastFoodLoader from "./Loader";

const PageWrapper = ({ children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sahifa o'zgarganda loader 0.8 soniya turadi (bu foydalanuvchiga vibe berish uchun yetarli)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <FastFoodLoader />;
  }

  // Sahifa yuklangach, chiroyli "Fade In" effekti bilan chiqadi
  return <div className="animate-in fade-in duration-500">{children}</div>;
};

export default PageWrapper;
