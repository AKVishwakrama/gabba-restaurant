import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function Cart() {
  const { items, addItem, decreaseItem, removeItem, subtotal } = useCart();
  const navigate = useNavigate();

  const DELIVERY_FEE = 40;
  const tax = +(subtotal * 0.05).toFixed(2);
  const total = +(subtotal + DELIVERY_FEE + tax).toFixed(2);
  const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(
    `Hi Gabba, I want to place an order. These are my items:\n${items
      .map((i) => `${i.name} x${i.quantity} - ₹${(i.price * i.quantity).toFixed(2)}`)
      .join("\n")}\n\nTotal: ₹${total.toFixed(2)}`
  )}`;

  if (items.length === 0) {
    return (
      <div className="page-wrap">
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p style={{ margin: "12px 0 20px" }}>Add a burger or two to get started.</p>
          <Link to="/" className="btn btn-yellow">
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <h2 style={{ marginBottom: 24 }}>Your Cart</h2>
      {items.map((item) => (
        <div className="cart-item" key={item.id}>
          {item.image_url && <img src={item.image_url} alt={item.name} />}
          <div className="info">
            <h4>{item.name}</h4>
            <div className="unit">₹{item.price.toFixed(0)} each</div>
          </div>
          <div className="qty-stepper">
            <button onClick={() => decreaseItem(item.id)}>-</button>
            <span>{item.quantity}</span>
            <button onClick={() => addItem(item)}>+</button>
          </div>
          <button className="btn btn-outline" onClick={() => removeItem(item.id)}>
            Remove
          </button>
        </div>
      ))}

      <div className="summary-box">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Delivery Fee</span>
          <span>₹{DELIVERY_FEE.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Tax (5%)</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
      </div>

      <button className="btn btn-yellow" style={{ width: "100%", marginTop: 20, padding: 14 }} onClick={() => navigate("/checkout")}>
        Proceed to Checkout
      </button>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="btn btn-outline"
        style={{ width: "100%", marginTop: 12, padding: 14, textAlign: "center", display: "inline-flex", justifyContent: "center" }}
      >
        Chat on WhatsApp
      </a>
    </div>
  );
}
