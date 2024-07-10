import { Router } from "express";
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} from "../controllers/tweets.controllers.js";
import {verifyJWT} from "../middleware/auth.middleware.js";

const router =Router();
router.use(verifyJWT);

router.route("/").post(createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/tweet/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router;