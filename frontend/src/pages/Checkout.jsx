import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import api from "../api/api.js";

const DELIVERY_FEE = 40;
const FREE_DELIVERY_THRESHOLD = 199;
const TAX_RATE = 0.05;

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    delivery_address: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  // Delivery is FREE when subtotal is ₹199 or more
  const deliveryFee =
    subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;

  const tax = +(subtotal * TAX_RATE).toFixed(2);

  const total = +(
    subtotal +
    deliveryFee +
    tax
  ).toFixed(2);

  const amountRemainingForFreeDelivery =
    Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setErrorDetails("");
    setStatusMessage("");

    if (
      !form.customer_name ||
      !form.customer_phone ||
      !form.delivery_address
    ) {
      setError("Please fill in all delivery details.");
      return;
    }

    setSubmitting(true);
    setStatusMessage("Placing your order... please wait.");

    try {
      const payload = {
        ...form,

        items: items.map((i) => ({
          menu_item_id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),

        payment_method: "cod",
      };

      /*
       * IMPORTANT:
       * Delivery fee is NOT sent from frontend.
       * Backend calculates:
       *
       * subtotal >= ₹199 → FREE delivery
       * subtotal < ₹199  → ₹40 delivery
       */
      const { data } = await api.post("/orders", payload);

      clearCart();

      navigate(`/order-confirmation/${data.order.id}`);
    } catch (err) {
      const apiError =
        err.response?.data?.error ||
        err.message ||
        "Failed to place order.";

      const apiDetail =
        err.response?.data?.detail ||
        err.response?.statusText ||
        "";

      setError(apiError);
      setErrorDetails(apiDetail);
      setStatusMessage("");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="page-wrap">
        <div className="empty-state">
          Your cart is empty. Add items before checking out.
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <h2 style={{ marginBottom: 24 }}>
        Checkout
      </h2>

      {error && (
        <div className="error-banner">
          <div>{error}</div>

          {errorDetails && (
            <div
              style={{
                opacity: 0.8,
                marginTop: 6,
              }}
            >
              {errorDetails}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ORDER PREVIEW */}
        <div className="order-preview">
          <h3>Order Preview</h3>

          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <span>
                {item.name} × {item.quantity}
              </span>

              <span>
                ₹{(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* FREE DELIVERY MESSAGE */}
        {subtotal < FREE_DELIVERY_THRESHOLD && (
          <div
            style={{
              marginTop: 16,
              padding: "12px 14px",
              borderRadius: 10,
              background: "#fff8d6",
              border: "1px solid #f1d65a",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            Add ₹
            {amountRemainingForFreeDelivery.toFixed(2)}
            {" "}more to your order and get{" "}
            <strong>FREE delivery</strong>.
          </div>
        )}

        {subtotal >= FREE_DELIVERY_THRESHOLD && (
          <div
            style={{
              marginTop: 16,
              padding: "12px 14px",
              borderRadius: 10,
              background: "#eef9ee",
              border: "1px solid #b8dfb8",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            <strong>FREE delivery unlocked!</strong>
            <br />
            Your order is ₹199 or above.
          </div>
        )}

        {/* CUSTOMER DETAILS */}
        <div className="form-field">
          <label>Full Name</label>

          <input
            name="customer_name"
            value={form.customer_name}
            onChange={handleChange}
            placeholder="Your name"
          />
        </div>

        <div className="form-field">
          <label>
            WhatsApp Number (with country code)
          </label>

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

        {/* ORDER SUMMARY */}
        <div className="summary-box">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>
              ₹{subtotal.toFixed(2)}
            </span>
          </div>

          <div className="summary-row">
            <span>Delivery Fee</span>

            <span>
              {deliveryFee === 0
                ? "FREE"
                : `₹${deliveryFee.toFixed(2)}`}
            </span>
          </div>

          <div className="summary-row">
            <span>Tax (5%)</span>

            <span>
              ₹{tax.toFixed(2)}
            </span>
          </div>

          <div className="summary-row total">
            <span>
              Total (Cash on Delivery)
            </span>

            <span>
              ₹{total.toFixed(2)}
            </span>
          </div>
        </div>

        {statusMessage && (
          <div className="status-banner">
            {statusMessage}
          </div>
        )}

        {/* PLACE ORDER */}
        <button
          type="submit"
          className="btn btn-yellow"
          style={{
            width: "100%",
            marginTop: 20,
            padding: 14,
          }}
          disabled={submitting}
        >
          {submitting
            ? "Placing Order..."
            : "Place Order (Cash on Delivery)"}
        </button>

        {/* WHATSAPP ORDER */}
        <a
          href={`https://wa.me/916260509660?text=${encodeURIComponent(
            `Hi Gabba! I want to order these items:\n\n${items
              .map(
                (i) =>
                  `- ${i.name} x${i.quantity} • ₹${(
                    i.price * i.quantity
                  ).toFixed(2)}`
              )
              .join("\n")}

Subtotal: ₹${subtotal.toFixed(2)}
Delivery: ${
              deliveryFee === 0
                ? "FREE"
                : `₹${deliveryFee.toFixed(2)}`
            }
Tax (5%): ₹${tax.toFixed(2)}
Total: ₹${total.toFixed(2)}`
          )}`}
          target="_blank"
          rel="noreferrer"
          className="btn btn-outline"
          style={{
            width: "100%",
            marginTop: 12,
            padding: 14,
            textAlign: "center",
            display: "inline-flex",
            justifyContent: "center",
          }}
        >
          Share order on WhatsApp
        </a>
      </form>
    </div>
  );
}




// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useCart } from "../context/CartContext.jsx";
// import api from "../api/api.js";

// const DELIVERY_FEE = 40;

// export default function Checkout() {
//   const { items, subtotal, clearCart } = useCart();
//   const navigate = useNavigate();

//   const [form, setForm] = useState({ customer_name: "", customer_phone: "", delivery_address: "" });
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState("");
//   const [errorDetails, setErrorDetails] = useState("");
//   const [statusMessage, setStatusMessage] = useState("");

//   // const tax = +(subtotal * 0.05).toFixed(2);
//   // const total = +(subtotal + DELIVERY_FEE + tax).toFixed(2);

//   const tax = +(subtotal * 0.05).toFixed(2);
//   const deliveryFee = subtotal >= 199 ? 0 : DELIVERY_FEE;
//   const total = +(subtotal + deliveryFee + tax).toFixed(2);

//   function handleChange(e) {
//     setForm({ ...form, [e.target.name]: e.target.value });
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
//     setStatusMessage("Placing your order... please wait.");

//     try {
//       const payload = {
//         ...form,
//         items: items.map((i) => ({ menu_item_id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
//         payment_method: "cod",
//       };
//       const { data } = await api.post("/orders", payload);
//       clearCart();
//       navigate(`/order-confirmation/${data.order.id}`);
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

//         <div className="summary-box">
//           <div className="summary-row">
//             <span>Subtotal</span>
//             <span>₹{subtotal.toFixed(2)}</span>
//           </div>
//           {/* <div className="summary-row">
//             <span>Delivery Fee</span>
//             <span>₹{DELIVERY_FEE.toFixed(2)}</span>
//           </div> */}

//         <div className="summary-row">
//   <span>Delivery Fee</span>
//   <span>
//     {deliveryFee === 0 ? "FREE" : `₹${deliveryFee.toFixed(2)}`}
//   </span>
// </div>

//           <div className="summary-row">
//             <span>Tax (5%)</span>
//             <span>₹{tax.toFixed(2)}</span>
//           </div>
//           <div className="summary-row total">
//             <span>Total (Cash on Delivery)</span>
//             <span>₹{total.toFixed(2)}</span>
//           </div>
//         </div>

//         {statusMessage && <div className="status-banner">{statusMessage}</div>}

//         <button type="submit" className="btn btn-yellow" style={{ width: "100%", marginTop: 20, padding: 14 }} disabled={submitting}>
//           {submitting ? "Placing Order..." : "Place Order (Cash on Delivery)"}
//         </button>

//         <a
//           href={`https://wa.me/916260509660?text=${encodeURIComponent(`Hi Gabba! I want to order these items:\n${items.map((i) => `- ${i.name} x${i.quantity} • ₹${(i.price * i.quantity).toFixed(2)}`).join("\n")}\n\nTotal: ₹${total.toFixed(2)}`)}`}
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