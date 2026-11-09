// Use a mock database so tests don't modify Neon
jest.mock("../config/db", () => ({
    query: jest.fn()
}));

process.env.JWT_SECRET = "test_secret_key";

const request = require("supertest");
const app = require("../server");

describe("Sweety API Tests", () => {

    // Test 1: Home API
    test("Home API should return success message", async () => {
        const response = await request(app).get("/");

        expect(response.statusCode).toBe(200);
        expect(response.text).toBe(
            "Sweety Blood Glucose Tracker API is running!"
        );
    });

    // Test 2: Readings API authentication
    test("Readings API should reject requests without token", async () => {
        const response = await request(app).get("/api/readings");

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe(
            "Access denied. Token required."
        );
    });

    // Test 3: Reports API authentication
    test("Reports API should reject requests without token", async () => {
        const response = await request(app).get("/api/reports/daily");

        expect(response.statusCode).toBe(401);
    });

});