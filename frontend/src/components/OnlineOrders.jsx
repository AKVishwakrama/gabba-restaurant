// import React from "react";
// import MenuCard from "./MenuCard.jsx";

// export default function OnlineOrders({ items = [] }) {
//   return (
//     <div className="menu-grid">
//       {items.map((it) => (
//         <MenuCard key={it.id} item={it} />
//       ))}
//     </div>
//   );
// }



import React from "react";
import MenuCard from "./MenuCard.jsx";

export default function OnlineOrders({ items }) {
  // Backend may return an object instead of an array
  const menuItems = Array.isArray(items)
    ? items
    : Array.isArray(items?.items)
      ? items.items
      : Array.isArray(items?.data)
        ? items.data
        : [];

  return (
    <div className="menu-grid">
      {menuItems.map((it, index) => (
        <MenuCard
          key={it.id || it._id || `menu-item-${index}`}
          item={it}
        />
      ))}
    </div>
  );
}