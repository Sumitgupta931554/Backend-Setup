import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if (!name||!description) {
        throw new ApiError(400,"Name and Description are required")
    }
    //TODO: create playlist
    const {userId}= req.user._id
    if (!userId||!isValidObjectId(userId)) {
        throw new ApiError(400,"Invalid User")
    }
    const playlist = await Playlist.create({
        name:name,
        description:description,
        owner:userId
    })
    if (!playlist) {
        throw new ApiError(500,"Failed to create playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(201,playlist,"Playlist created Successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if (!userId||!isValidObjectId(userId)) {
        throw new ApiError(400,"Invalid User Id")
    }
    const userPlaylists = await Playlist.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from:"Video",
                localfield:"video",
                foreignfield:"_id",
                as :"playlistVideo",
                pipeline:[
                    {
                       $lookup:{
                        from :"User",
                        localfield:"owner",
                        foreignfield:"_id",
                        as:"ownerDetails",
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
                ]
            }
        }
    ])
    if (!userPlaylists) {
        throw new ApiError(400,"There is No Playlist created by user")
    }
    return res
    .status(200)
    .json(new ApiResponse(201,userPlaylists,"Playlist Fetched Successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if (!playlistId||!isValidObjectId(playlistId)) {
        throw new ApiError(400,"Playlist is not Valid")
    }
    const playlists = await Playlist.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from:"Video",
                localfield:"video",
                foreignfield:"_id",
                as :"playlistVideo",
                pipeline:[
                    {
                       $lookup:{
                        from :"User",
                        localfield:"owner",
                        foreignfield:"_id",
                        as:"ownerDetails",
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
                ]
            }
        }
    ])
    if (!playlists) {
        throw new ApiError(500,"Failed to finding the Playlist")
    }
    return res
    .status(200)
    .json(new ApiResponse(201,playlists,"Playlist Fetched Successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if (!playlistId||!isValidObjectId(playlistId)) {
        throw new ApiError(400,"Playlist Id is Required or Invalid Playlist")
    }
    if (!videoId||!isValidObjectId(videoId)) {
        throw new ApiError(400,"Video Id is Required or Invalid Video Id")
    }
    const videoAddedToPlaylist = await Playlist.findByIdAndUpdate(playlistId,
        {
            $push:{
                video:new mongoose.Types.ObjectId(videoId)
            }
        },
        {new :true}
    )
    if (!videoAddedToPlaylist) {
        throw new ApiError(500,"Failed to Find or Add video in playlist")
    }
    return res
    .status(200)
    .json(new ApiResponse(201,videoAddedToPlaylist,"Video Added Successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if (!playlistId||!isValidObjectId(playlistId)) {
        throw new ApiError(400,"Playlist Id is Required or Invalid Playlist")
    }
    if (!videoId||!isValidObjectId(videoId)) {
        throw new ApiError(400,"Video Id is Required or Invalid Video Id")
    }
    const videoRemovedFromPlaylist = await Playlist.findByIdAndUpdate(playlistId,
        {
            $pull:{
                video:new mongoose.Types.ObjectId(videoId)
            }
        },
        {new :true}
    )
    if (!videoRemovedFromPlaylist) {
        throw new ApiError(500,"Failed to Find or Add video in playlist")
    }
    return res
    .status(200)
    .json(new ApiResponse(201,videoRemovedFromPlaylist,"Video Removed Successfully From Playlist"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if (!playlistId||!isValidObjectId(playlistId)) {
        throw new ApiError(400,"Playlist Id not Found or Invalid Playlist Id")
    }
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)
    if (!deletedPlaylist) {
        throw new ApiError(500,"Failed to Delete Playlist or Playlist Doesn't Exists")
    }
    return res
    .status(200)
    .json(201,deletedPlaylist,"Playlist Deleted Successfully")
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if (!playlistId||!isValidObjectId(playlistId)) {
        throw new ApiError(400,"Playlist Id not Found or Invalid Playlist Id")
    }
    if (!name||!description) {
        throw new ApiError(400,"Name and Description are required")
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,
        {
            $set:{
                name:name,
                description:description
            }
        },
        {new :true}
    )
    if (!updatePlaylist) {
        throw new ApiError(500,"Failed to Update Playlist")
    }
    return res
    .status(200)
    .json(new ApiResponse(201,updatePlaylist,"Playlist Updated Successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}