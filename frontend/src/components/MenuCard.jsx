import React from "react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const fallbackImageFor = (name) => {
  const normalized = name.toLowerCase();
  if (/cold\s*coffee|iced\s*coffee|coffee/.test(normalized)) {
    return "https://images.unsplash.com/photo-1530373239216-42518e6b4063?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  }
  if (/aloo\s*tikki|aloo|potato/.test(normalized)) {
    return "https://images.unsplash.com/photo-1660715683888-8e506d6898c8?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  }
  if (/paneer/.test(normalized)) {
    return "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80";
  }
  if (/peri|periperi|double\s*dscker|cheesiyo|mackano|maxicano|grab|maxicano|double\s*chees|cheese|patty|burger/.test(normalized)) {
    return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80";
  }
  return "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80";
};

const createMenuTags = (name) => {
  const normalized = name.toLowerCase();
  const tags = [];
  if (/cheese|cheesiyo|double|double\s*chees|mackano|maxicano|grab/.test(normalized)) tags.push("Cheesy hit");
  if (/peri|periperi/.test(normalized)) tags.push("Peri Peri");
  if (/paneer/.test(normalized)) tags.push("Paneer special");
  if (/aloo\s*tikki|aloo|potato/.test(normalized)) tags.push("Crispy snack");
  if (/cold\s*coffee|iced\s*coffee|coffee/.test(normalized)) tags.push("Cool drink");
  if (tags.length === 0) tags.push("popular");
  return tags.slice(0, 2);
};

const ratingFromName = (name) => {
  const base = 80 + (name.length % 10);
  return `${(base / 20).toFixed(1)} ★`;
};

const estimateTime = (name) => {
  const values = ["12 min", "14 min", "15 min", "18 min"];
  return values[name.length % values.length];
};

export default function MenuCard({ item }) {
  const { addItem, decreaseItem, getQuantity } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qty = getQuantity(item.id);
  const imageUrl = item.image_url || fallbackImageFor(item.name || "food");
  const tags = createMenuTags(item.name || "Dish");
  const rating = ratingFromName(item.name || "Dish");
  const readyTime = estimateTime(item.name || "Dish");
  console.log("MENU ITEM:", item);
  console.log("IMAGE URL:", item.image_url);

  return (
    <div className="menu-card">
      <div className="thumb">
        <img src={imageUrl} alt={item.name} onError={(e) => {
          e.target.onerror = null;
          e.target.src = "/burger.jpg";
        }} />
        {item.is_bestseller && <span className="badge-bestseller">Bestseller</span>}
        <span className={`veg-dot ${item.is_veg ? "veg" : "nonveg"}`}>
          <span className="dot" />
        </span>
      </div>
      <div className="body">
        <div className="menu-card-top">
          <h3>{item.name}</h3>
          <div className="item-meta">
            <span className="rating-pill">{rating}</span>
            <span className="meta-chip">{readyTime}</span>
          </div>
        </div>
        <div className="tag-row">
          {tags.map((tag) => (
            <span key={tag} className="label-pill label-pill--small">{tag}</span>
          ))}
        </div>
        <p className="desc">{item.description}</p>
        <div className="row">
          <span className="price">₹{Number(item.price).toFixed(0)}</span>
          {qty === 0 ? (
            <button
              className="btn btn-yellow"
              onClick={() => {
                if (!user) return navigate("/login", { state: { scrollTo: "menu" } });
                addItem(item);
              }}
            >
              Add
            </button>
          ) : (
            <div className="qty-stepper">
              <button onClick={() => decreaseItem(item.id)}>-</button>
              <span>{qty}</span>
              <button
                onClick={() => {
                  if (!user) return navigate("/login", { state: { scrollTo: "menu" } });
                  addItem(item);
                }}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
