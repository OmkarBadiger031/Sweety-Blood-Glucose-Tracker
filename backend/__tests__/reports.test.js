jest.mock("../config/db", () => ({
    query: jest.fn()
}));

process.env.JWT_SECRET = "test_secret_key";

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../server");
const pool = require("../config/db");

const token = jwt.sign(
    { id: 1, email: "test@gmail.com" },
    process.env.JWT_SECRET
);

const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata"
}).format(new Date());

const firstDayOfMonth = today.slice(0, 8) + "01";

describe("Reports API Tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // DAILY REPORT
    test("Should generate daily report", async () => {

        pool.query.mockResolvedValue({
            rows: [{
                highest: 250,
                lowest: 100,
                average: 175.0,
                total_readings: "2"
            }]
        });

        const response = await request(app)
            .get("/api/reports/daily")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.report).toBe("Daily Report");
        expect(response.body.statistics.highest).toBe(250);
        expect(pool.query).toHaveBeenCalled();
    });

    test("Should generate daily report for selected date", async () => {

        const selectedDate = "2026-11-05";

        pool.query.mockResolvedValue({
            rows: [{
                highest: 200,
                lowest: 120,
                average: 160.0,
                total_readings: "2"
            }]
        });

        const response = await request(app)
            .get(`/api/reports/daily?date=${selectedDate}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.date).toBe(selectedDate);

        expect(pool.query.mock.calls[0][1]).toEqual([
            1,
            selectedDate
        ]);
    });

    // MONTH-TO-DATE REPORT
    test("Should generate month-to-date report", async () => {

        pool.query.mockResolvedValue({
            rows: [{
                highest: 300,
                lowest: 100,
                average: 175.5,
                total_readings: "4"
            }]
        });

        const response = await request(app)
            .get("/api/reports/monthly")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.report).toBe("Month-to-Date Report");
        expect(response.body.from).toBe(firstDayOfMonth);
        expect(response.body.to).toBe(today);
        expect(response.body.statistics.total_readings).toBe("4");
    });

    // PREVIOUS MONTH REPORT
    test("Should generate previous month report", async () => {

        pool.query.mockResolvedValue({
            rows: [{
                highest: 280,
                lowest: 90,
                average: 160.5,
                total_readings: "5"
            }]
        });

        const response = await request(app)
            .get("/api/reports/previous-month")
            .set("Authorization", `Bearer ${token}`);

        const previousMonthEnd = new Date(
            firstDayOfMonth + "T00:00:00Z"
        );

        previousMonthEnd.setUTCDate(0);

        const expectedEndDate = previousMonthEnd
            .toISOString()
            .slice(0, 10);

        expect(response.status).toBe(200);
        expect(response.body.report).toBe("Previous Month Report");
        expect(response.body.to).toBe(expectedEndDate);
        expect(response.body.statistics.highest).toBe(280);
    });

    // EMPTY REPORT
    test("Should handle report with no readings", async () => {

        pool.query.mockResolvedValue({
            rows: [{
                highest: null,
                lowest: null,
                average: null,
                total_readings: "0"
            }]
        });

        const response = await request(app)
            .get("/api/reports/daily")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.statistics.highest).toBeNull();
        expect(response.body.statistics.total_readings).toBe("0");
    });

    // AUTHENTICATION
    test("Should reject request without token", async () => {

        const response = await request(app)
            .get("/api/reports/daily");

        expect(response.status).toBe(401);
        expect(response.body.message).toBe(
            "Access denied. Token required."
        );
    });

    // DATABASE ERROR
    test("Should return 500 if daily report database query fails", async () => {

        pool.query.mockRejectedValue(
            new Error("Database error")
        );

        const response = await request(app)
            .get("/api/reports/daily")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe(
            "Failed to generate daily report"
        );
    });

});