import request from "supertest";
import { describe, it, expect, beforeEach, vi } from "vitest";
import app from "../src/index.js";

// Mock Prisma so we don’t hit real DB
vi.mock("../src/prisma.js", () => ({
    default: {
        employee: {
            findFirst: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            findMany: vi.fn()
        }
    }
}));

import Prisma from "../src/prisma.js";


describe("Employee API", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("GET / should return server running message", async () => {
        const res = await request(app).get("/");
        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Http Server is now running...");
    });

    it("POST /api/employees should create a new employee", async () => {
        (Prisma.employee.findFirst as any).mockResolvedValue(null);
        (Prisma.employee.create as any).mockResolvedValue({
            id: 1,
            name: "Alice",
            email: "alice@gmail.com",
            position: "Engineer"
        });

        const res = await request(app)
            .post("/api/employees")
            .send({ name: "Alice", email: "alice@gmail.com", position: "Engineer" });

        expect(res.status).toBe(201);
        expect(res.body.message).toBe("Employee Created Succesfylly !");
        expect(res.body.id).toBe(1);
    });

    it("GET /api/employees should return employees", async () => {
        (Prisma.employee.findMany as any).mockResolvedValue([
            { id: 1, name: "Alice", email: "alice@example.com", position: "Engineer" }
        ]);

        const res = await request(app).get("/api/employees");
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].name).toBe("Alice");
    });


    it("PUT /api/employees should return updated employees ", async () => {
        (Prisma.employee.findUnique as any).mockResolvedValue({
            id: 1,
            name: "Alice",
            email: "alice@gmail.com",
            position: "Engineer"
        });

        (Prisma.employee.findFirst as any).mockResolvedValue(null);

        (Prisma.employee.update as any).mockResolvedValue({
            id: 1,
            name: "Alice",
            email: "alice@gmail.com",
            position: "backend engineer"
        });

        const res = await request(app)
            .put("/api/employees")
            .send({ id: 1, name: "Alice", email: "alice@gmail.com", position: "backend engineer" })


        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Employee Details Updated Successfully ");
        expect(res.body.data).toEqual({
            id: 1,
            name: "Alice",
            email: "alice@gmail.com",
            position: "backend engineer"
        })


    })

    it("DELETE /api/employees should delete a employee record", async () => {
        (Prisma.employee.findUnique as any).mockResolvedValue({
            id: 1,
            name: "Alice",
            email: "alice@gmail.com",
            position: "backend engineer",
        });


        (Prisma.employee.delete as any).mockResolvedValue({
            id: 1,
            name: "Alice",
            email: "alice@gmailc.om",
            position: "backend engineer",
        })


        const res = await request(app).delete("/api/employees/1");
        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Employee  Deleted Successfully ");

    })


});
