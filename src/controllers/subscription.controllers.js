import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.models.js"
import  {Subscription}  from "../models/subscription.models.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!channelId) {
        throw new ApiError(400,"Channel not found")
    }
    // TODO: toggle subscription
    const userId = req.user._id
    if(!userId||!isValidObjectId(userId)){
        throw new ApiError(400,"User is Required")
    }
    const subscribed = await Subscription.findOne(
        {$and : [
            {
                subscriber:new mongoose.Types.ObjectId(userId)
            },
            {
                channel:new mongoose.Types.ObjectId(channelId)
            }

        ]}
    )
    if (subscribed) {
        const unsubscribed = await Subscription.findbyIdAndDelete(subscribed._id)
        if (!unsubscribed) {
            throw new ApiError(500,"Failed to Unsubscribe")
        }
        return res
        .status(200)
        .json(new ApiResponse(200,{},"Unsubscribed Successfully"))
    } else {
        const subscribe=await Subscription.create({
            subscriber:userId,
            channel:channelId
        })
        if (!subscribe) {
            throw new ApiError(500,"Failed to Subscribe")
        }
        return res
        .status(200)
        .json(new ApiResponse(200,subscribe,"Subscribed Successfully"))
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!channelId) {
        throw new ApiError(400,"Invalid Channel")
    }
    const subscribers = await Subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"subscribers",
                foreignField:"_id",
                as :"SubscriberList",
                pipeline:[
                    {
                        $project:{
                            avatar:1,
                            username:1,
                            fullname:1
                        }
                    }
                ]
            }
        }
    ])
    if (!subscribers) {
        throw new ApiError(400,"Channel has no Subscriber")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,subscribers,"Subcribers fetched Successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!subscriberId) {
        throw new ApiError(400,"Invalid User")
    }
    const channelList = await Subscription.aggregate([
        {
            $match:{
                subscriber:new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as :"ChannelList",
                pipeline:[
                    {
                        $project:{
                            avatar:1,
                            username:1,
                            fullname:1
                        }
                    }
                ]
            }
        }
    ])
    if (!channelList) {
        throw new ApiError(400,"Subscriber doesn't subcribed Any channel")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,channelList,"Subsribed Channel fetched Successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}