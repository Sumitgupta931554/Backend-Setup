import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweets.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content}= req.body
    if(!content){
        throw new ApiError(400,"Tweet is Required")
    }
    const {userId}= req.user._id
    if (!isValidObjectId(userId)) {
        throw new ApiError(400,"Invalid User")
    }
    const tweet=await Tweet.create({
        content:content,
        owner:userId
    })
    if(!tweet){
        throw new ApiError(500,"Error While Creating tweets")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,tweet,"Tweet created Successfully"))

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId}=req.params
    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(400,"User Not Found")
    }
    const tweet= await Tweet.aggregate([
        {
            $match:{
                owner:user._id  
            }
        },
        {
            $lookup:{
                from:"User",
                localfield:"owner",
                foreignfield:"_id",
                as:"user",
                pipelines:[{
                    $project:{
                        avatar:1,
                        username:1,
                        fullname:1
                    }
                }]
            }
        },
        {
            $addfield:{
                owner:"$user"
            }
        }
    ])
    if(!tweet?.length){
        throw new ApiError(400,"There is no any tweets by User")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,tweet,"User Tweets Fetched Successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId}=req.params
    if (!tweetId||!isValidObjectId(tweetId)) {
        throw new ApiError(400,"Invalid Tweet")
    }
    const {content}=req.body
    if (!content) {
        throw new ApiError(400,"Content is Required")
    }
    const updatedTweet=await Tweet.findbyIdAndUpdate(tweetId,{
        $set:{
            content:content
        }
    },
    {
        new :true
    })
    if (!updateTweet) {
        throw new ApiError(500,"Error While Updating the tweet or Tweet doesn't Exist")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,updatedTweet,"Tweet Updated Successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId}=req.params
    if (!tweetId||!isValidObjectId(tweetId)) {
        throw new ApiError(400,"Invalid Tweet")
    }
    const deletedTweet= await Tweet.findOneAndDelete(tweetId)
    if (!deletedTweet) {
        throw new ApiError(400,"Failed to delete tweet or tweet doesn't exist")
    }
    return res
    .status(200)
    .json(new ApiResponse(201,deletedTweet,"Tweet deleted Successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}