import { Router } from "express";
import {
    publishAVideo,
    getallVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from "../controllers/video.controllers.js"
import {verifyJWT} from "../middleware/auth.middleware.js"
import { upload } from "../middleware/multer.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/publish-Video").post(
    upload.fields([
        {
            name:"videofile",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ]),
    publishAVideo
);

router.route("/get-all-Videos").get(getallVideos);
router.route("/c/:videoId")
                .get(getVideoById)
                .patch(upload.single("thumbnail"),updateVideo)
                .delete(deleteVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);


export default router;