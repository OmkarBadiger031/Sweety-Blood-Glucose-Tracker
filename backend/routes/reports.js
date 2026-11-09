const express = require("express");
const pool = require("../config/db");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// Get today's date in Indian timezone
const getToday = () => {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata"
    }).format(new Date());
};

// Validate date format and actual calendar date
const isValidDate = (date) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
    }

    const parsedDate = new Date(`${date}T00:00:00Z`);

    return (
        !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === date
    );
};

// DAILY REPORT
router.get("/daily", authenticateToken, async (req, res) => {
    try {
        const date = req.query.date || getToday();

        if (!isValidDate(date)) {
            return res.status(400).json({
                message: "Please provide a valid date."
            });
        }

        if (date > getToday()) {
            return res.status(400).json({
                message: "Future dates are not allowed."
            });
        }

        const result = await pool.query(
            `SELECT
                MAX(value) AS highest,
                MIN(value) AS lowest,
                ROUND(AVG(value), 1) AS average,
                COUNT(*)::int AS count
             FROM readings
             WHERE user_id = $1
             AND reading_date = $2`,
            [req.user.id, date]
        );

        // Fetch individual readings for the selected date
        const readingsResult = await pool.query(
            `SELECT
                id,
                reading_date::text AS reading_date,
                time_slot,
                value
             FROM readings
             WHERE user_id = $1
             AND reading_date = $2
             ORDER BY
                CASE time_slot
                    WHEN 'Morning fasting' THEN 1
                    WHEN 'Morning (fasting)' THEN 1
                    WHEN 'After breakfast' THEN 2
                    WHEN 'After lunch' THEN 3
                    WHEN 'After dinner' THEN 4
                    ELSE 5
                END`,
            [req.user.id, date]
        );

        res.json({
            report: "Daily Report",
            date: date,
            statistics: result.rows[0],
            readings: readingsResult.rows
        });

    } catch (error) {
        console.error("Daily report error:", error.message);

        res.status(500).json({
            message: "Failed to generate daily report"
        });
    }
});

// MONTH-TO-DATE REPORT
router.get("/monthly", authenticateToken, async (req, res) => {
    try {
        const selectedDate = req.query.date || getToday();

        if (!isValidDate(selectedDate)) {
            return res.status(400).json({
                message: "Please provide a valid date."
            });
        }

        if (selectedDate > getToday()) {
            return res.status(400).json({
                message: "Future dates are not allowed."
            });
        }

        // First day of the selected month
        const startDate = selectedDate.slice(0, 8) + "01";

        const result = await pool.query(
            `SELECT
                MAX(value) AS highest,
                MIN(value) AS lowest,
                ROUND(AVG(value), 1) AS average,
                COUNT(*)::int AS count
             FROM readings
             WHERE user_id = $1
             AND reading_date >= $2
             AND reading_date <= $3`,
            [req.user.id, startDate, selectedDate]
        );

        res.json({
            report: "Month-to-Date Report",
            from: startDate,
            to: selectedDate,
            statistics: result.rows[0]
        });

    } catch (error) {
        console.error("Monthly report error:", error.message);

        res.status(500).json({
            message: "Failed to generate monthly report"
        });
    }
});

// PREVIOUS MONTH REPORT
router.get("/previous-month", authenticateToken, async (req, res) => {
    try {
        const today = getToday();

        // First day of current month
        const currentMonthStart = today.slice(0, 8) + "01";

        // Last day of previous month
        const previousMonthEnd = new Date(
            `${currentMonthStart}T00:00:00Z`
        );

        previousMonthEnd.setUTCDate(0);

        const endDate = previousMonthEnd
            .toISOString()
            .slice(0, 10);

        // First day of previous month
        const startDate =
            previousMonthEnd.getUTCFullYear() +
            "-" +
            String(previousMonthEnd.getUTCMonth() + 1).padStart(2, "0") +
            "-01";

        const result = await pool.query(
            `SELECT
                MAX(value) AS highest,
                MIN(value) AS lowest,
                ROUND(AVG(value), 1) AS average,
                COUNT(*)::int AS count
             FROM readings
             WHERE user_id = $1
             AND reading_date >= $2
             AND reading_date <= $3`,
            [req.user.id, startDate, endDate]
        );

        res.json({
            report: "Previous Month Report",
            from: startDate,
            to: endDate,
            statistics: result.rows[0]
        });

    } catch (error) {
        console.error("Previous month report error:", error.message);

        res.status(500).json({
            message: "Failed to generate previous month report"
        });
    }
});

module.exports = router;