const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticate = require("../middleware/authenticate");

// Create a test and its infos together (transactional)
router.post("/", authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, category_id, status, infos } = req.body;
    const updated_by = req.user.full_name; // from JWT

    if (!name || !category_id) {
      return res
        .status(400)
        .json({ error: "Both 'name' and 'category_id' are required" });
    }

    await client.query("BEGIN");

    const testResult = await client.query(
      `
      INSERT INTO tests (name, category_id, updated_by, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())

      RETURNING id
      `,
      [name, category_id, updated_by, status || "active"]
    );

    const testId = testResult.rows[0].id;

    if (Array.isArray(infos) && infos.length > 0) {
      const insertInfoQuery = `
        INSERT INTO test_infos 
          (test_id, type, title, description, image_url, extra_data, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'active')
      `;
      for (const info of infos) {
        await client.query(insertInfoQuery, [
          testId,
          info.type || "Basic",
          info.title || "",
          info.description || "",
          info.image_url || null,
          info.extra_data || null,
        ]);
      }
    }

    await client.query("COMMIT");
    res
      .status(201)
      .json({ message: "Test and infos created successfully", testId });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating test with infos:", err);
    res.status(500).json({ error: "Failed to create test" });
  } finally {
    client.release();
  }
});

// Get all tests (basic info only), optional category filter
router.get("/", async (req, res) => {
  try {
    const { category_id } = req.query;

    let query = `
      SELECT 
        t.id,
        t.name,
        t.category_id AS "categoryId",
        c.name AS "categoryName",
        t.updated_by AS "updatedBy",
        TO_CHAR(t.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS "updatedAt",
        TO_CHAR(t.created_at, 'YYYY-MM-DD HH24:MI:SS') AS "createdAt",
        t.status
      FROM tests t
      JOIN categories c ON t.category_id = c.id
      WHERE 1=1
    `;

    const values = [];

    if (category_id) {
      values.push(category_id);
      query += ` AND t.category_id = $1`;
    }

    query += `
      ORDER BY
        CASE 
          WHEN c.name = 'Introduction' THEN t.created_at
          ELSE NULL
        END ASC,
        t.name ASC
    `;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching tests:", err);
    res.status(500).json({ error: "Failed to fetch tests" });
  }
});

// Get single test (optionally with infos)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { includeinfos } = req.query;

    const testResult = await pool.query(
      `
      SELECT 
        t.id,
        t.name,
        t.category_id AS "categoryId",
        c.name AS "categoryName",
        t.updated_by AS "updatedBy",
        TO_CHAR(t.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS "updatedAt",
        t.status
      FROM tests t
      JOIN categories c ON t.category_id = c.id
      WHERE t.id = $1 AND t.status != 'deleted'
      `,
      [id]
    );
    if (testResult.rowCount === 0) {
      return res.status(404).json({ error: "Test not found" });
    }

    const test = testResult.rows[0];

    // Include infos if requested
    if (includeinfos === "true") {
      const infosResult = await pool.query(
        `
        SELECT 
          id,
          test_id AS "testId",
          type,
          title,
          description,
          image_url AS "imageUrl",
          extra_data AS "extraData"
        FROM test_infos
        WHERE test_id = $1 AND status != 'deleted'
        ORDER BY id ASC
        `,
        [id]
      );
      test.infos = infosResult.rows;
      test.infoTypes = [...new Set(infosResult.rows.map((info) => info.type))];
    }

    res.json(test);
  } catch (err) {
    console.error("Error fetching test:", err);
    res.status(500).json({ error: "Failed to fetch test" });
  }
});

// Soft delete test + its infos
router.delete("/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    await client.query("BEGIN");

    await client.query(
      `UPDATE tests SET status = 'deleted', updated_at = NOW() WHERE id = $1`,
      [id]
    );
    await client.query(
      `UPDATE test_infos SET status = 'deleted' WHERE test_id = $1`,
      [id]
    );

    await client.query("COMMIT");
    res.json({ message: "Test and infos deleted successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error deleting test:", err);
    res.status(500).json({ error: "Failed to delete test" });
  } finally {
    client.release();
  }
});

