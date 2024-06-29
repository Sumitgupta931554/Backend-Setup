import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {User} from "../models/user.models.js";
import uploadOnCloudnary from "../utils/Cloudnary.js"
import ApiResponse from "../utils/ApiResponse.js";


const generateAccessAndRefreshToken=async( user_id )=>{
    try {
        const user = await User.findById(user_id)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshtoken=refreshToken
        await user.save({validBeforeSave:false})
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something Went Error While Creating the Access Token")
    }
}
const registerUser = asyncHandler(async (req,res)=>{
    // res.status(200).json({
    //     message:"Successfully Done"
    // })

    const {fullname,email,username,password}=req.body;
    // console.log("Fullname",fullname);

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

    // console.log(avatarLocalPath);
    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar Files Required")        
    }
    // console.log(avatarLocalPath);
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
const LoginUser = asyncHandler(async (req,res)=>{

    const {username,email,password}=req.body

    if(!(username||email)){
        throw new ApiError(401,"Username or Email is Required")
    }

    const user = await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw new ApiError(400,"User Does not exists")
    }
    const isPasswordCorrect= await user.isPasswordCorrect(password)
    if(!isPasswordCorrect){
        throw new ApiError(400,"Wrong Password")
    }
    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);
    const loggedinUser = User.findById(user._id).select( "-password -refreshtoken")
    const option={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(new ApiResponse(200,{
        user:loggedinUser,accessToken,refreshToken
    },"Logging Successfully"))
})
const loggedOutUser = asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(req.User._id,{
        $set:{
            refreshtoken:""
        }
    })
    const option={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(200,"User Logged Out Successfully")

})

export {registerUser,LoginUser};
