import { Request, Response } from "express";
import { EmployeeSchema, EmployeeUpdateSchema } from "./zod/index.js";
import { ZodError } from "zod";
import Prisma from "./prisma.js";
import app from "./app.js"

type parsedDataType = {
    id: number,
    name?: string,
    email?: string,
    position?: string

}


async function checkDuplicates(parsedData: parsedDataType, id: number) {
    const orConditions: any[] = []

    if (parsedData.email !== undefined && parsedData.email !== null && parsedData.email !== "") {
        orConditions.push({ email: parsedData.email });
    }
    if (parsedData.name !== undefined && parsedData.name !== null && parsedData.name !== "") {
        orConditions.push({ name: parsedData.name });
    }

    if (orConditions.length === 0) {
        return null;
    }

    const duplicateEmployee = await Prisma.employee.findFirst({
        where: {
            AND: [
                {
                    OR: orConditions
                },
                {
                    id: { not: id }
                }
            ]
        }

    })

    return duplicateEmployee;

}


// creating a employee
app.post("/api/employees", async (req: Request, res: Response) => {
    try {

        const { name, email, position } = req.body;

        const parsed = EmployeeSchema.safeParse({ name, email, position });

        // if input format is not valid 
        if (!parsed.success) {
            return res.status(400).json({
                message: "Invalid request",
                errors: parsed.error.flatten().fieldErrors,
            });
        }

        // checking if user is exist or not 
        const employee = await Prisma.employee.findFirst({
            where: {
                email: parsed.data.email
            }
        });

        if (employee) {
            return res.status(409).json({
                message: "Employee Already Exists !",

            })
        }


        const newEmployee = await Prisma.employee.create({
            data: {
                name: parsed.data.name,
                email: parsed.data.email,
                position: parsed.data.position
            }
        })

        if (newEmployee) {
            return res.status(201).json({
                message: "Employee Created Succesfylly !",
                id: newEmployee.id,
                newEmployee
            })
        }

    } catch (e: any) {

        if (e instanceof ZodError) {

            return res.status(400).json({
                message: "Invalid Input",
                error: e.message
            })

        } else {

            return res.status(500).json({
                message: "Internal Server Issue",
                error: e
            })
        }

    }
})

// updating the employee
app.put("/api/employees", async (req: Request, res: Response) => {
    try {
        console.log("request reach herer")
        const parsedData = EmployeeUpdateSchema.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json({
                message: "Invalid Data Format",
                error: parsedData.error.flatten().fieldErrors
            })
        };

        console.log("before existing employee")

        // check if the user exist or not  
        const existingEmployee = await Prisma.employee.findUnique({
            where: {
                id: parsedData.data.id
            }
        })


        if (!existingEmployee) {
            return res.status(404).json({
                message: "Employee Not Found"
            })
        }




        console.log("before duplicate employee")
        // check for the duplicate data 
        const duplicateEmployee = await checkDuplicates(parsedData.data, parsedData.data.id);


        if (duplicateEmployee) {
            return res.status(409).json({
                message: "Employee with this email or name already exists!"
            });
        }




        // update the employee details 
        const updatedEmployee = await Prisma.employee.update({
            where: {
                id: parsedData.data.id
            },
            data: {
                ...(parsedData.data.email && { email: parsedData.data.email }),
                ...(parsedData.data.name && { name: parsedData.data.name }),
                ...(parsedData.data.position && { position: parsedData.data.position }),
                updatedAt: new Date().toISOString()
            }
        })

        console.log("final call")
        return res.status(200).json({
            message: "Employee Details Updated Successfully ",
            data: updatedEmployee
        })



    } catch (e: any) {

        if (e instanceof ZodError) {
            return res.status(400).json({
                message: "Incalid Input Format",
                error: e.message
            })
        } else {
            return res.status(500).json({
                message: "Internal Server Error",
                error: e
            })
        }

    }

})


// Deleting the employee
app.delete("/api/employees/:id", async (req: Request, res: Response) => {
    try {

        const employeeId = req.params.id;

        // check if the user exist or not 
        const employeeExist = await Prisma.employee.findUnique({
            where: {
                id: Number(employeeId)
            }
        })

        if (!employeeExist) {
            return res.status(404).json({
                message: "Employee Does not Exist !"
            })
        }

        // deleting the actual user 
        const deleteEmployee = await Prisma.employee.delete({
            where: {
                id: Number(employeeId)
            }
        })


        return res.status(200).json({
            message: "Employee  Deleted Successfully "
        }
        )

    } catch (e: any) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: e
        })
    }
})


// getting all employees 
app.get("/api/employees", async (req: Request, res: Response) => {
    try {

        const allEmployees = await Prisma.employee.findMany({});
        if (!allEmployees) {
            return res.status(404).json({
                message: "Employee Not Found"
            })
        }

        return res.status(200).json({
            data: allEmployees
        })


    } catch (e: any) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: e
        }
        )
    }
})


export default app;



// app.listen(process.env.PORT, () => {
//     console.log("server is listening on port : ", process.env.PORT);
// })


