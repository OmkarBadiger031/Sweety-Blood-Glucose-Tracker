describe("Sweety Backend Tests", () => {

    test("Jest is working correctly", () => {
        expect(2 + 2).toBe(4);
    });

    test("Minimum glucose value is 40", () => {
        expect(40).toBeGreaterThanOrEqual(40);
    });

    test("Maximum glucose value is 600", () => {
        expect(600).toBeLessThanOrEqual(600);
    });

    test("Glucose value 39 is below the allowed range", () => {
        expect(39).toBeLessThan(40);
    });

    test("Glucose value 601 is above the allowed range", () => {
        expect(601).toBeGreaterThan(600);
    });

});