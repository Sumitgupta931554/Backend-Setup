import mongoose,{Schema} from "mongoose";
import { User } from "./user.models";
import { Video } from "./video.models";
import { Comment } from "./comments.models";
import { Tweet } from "./tweets.models";

const likesSchema =new mongoose.Schema(
    {
        tweets:{
            type:Schema.Types.ObjectId,
            ref:Tweet
        },
        video:{
            type:Schema.Types.ObjectId,
            ref: Video
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