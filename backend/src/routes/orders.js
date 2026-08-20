const express = require("express");
const pool = require("../db");
const { authOptional } = require("../middleware/auth");
const { sendBillToCustomerAndOwner } = require("../services/whatsapp");

const router = express.Router();

const DELIVERY_FEE = 40;
const TAX_RATE = 0.05;

// POST /api/orders - place an order (works for guests and logged-in users)
router.post("/", authOptional, async (req, res) => {
  const {
    customer_name,
    customer_phone,
    delivery_address,
    items, // [{ menu_item_id, name, price, quantity }]
    payment_method, // 'razorpay' | 'cod'
    razorpay_order_id,
    razorpay_payment_id,
  } = req.body;

  if (!customer_name || !customer_phone || !delivery_address || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "customer_name, customer_phone, delivery_address, and items are required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const subtotal = items.reduce((sum, it) => sum + Number(it.price) * Number(it.quantity), 0);
    const tax = +(subtotal * TAX_RATE).toFixed(2);

    // Free delivery on orders of ₹199 or more
    // const total = +(subtotal + DELIVERY_FEE + tax).toFixed(2);
    const deliveryFee = subtotal >= 199 ? 0 : DELIVERY_FEE;
    const total = +(subtotal + deliveryFee + tax).toFixed(2);

    const payment_status = payment_method === "razorpay" && razorpay_payment_id ? "paid" : "pending";

    const delivery_area = delivery_address.split(",")[1]?.trim() || "Unknown";
    const orderResult = await client.query(
      `INSERT INTO orders
        (user_id, customer_name, customer_phone, delivery_address, delivery_area, subtotal, delivery_fee, tax, total,
         payment_method, payment_status, razorpay_order_id, razorpay_payment_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        req.user ? req.user.id : null,
        customer_name,
        customer_phone,
        delivery_address,
        delivery_area,
        subtotal,
        deliveryFee,
        tax,
        total,
        payment_method || "cod",
        payment_status,
        razorpay_order_id || null,
        razorpay_payment_id || null,
      ]
    );
    const order = orderResult.rows[0];

    const insertedItems = [];
    for (const it of items) {
      const r = await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, price)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [order.id, it.menu_item_id, it.name, it.quantity, it.price]
      );
      insertedItems.push(r.rows[0]);
    }

    await client.query("COMMIT");

    // Send WhatsApp bill to customer + owner (non-blocking failure - order still succeeds)
    sendBillToCustomerAndOwner(order, insertedItems)
      .then((results) => {
        const updates = [];
        const params = [];
        if (results.customer && !results.customer.error && !results.customer.skipped) {
          updates.push(`whatsapp_customer_sent = true`);
        }
        if (results.owner && !results.owner.error && !results.owner.skipped) {
          updates.push(`whatsapp_owner_sent = true`);
        }
        if (updates.length) {
          pool.query(`UPDATE orders SET ${updates.join(", ")} WHERE id = $1`, [order.id]).catch(console.error);
        }
      })
      .catch(console.error);

    res.status(201).json({ order, items: insertedItems });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({
      error: err.message || "Failed to place order",
      detail: err.detail || err.code || undefined,
    });
  } finally {
    client.release();
  }
});

// GET /api/orders/:id - fetch a single order with its items
router.get("/:id", async (req, res) => {
  try {
    const orderResult = await pool.query("SELECT * FROM orders WHERE id = $1", [req.params.id]);
    if (orderResult.rows.length === 0) return res.status(404).json({ error: "Order not found" });
    const itemsResult = await pool.query("SELECT * FROM order_items WHERE order_id = $1", [req.params.id]);
    res.json({ order: orderResult.rows[0], items: itemsResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// GET /api/orders/user/:userId - order history for a logged-in user
router.get("/user/:userId", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch order history" });
  }
});

module.exports = router;
