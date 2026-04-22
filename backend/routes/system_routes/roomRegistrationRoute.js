const express = require('express');
const { db3 } = require('../database/database');
const {
  CanCreate,
  CanDelete,
  CanEdit,
} = require("../../middleware/pagePermissions");

const router = express.Router();

/* ===================== GET ROOM LIST ===================== */
router.get("/room_list", async (req, res) => {
  const { branch } = req.query;

  let query = `
    SELECT 
      room_id,
      room_description,
      building_description,
      floor,
      is_airconditioned,
      type,
      branch,
      created_at,
      updated_at,
      updated_by
    FROM room_table
  `;

  const params = [];

  if (branch) {
    query += " WHERE branch = ?";
    params.push(branch);
  }

  query += " ORDER BY room_description ASC";

  try {
    const [result] = await db3.query(query, params);
    res.status(200).json(result);
  } catch (err) {
    console.error("Query error:", err);
    res.status(500).json({
      error: "Query failed",
      details: err.message,
    });
  }
});


/* ===================== ADD ROOM ===================== */
router.post("/adding_room", CanCreate, async (req, res) => {
  const {
    room_description,
    building_description,
    floor,
    is_airconditioned,
    type,
    branch,
    updated_by
  } = req.body;

  try {

    if (!room_description || floor == null || type == null || branch == null) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // Prevent duplicate room (same name + building + branch)
    const [rows] = await db3.query(
      `SELECT room_id FROM room_table
       WHERE room_description = ?
       AND building_description = ?
       AND branch = ?`,
      [room_description, building_description, branch]
    );

    if (rows.length > 0) {
      return res.status(400).json({ message: "Room already exists" });
    }

    await db3.query(
      `INSERT INTO room_table
      (room_description, building_description, floor,
       is_airconditioned, type, branch, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        room_description,
        building_description || null,
        floor,
        is_airconditioned ?? 0,
        type,
        branch,
        updated_by || null
      ]
    );

    res.status(200).json({ message: "✅ Room added successfully" });

  } catch (error) {
    console.error("❌ Error adding room:", error);
    res.status(500).json({ message: "Failed to add room" });
  }
});


/* ===================== UPDATE ROOM ===================== */
router.put("/update_room/:id", CanEdit, async (req, res) => {
  const { id } = req.params;

  const {
    room_description,
    building_description,
    floor,
    is_airconditioned,
    type,
    branch,
    updated_by
  } = req.body;

  try {

    const [currentRows] = await db3.query(
      "SELECT * FROM room_table WHERE room_id = ?",
      [id]
    );

    if (currentRows.length === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    const current = currentRows[0];

    // Prevent duplicate (exclude current record)
    const [exists] = await db3.query(
      `SELECT room_id FROM room_table
       WHERE room_description = ?
       AND building_description = ?
       AND branch = ?
       AND room_id != ?`,
      [
        room_description ?? current.room_description,
        building_description ?? current.building_description,
        branch ?? current.branch,
        id
      ]
    );

    if (exists.length > 0) {
      return res.status(400).json({ message: "Room already exists" });
    }

    await db3.query(
      `UPDATE room_table SET
        room_description = ?,
        building_description = ?,
        floor = ?,
        is_airconditioned = ?,
        type = ?,
        branch = ?,
        updated_by = ?
       WHERE room_id = ?`,
      [
        room_description ?? current.room_description,
        building_description ?? current.building_description,
        floor ?? current.floor,
        is_airconditioned ?? current.is_airconditioned,
        type ?? current.type,
        branch ?? current.branch,
        updated_by ?? current.updated_by,
        id
      ]
    );

    res.json({ message: "✅ Room updated successfully" });

  } catch (error) {
    console.error("❌ Error updating room:", error);
    res.status(500).json({ message: "Failed to update room" });
  }
});


/* ===================== DELETE ROOM ===================== */
router.delete("/delete_room/:id", CanDelete, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db3.query(
      "DELETE FROM room_table WHERE room_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json({ message: "✅ Room deleted successfully" });

  } catch (error) {
    console.error("❌ Error deleting room:", error);
    res.status(500).json({ message: "Failed to delete room" });
  }
});

module.exports = router;
