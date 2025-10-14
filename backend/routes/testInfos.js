const express = require("express");
const router = express.Router();
const pool = require("../db");

// Create a test info for a specific test
router.post("/", async (req, res) => {
  const client = await pool.connect();
  try {
    const { test_id, type, title, description, image_url, extra_data } = req.body;

    if (!test_id || !type) {
      return res.status(400).json({ error: "test_id and type are required" });
    }

    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO test_infos (test_id, type, title, description, image_url, extra_data, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'active')
       RETURNING id`,
      [test_id, type, title || "", description || "", image_url || null, extra_data || null]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Test info created successfully",
      infoId: result.rows[0].id,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating test info:", err);
    res.status(500).json({ error: "Failed to create test info" });
  } finally {
    client.release();
  }
});

// Get all test infos (optionally filter by test_id)
router.get("/", async (req, res) => {
  try {
    const { test_id } = req.query;
    let query = `
      SELECT id, test_id AS "testId", type, title, description, image_url AS "imageUrl",
             extra_data AS "extraData", status
      FROM test_infos
      WHERE status != 'deleted'`;
    const values = [];

    if (test_id) {
      query += " AND test_id = $1";
      values.push(test_id);
    }

    query += " ORDER BY id ASC";

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching test infos:", err);
    res.status(500).json({ error: "Failed to fetch test infos" });
  }
});

// Get a single test info
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, test_id AS "testId", type, title, description, image_url AS "imageUrl",
              extra_data AS "extraData", status
       FROM test_infos
       WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Test info not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching test info:", err);
    res.status(500).json({ error: "Failed to fetch test info" });
  }
});

// Update a test info
router.put("/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { type, title, description, image_url, extra_data, status } = req.body;

    await client.query("BEGIN");

    const result = await client.query(
      `UPDATE test_infos
       SET type = COALESCE($1, type),
           title = COALESCE($2, title),
           description = COALESCE($3, description),
           image_url = COALESCE($4, image_url),
           extra_data = COALESCE($5, extra_data),
           status = COALESCE($6, status),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [type, title, description, image_url, extra_data, status, id]
    );

    await client.query("COMMIT");

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Test info not found" });
    }

    res.json({ message: "Test info updated successfully", info: result.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error updating test info:", err);
    res.status(500).json({ error: "Failed to update test info" });
  } finally {
    client.release();
  }
});

// Soft delete a test info
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE test_infos SET status = 'deleted', updated_at = NOW() WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Test info not found" });
    }

    res.json({ message: "Test info deleted successfully" });
  } catch (err) {
    console.error("Error deleting test info:", err);
    res.status(500).json({ error: "Failed to delete test info" });
  }
});

module.exports = router;
