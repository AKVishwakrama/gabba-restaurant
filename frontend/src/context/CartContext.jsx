// import React, { createContext, useContext, useEffect, useState } from "react";

// const CartContext = createContext(null);

// const STORAGE_KEY = "gabba_cart";

// export function CartProvider({ children }) {
//   const [items, setItems] = useState(() => {
//     try {
//       const saved = localStorage.getItem(STORAGE_KEY);
//       return saved ? JSON.parse(saved) : [];
//     } catch {
//       return [];
//     }
//   });

//   useEffect(() => {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
//   }, [items]);

//   function addItem(menuItem) {
//     setItems((prev) => {
//       const existing = prev.find((i) => i.id === menuItem.id);
//       if (existing) {
//         return prev.map((i) => (i.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i));
//       }
//       return [...prev, { id: menuItem.id, name: menuItem.name, price: Number(menuItem.price), image_url: menuItem.image_url, quantity: 1 }];
//     });
//   }

//   function decreaseItem(id) {
//     setItems((prev) =>
//       prev
//         .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
//         .filter((i) => i.quantity > 0)
//     );
//   }

//   function removeItem(id) {
//     setItems((prev) => prev.filter((i) => i.id !== id));
//   }

//   function clearCart() {
//     setItems([]);
//   }

//   function getQuantity(id) {
//     return items.find((i) => i.id === id)?.quantity || 0;
//   }

//   const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
//   const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);

//   return (
//     <CartContext.Provider
//       value={{ items, addItem, decreaseItem, removeItem, clearCart, getQuantity, subtotal, totalCount }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// }

// export function useCart() {
//   const ctx = useContext(CartContext);
//   if (!ctx) throw new Error("useCart must be used within a CartProvider");
//   return ctx;
// }




import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "gabba_cart";
const DELIVERY_STORAGE_KEY = "gabba_delivery_details";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [deliveryDetails, setDeliveryDetails] = useState(() => {
    try {
      const saved = localStorage.getItem(DELIVERY_STORAGE_KEY);
      return saved ? JSON.parse(saved) : { customer_name: "", customer_phone: "", delivery_address: "" };
    } catch {
      return { customer_name: "", customer_phone: "", delivery_address: "" };
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(DELIVERY_STORAGE_KEY, JSON.stringify(deliveryDetails));
  }, [deliveryDetails]);

  function addItem(menuItem) {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === menuItem.id);
      if (existing) {
        return prev.map((i) => (i.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { id: menuItem.id, name: menuItem.name, price: Number(menuItem.price), image_url: menuItem.image_url, quantity: 1 }];
    });
  }

  function decreaseItem(id) {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function clearCart() {
    setItems([]);
  }

  function getQuantity(id) {
    return items.find((i) => i.id === id)?.quantity || 0;
  }

  function updateDeliveryDetails(field, value) {
    setDeliveryDetails((prev) => ({ ...prev, [field]: value }));
  }

  function clearDeliveryDetails() {
    setDeliveryDetails({ customer_name: "", customer_phone: "", delivery_address: "" });
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const isDeliveryDetailsValid =
    deliveryDetails.customer_name.trim().length > 0 &&
    deliveryDetails.customer_phone.trim().length >= 10 &&
    deliveryDetails.delivery_address.trim().length > 0;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        decreaseItem,
        removeItem,
        clearCart,
        getQuantity,
        subtotal,
        totalCount,
        deliveryDetails,
        updateDeliveryDetails,
        clearDeliveryDetails,
        isDeliveryDetailsValid,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}