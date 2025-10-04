const express = require("express");
const router = express.Router();
const pool = require("../db");
const { sendEmail } = require("../utils/mailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// GET all admins
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`SELECT 
        id,
        full_name,
        department,
        email,
        notes,
        to_char(time, 'YYYY-MM-DD HH24:MI:SS') AS time,
        status
      FROM admins
      ORDER BY id ASC`);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/verify-token/:token", async (req, res) => {
  const { token } = req.params;
  const crypto = require("crypto");

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
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/set-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const crypto = require("crypto");

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
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

const crypto = require("crypto");

// POST /api/admins/forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // 1. Check if admin exists
    const result = await pool.query("SELECT * FROM admins WHERE email = $1", [
      email,
    ]);

    const admin = result.rows[0];

    // 2. Generate reset token
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

    // 3. Send email with reset link
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

// CHECK if email already exists
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
      return res.json({
        exists: true,
        status: result.rows[0].status, // "pending" | "approved" | etc.
      });
    }

    res.json({ exists: false });
  } catch (err) {
    console.error("Error checking email:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/admin/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user exists
    const result = await pool.query("SELECT * FROM admins WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const admin = result.rows[0];

    // 2. Check status
    if (admin.status == "pending") {
      return res.status(403).json({ error: "Account not approved yet" });
    }

    if (admin.status == "rejected") {
      return res.status(403).json({ error: "Account request is rejected" });
    }

    // 3. Compare password
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Wrong password" });
    }

    // 4. Generate token
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET || "supersecret",
      { expiresIn: "1h" }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        department: admin.department,
        status: admin.status,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// POST new admin (sign up form)
router.post("/", async (req, res) => {
  const { fullName, department, email, notes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO admins (full_name, department, email, notes, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [fullName, department, email, notes]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// UPDATE status
// PUT /api/admins/:id/status
router.put("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const crypto = require("crypto");

  try {
    // Update DB first
    const result = await pool.query(
      "UPDATE admins SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const admin = result.rows[0];

    // Send email depending on status
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
          <p>Your admin request has been <b>APPROVED</b>.
           <p>Click the link below to set your password (valid 24h):</p>
           <a href="${link}" style="color:blue;">Set Password</a>`
        );
      } catch (emailErr) {
        console.error("Failed to send email:", emailErr.message);
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
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
