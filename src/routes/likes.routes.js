import { Router } from "express";
import {verifyJWT} from "../middleware/auth.middleware.js";
import {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
} from "../controllers/likes.controllers.js";

const router =Router();
router.use(verifyJWT);

router.route("/toogle/v/:videoId").post(toggleVideoLike);
router.route("/toogle/c/:commentId").post(toggleCommentLike);
router.route("/toogle/t/:tweetId").post(toggleTweetLike);
router.route("/liked-videos").get(getLikedVideos);

export default router;