import mongoose, {isValidObjectId} from "mongoose"
import {Likes} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if (!videoId||!isValidObjectId(videoId)) {
        throw new ApiError(400,"Invalid video")
    }
    //TODO: toggle like on video
    const {userId}= req.user._id
    if (!userId||!isValidObjectId(userId)) {
        throw new ApiError(400,"Invalid User")
    }
    const isliked = await Likes.findOne(
        {likedby:new mongoose.Types.ObjectId(userId)},
        {video:new mongoose.Types.ObjectId(videoId)}
    )
    if (!isliked) {
        const like = await Likes.create(
            {
                likedby:userId,
                video:videoId
            }
        )
        if (!like) {
            throw new ApiError(500,"Failed to Like the Video")
        }
        return res
        .status(200)
        .json(new ApiResponse(200,like,"liked Successfully"))
    }
    else{
        const like = await Likes.findbyIdAndDelete(isliked._id)
        if (!like) {
            throw new ApiError(500,"Failed to Dislike")
        }
        return res
        .status(200)
        .json(new ApiResponse(200,like,"Dislike Successfully"))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if (!commentId||!isValidObjectId(commentId)) {
        throw new ApiError(400,"Invalid video")
    }
    //TODO: toggle like on video
    const {userId}= req.user._id
    if (!userId||!isValidObjectId(userId)) {
        throw new ApiError(400,"Invalid User")
    }
    const isliked = await Likes.findOne(
        {likedby:new mongoose.Types.ObjectId(userId)},
        {comment:new mongoose.Types.ObjectId(commentId)}
    )
    if (!isliked) {
        const like = await Likes.create(
            {
                likedby:userId,
                comment:commentId
            }
        )
        if (!like) {
            throw new ApiError(500,"Failed to Like the Video")
        }
        return res
        .status(200)
        .json(new ApiResponse(200,like,"liked Successfully"))
    }
    else{
        const like = await Likes.findbyIdAndDelete(isliked._id)
        if (!like) {
            throw new ApiError(500,"Failed to Dislike")
        }
        return res
        .status(200)
        .json(new ApiResponse(200,like,"Dislike Successfully"))
    }


})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if (!tweetId||!isValidObjectId(tweetId)) {
        throw new ApiError(400,"Invalid video")
    }
    //TODO: toggle like on video
    const {userId}= req.user._id
    if (!userId||!isValidObjectId(userId)) {
        throw new ApiError(400,"Invalid User")
    }
    const isliked = await Likes.findOne(
        {likedby:new mongoose.Types.ObjectId(userId)},
        {tweetId:new mongoose.Types.ObjectId(tweetId)}
    )
    if (!isliked) {
        const like = await Likes.create(
            {
                likedby:userId,
                tweet:tweetId
            }
        )
        if (!like) {
            throw new ApiError(500,"Failed to Like the Video")
        }
        return res
        .status(200)
        .json(new ApiResponse(200,like,"liked Successfully"))
    }
    else{
        const like = await Likes.findbyIdAndDelete(isliked._id)
        if (!like) {
            throw new ApiError(500,"Failed to Dislike")
        }
        return res
        .status(200)
        .json(new ApiResponse(200,like,"Dislike Successfully"))
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const {userId} = req.user._id
    if (!userId||!isValidObjectId(userId)) {
        throw new ApiError(400,"Invalid User")
    }
    const likedVideo = await Likes.aggregate([
        {
            $match:{
                likedby:new mongoose.Types.ObjectId(userId),
                video:{$exist:true}
            }
        },
        {
            $lookup:{
                from :"Video",
                localfield:"video",
                foreignfield:"_id",
                as:"likedVideo",
                pipeline:[
                    {
                        $project:{
                            thumnail:1,
                            videofile:1,
                            title:1,
                            description:1,
                            owner:1
                        }
                    }
                ]
            }
        }
    ])
    if (!likedVideo) {
        throw new ApiError(400,"User Dooesn't liked any video")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,likedVideo,"Liked Video Fetched Successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}