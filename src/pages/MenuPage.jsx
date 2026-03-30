import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";

const MenuPage = () => {
  const { tenantId } = useContext(AppContext);

  console.log("[MENU PAGE] Sahifa muvaffaqiyatli chizildi!");

  return (
    <div
      style={{
        padding: "50px",
        textAlign: "center",
        backgroundColor: "#e0ffe0",
      }}
    >
      <h1>Tabriklayman! 🎉</h1>
      <p>Router va Sahifa ishlayapti.</p>
      <p>
        Sizning do'kon ID: <b>{tenantId}</b>
      </p>
    </div>
  );
};

export default MenuPage;
