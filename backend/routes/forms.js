const express = require("express");
const router = express.Router();
const pool = require("../db");

/**
 * CREATE a new form
 */
router.post("/", async (req, res) => {
  try {
    const { field, title, form_url, link_text } = req.body;

    if (!field || !title || !form_url) {
      return res
        .status(400)
        .json({ error: "Field, title, and form URL are required" });
    }

    const result = await pool.query(
      `
      INSERT INTO forms (field, title, form_url, link_text, status)
      VALUES ($1, $2, $3, $4, 'active')
      RETURNING *
      `,
      [field, title, form_url, link_text || "Open Form"]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating form:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * READ all forms
 */
// backend/routes/forms.js
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM forms
      ORDER BY id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching forms:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * READ all deleted forms
 */
router.get("/deleted", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT * FROM forms
      WHERE status = 'deleted'
      ORDER BY updated_at DESC NULLS LAST
      `
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching deleted forms:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * UPDATE a form (edit details)
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { field, title, form_url, link_text, status } = req.body;

    const result = await pool.query(
      `
      UPDATE forms
      SET field = COALESCE($1, field),
          title = COALESCE($2, title),
          form_url = COALESCE($3, form_url),
          link_text = COALESCE($4, link_text),
          status = COALESCE($5, status),
          updated_at = NOW()
      WHERE id = $6
      RETURNING *
      `,
      [field, title, form_url, link_text, status, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Form not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating form:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * SOFT DELETE (set status to 'deleted')
 */
router.put("/:id/delete", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `
      UPDATE forms
      SET status = 'deleted',
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Form not found" });

    res.json({ message: "Form soft deleted", form: result.rows[0] });
  } catch (err) {
    console.error("Error soft deleting form:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PERMANENT DELETE (remove from DB)
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `
      DELETE FROM forms
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Form not found" });

    res.json({ message: "Form permanently deleted" });
  } catch (err) {
    console.error("Error permanently deleting form:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * RESTORE (set status back to 'active')
 */
router.put("/:id/restore", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE forms
      SET status = 'active',
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Form not found" });

    res.json({ message: "Form restored", form: result.rows[0] });
  } catch (err) {
    console.error("Error restoring form:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
