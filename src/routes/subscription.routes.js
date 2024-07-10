import { Router } from "express";
import {verifyJWT} from "../middleware/auth.middleware.js";
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from "../controllers/subscription.controllers.js";

const router=Router();

router.use(verifyJWT)

router.route("/subscription/:channelId")
        .post(toggleSubscription)
        .get(getUserChannelSubscribers);

router.route("/s/:subscriberId").get(getSubscribedChannels)

export default router;
