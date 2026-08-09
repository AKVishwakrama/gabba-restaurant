const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { authOptional } = require("../middleware/auth");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "GabbaRestaurant2026@JWT";
if (!process.env.JWT_SECRET) {
  console.warn("Warning: JWT_SECRET is not set in environment variables. Using default development secret.");
}

const https = require("https");
const crypto = require("crypto");

router.post("/register", async (req, res) => {
  const { name, email, password, phone, address } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email, and password are required" });
  }
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, phone, address)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email, phone, address`,
      [name, normalizedEmail, password_hash, phone || null, address || null]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [normalizedEmail]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    delete user.password_hash;
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/me", authOptional, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const result = await pool.query(
      "SELECT id, name, email, phone, address, is_admin FROM users WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user info" });
  }
});

// POST /api/auth/google - verify Google id_token and sign in / create user
router.post("/google", async (req, res) => {
  const { id_token } = req.body;
  if (!id_token) return res.status(400).json({ error: "id_token is required" });

  try {
    // verify token with Google's tokeninfo endpoint
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(id_token)}`;
    const tokenInfo = await new Promise((resolve, reject) => {
      https
        .get(url, (resp) => {
          let data = "";
          resp.on("data", (chunk) => (data += chunk));
          resp.on("end", () => resolve(JSON.parse(data)));
        })
        .on("error", reject);
    });

    // optional audience check
    if (process.env.GOOGLE_CLIENT_ID && tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ error: "Invalid Google client ID" });
    }

    const email = tokenInfo.email;
    const name = tokenInfo.name || tokenInfo.email.split("@")[0];

    // find or create user
    let userRes = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    let user = userRes.rows[0];
    if (!user) {
      const randomPwd = crypto.randomBytes(16).toString("hex");
      const password_hash = await bcrypt.hash(randomPwd, 10);
      const insert = await pool.query(
        `INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING id, name, email, phone, address, is_admin`,
        [name, email, password_hash]
      );
      user = insert.rows[0];
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ user, token });
  } catch (err) {
    console.error("Google auth failed", err);
    res.status(500).json({ error: "Google authentication failed" });
  }
});

module.exports = router;

