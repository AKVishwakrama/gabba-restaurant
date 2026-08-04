const express = require("express");
const { authRequired } = require("../middleware/auth");
const pool = require("../db");
const { getActiveUsers } = require("../services/activeUsers");

const router = express.Router();

router.get("/metrics", authRequired, async (req, res) => {
  if (!req.user?.is_admin) {
    return res.status(403).json({ error: "Admin access required" });
  }

  try {
    const summary = await pool.query(
      `SELECT COUNT(*) AS total_orders, COALESCE(SUM(total), 0) AS total_revenue
       FROM orders`
    );

    const byArea = await pool.query(
      `SELECT COALESCE(delivery_area, 'Unknown') AS delivery_area,
              COUNT(*) AS orders,
              COALESCE(SUM(total), 0) AS revenue
       FROM orders
       GROUP BY COALESCE(delivery_area, 'Unknown')
       ORDER BY orders DESC
       LIMIT 6`
    );

    const recent = await pool.query(
      `SELECT id, customer_name, delivery_area, total, payment_status, order_status, created_at
       FROM orders
       ORDER BY created_at DESC
       LIMIT 8`
    );

    res.json({
      totalOrders: Number(summary.rows[0].total_orders),
      totalRevenue: Number(summary.rows[0].total_revenue),
      areaStats: byArea.rows.map((row) => ({
        area: row.delivery_area,
        orders: Number(row.orders),
        revenue: Number(row.revenue),
      })),
      recentOrders: recent.rows,
      activeUsers: getActiveUsers(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load admin metrics" });
  }
});

module.exports = router;
