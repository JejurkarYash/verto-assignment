import { z } from "zod";

export const EmployeeSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    position: z.string().min(1, "Position is required"),
});

export const EmployeeUpdateSchema = z.object({
    id: z.number(),
    name: z.string().min(1, "Name is required").optional(),
    email: z.string().min(1, "Email is required").email("Invalid email format").optional(),
    position: z.string().min(1, "Position is required").optional(),
})
