import { Router } from "express";
import { LoginUser, 
    registerUser,
    loggedOutUser,
    refreshAccessToken ,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    getUserProfile,
    getUserHistory} from "../controllers/user.controllers.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router= Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)
router.route("/login").post(LoginUser)
router.route("/logout").post(verifyJWT,loggedOutUser)
router.route("/refreshAccessToken").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changePassword)
router.route("/get-Current-User").get(verifyJWT,getCurrentUser)
router.route("/update-Account-Details").patch(verifyJWT,updateAccountDetails)
router.route("/update-avatar").patch(verifyJWT,upload.single("avatarImage"),updateAvatar)
router.route("/update-coverImage").patch(verifyJWT,upload.single("coverImage"),updateCoverImage)
router.route("/c/:username").get(verifyJWT,getUserProfile)
router.route("/watch-history").get(verifyJWT,getUserHistory)
export default router;