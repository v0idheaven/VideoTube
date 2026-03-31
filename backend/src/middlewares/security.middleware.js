import rateLimit from "express-rate-limit";

const rateLimitConfig = {
    standardHeaders: true,
    legacyHeaders: false,
};

const isProduction = process.env.NODE_ENV === "production";

const isLocalRequest = (req) => {
    const forwardedFor = req.headers["x-forwarded-for"];
    const remoteAddress = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : typeof forwardedFor === "string"
            ? forwardedFor.split(",")[0]?.trim()
            : req.ip || req.socket?.remoteAddress || "";

    return ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(remoteAddress);
};

const isPlainObject = (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
};

const sanitizeMongoPayload = (value) => {
    if (Array.isArray(value)) {
        for (const item of value) {
            sanitizeMongoPayload(item);
        }

        return value;
    }

    if (!isPlainObject(value)) {
        return value;
    }

    for (const key of Object.keys(value)) {
        if (key.startsWith("$") || key.includes(".")) {
            delete value[key];
            continue;
        }

        sanitizeMongoPayload(value[key]);
    }

    return value;
};

const mongoSanitizeRequest = (req, _, next) => {
    sanitizeMongoPayload(req.body);
    sanitizeMongoPayload(req.params);
    sanitizeMongoPayload(req.query);
    next();
};

const apiLimiter = rateLimit({
    ...rateLimitConfig,
    windowMs: 15 * 60 * 1000,
    max: isProduction ? 300 : 10_000,
    skip: (req) => !isProduction && isLocalRequest(req),
    message: {
        statusCode: 429,
        data: null,
        message: "Too many requests, please try again later.",
        success: false,
        errors: [],
    },
});

const authLimiter = rateLimit({
    ...rateLimitConfig,
    windowMs: 15 * 60 * 1000,
    max: isProduction ? 10 : 200,
    skip: (req) => !isProduction && isLocalRequest(req),
    message: {
        statusCode: 429,
        data: null,
        message: "Too many authentication attempts, please try again later.",
        success: false,
        errors: [],
    },
});

export { apiLimiter, authLimiter, mongoSanitizeRequest };
