import app from "./index.js";
import { config } from "dotenv"

config();


app.listen(process.env.PORT, () => {
    console.log("sever is listening on port: ", process.env.PORT);
})