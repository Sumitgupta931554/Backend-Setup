import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { User } from "../models/user.models.js";
const VideoSchema = new mongoose.Schema(
    {
        videofile:{
            type:String,
            required:true
        },
        thumbnail:{
            type:String,
            required:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:User
        },
        title:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        },
        duration:{
            type:Number,
            required:true
        },
        views:{
            type:Number,
            default:0
        },
        isPublished:{
            type:Boolean,
            default:true
        }

    },
    {
        timestamps:true
    }
)
VideoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video",VideoSchema)