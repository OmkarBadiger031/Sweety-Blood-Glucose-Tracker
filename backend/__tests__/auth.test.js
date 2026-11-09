jest.mock("../config/db", () => ({
    query: jest.fn()
}));

process.env.JWT_SECRET = "test_secret_key";

const request = require("supertest");
const bcrypt = require("bcrypt");
const pool = require("../config/db");
const app = require("../server");

describe("Sweety Authentication API Tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // TEST 1: Successful registration
    test("Should register a new user successfully", async () => {

        pool.query
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({
                rows: [{
                    id: 10,
                    name: "Test User",
                    email: "test@example.com"
                }]
            });

        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: "test@example.com",
                password: "test123"
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("Registration successful");
        expect(response.body.user.email).toBe("test@example.com");

        // Password must not be returned
        expect(response.body.user.password_hash).toBeUndefined();

        // Verify password was hashed
        const hashedPassword = pool.query.mock.calls[1][1][2];

        expect(
            await bcrypt.compare("test123", hashedPassword)
        ).toBe(true);
    });


    // TEST 2: Duplicate email
    test("Should reject an already registered email", async () => {

        pool.query.mockResolvedValueOnce({
            rows: [{ id: 1 }]
        });

        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: "test@example.com",
                password: "test123"
            });

        expect(response.statusCode).toBe(409);
        expect(response.body.message).toBe("Email already registered");
    });


    // TEST 3: Successful login
    test("Should login with correct email and password", async () => {

        const hashedPassword = await bcrypt.hash("test123", 10);

        pool.query.mockResolvedValueOnce({
            rows: [{
                id: 10,
                name: "Test User",
                email: "test@example.com",
                password_hash: hashedPassword
            }]
        });

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "test@example.com",
                password: "test123"
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Login successful");
        expect(response.body.token).toBeDefined();
        expect(response.body.user.email).toBe("test@example.com");

        // Password hash must not be exposed
        expect(response.body.user.password_hash).toBeUndefined();
    });


    // TEST 4: Incorrect password
    test("Should reject an incorrect password", async () => {

        const hashedPassword = await bcrypt.hash("test123", 10);

        pool.query.mockResolvedValueOnce({
            rows: [{
                id: 10,
                name: "Test User",
                email: "test@example.com",
                password_hash: hashedPassword
            }]
        });

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "test@example.com",
                password: "wrong123"
            });

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe("Invalid email or password");
    });


    // TEST 5: Missing registration fields
    test("Should reject registration with missing fields", async () => {

        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                email: "test@example.com"
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("All fields are required");
    });

});