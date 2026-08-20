// import React, { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import api from "../api/api.js";

// export default function OrderConfirmation() {
//   const { id } = useParams();
//   const [data, setData] = useState(null);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     api
//       .get(`/orders/${id}`)
//       .then((res) => setData(res.data))
//       .catch(() => setError("Couldn't load order details."));
//   }, [id]);

//   if (error) return <div className="page-wrap error-banner">{error}</div>;
//   if (!data) return <div className="page-wrap">Loading order...</div>;

//   const { order, items } = data;

//   return (
//     <div className="page-wrap">
//       <div className="confirm-box">
//         <div className="check">✓</div>
//         <h2>Order Placed!</h2>
//         <p style={{ color: "#666", marginTop: 8 }}>
//           Order #{order.id} confirmed. The bill has been sent to your WhatsApp
//           {order.whatsapp_customer_sent ? "" : " (or will arrive shortly once WhatsApp is configured)"}.
//         </p>
//       </div>

//       {items.map((it) => (
//         <div className="cart-item" key={it.id}>
//           <div className="info">
//             <h4>
//               {it.item_name} x{it.quantity}
//             </h4>
//           </div>
//           <div className="price">₹{(it.price * it.quantity).toFixed(2)}</div>
//         </div>
//       ))}

//       <div className="summary-box">
//         <div className="summary-row">
//           <span>Subtotal</span>
//           <span>₹{Number(order.subtotal).toFixed(2)}</span>
//         </div>
//         <div className="summary-row">
//           <span>Delivery Fee</span>
//           <span>₹{Number(order.delivery_fee).toFixed(2)}</span>
//         </div>
//         <div className="summary-row">
//           <span>Tax</span>
//           <span>₹{Number(order.tax).toFixed(2)}</span>
//         </div>
//         <div className="summary-row total">
//           <span>Total</span>
//           <span>₹{Number(order.total).toFixed(2)}</span>
//         </div>
//       </div>

//       <Link to="/" className="btn btn-yellow" style={{ display: "block", textAlign: "center", marginTop: 20, padding: 14 }}>
//         Order More
//       </Link>
//     </div>
//   );
// }





import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api.js";

export default function OrderConfirmation() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then((res) => setData(res.data))
      .catch(() =>
        setError("Couldn't load order details.")
      );
  }, [id]);

  if (error) {
    return (
      <div className="page-wrap error-banner">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-wrap">
        Loading order...
      </div>
    );
  }

  const { order, items } = data;

  const deliveryFee = Number(order.delivery_fee);
  const subtotal = Number(order.subtotal);
  const tax = Number(order.tax);
  const total = Number(order.total);

  return (
    <div className="page-wrap">

      {/* SUCCESS MESSAGE */}
      <div className="confirm-box">
        <div className="check">✓</div>

        <h2>Order Placed!</h2>

        <p
          style={{
            color: "#666",
            marginTop: 8,
          }}
        >
          Order #{order.id} confirmed.
          The bill has been sent to your WhatsApp
          {order.whatsapp_customer_sent
            ? ""
            : " (or will arrive shortly once WhatsApp is configured)"}
          .
        </p>
      </div>

      {/* ORDER ITEMS */}
      {items.map((it) => (
        <div
          className="cart-item"
          key={it.id}
        >
          <div className="info">
            <h4>
              {it.item_name} × {it.quantity}
            </h4>
          </div>

          <div className="price">
            ₹{(
              Number(it.price) *
              Number(it.quantity)
            ).toFixed(2)}
          </div>
        </div>
      ))}

      {/* SUMMARY */}
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
          <span>Tax</span>

          <span>
            ₹{tax.toFixed(2)}
          </span>
        </div>

        <div className="summary-row total">
          <span>Total</span>

          <span>
            ₹{total.toFixed(2)}
          </span>
        </div>

      </div>

      {/* FREE DELIVERY MESSAGE */}
      {deliveryFee === 0 && (
        <div
          style={{
            marginTop: 12,
            padding: "12px 14px",
            borderRadius: 10,
            background: "#eef9ee",
            border: "1px solid #b8dfb8",
            textAlign: "center",
            fontSize: 14,
          }}
        >
          FREE delivery applied on your ₹199+ order.
        </div>
      )}

      <Link
        to="/"
        className="btn btn-yellow"
        style={{
          display: "block",
          textAlign: "center",
          marginTop: 20,
          padding: 14,
        }}
      >
        Order More
      </Link>

    </div>
  );
}