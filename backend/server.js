const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const pool = require("./config/db");
const authRoutes = require("./routes/auth");
const readingsRoutes = require("./routes/readings");
const reportsRoutes = require("./routes/reports");

// Middleware
app.use(express.json());

// CORS Configuration
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:5180",
            "http://localhost:5175",
            "http://localhost:5176",
            "http://localhost:5185"
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

// Home Route
app.get("/", (req, res) => {
    res.send("Sweety Blood Glucose Tracker API is running!");
});

// Database Test Route
app.get("/api/db-test", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'readings')"
        );

        res.json({
            message: "Neon database is working!",
            tables: result.rows
        });
    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            message: "Database test failed"
        });
    }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/readings", readingsRoutes);
app.use("/api/reports", reportsRoutes);

module.exports = app;