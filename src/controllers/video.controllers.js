import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Video } from "../models/video.models.js";
import uploadOnCloudnary from "../utils/Cloudnary.js";
import mongoose,{isValidObjectId} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const getallVideos = asyncHandler(async (req,res)=>{
    const {page=1,limit=10,query, sortBy, sortType, userId }=req.query

    // page = isNaN(page) ? 1 : Number(page);
    // limit = isNaN(page) ? 10 : Number(limit);
  
    // //because 0 is not acceptable ein skip and limit in aggregate pipeline
    // if (page < 0) {
    //   page = 1;
    // }
    // if (limit <= 0) {
    //   limit = 10;
    // }
  
    const matchStage = {};
    
    if (userId && isValidObjectId(userId)) {
      matchStage["$match"] = {
        owner: new mongoose.Types.ObjectId(userId),
      };
    } else if (query) {
      matchStage["$match"] = {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      };
    } else {
      matchStage["$match"] = {};
    }
    if (userId && query) {
      matchStage["$match"] = {
        $and: [
          { owner: new mongoose.Types.ObjectId(userId) },
          {
            $or: [
              { title: { $regex: query, $options: "i" } },
              { description: { $regex: query, $options: "i" } },
            ],
          },
        ],
      };
    }
  
    const sortStage = {};
    if (sortBy && sortType) {
      sortStage["$sort"] = {
        [sortBy]: sortType === "asc" ? 1 : -1,
      };
    } else {
      sortStage["$sort"] = {
        createdAt: -1,
      };
    }
  
    // const skipStage = { $skip: (page - 1) * limit };
    // const limitStage = { $limit: limit };
  
    const videos = await Video.aggregate([
      matchStage,
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                fullName: 1,
                username: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "likes",
        },
      },
      sortStage,
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
      {
        $addFields: {
          owner: {
            $first: "$owner",
          },
          likes: {
            $size: "$likes",
          },
        },
      },
    ]);
  
    if (!videos) {
      throw new ApiError(500, "something want wrong while get all videos");
    }
  
    return res
      .status(200)
      .json(new ApiResponse(200, videos, "get all videos successfully"));
})
const publishAVideo=asyncHandler(async (req,res)=>{
    const { title, description} = req.body
    const owner = req.user._id
    const videofileLocalPath = await req.files?.videofile[0].path
    const thumbnailLocalPath = await req.files?.thumbnail[0].path
    if(!videofileLocalPath||!thumbnailLocalPath){
        throw new ApiError(400,"Video and Thumbnail are Required")
    }
    const videofile = await uploadOnCloudnary(videofileLocalPath)
    if (!videofile) {
        throw new ApiError(500,"Failed to Upload video")
    }
    const thumbnail= await uploadOnCloudnary(thumbnailLocalPath)
    if (!thumbnail) {
        throw new ApiError(500,"Failed to Uplaod Thumbnail")
    }
    const video = await Video.create({
        title:title,
        description:description,
        owner:owner,
        videofile:videofile.url,
        thumbnail:thumbnail.url,
        duration:videofile.duration
    })

    if (!video) {
        throw new ApiError(500,"Failed While creating Video")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,video,"Successfully Video Uplaoded"))

})
const getVideoById = asyncHandler(async (req,res)=>{
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400,"Video ID not Found")
    }
    const video  = await Video.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"userDetail",
                pipeline:[
                    {
                        $project:{
                            avatar:1,
                            username:1,
                            fullname:1
                        }
                    }
                ]
            },
        },
        {
                $addFields:{
                    owner:{
                      $first:"$userDetail"
                    }
                }
            }
    ])
    if (!video) {
        throw new ApiError(200,"Video Doesn't Exists")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,video,"Video Fetched Successfully"))
})
const updateVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    if (!videoId) {
        throw new ApiError(400,"Video ID not Found")
    }
    const {title,description}=req.body
    const thumbnailLocalPath = await req.file?.path
    if (!(thumbnailLocalPath||title||description)) {
        throw new ApiError(200,"All Fields are Required")
    }
    const updatedthumbnail = await uploadOnCloudnary(thumbnailLocalPath)
    try {
        const videofile =await Video.findById(videoId)
        if(updatedthumbnail){
            videofile.thumbnail=updatedthumbnail.url
        }
        if(title){
            videofile.title=title
        }
        if(description){
            videofile.description=description
        }
        await videofile.save({validateBeforeSave:false})
        return res
        .status(200)
        .json(new ApiResponse(200,videofile,"Video Updated Successfully"))
    } catch (error) {
        throw new ApiError(500,"Something Went Wrong While Updating the Video")
    }

    
})
const deleteVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    if (!videoId) {
        throw new ApiError(400,"Video ID not Found")
    }
    const deletedVideo = await Video.findByIdAndDelete(videoId)
    if (!deletedVideo) {
        throw new ApiError(200,"Failed to Delete Video Or Video Doesn't Exist")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,deletedVideo,"Video Deleted Successfully"))
})
const togglePublishStatus = asyncHandler(async(req,res)=>{
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400,"Video Not Found")
    }
    const videofile = await Video.findById(videoId)
    if(!videofile){
        throw new ApiError(400,"Video Doesn't Exist")
    }
    videofile.isPublished = !videofile.isPublished
    await videofile.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200,videofile.isPublished,"Video Toggled SuccesFully"))

})

export {
    publishAVideo,
    getallVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}