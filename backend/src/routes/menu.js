const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET /api/menu - list all available items, optional ?category=Burger
router.get("/", async (req, res) => {
  const { category } = req.query;
  try {
    let query = "SELECT * FROM menu_items WHERE is_available = true";
    const params = [];
    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }
    query += " ORDER BY is_bestseller DESC, name ASC";
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch menu" });
  }
});

// GET /api/menu/categories - distinct categories for the menu tabs
router.get("/categories", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT DISTINCT category FROM menu_items WHERE is_available = true ORDER BY category"
    );
    res.json(result.rows.map((r) => r.category));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// GET /api/menu/:id
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM menu_items WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Item not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch item" });
  }
});

module.exports = router;
