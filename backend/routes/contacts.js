// routes/contacts.js
const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all contacts
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM contacts ORDER BY position ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching contacts:", err);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

// Add new contact
router.post("/", async (req, res) => {
  try {
    const { title, description, position } = req.body;
    const result = await pool.query(
      "INSERT INTO contacts (title, description, position) VALUES ($1, $2, $3) RETURNING *",
      [title, description, position || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding contact:", err);
    res.status(500).json({ error: "Failed to add contact" });
  }
});

// Update contact
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, position } = req.body;

    const result = await pool.query(
      "UPDATE contacts SET title = $1, description = $2, position = $3 WHERE id = $4 RETURNING *",
      [title, description, position || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating contact:", err);
    res.status(500).json({ error: "Failed to update contact" });
  }
});

// Delete contact
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM contacts WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.json({ message: "Contact deleted successfully" });
  } catch (err) {
    console.error("Error deleting contact:", err);
    res.status(500).json({ error: "Failed to delete contact" });
  }
});

module.exports = router;
