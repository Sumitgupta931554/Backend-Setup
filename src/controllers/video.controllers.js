import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Video } from "../models/video.models.js";
import uploadOnCloudnary from "../utils/Cloudnary.js";

const getallVideos = asyncHandler(async (req,res)=>{
    const {page=1,limit=10,query, sortBy, sortType, userId }=req.query
})
const publishAVideo=asyncHandler(async (req,res)=>{
    const { title, description} = req.body
    const owner = req.user._id
    const videofileLocalPath = await req.files?.videofile?.path
    const thumbnailLocalPath = await req.files?.thumbnail?.path
    if(!(videofileLocalPath&&thumbnailLocalPath)){
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
        video:videofile.url,
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
    const video  = await Video.aggregate([
        {
            $match:{
                _id:new moongose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"User",
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
        },{
                $addfield:{
                    owner:{
                        $first:"$owner"
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
    const {thumbnail,title,description}=req.body
    if (!(thumbnail||title||description)) {
        throw new ApiError(200,"All Fields are Required")
    }
    try {
        const videofile =await Video.findById(videoId)
        if(thumbnail){
            videofile.thumbnail=thumbnail
        }
        if(title){
            videofile.title=title
        }
        if(description){
            videofile.description=description
        }
        await videofile.save({validateBeforeSave:false})
    } catch (error) {
        throw new ApiError(500,"Something Went Wrong While Updating the Video")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,videofile,"Video Updated Successfully"))
    
})
const deleteVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    try {
        await Video.deleteOne(videoId)
    } catch (error) {
        throw new ApiError(200,"Failed to Delete Video Or Video Doesn't Exist")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Video Deleted Successfully"))
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
    .json(new ApiResponse(200,{videofile},"Video Toggled SuccesFully"))

})

export {
    publishAVideo,
    getallVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}