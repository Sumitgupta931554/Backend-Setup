import mongoose,{Schema} from "mongoose";
import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";
import { Comment } from "../models/comments.models.js";
import { Tweet } from "../models/tweets.models.js";

const likesSchema =new mongoose.Schema(
    {
        tweets:{
            type:Schema.Types.ObjectId,
            ref:Tweet
        },
        video:{
            type:Schema.Types.ObjectId,
            ref:Video
        },
        comment:{
            type:Schema.Types.ObjectId,
            ref: Comment
        },
        likedby:{
            type:Schema.Types.ObjectId,
            ref:User
        }
    },
    {timestamps:true}
)
export const Likes = mongoose.model("Likes",likesSchema)