const express = require("express");
const pool = require("../config/db");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

const allowedSlots = [
    "Morning fasting",
    "After breakfast",
    "After lunch",
    "After dinner"
];

// ADD GLUCOSE READING
router.post("/", authenticateToken, async (req, res) => {
    try {
        const { reading_date, time_slot, value } = req.body;

        // Validate required fields
        if (!reading_date || !time_slot || value === undefined) {
            return res.status(400).json({
                message: "Date, time slot and value are required"
            });
        }

        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(reading_date)) {
            return res.status(400).json({
                message: "Date must be in YYYY-MM-DD format"
            });
        }

        // Validate actual calendar date
        const date = new Date(reading_date + "T00:00:00Z");

        if (
            Number.isNaN(date.getTime()) ||
            date.toISOString().slice(0, 10) !== reading_date
        ) {
            return res.status(400).json({
                message: "Invalid date"
            });
        }

        // Get today's date in India
        const today = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).format(new Date());

        // Prevent future dates
        if (reading_date > today) {
            return res.status(400).json({
                message: "Future dates are not allowed"
            });
        }

        // Validate time slot
        if (!allowedSlots.includes(time_slot)) {
            return res.status(400).json({
                message: "Invalid time slot"
            });
        }

        // Validate glucose value
        if (!Number.isInteger(value) || value < 40 || value > 600) {
            return res.status(400).json({
                message: "Glucose value must be an integer between 40 and 600"
            });
        }

        // Insert reading into database
        const result = await pool.query(
            `INSERT INTO readings
             (user_id, reading_date, time_slot, value)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [req.user.id, reading_date, time_slot, value]
        );

        res.status(201).json({
            message: "Glucose reading added successfully",
            reading: result.rows[0]
        });

    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                message: "A reading already exists for this time slot and date"
            });
        }

        console.error("Add reading error:", error.message);

        res.status(500).json({
            message: "Failed to add glucose reading"
        });
    }
});


// GET ALL READINGS FOR LOGGED-IN USER
router.get("/", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                id,
                user_id,
                reading_date::text AS reading_date,
                time_slot,
                value,
                created_at
             FROM readings
             WHERE user_id = $1
             ORDER BY reading_date DESC, created_at DESC`,
            [req.user.id]
        );

        res.status(200).json({
            readings: result.rows
        });

    } catch (error) {
        console.error("Get readings error:", error.message);

        res.status(500).json({
            message: "Failed to fetch readings"
        });
    }
});


// UPDATE GLUCOSE READING
router.put("/:id", authenticateToken, async (req, res) => {
    try {
        const { value } = req.body;
        const { id } = req.params;

        // Validate glucose value
        if (!Number.isInteger(value) || value < 40 || value > 600) {
            return res.status(400).json({
                message: "Glucose value must be an integer between 40 and 600"
            });
        }

        const result = await pool.query(
            `UPDATE readings
             SET value = $1
             WHERE id = $2 AND user_id = $3
             RETURNING *`,
            [value, id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Reading not found"
            });
        }

        res.status(200).json({
            message: "Glucose reading updated successfully",
            reading: result.rows[0]
        });

    } catch (error) {
        console.error("Update reading error:", error.message);

        res.status(500).json({
            message: "Failed to update glucose reading"
        });
    }
});


// DELETE GLUCOSE READING
router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM readings
             WHERE id = $1 AND user_id = $2
             RETURNING id`,
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Reading not found"
            });
        }

        res.status(200).json({
            message: "Glucose reading deleted successfully"
        });

    } catch (error) {
        console.error("Delete reading error:", error.message);

        res.status(500).json({
            message: "Failed to delete glucose reading"
        });
    }
});

module.exports = router;