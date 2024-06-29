import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {User} from "../models/user.models.js";
import uploadOnCloudnary from "../utils/Cloudnary.js"
import ApiResponse from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req,res)=>{
    // res.status(200).json({
    //     message:"Successfully Done"
    // })

    const {fullname,email,username,password}=req.body;
    console.log("Fullname",fullname);

    // if (fullname==="") {
    //     throw new ApiError(400,"Fullname Required")
    // }
    if ([fullname,email,password,username].some((field)=>
        field?.trim()===""
    )) {
        throw new ApiError(404,"All Fields are Required")
    }
    const existedUser = await User.findOne({
        $or :[{username},{email}]
    })
    if (existedUser) {
        throw new ApiError(409,"User with Email or Username Already exist")
    }
    const avatarLocalPath = await  req.files?.avatar[0]?.path
    //const coverImageLocalPath = await req.files?.coverImage[0]?.path
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    console.log(avatarLocalPath);
    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar Files Required")        
    }
    console.log(avatarLocalPath);
    const avatar= await uploadOnCloudnary(avatarLocalPath)
    const coverImage= await uploadOnCloudnary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400,"Avatar Files Is Required")
    }
    const user=await User.create({
        fullname,
        avatar:avatar.url,
        coverimage:coverImage?.url ||"",
        username:username.toLowerCase(),
        email,
        password
    })
    const createdUser= await User.findById(user._id).select(
        "-password -refreshtoken"
    )
    if (!createdUser) {
        throw new ApiError(500,"Something Went Wrong While Creating the User")
    }
    return res.status(201).json(new ApiResponse(200,createdUser,"User Registered succesfully"))
})

export {registerUser};
