
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config()


connectDB()
.then(() => {
    app.on("error", (error) => {
        console.log("ERRR: ", error);
        throw error
    })
    const port = process.env.PORT || 8000;

    app.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
    })
})
.catch((error) => {
    console.error("MONGODB connection failed !!! ", error)
})
