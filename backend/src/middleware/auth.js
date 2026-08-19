// const jwt = require("jsonwebtoken");

// function authRequired(req, res, next) {
//   const header = req.headers.authorization;
//   if (!header || !header.startsWith("Bearer ")) {
//     return res.status(401).json({ error: "Missing or invalid Authorization header" });
//   }
//   const token = header.split(" ")[1];
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({ error: "Invalid or expired token" });
//   }
// }

// // Optional auth - attaches user if token present, but doesn't block guest checkout
// function authOptional(req, res, next) {
//   const header = req.headers.authorization;
//   if (header && header.startsWith("Bearer ")) {
//     const token = header.split(" ")[1];
//     try {
//       req.user = jwt.verify(token, process.env.JWT_SECRET);
//     } catch (err) {
//       req.user = null;
//     }
//   }
//   next();
// }

// module.exports = { authRequired, authOptional };




const jwt = require("jsonwebtoken");
const pool = require("../db");

/*
|--------------------------------------------------------------------------
| Authentication Middleware
|--------------------------------------------------------------------------
| Verifies that the user has a valid JWT token.
*/

function authRequired(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }

  const token = header.substring(7).trim();

  if (!token) {
    return res.status(401).json({
      error: "Authentication token missing",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Make sure the JWT contains a user ID
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        error: "Invalid authentication token",
      });
    }

    req.user = decoded;

    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);

    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
}


/*
|--------------------------------------------------------------------------
| Admin / Owner Middleware
|--------------------------------------------------------------------------
| IMPORTANT:
| We do NOT trust is_admin from the frontend or JWT.
|
| We check the actual Neon PostgreSQL database.
|
| Only users with is_admin = true can access admin APIs.
*/

async function adminRequired(req, res, next) {
  try {
    // authRequired must run before this middleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        is_admin
      FROM users
      WHERE id = $1
      `,
      [req.user.id]
    );

    // User doesn't exist
    if (result.rows.length === 0) {
      return res.status(403).json({
        error: "Admin access denied",
      });
    }

    const admin = result.rows[0];

    // User exists but isn't an admin
    if (admin.is_admin !== true) {
      return res.status(403).json({
        error: "Admin access required",
      });
    }

    // Store verified admin information
    req.admin = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      is_admin: admin.is_admin,
    };

    next();

  } catch (err) {
    console.error(
      "Admin authentication error:",
      err
    );

    return res.status(500).json({
      error: "Failed to verify admin access",
    });
  }
}


/*
|--------------------------------------------------------------------------
| Optional Authentication
|--------------------------------------------------------------------------
| Used for routes where login is optional.
|
| Example:
| - Menu can be viewed without login
| - Logged-in user gets personalized information
|
| Invalid/missing token does NOT block the request.
*/

function authOptional(req, res, next) {
  const header = req.headers.authorization;

  // No token → continue as guest
  if (!header || !header.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  const token = header.substring(7).trim();

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

  } catch (err) {
    // Optional auth means invalid token
    // should not block public routes.
    req.user = null;
  }

  next();
}


/*
|--------------------------------------------------------------------------
| Export Middleware
|--------------------------------------------------------------------------
*/

module.exports = {
  authRequired,
  authOptional,
  adminRequired,
};