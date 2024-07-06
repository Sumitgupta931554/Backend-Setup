import mongoose ,{isValidObjectId}from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.models.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    if (!videoId||!isValidObjectId(videoId)) {
        throw new ApiError(400,"Invalid Video")
    }
    const {content} = req.body
    if (!content) {
        throw new ApiError(400,"Comment Is Required")
    }
    const {userId} = req.user._id
    if (!userId||!isValidObjectId(userId)) {
        throw new ApiError(400,"Invalid User ")
    }
    const videofile = await Video.findById(videoId)
    if(!videofile){
        throw new ApiError(400,"Video doesn'n Exist")
    }
    const addComment=await Comment.create({
        content:content,
        video:videofile._id,
        owner:userId
    })
    if (!addComment) {
        throw new ApiError(500,"Failed to Add Comment on Video")
    }
    return res
    .status(200)
    .json(new ApiResponse(201,addComment,"Comment added Successfully"))

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {videoId} = req.params
    if (!videoId||!isValidObjectId(videoId)) {
        throw new ApiError(400,"Invalid Video")
    }
    const {content} = req.body
    if (!content) {
        throw new ApiError(400,"Comment Is Required")
    }
    const {userId} = req.user._id
    if (!userId||!isValidObjectId(userId)) {
        throw new ApiError(400,"Invalid User ")
    }
    const videofile = await Video.findById(videoId)
    if(!videofile){
        throw new ApiError(400,"Video doesn'n Exist")
    }
    const updateComment= await Comment.find(
        {
        video:new mongoose.Types.ObjectId(videofile._id)
    },{
        owner:new mongoose.Types.ObjectId(userId)
    })
    if (!updateComment) {
        throw new ApiError(400,"Comment Not Found to update")
    }
    try {
        updateComment.content=content
        await updateComment.save()
    } catch (error) {
        throw new ApiError(500,"Failed to Update Comment")
    }
    return res
    .status(200)
    .json(new ApiResponse(201,updateComment,"Comment Updated Successfully "))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.body;

if (!commentId || !isValidObjectId(commentId)) {
    throw new ApiError(401, "Video ID is required or invalid");
  }

  const deletedComment = await Comment.findByIdAndDelete(commentId);

  if (!deletedComment) {
    throw new ApiError(500, "Something went wrong while deleting a comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment is deleted successfully"));
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }