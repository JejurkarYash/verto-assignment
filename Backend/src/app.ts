import express, { Application, Request, Response } from "express";
import cors from "cors";


const app: Application = express();

// middlewaares 
app.use(express.json());
app.use(cors());


// health check 
app.get("/", (req: Request, res: Response) => {
    return res.json({
        message: "Http Server is now running..."
    })
})

export default app; 
