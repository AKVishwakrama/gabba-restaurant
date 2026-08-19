const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const https = require("https");
const crypto = require("crypto");

const pool = require("../db");
const { authOptional } = require("../middleware/auth");

const router = express.Router();

const JWT_SECRET =
  process.env.JWT_SECRET || "GabbaRestaurant2026@JWT";

if (!process.env.JWT_SECRET) {
  console.warn(
    "Warning: JWT_SECRET is not set in environment variables. Using default development secret."
  );
}

/* =========================================================
   REGISTER
   POST /api/auth/register
   ========================================================= */

router.post("/register", async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    address,
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      error: "name, email, and password are required",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    // Check if account already exists
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: "An account with this email already exists",
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    /*
      IMPORTANT:
      Do NOT allow the frontend to send is_admin.

      Every newly registered customer is automatically:
      is_admin = false
    */

    const result = await pool.query(
      `INSERT INTO users
        (name, email, password_hash, phone, address, is_admin)
       VALUES
        ($1, $2, $3, $4, $5, false)
       RETURNING
        id,
        name,
        email,
        phone,
        address,
        is_admin,
        created_at`,
      [
        name.trim(),
        normalizedEmail,
        password_hash,
        phone || null,
        address || null,
      ]
    );

    const user = result.rows[0];

    // Create JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(201).json({
      user,
      token,
    });
  } catch (err) {
    console.error("Registration error:", err);

    return res.status(500).json({
      error: "Registration failed",
    });
  }
});


/* =========================================================
   LOGIN
   POST /api/auth/login
   ========================================================= */

router.post("/login", async (req, res) => {
  const {
    email,
    password,
  } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "email and password are required",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    /*
      We explicitly select the fields we need.

      is_admin is included so React knows whether
      this is the owner/admin account.
    */

    const result = await pool.query(
      `SELECT
        id,
        name,
        email,
        password_hash,
        phone,
        address,
        is_admin,
        created_at
       FROM users
       WHERE email = $1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const dbUser = result.rows[0];

    // Verify password
    const match = await bcrypt.compare(
      password,
      dbUser.password_hash
    );

    if (!match) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: dbUser.id,
        email: dbUser.email,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    /*
      IMPORTANT:
      Never send password_hash to frontend.
    */

    const user = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      phone: dbUser.phone,
      address: dbUser.address,
      is_admin: dbUser.is_admin,
      created_at: dbUser.created_at,
    };

    console.log(
      `Login successful: ${user.email} | Admin: ${user.is_admin}`
    );

    return res.json({
      user,
      token,
    });
  } catch (err) {
    console.error("Login error:", err);

    return res.status(500).json({
      error: "Login failed",
    });
  }
});


/* =========================================================
   CURRENT USER
   GET /api/auth/me
   ========================================================= */

router.get("/me", authOptional, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Not authenticated",
      });
    }

    const result = await pool.query(
      `SELECT
        id,
        name,
        email,
        phone,
        address,
        is_admin,
        created_at
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.json({
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Auth /me error:", err);

    return res.status(500).json({
      error: "Failed to fetch user info",
    });
  }
});


/* =========================================================
   GOOGLE LOGIN
   POST /api/auth/google
   ========================================================= */

router.post("/google", async (req, res) => {
  const { id_token } = req.body;

  if (!id_token) {
    return res.status(400).json({
      error: "id_token is required",
    });
  }

  try {
    /*
      Verify Google ID token using Google's tokeninfo endpoint.
    */

    const url =
      `https://oauth2.googleapis.com/tokeninfo?id_token=` +
      encodeURIComponent(id_token);

    const tokenInfo = await new Promise((resolve, reject) => {
      https
        .get(url, (response) => {
          let data = "";

          response.on("data", (chunk) => {
            data += chunk;
          });

          response.on("end", () => {
            try {
              const parsed = JSON.parse(data);

              if (response.statusCode !== 200) {
                return reject(
                  new Error(
                    parsed.error_description ||
                      "Invalid Google token"
                  )
                );
              }

              resolve(parsed);
            } catch (err) {
              reject(err);
            }
          });
        })
        .on("error", reject);
    });

    /*
      Verify Google Client ID if configured.
    */

    if (
      process.env.GOOGLE_CLIENT_ID &&
      tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID
    ) {
      return res.status(401).json({
        error: "Invalid Google client ID",
      });
    }

    const email = tokenInfo.email?.trim().toLowerCase();

    if (!email) {
      return res.status(401).json({
        error: "Google account email not available",
      });
    }

    const name =
      tokenInfo.name ||
      email.split("@")[0];

    /*
      Find existing user.
    */

    let userResult = await pool.query(
      `SELECT
        id,
        name,
        email,
        password_hash,
        phone,
        address,
        is_admin,
        created_at
       FROM users
       WHERE email = $1`,
      [email]
    );

    let user;

    /*
      Existing account
    */

    if (userResult.rows.length > 0) {
      user = userResult.rows[0];
    }

    /*
      New Google account

      IMPORTANT:
      Google users are NEVER automatically made admin.
      is_admin is explicitly false.
    */

    else {
      const randomPassword = crypto
        .randomBytes(32)
        .toString("hex");

      const password_hash = await bcrypt.hash(
        randomPassword,
        10
      );

      const insertResult = await pool.query(
        `INSERT INTO users
          (name, email, password_hash, is_admin)
         VALUES
          ($1, $2, $3, false)
         RETURNING
          id,
          name,
          email,
          phone,
          address,
          is_admin,
          created_at`,
        [
          name.trim(),
          email,
          password_hash,
        ]
      );

      user = insertResult.rows[0];
    }

    /*
      Create JWT.
    */

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    /*
      Never return password_hash.
    */

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      is_admin: user.is_admin,
      created_at: user.created_at,
    };

    console.log(
      `Google login successful: ${safeUser.email} | Admin: ${safeUser.is_admin}`
    );

    return res.json({
      user: safeUser,
      token,
    });
  } catch (err) {
    console.error("Google authentication failed:", err);

    return res.status(500).json({
      error: "Google authentication failed",
    });
  }
});


/* =========================================================
   EXPORT ROUTER
   ========================================================= */

module.exports = router;