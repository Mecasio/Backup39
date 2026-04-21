const express = require("express");
const { db3 } = require("../database/database");
const {
  CanCreate,
  CanDelete,
  CanEdit,
} = require("../../middleware/pagePermissions");
const router = express.Router();

// -------------------- CREATE DEPARTMENT --------------------
router.post("/department", CanCreate, async (req, res) => {
  const { dep_name, dep_code } = req.body;

  if (!dep_name || !dep_code) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const normalized_code = dep_code.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

    const [rows] = await db3.query(
      "SELECT dprtmnt_id FROM dprtmnt_table WHERE dprtmnt_code = ?",
      [normalized_code],
    );

    if (rows.length > 0) {
      return res.status(400).json({
        message: "Department already exists",
      });
    }

    const [result] = await db3.query(
      "INSERT INTO dprtmnt_table (dprtmnt_name, dprtmnt_code) VALUES (?, ?)",
      [dep_name, normalized_code],
    );

    res.status(200).json({
      message: "Department created successfully",
      insertId: result.insertId,
    });
  } catch (err) {
    console.error("Error creating department:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// -------------------- GET DEPARTMENTS --------------------
router.get("/get_department", async (req, res) => {
  try {
    const [result] = await db3.query("SELECT * FROM dprtmnt_table");
    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// -------------------- UPDATE DEPARTMENT --------------------
router.put("/department/:id", CanEdit, async (req, res) => {
  const { id } = req.params;
  const { dep_name, dep_code } = req.body;

  if (!dep_name || !dep_code) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const [result] = await db3.query(
      `UPDATE dprtmnt_table 
       SET dprtmnt_name = ?, dprtmnt_code = ?
       WHERE dprtmnt_id = ?`,
      [dep_name, dep_code, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.json({ message: "Department updated successfully" });
  } catch (err) {
    console.error("Error updating department:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// -------------------- DELETE DEPARTMENT --------------------
router.delete("/department/:id", CanDelete, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db3.query(
      "DELETE FROM dprtmnt_table WHERE dprtmnt_id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.json({ message: "Department deleted successfully" });
  } catch (err) {
    console.error("Error deleting department:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
