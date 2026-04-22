const express = require('express');
const { db, db3 } = require('../database/database');
const {
  CanCreate,
  CanDelete,
  CanEdit,
} = require("../../middleware/pagePermissions");

const router = express.Router();

router.get("/api/year-levels", async (req, res) => {
  try {
    const [rows] = await db3.query(
      `SELECT year_level_id, year_level_description, level_type
   FROM year_level_table 
   WHERE level_type IN ('year', 'graduate')
   ORDER BY year_level_id`
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching year levels:", err);
    res.status(500).json({ message: "Failed to fetch year levels" });
  }
});

router.post("/years_level", CanCreate, async (req, res) => {
  const { year_level_description, level_type } = req.body;

  if (!year_level_description) {
    return res
      .status(400)
      .json({ error: "year_level_description is required" });
  }

  const query =
    "INSERT INTO year_level_table (year_level_description, level_type) VALUES (?, ?)";

  try {
    const [result] = await db3.query(query, [
      year_level_description,
      level_type || "year",
    ]);

    res.status(201).json({
      year_level_id: result.insertId,
      year_level_description,
      level_type,
    });
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ error: "Insert failed", details: err.message });
  }
});

router.put("/years_level/:id", CanEdit, async (req, res) => {
  const { id } = req.params;
  const { year_level_description, level_type } = req.body;

  if (!year_level_description) {
    return res.status(400).json({ error: "Description is required" });
  }

  try {
    await db3.query(
      `UPDATE year_level_table 
       SET year_level_description = ?, level_type = ? 
       WHERE year_level_id = ?`,
      [year_level_description, level_type, id]
    );

    res.json({ message: "Updated successfully" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Update failed" });
  }
});

router.delete("/years_level/:id", CanDelete, async (req, res) => {
  const { id } = req.params;

  try {
    await db3.query(
      "DELETE FROM year_level_table WHERE year_level_id = ?",
      [id]
    );

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;
