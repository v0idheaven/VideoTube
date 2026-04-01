import dotenv from "dotenv";
dotenv.config();

// Validate required environment variables before anything else
const REQUIRED_ENV_VARS = [
    "MONGODB_URI",
    "ACCESS_TOKEN_SECRET",
    "REFRESH_TOKEN_SECRET",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
];

const missingVars = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

if (missingVars.length) {
    console.error(`[startup] Missing required environment variables: ${missingVars.join(", ")}`);
    process.exit(1);
}

import connectDB from "./db/index.js";
import { app } from "./app.js";

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.error("[app] Express error:", error);
            throw error;
        });

        const port = process.env.PORT || 8000;

        app.listen(port, () => {
            console.log(`[server] Running on port ${port} (${process.env.NODE_ENV || "development"})`);
        });
    })
    .catch((error) => {
        console.error("[db] MongoDB connection failed:", error);
        process.exit(1);
    });
