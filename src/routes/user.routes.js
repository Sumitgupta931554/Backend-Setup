import { Router } from "express";
import { LoginUser, registerUser,loggedOutUser } from "../controllers/user.controllers.js";
import { upload } from "../middleware/multer.middleware.js";
import { veriftJWT } from "../middleware/auth.middleware.js";

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
router.route("/logout").post(veriftJWT,loggedOutUser)
export default router;