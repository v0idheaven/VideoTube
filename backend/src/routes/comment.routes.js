import { Router } from "express";
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js";
import { optionalJWT, verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router
    .route("/:videoId")
    .get(optionalJWT, getVideoComments)
    .post(verifyJWT, upload.none(), addComment);

router
    .route("/c/:commentId")
    .delete(verifyJWT, deleteComment)
    .patch(verifyJWT, upload.none(), updateComment);

export default router;
