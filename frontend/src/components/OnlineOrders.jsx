import React from "react";
import MenuCard from "./MenuCard.jsx";

export default function OnlineOrders({ items = [] }) {
  return (
    <div className="menu-grid">
      {items.map((it) => (
        <MenuCard key={it.id} item={it} />
      ))}
    </div>
  );
}
