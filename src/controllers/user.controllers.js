import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {User} from "../models/user.models.js";
import uploadOnCloudnary from "../utils/Cloudnary.js"
import ApiResponse from "../utils/ApiResponse.js";


const generateAccessAndRefreshToken=async ( user_id )=>{
    try {
        const user = await User.findById(user_id)
        const accessToken =await user.generateAccessToken();
        const refreshToken =await user.generateRefreshToken();
        // console.log(accessToken,refreshToken);
        user.refreshtoken=refreshToken
        await user.save({validateBeforeSave:false})
        return {
            accessToken:accessToken,
            refreshToken:refreshToken
        }
        
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

    const {username,email,userpassword}=req.body;
    console.log(username,email,userpassword);
    if((!username)&&(!email)){
        throw new ApiError(401,"Username or Email is Required")
    }

    const user1 = await User.findOne({
        $or:[{username},{email}]
    })
    if(!user1){
        throw new ApiError(400,"User Does not exists")
    }
    const isPasswordValid= await user1.isPasswordCorrect(userpassword);
    console.log(isPasswordValid);
    if(!isPasswordValid){
        throw new ApiError(400,"Wrong Password")
    }
    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user1._id)
    // console.log(accessToken,refreshToken);
    // const accessToken =await user1.generateAccessToken();
    // const refreshToken =await user1.generateRefreshToken();
    // user1.refreshtoken=refreshToken
    // await user1.save({validateBeforeSave:false})
    const loggedinUser =await User.findById(user1._id).select( "-password -refreshtoken")
    const option={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(
        new ApiResponse
        (200,
        {
            loggedinUser,accessToken,refreshToken
        },
        "Logging Successfully"))
})
const loggedOutUser = asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(req.user._id,{
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

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshtoken =await req.cookie?.refreshToken||req.body?.refreshToken
    if(!incomingRefreshtoken){
        throw new ApiError(400,"Refresh Token Expires")
    }
    try {
        const decodeToken = jwt.verify(incomingRefreshtoken,process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodeToken._id)
        if (!user) {
            throw new ApiError(400,"Session Expires")
        }
        if (incomingRefreshtoken!==user.refreshtoken) {
            throw new ApiError(400,"Invalid User")  
        }
        const {accessToken,newrefreshToken} = await generateAccessAndRefreshToken(user._id)
        const option={
            httpOnly:true,
            secure:true
        }
        return res
        .status(200)
        .cookie("accessToken",accessToken,option)
        .cookie("refreshToken",newrefreshToken,option)
        .json(new ApiResponse(200 , 
            {
                accessToken,refreshToken:newrefreshToken
            }
        ))
    } catch (error) {
        throw new ApiError(401,error?.message||"Invalid Refresh Token")
    }
})
const changePassword =asyncHandler(async (req,res)=>{
    const {oldPassword,newPassword}=req.body
    if (!(oldPassword&&newPassword)) {
        throw new ApiError(400,"OldPassword And New Password Is Required")
    }
    const user =await User.findById(req.user._id)
    if (!user) {
        throw new ApiError(400,"User Not Found")
    }
    const isPasswordValid=await user.isPasswordCorrect(oldPassword)
    if(!isPasswordValid){
        throw new ApiError(402,"OldPassword is Incorrect")
    }
    user.password=newPassword
    await user.save({validateBeforeSave:false})
    return  res
    .status(200)
    .json(new ApiResponse(200,{},"Password Change SuccessFully"))

})
const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"User Fetched Successfully"))
})
const updateAccountDetails = asyncHandler(async (req,res)=>{
    const {fullname,email}=req.body
    if(!fullname&&!email){
        throw new ApiError(400,"Fields name Required")
    }
    const user = await User.findByIdAndUpdate(req.user._id,{
        $set:{
            fullname:fullname,
            email:email
        }
    },
    {
        new:true
    }
).select("-password -refreshtoken")

return res
.status(200)
.json(new ApiResponse(200,user,"Details Update Succesfully"))
})
const updateAvatar = asyncHandler(async (req,res)=>{
    const avatarLocalPath = await req.files?.avatar?.path
    if (!avatarLocalPath) {
        throw new ApiError(401,"Avatar Image Is Required")
    }
    const avatar = await uploadOnCloudnary(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(401,"Failed to Uplaod Avatar Image")
    }
    const user = await User.findByIdAndUpdate(req.user._id,{
        $set:{
            avatar:avatar.url
        }
    },{
        new:true
    }).select("-password -refreshtoken")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Avatar Upadated Successfully"))

})
const updateCoverImage = asyncHandler(async (req,res)=>{
    const coverImageLocalPath = await req.files?.avatar?.path
    if (!coverImageLocalPath) {
        throw new ApiError(401,"Avatar Image Is Required")
    }
    const coverImage = await uploadOnCloudnary(coverImageLocalPath)
    if (!coverImage.url) {
        throw new ApiError(401,"Failed to Uplaod Avatar Image")
    }
    const user = await User.findByIdAndUpdate(req.user._id,{
        $set:{
            coverimage:coverImage.url
        }
    },{
        new:true
    }).select("-password -refreshtoken")
    
    return res
    .status(200)
    .json(new ApiResponse(200,user,"Cover Image Upadated Successfully"))
})
export {
    registerUser,
    LoginUser,
    loggedOutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage
};
