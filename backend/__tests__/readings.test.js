// Mock database to protect the real Neon database
jest.mock("../config/db", () => ({
    query: jest.fn()
}));

process.env.JWT_SECRET = "test_secret_key";

const request = require("supertest");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const app = require("../server");

// Generate a valid test token
const token = jwt.sign(
    { id: 10, email: "test@example.com" },
    process.env.JWT_SECRET
);

// Get today's date in India
function getTodayDate() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date());
}

describe("Sweety Glucose Readings API Tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // TEST 1: Add reading successfully
    test("Should add a valid glucose reading", async () => {

        pool.query.mockResolvedValueOnce({
            rows: [{
                id: 1,
                user_id: 10,
                reading_date: getTodayDate(),
                time_slot: "Morning fasting",
                value: 120
            }]
        });

        const response = await request(app)
            .post("/api/readings")
            .set("Authorization", `Bearer ${token}`)
            .send({
                reading_date: getTodayDate(),
                time_slot: "Morning fasting",
                value: 120
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe(
            "Glucose reading added successfully"
        );
        expect(response.body.reading.value).toBe(120);
    });


    // TEST 2: Reject missing fields
    test("Should reject reading with missing fields", async () => {

        const response = await request(app)
            .post("/api/readings")
            .set("Authorization", `Bearer ${token}`)
            .send({
                reading_date: getTodayDate(),
                time_slot: "Morning fasting"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe(
            "Date, time slot and value are required"
        );
    });


    // TEST 3: Reject glucose value below 40
    test("Should reject glucose value below 40", async () => {

        const response = await request(app)
            .post("/api/readings")
            .set("Authorization", `Bearer ${token}`)
            .send({
                reading_date: getTodayDate(),
                time_slot: "Morning fasting",
                value: 39
            });

        expect(response.statusCode).toBe(400);
    });


    // TEST 4: Reject glucose value above 600
    test("Should reject glucose value above 600", async () => {

        const response = await request(app)
            .post("/api/readings")
            .set("Authorization", `Bearer ${token}`)
            .send({
                reading_date: getTodayDate(),
                time_slot: "Morning fasting",
                value: 601
            });

        expect(response.statusCode).toBe(400);
    });


    // TEST 5: Reject decimal glucose value
    test("Should reject decimal glucose value", async () => {

        const response = await request(app)
            .post("/api/readings")
            .set("Authorization", `Bearer ${token}`)
            .send({
                reading_date: getTodayDate(),
                time_slot: "Morning fasting",
                value: 120.5
            });

        expect(response.statusCode).toBe(400);
    });


    // TEST 6: Reject future date
    test("Should reject future reading date", async () => {

        const futureDate = new Date(
            Date.now() + 2 * 24 * 60 * 60 * 1000
        ).toISOString().slice(0, 10);

        const response = await request(app)
            .post("/api/readings")
            .set("Authorization", `Bearer ${token}`)
            .send({
                reading_date: futureDate,
                time_slot: "Morning fasting",
                value: 120
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe(
            "Future dates are not allowed"
        );
    });


    // TEST 7: Reject invalid time slot
    test("Should reject invalid time slot", async () => {

        const response = await request(app)
            .post("/api/readings")
            .set("Authorization", `Bearer ${token}`)
            .send({
                reading_date: getTodayDate(),
                time_slot: "Night",
                value: 120
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Invalid time slot");
    });


    // TEST 8: Reject duplicate reading
    test("Should reject duplicate reading for same date and slot", async () => {

        pool.query.mockRejectedValueOnce({
            code: "23505"
        });

        const response = await request(app)
            .post("/api/readings")
            .set("Authorization", `Bearer ${token}`)
            .send({
                reading_date: getTodayDate(),
                time_slot: "Morning fasting",
                value: 120
            });

        expect(response.statusCode).toBe(409);
    });


    // TEST 9: Get readings successfully
    test("Should fetch readings for logged-in user", async () => {

        pool.query.mockResolvedValueOnce({
            rows: [{
                id: 1,
                user_id: 10,
                reading_date: getTodayDate(),
                time_slot: "Morning fasting",
                value: 120
            }]
        });

        const response = await request(app)
            .get("/api/readings")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.readings).toHaveLength(1);

        // Check user-specific database query
        expect(pool.query.mock.calls[0][1]).toEqual([10]);
    });


    // TEST 10: Update reading successfully
    test("Should update an existing reading", async () => {

        pool.query.mockResolvedValueOnce({
            rows: [{
                id: 1,
                user_id: 10,
                value: 150
            }]
        });

        const response = await request(app)
            .put("/api/readings/1")
            .set("Authorization", `Bearer ${token}`)
            .send({
                value: 150
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.reading.value).toBe(150);
    });


    // TEST 11: Delete reading successfully
    test("Should delete an existing reading", async () => {

        pool.query.mockResolvedValueOnce({
            rows: [{ id: 1 }]
        });

        const response = await request(app)
            .delete("/api/readings/1")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe(
            "Glucose reading deleted successfully"
        );
    });


    // TEST 12: Reject unauthenticated reading request
    test("Should reject reading request without token", async () => {

        const response = await request(app)
            .post("/api/readings")
            .send({
                reading_date: getTodayDate(),
                time_slot: "Morning fasting",
                value: 120
            });

        expect(response.statusCode).toBe(401);
    });

});