// Permanently delete a test and its infos
router.delete("/:id/permanent", authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query("BEGIN");

    // Delete test_infos first (foreign key constraint)
    await client.query(`DELETE FROM test_infos WHERE test_id = $1`, [id]);

    // Delete the test
    const result = await client.query(`DELETE FROM tests WHERE id = $1`, [id]);

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Test not found" });
    }

    await client.query("COMMIT");
    res.json({ message: "Test and infos permanently deleted" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error permanently deleting test:", err);
    res.status(500).json({ error: "Failed to permanently delete test" });
  } finally {
    client.release();
  }
});

// Update test and its infos (replace existing infos)
router.put("/:id", authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { name, category_id, status, infos } = req.body;
    const updated_by = req.user.full_name; // from JWT

    await client.query("BEGIN");

    // 1. Update the test itself
    const testResult = await client.query(
      `
      UPDATE tests
      SET
        name = COALESCE($1, name),
        category_id = COALESCE($2, category_id),
        updated_by = $3,
        status = COALESCE($4, status),
        updated_at = NOW()
      WHERE id = $5
      RETURNING *
      `,
      [name, category_id, updated_by, status, id]
    );

    if (testResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Test not found" });
    }

    // 2. Handle infos update if provided
    if (Array.isArray(infos)) {
      // Delete all existing test_infos for this test
      await client.query(`DELETE FROM test_infos WHERE test_id = $1`, [id]);

      // Insert the new infos
      if (infos.length > 0) {
        const insertInfoQuery = `
          INSERT INTO test_infos 
            (test_id, type, title, description, image_url, extra_data, status)
          VALUES ($1, $2, $3, $4, $5, $6, 'active')
        `;

        for (const info of infos) {
          await client.query(insertInfoQuery, [
            id,
            info.type || "Basic",
            info.title || "",
            info.description || "",
            info.image_url || null,
            info.extra_data || null,
          ]);
        }
      }
    }

    await client.query("COMMIT");
    res.json({
      message: "Test and infos updated successfully",
      test: testResult.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error updating test:", err);
    res.status(500).json({ error: "Failed to update test" });
  } finally {
    client.release();
  }
});

// Recover a soft-deleted test
router.put("/:id/recover", authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const updated_by = req.user.full_name; // from JWT

    await client.query("BEGIN");

    // Recover the test
    const testResult = await client.query(
      `
      UPDATE tests
      SET status = 'active',
          updated_by = $1,
          updated_at = NOW()
      WHERE id = $2 AND status = 'deleted'
      RETURNING *
      `,
      [updated_by, id]
    );

    if (testResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Test not found or not deleted" });
    }

    // Recover all its test_infos too
    await client.query(
      `
      UPDATE test_infos
      SET status = 'active'
      WHERE test_id = $1 AND status = 'deleted'
      `,
      [id]
    );

    await client.query("COMMIT");
    res.json({ message: "Test and infos recovered successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error recovering test:", err);
    res.status(500).json({ error: "Failed to recover test" });
  } finally {
    client.release();
  }
});

// Get total tests count + last updated date
router.get("/stats/summary", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) AS total_tests,
        TO_CHAR(MAX(updated_at), 'YYYY-MM-DD HH24:MI:SS') AS last_updated
      FROM tests
      WHERE status != 'deleted'
    `);

    const stats = {
      totalTests: parseInt(result.rows[0].total_tests, 10) || 0,
      lastUpdated: result.rows[0].last_updated || null,
    };

    res.json(stats);
  } catch (err) {
    console.error("Error fetching test stats:", err);
    res.status(500).json({ error: "Failed to fetch test stats" });
  }
});

module.exports = router;
