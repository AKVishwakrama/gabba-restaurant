import React from "react";
import { useCart } from "../context/CartContext.jsx";

export default function MenuCard({ item }) {
  const { addItem, decreaseItem, getQuantity } = useCart();
  const qty = getQuantity(item.id);

  return (
    <div className="menu-card">
      <div className="thumb">
        {item.image_url && <img src={item.image_url} alt={item.name} />}
        {item.is_bestseller && <span className="badge-bestseller">Bestseller</span>}
        <span className={`veg-dot ${item.is_veg ? "veg" : "nonveg"}`}>
          <span className="dot" />
        </span>
      </div>
      <div className="body">
        <h3>{item.name}</h3>
        <p className="desc">{item.description}</p>
        <div className="row">
          <span className="price">₹{Number(item.price).toFixed(0)}</span>
          {qty === 0 ? (
            <button className="btn btn-yellow" onClick={() => addItem(item)}>
              Add
            </button>
          ) : (
            <div className="qty-stepper">
              <button onClick={() => decreaseItem(item.id)}>-</button>
              <span>{qty}</span>
              <button onClick={() => addItem(item)}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
