import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const healthcheck = asyncHandler(async (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatus = ["disconnected", "connected", "connecting", "disconnecting"][dbState] || "unknown";

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                status: "ok",
                db: dbStatus,
                uptime: Math.floor(process.uptime()),
                timestamp: new Date().toISOString(),
                env: process.env.NODE_ENV || "development",
            },
            "Server is healthy"
        )
    );
});

export { healthcheck };
