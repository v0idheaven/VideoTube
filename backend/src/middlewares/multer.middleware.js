import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDirectory = path.resolve(__dirname, "../../public/temp");

fs.mkdirSync(tempDirectory, { recursive: true });

const isImageMimeType = (mimeType = "") => mimeType.startsWith("image/");
const isVideoMimeType = (mimeType = "") => mimeType.startsWith("video/");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDirectory);
    },
    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname);
        const baseName = path
            .basename(file.originalname, extension)
            .replace(/[^a-zA-Z0-9-_]/g, "-");

        cb(
            null,
            `${Date.now()}-${Math.round(Math.random() * 1e9)}-${baseName}${extension}`
        );
    }
});

const fileFilter = (_, file, cb) => {
    const imageFields = new Set(["avatar", "coverImage", "thumbnail"]);
    const videoFields = new Set(["videoFile"]);

    if (imageFields.has(file.fieldname) && isImageMimeType(file.mimetype)) {
        return cb(null, true);
    }

    if (videoFields.has(file.fieldname) && isVideoMimeType(file.mimetype)) {
        return cb(null, true);
    }

    const error = new Error(`Unsupported file type for ${file.fieldname}`);
    error.statusCode = 400;
    cb(error);
};

// 100MB for videos, 10MB for images
const limits = {
    fileSize: 100 * 1024 * 1024,
    files: 2,
};

export const upload = multer({
    storage,
    fileFilter,
    limits,
});
