// const express = require("express");
// const { authRequired } = require("../middleware/auth");
// const pool = require("../db");
// const { getActiveUsers } = require("../services/activeUsers");

// const router = express.Router();

// router.get("/metrics", authRequired, async (req, res) => {
//   if (!req.user?.is_admin) {
//     return res.status(403).json({ error: "Admin access required" });
//   }

//   try {
//     const summary = await pool.query(
//       `SELECT COUNT(*) AS total_orders, COALESCE(SUM(total), 0) AS total_revenue
//        FROM orders`
//     );

//     const byArea = await pool.query(
//       `SELECT COALESCE(delivery_area, 'Unknown') AS delivery_area,
//               COUNT(*) AS orders,
//               COALESCE(SUM(total), 0) AS revenue
//        FROM orders
//        GROUP BY COALESCE(delivery_area, 'Unknown')
//        ORDER BY orders DESC
//        LIMIT 6`
//     );

//     const recent = await pool.query(
//       `SELECT id, customer_name, delivery_area, total, payment_status, order_status, created_at
//        FROM orders
//        ORDER BY created_at DESC
//        LIMIT 8`
//     );

//     res.json({
//       totalOrders: Number(summary.rows[0].total_orders),
//       totalRevenue: Number(summary.rows[0].total_revenue),
//       areaStats: byArea.rows.map((row) => ({
//         area: row.delivery_area,
//         orders: Number(row.orders),
//         revenue: Number(row.revenue),
//       })),
//       recentOrders: recent.rows,
//       activeUsers: getActiveUsers(),
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to load admin metrics" });
//   }
// });

// module.exports = router;







const express = require("express");
const pool = require("../db");
const {
  authRequired,
  adminRequired,
} = require("../middleware/auth");
const { getActiveUsers } = require("../services/activeUsers");

const router = express.Router();

router.use(authRequired);
router.use(adminRequired);

/*
|--------------------------------------------------------------------------
| Dashboard Overview
|--------------------------------------------------------------------------
*/

router.get("/metrics", async (req, res) => {
  try {
    const [
      summary,
      users,
      today,
      averageOrder,
      topProducts,
      dailySales,
      orderStatus,
      areas,
      recentOrders,
    ] = await Promise.all([
      // Revenue + orders
      pool.query(`
        SELECT
          COUNT(*) AS total_orders,
          COALESCE(SUM(total), 0) AS total_revenue
        FROM orders
        WHERE order_status <> 'cancelled'
      `),

      // Users
      pool.query(`
        SELECT COUNT(*) AS total_users
        FROM users
      `),

      // Today's orders
      pool.query(`
        SELECT
          COUNT(*) AS orders_today,
          COALESCE(SUM(total), 0) AS revenue_today
        FROM orders
        WHERE order_status <> 'cancelled'
        AND created_at >= CURRENT_DATE
      `),

      // Average order
      pool.query(`
        SELECT
          COALESCE(AVG(total), 0) AS average_order
        FROM orders
        WHERE order_status <> 'cancelled'
      `),

      // Best selling products
      pool.query(`
        SELECT
          oi.menu_item_id,
          oi.item_name,
          SUM(oi.quantity) AS quantity_sold,
          COALESCE(
            SUM(oi.quantity * oi.price),
            0
          ) AS revenue
        FROM order_items oi
        JOIN orders o
          ON o.id = oi.order_id
        WHERE o.order_status <> 'cancelled'
        GROUP BY
          oi.menu_item_id,
          oi.item_name
        ORDER BY quantity_sold DESC
        LIMIT 10
      `),

      // Last 7 days
      pool.query(`
        SELECT
          DATE(created_at) AS date,
          COUNT(*) AS orders,
          COALESCE(SUM(total), 0) AS revenue
        FROM orders
        WHERE order_status <> 'cancelled'
        AND created_at >= CURRENT_DATE - INTERVAL '6 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `),

      // Order status
      pool.query(`
        SELECT
          order_status,
          COUNT(*) AS count
        FROM orders
        GROUP BY order_status
        ORDER BY count DESC
      `),

      // Delivery areas
      pool.query(`
        SELECT
          COALESCE(delivery_area, 'Unknown') AS area,
          COUNT(*) AS orders,
          COALESCE(SUM(total), 0) AS revenue
        FROM orders
        WHERE order_status <> 'cancelled'
        GROUP BY COALESCE(delivery_area, 'Unknown')
        ORDER BY orders DESC
        LIMIT 8
      `),

      // Recent orders
      pool.query(`
        SELECT
          o.id,
          o.customer_name,
          o.customer_phone,
          o.total,
          o.payment_status,
          o.order_status,
          o.delivery_area,
          o.created_at
        FROM orders o
        ORDER BY o.created_at DESC
        LIMIT 10
      `),
    ]);

    res.json({
      overview: {
        totalOrders: Number(summary.rows[0].total_orders),
        totalRevenue: Number(summary.rows[0].total_revenue),
        totalUsers: Number(users.rows[0].total_users),
        ordersToday: Number(today.rows[0].orders_today),
        revenueToday: Number(today.rows[0].revenue_today),
        averageOrder: Number(averageOrder.rows[0].average_order),
        activeUsers: getActiveUsers(),
      },

      topProducts: topProducts.rows.map((item) => ({
        id: item.menu_item_id,
        name: item.item_name,
        quantitySold: Number(item.quantity_sold),
        revenue: Number(item.revenue),
      })),

      dailySales: dailySales.rows.map((item) => ({
        date: item.date,
        orders: Number(item.orders),
        revenue: Number(item.revenue),
      })),

      orderStatus: orderStatus.rows.map((item) => ({
        status: item.order_status,
        count: Number(item.count),
      })),

      areas: areas.rows.map((item) => ({
        area: item.area,
        orders: Number(item.orders),
        revenue: Number(item.revenue),
      })),

      recentOrders: recentOrders.rows,
    });
  } catch (err) {
    console.error("Admin metrics error:", err);

    res.status(500).json({
      error: "Failed to load admin dashboard",
    });
  }
});

/*
|--------------------------------------------------------------------------
| All Registered Users
|--------------------------------------------------------------------------
*/

router.get("/users", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.address,
        u.created_at,
        COUNT(o.id) AS total_orders,
        COALESCE(SUM(
          CASE
            WHEN o.order_status <> 'cancelled'
            THEN o.total
            ELSE 0
          END
        ), 0) AS total_spent
      FROM users u
      LEFT JOIN orders o
        ON o.user_id = u.id
      GROUP BY
        u.id,
        u.name,
        u.email,
        u.phone,
        u.address,
        u.created_at
      ORDER BY u.created_at DESC
    `);

    res.json({
      users: result.rows.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        createdAt: user.created_at,
        totalOrders: Number(user.total_orders),
        totalSpent: Number(user.total_spent),
      })),
    });
  } catch (err) {
    console.error("Users error:", err);

    res.status(500).json({
      error: "Failed to load users",
    });
  }
});

/*
|--------------------------------------------------------------------------
| All Orders
|--------------------------------------------------------------------------
*/

router.get("/orders", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        customer_name,
        customer_phone,
        total,
        payment_method,
        payment_status,
        order_status,
        delivery_area,
        created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 100
    `);

    res.json({
      orders: result.rows,
    });
  } catch (err) {
    console.error("Orders error:", err);

    res.status(500).json({
      error: "Failed to load orders",
    });
  }
});

module.exports = router;