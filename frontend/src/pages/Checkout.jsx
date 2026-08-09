// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useCart } from "../context/CartContext.jsx";
// import api from "../api/api.js";

// const DELIVERY_FEE = 40;

// function loadRazorpayScript() {
//   return new Promise((resolve) => {
//     if (window.Razorpay) return resolve(true);
//     const script = document.createElement("script");
//     script.src = "https://checkout.razorpay.com/v1/checkout.js";
//     script.onload = () => resolve(true);
//     script.onerror = () => resolve(false);
//     document.body.appendChild(script);
//   });
// }

// export default function Checkout() {
//   const { items, subtotal, clearCart } = useCart();
//   const navigate = useNavigate();

//   const [form, setForm] = useState({ customer_name: "", customer_phone: "", delivery_address: "" });
//   const [paymentMethod, setPaymentMethod] = useState("cod");
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState("");
//   const [errorDetails, setErrorDetails] = useState("");
//   const [statusMessage, setStatusMessage] = useState("");

//   const tax = +(subtotal * 0.05).toFixed(2);
//   const total = +(subtotal + DELIVERY_FEE + tax).toFixed(2);

//   function handleChange(e) {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   }

//   async function placeOrder(paymentInfo = {}) {
//     setStatusMessage("Placing your order... please wait.");
//     const payload = {
//       ...form,
//       items: items.map((i) => ({ menu_item_id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
//       payment_method: paymentMethod,
//       ...paymentInfo,
//     };
//     const { data } = await api.post("/orders", payload);
//     clearCart();
//     navigate(`/order-confirmation/${data.order.id}`);
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError("");
//     setStatusMessage("");

//     if (!form.customer_name || !form.customer_phone || !form.delivery_address) {
//       setError("Please fill in all delivery details.");
//       return;
//     }

//     setSubmitting(true);
//     setStatusMessage(paymentMethod === "cod" ? "Placing your cash-on-delivery order..." : "Opening the payment window...");
//     try {
//       if (paymentMethod === "cod") {
//         await placeOrder();
//         return;
//       }

//       // Razorpay flow
//       const { data } = await api.post("/payment/create-order", { amount: total });
//       const scriptLoaded = await loadRazorpayScript();
//       if (!scriptLoaded) {
//         setError("Payment gateway failed to load. Check your internet connection.");
//         setSubmitting(false);
//         return;
//       }

//       const rzp = new window.Razorpay({
//         key: data.key_id,
//         amount: data.order.amount,
//         currency: "INR",
//         name: "Gabba",
//         description: "Food order payment",
//         order_id: data.order.id,
//         theme: { color: "#ffcc00" },
//         handler: async function (response) {
//           try {
//             await api.post("/payment/verify", response);
//             await placeOrder({
//               razorpay_order_id: response.razorpay_order_id,
//               razorpay_payment_id: response.razorpay_payment_id,
//             });
//           } catch (err) {
//             setError("Payment verification failed. Please contact support before retrying.");
//             setSubmitting(false);
//           }
//         },
//         modal: {
//           ondismiss: () => setSubmitting(false),
//         },
//       });
//       rzp.open();
//     } catch (err) {
//       const apiError = err.response?.data?.error || err.message || "Failed to place order.";
//       const apiDetail = err.response?.data?.detail || err.response?.statusText || "";
//       setError(apiError);
//       setErrorDetails(apiDetail);
//       setStatusMessage("");
//       setSubmitting(false);
//     }
//   }

//   if (items.length === 0) {
//     return (
//       <div className="page-wrap">
//         <div className="empty-state">Your cart is empty. Add items before checking out.</div>
//       </div>
//     );
//   }

//   return (
//     <div className="page-wrap">
//       <h2 style={{ marginBottom: 24 }}>Checkout</h2>
//       {error && (
//         <div className="error-banner">
//           <div>{error}</div>
//           {errorDetails && <div style={{ opacity: 0.8, marginTop: 6 }}>{errorDetails}</div>}
//         </div>
//       )}

//       <form onSubmit={handleSubmit}>
//         <div className="order-preview">
//           <h3>Order Preview</h3>
//           {items.map((item) => (
//             <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #eee" }}>
//               <span>{item.name} × {item.quantity}</span>
//               <span>₹{(item.price * item.quantity).toFixed(2)}</span>
//             </div>
//           ))}
//         </div>

//         <div className="form-field">
//           <label>Full Name</label>
//           <input name="customer_name" value={form.customer_name} onChange={handleChange} placeholder="Your name" />
//         </div>
//         <div className="form-field">
//           <label>WhatsApp Number (with country code)</label>
//           <input
//             name="customer_phone"
//             value={form.customer_phone}
//             onChange={handleChange}
//             placeholder="+91XXXXXXXXXX"
//           />
//         </div>
//         <div className="form-field">
//           <label>Delivery Address</label>
//           <textarea
//             name="delivery_address"
//             value={form.delivery_address}
//             onChange={handleChange}
//             rows={3}
//             placeholder="House no, street, area, landmark"
//           />
//         </div>

