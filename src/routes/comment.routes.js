import { Router } from "express";
import {verifyJWT} from "../middleware/auth.middleware.js";
import {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
} from "../controllers/comments.controllers.js"

const router =Router();
router.use(verifyJWT);

router.route("/comment/:videoId").get(getVideoComments).post(addComment).patch(updateComment);
router.route("/c/:commentId").delete(deleteComment)

export default router