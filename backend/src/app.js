import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import { fileURLToPath } from "url";

import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import healthCheckRouter from "./routes/healthCheck.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playlist.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";
import { apiLimiter, mongoSanitizeRequest } from "./middlewares/security.middleware.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDirectory = path.resolve(__dirname, "../public");
const defaultAllowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];

const allowedOrigins = [
    ...new Set(
        [
            ...(process.env.CORS_ORIGIN || "")
                .split(",")
                .map((origin) => origin.trim())
                .filter(Boolean),
            ...(process.env.NODE_ENV === "production" ? [] : defaultAllowedOrigins)
        ]
    )
];

if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}

// Security headers
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: false, // handled by frontend
    })
);

// Gzip compression
app.use(compression());

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || !allowedOrigins.length || allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }

            const corsError = new Error(`CORS blocked for origin: ${origin}`);
            corsError.statusCode = 403;
            callback(corsError);
        },
        credentials: true
    })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static(publicDirectory));
app.use(cookieParser());
app.use(mongoSanitizeRequest);
app.use("/api/v1", apiLimiter);

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/dashboard", dashboardRouter);

// 404 handler
app.use((_, res) => {
    res.status(404).json({
        statusCode: 404,
        data: null,
        message: "Route not found",
        success: false,
        errors: []
    });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || "Internal server error";

    if (process.env.NODE_ENV !== "production") {
        console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${statusCode}: ${message}`);
        if (statusCode >= 500) {
            console.error(err.stack);
        }
    } else if (statusCode >= 500) {
        console.error(`[${new Date().toISOString()}] 500 ${req.method} ${req.path}: ${message}`);
    }

    res.status(statusCode).json({
        statusCode,
        data: null,
        message: statusCode >= 500 ? "Internal server error" : message,
        success: false,
        errors: err.errors || []
    });
});

export { app };
