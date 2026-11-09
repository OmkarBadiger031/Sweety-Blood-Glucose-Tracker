const bcrypt = require("bcrypt");
const pool = require("./config/db");

async function seedDatabase() {
    try {
        const demoName = "Demo User";
        const demoEmail = "demo@sweety.com";
        const demoPassword = "Sweety@123";

        // Check whether demo user already exists
        let userResult = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [demoEmail]
        );

        let userId;

        if (userResult.rows.length === 0) {
            const hashedPassword = await bcrypt.hash(demoPassword, 10);

            userResult = await pool.query(
                `INSERT INTO users (name, email, password_hash)
                 VALUES ($1, $2, $3)
                 RETURNING id`,
                [demoName, demoEmail, hashedPassword]
            );

            userId = userResult.rows[0].id;

            console.log("Demo user created successfully!");
        } else {
            userId = userResult.rows[0].id;
            console.log("Demo user already exists!");
        }

        // Get today's date in Indian timezone
        const today = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Kolkata"
        }).format(new Date());

        // Sample readings
        const sampleReadings = [
            [today, "Morning fasting", 95],
            [today, "After breakfast", 140],
            [today, "After lunch", 160],
            [today, "After dinner", 125]
        ];

        for (const reading of sampleReadings) {
            await pool.query(
                `INSERT INTO readings
                 (user_id, reading_date, time_slot, value)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (user_id, reading_date, time_slot)
                 DO NOTHING`,
                [userId, ...reading]
            );
        }

        console.log("Sample readings inserted successfully!");
        console.log("Demo Email:", demoEmail);
        console.log("Demo Password:", demoPassword);

    } catch (error) {
        console.error("Seed error:", error.message);
    } finally {
        await pool.end();
    }
}

seedDatabase();