require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const menuRoutes = require("./routes/menu");
const orderRoutes = require("./routes/orders");
const paymentRoutes = require("./routes/payment");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

async function ensureDatabaseSchema() {
  try {
    await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_area VARCHAR(100)");
  } catch (err) {
    console.error("Schema migration failed:", err);
    process.exit(1);
  }
}

ensureDatabaseSchema();

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "gabba-backend" }));

app.use((req, res, next) => {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress;
  require("./services/activeUsers").touchClient(ip);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Gabba backend running on http://localhost:${PORT}`);
});
