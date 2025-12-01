const express = require("express");
const router = express.Router();
const pool = require("../db");
const { sendEmail } = require("../utils/mailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const authenticate = require("../middleware/authenticate");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET not configured");

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, department, email, notes,
              to_char(time, 'YYYY-MM-DD HH24:MI:SS') AS time, status
       FROM admins
       ORDER BY id ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching admins:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Verify reset token
router.get("/verify-token/:token", async (req, res) => {
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  try {
    const result = await pool.query(
      "SELECT id FROM admins WHERE reset_token = $1 AND token_expiry > NOW()",
      [hashedToken]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    res.json({ success: true, adminId: result.rows[0].id });
  } catch (err) {
    console.error("Error verifying token:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Set new password
router.post("/set-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      `UPDATE admins
       SET password = $1, reset_token = NULL, token_expiry = NULL
       WHERE reset_token = $2 AND token_expiry > NOW()
       RETURNING id`,
      [hashedPassword, hashedToken]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    res.json({ success: true, message: "Password set successfully" });
  } catch (err) {
    console.error("Error setting password:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Forgot password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query("SELECT * FROM admins WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const admin = result.rows[0];

    // Generate reset token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      "UPDATE admins SET reset_token = $1, token_expiry = $2 WHERE id = $3",
      [hashedToken, expiry, admin.id]
    );

    const link = `http://localhost:5173/set-password/${rawToken}`;

    try {
      await sendEmail(
        admin.email,
        "Password Reset Request",
        `<p>Hello ${admin.full_name || "Admin"},</p>
         <p>You requested a password reset.</p>
         <p>Click below to set a new password (valid for 1 hour):</p>
         <a href="${link}" style="color:blue;">Reset Password</a>`
      );
    } catch (emailErr) {
      console.error("Failed to send reset email:", emailErr.message);
    }

    res.json({ message: "A reset password link has been sent to your email." });
  } catch (err) {
    console.error("Forgot password error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Check if email exists
router.get("/check", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const result = await pool.query(
      "SELECT status FROM admins WHERE LOWER(email) = LOWER($1) LIMIT 1",
      [email]
    );

    if (result.rows.length > 0) {
      return res.json({ exists: true, status: result.rows[0].status });
    }

    res.json({ exists: false });
  } catch (err) {
    console.error("Error checking email:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Login (with refresh token)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM admins WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const admin = result.rows[0];

    if (admin.status === "pending") {
      return res.status(404).json({ error: "Account not approved yet" });
    }
    if (admin.status === "rejected") {
      return res.status(404).json({ error: "Account request is rejected" });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(404).json({ error: "Wrong password" });
    }

    // Generate short-lived access token (70s for testing)
    const accessToken = jwt.sign(
      { id: admin.id, email: admin.email, full_name: admin.full_name },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    // ✅ Generate refresh token (10min for testing, 24h in production)
    const refreshToken = jwt.sign(
      { id: admin.id, email: admin.email, full_name: admin.full_name },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "8h" } // 10 min > 5 min max session (for testing)
    );

    // Send refresh token as secure HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // set to true in production (HTTPS)
      sameSite: "Strict",
      maxAge: 8 * 60 * 60 * 1000, // 10 minutes
    });

    res.json({
      token: accessToken,
      admin: {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        department: admin.department,
        status: admin.status,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Refresh token: issue new tokens with ROTATION
router.post("/refresh", (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken;

  if (!oldRefreshToken) {
    console.log("REFRESH FAILED: No refresh token in cookies");
    return res.status(401).json({ error: "No refresh token" });
  }

  jwt.verify(
    oldRefreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (err, decoded) => {
      if (err) {
        console.log("REFRESH FAILED: Token verification error");
        console.error("Error details:", err.message);
        return res
          .status(403)
          .json({ error: "Invalid or expired refresh token" });
      }

      // Generate NEW access token (70s for testing)
      const newAccessToken = jwt.sign(
        { id: decoded.id, email: decoded.email, full_name: decoded.full_name },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      // TOKEN ROTATION: Generate NEW refresh token with FRESH expiry
      const newRefreshToken = jwt.sign(
        { id: decoded.id, email: decoded.email, full_name: decoded.full_name },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "8h" } // Fresh 10 minutes from NOW
      );

      // Replace old refresh token with new one in cookie
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: false, // true in production
        sameSite: "Strict",
        maxAge: 8 * 60 * 60 * 1000, // 10 minutes
      });

      res.json({ token: newAccessToken });
    }
  );
});

// LOGOUT: Clear refresh token cookie
router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false, // true in production
    sameSite: "Strict",
  });
  res.json({ message: "Logged out successfully" });
});

// Get logged-in admin profile
router.get("/me", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, department, email, status
       FROM admins WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching admin:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Update profile (only self)
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, department } = req.body;

    // Restrict: user can only update own profile
    if (req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const result = await pool.query(
      `UPDATE admins
       SET full_name = $1, department = $2
       WHERE id = $3
       RETURNING id, full_name, department, email`,
      [full_name, department, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating admin:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Sign up (new admin request)
router.post("/", async (req, res) => {
  const { fullName, department, email, notes } = req.body;
  try {
    const exists = await pool.query(
      "SELECT id FROM admins WHERE LOWER(email) = LOWER($1)",
      [email]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const result = await pool.query(
      `INSERT INTO admins (full_name, department, email, notes, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [fullName, department, email, notes]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error creating admin:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Update status (approve/reject) + send email
router.put("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      "UPDATE admins SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const admin = result.rows[0];

    if (status === "approved") {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

      await pool.query(
        "UPDATE admins SET reset_token = $1, token_expiry = $2 WHERE id = $3",
        [hashedToken, expiry, admin.id]
      );

      const link = `http://localhost:5173/set-password/${rawToken}`;

      try {
        sendEmail(
          admin.email,
          "Admin Request Approved",
          `<p>Hello ${admin.full_name},</p>
           <p>Your admin request has been <b>APPROVED</b>.</p>
           <p>Click the link below to set your password (valid 24h):</p>
           <a href="${link}" style="color:blue;">Set Password</a>`
        );
      } catch (emailErr) {
        console.error("Failed to send approval email:", emailErr.message);
      }
    } else if (status === "rejected") {
      try {
        sendEmail(
          admin.email,
          "Admin Request Rejected",
          `<p>Hello ${admin.full_name},</p>
           <p>We regret to inform you that your admin request was <b>REJECTED</b>.</p>`
        );
      } catch (emailErr) {
        console.error("Failed to send rejection email:", emailErr.message);
      }
    }

    res.json(admin);
  } catch (err) {
    console.error("Error updating status:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Get total number of admins
router.get("/count", async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) AS total FROM admins");
    res.json({ total: parseInt(result.rows[0].total, 10) });
  } catch (err) {
    console.error("Error fetching admin count:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
