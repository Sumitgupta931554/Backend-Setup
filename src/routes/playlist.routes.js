import { Router } from "express";
import {verifyJWT} from "../middleware/auth.middleware.js";
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controllers.js";

const router =Router();
router.use(verifyJWT);

router.route("/").post(createPlaylist);
router.route("/user-playlist/:userId").get(getUserPlaylists);
router.route("/p/:playlistId")
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist);

router.route("/add/:playlistId/:videoId").patch(addVideoToPlaylist);
router.route("/remove/:playlistId/:videoId").patch(removeVideoFromPlaylist)

export default router;