//         <label style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 8 }}>Payment Method</label>
//         <div
//           className={`pay-option ${paymentMethod === "razorpay" ? "selected" : ""}`}
//           onClick={() => setPaymentMethod("razorpay")}
//         >
//           <input type="radio" checked={paymentMethod === "razorpay"} readOnly /> Pay Online (Card / UPI / Netbanking)
//         </div>
//         <div
//           className={`pay-option ${paymentMethod === "cod" ? "selected" : ""}`}
//           onClick={() => setPaymentMethod("cod")}
//         >
//           <input type="radio" checked={paymentMethod === "cod"} readOnly /> Cash on Delivery
//         </div>

//         <div className="summary-box">
//           <div className="summary-row">
//             <span>Subtotal</span>
//             <span>₹{subtotal.toFixed(2)}</span>
//           </div>
//           <div className="summary-row">
//             <span>Delivery Fee</span>
//             <span>₹{DELIVERY_FEE.toFixed(2)}</span>
//           </div>
//           <div className="summary-row">
//             <span>Tax (5%)</span>
//             <span>₹{tax.toFixed(2)}</span>
//           </div>
//           <div className="summary-row total">
//             <span>Total</span>
//             <span>₹{total.toFixed(2)}</span>
//           </div>
//         </div>

//         {statusMessage && <div className="status-banner">{statusMessage}</div>}

//         <button type="submit" className="btn btn-yellow" style={{ width: "100%", marginTop: 20, padding: 14 }} disabled={submitting}>
//           {submitting ? "Placing Order..." : paymentMethod === "cod" ? "Place Order" : `Pay ₹${total.toFixed(2)}`}
//         </button>

//         <a
//           href={`https://wa.me/917000427370?text=${encodeURIComponent(`Hi Gabba! I want to order these items:\n${items.map((i) => `- ${i.name} x${i.quantity} • ₹${(i.price * i.quantity).toFixed(2)}`).join("\n")}\n\nTotal: ₹${total.toFixed(2)}`)}`}
//           target="_blank"
//           rel="noreferrer"
//           className="btn btn-outline"
//           style={{ width: "100%", marginTop: 12, padding: 14, textAlign: "center", display: "inline-flex", justifyContent: "center" }}
//         >
//           Share order on WhatsApp
//         </a>
//       </form>
//     </div>
//   );
// }







import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import api from "../api/api.js";

const DELIVERY_FEE = 40;

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({ customer_name: "", customer_phone: "", delivery_address: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const tax = +(subtotal * 0.05).toFixed(2);
  const total = +(subtotal + DELIVERY_FEE + tax).toFixed(2);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setStatusMessage("");

    if (!form.customer_name || !form.customer_phone || !form.delivery_address) {
      setError("Please fill in all delivery details.");
      return;
    }

    setSubmitting(true);
    setStatusMessage("Placing your order... please wait.");

    try {
      const payload = {
        ...form,
        items: items.map((i) => ({ menu_item_id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        payment_method: "cod",
      };
      const { data } = await api.post("/orders", payload);
      clearCart();
      navigate(`/order-confirmation/${data.order.id}`);
    } catch (err) {
      const apiError = err.response?.data?.error || err.message || "Failed to place order.";
      const apiDetail = err.response?.data?.detail || err.response?.statusText || "";
      setError(apiError);
      setErrorDetails(apiDetail);
      setStatusMessage("");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="page-wrap">
        <div className="empty-state">Your cart is empty. Add items before checking out.</div>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <h2 style={{ marginBottom: 24 }}>Checkout</h2>
      {error && (
        <div className="error-banner">
          <div>{error}</div>
          {errorDetails && <div style={{ opacity: 0.8, marginTop: 6 }}>{errorDetails}</div>}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="order-preview">
          <h3>Order Preview</h3>
          {items.map((item) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #eee" }}>
              <span>{item.name} × {item.quantity}</span>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="form-field">
          <label>Full Name</label>
          <input name="customer_name" value={form.customer_name} onChange={handleChange} placeholder="Your name" />
        </div>
        <div className="form-field">
          <label>WhatsApp Number (with country code)</label>
          <input
            name="customer_phone"
            value={form.customer_phone}
            onChange={handleChange}
            placeholder="+91XXXXXXXXXX"
          />
        </div>
        <div className="form-field">
          <label>Delivery Address</label>
          <textarea
            name="delivery_address"
            value={form.delivery_address}
            onChange={handleChange}
            rows={3}
            placeholder="House no, street, area, landmark"
          />
        </div>

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
            <span>Total (Cash on Delivery)</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>

        {statusMessage && <div className="status-banner">{statusMessage}</div>}

        <button type="submit" className="btn btn-yellow" style={{ width: "100%", marginTop: 20, padding: 14 }} disabled={submitting}>
          {submitting ? "Placing Order..." : "Place Order (Cash on Delivery)"}
        </button>

        <a
          href={`https://wa.me/916260509660?text=${encodeURIComponent(`Hi Gabba! I want to order these items:\n${items.map((i) => `- ${i.name} x${i.quantity} • ₹${(i.price * i.quantity).toFixed(2)}`).join("\n")}\n\nTotal: ₹${total.toFixed(2)}`)}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-outline"
          style={{ width: "100%", marginTop: 12, padding: 14, textAlign: "center", display: "inline-flex", justifyContent: "center" }}
        >
          Share order on WhatsApp
        </a>
      </form>
    </div>
  );
}