import mongoose, { Mongoose } from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const channelStats = await User.aggregate([
        {
          $lookup: {
            from: "videos",
            localField: "_id",
            foreignField: "owner",
            as: "allVideos",
            pipeline: [
              {
                $lookup: {
                  from: "likes",
                  localField: "_id",
                  foreignField: "video",
                  as: "likes",
                },
              },
              {
                $addFields: {
                  likesCount: { $size: "$likes" },
                },
              },
              // {
              //   $project: {
              //     likes: 0,
              //   },
              // },
            ],
          },
        },
        {
          $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers",
          },
        },
        {
          $addFields: {
            totalSubscribers: { $size: "$subscribers" },
            totalVideos: { $size: "$allVideos" },
            totalViews: { $sum: "$allVideos.views" },
            totalLikes: { $sum: "$allVideos.likesCount" },
          },
        },
        {
          $project: {
            totalVideos: 1,
            totalViews: 1,
            totalLikes: 1,
            totalSubscribers: 1,
            username: 1,
            fullName: 1,
            avatar: 1,
            coverImage: 1,
          },
        },
      ]);
    
      if (channelStats.length < 1) {
        throw new ApiError(400, "channel not found");
      }
    
      return res
        .status(200)
        .json(
          new ApiResponse(200, channelStats[0], "channel stats get successfully")
        );
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const channelVideo = await Video.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(req?.user._id)
            }
        },
        {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "video",
              as: "likes",
            },
        },
        {
            $addFields: {
              likesCount: { $size: "$likes" },
            },
          }
    ])
    if (!channelVideo?.length>0) {
        throw new ApiError(400,"Channel Doesn't Upload any vidoe or Failed to Fetched channel Video")
    }
    return res
    .status(200)
    .json(new ApiResponse(201,channelVideo,"Channle Video Fetched Successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
    }