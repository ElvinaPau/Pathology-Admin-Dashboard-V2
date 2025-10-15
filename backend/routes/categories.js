const express = require("express");
const router = express.Router();
const pool = require("../db");

// Helper: validate ID
const isValidId = (id) => !isNaN(parseInt(id));

// Get all categories
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY position ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching categories:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Reorder categories
router.put("/reorder", async (req, res) => {
  const { updates } = req.body;

  if (!Array.isArray(updates))
    return res.status(400).json({ error: "Invalid updates array" });

  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (const { id, position } of updates) {
        if (!isValidId(id) || typeof position !== "number") continue;
        await client.query(
          "UPDATE categories SET position = $1 WHERE id = $2",
          [position, id]
        );
      }

      await client.query("COMMIT");
      res.json({ message: "Categories reordered successfully" });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Error reordering categories:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Get single category by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id))
    return res.status(400).json({ error: "Invalid category ID" });

  try {
    const result = await pool.query("SELECT * FROM categories WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Category not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Add new category
router.post("/", async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim())
    return res.status(400).json({ error: "Category name is required" });

  try {
    // Check for duplicate
    const duplicateCheck = await pool.query(
      "SELECT * FROM categories WHERE LOWER(name) = LOWER($1)",
      [name.trim()]
    );
    if (duplicateCheck.rows.length > 0)
      return res.status(400).json({ error: "Category already exists" });

    const result = await pool.query(
      "INSERT INTO categories (name) VALUES ($1) RETURNING *",
      [name.trim()]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error adding category:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Update category
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!isValidId(id))
    return res.status(400).json({ error: "Invalid category ID" });
  if (!name || !name.trim())
    return res.status(400).json({ error: "Category name is required" });

  try {
    // Check for duplicate (excluding current ID)
    const duplicateCheck = await pool.query(
      "SELECT * FROM categories WHERE LOWER(name) = LOWER($1) AND id <> $2",
      [name.trim(), id]
    );
    if (duplicateCheck.rows.length > 0)
      return res.status(400).json({ error: "Category name already exists" });

    const result = await pool.query(
      "UPDATE categories SET name = $1 WHERE id = $2 RETURNING *",
      [name.trim(), id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Category not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating category:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete category
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id))
    return res.status(400).json({ error: "Invalid category ID" });

  try {
    // Return deleted category
    const result = await pool.query(
      "DELETE FROM categories WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Category not found" });

    res.json({ message: "Category deleted successfully", category: result.rows[0] });
  } catch (err) {
    console.error("Error deleting category:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;