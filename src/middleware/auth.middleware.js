import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.models.js"

export const veriftJWT = asyncHandler(async (req,_,next)=>{
    const token =await req.cookies?.accessToken||req.header("Authorisation")?.replace("Bearer ","")
    if(!token){
        throw new ApiError(401,"Unauthorized Access")
    }
    const decodeToken =jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(decodeToken?._id).select(" -password -refreshtoken")
    if(!user){
        throw new ApiError(400,"Invalid Access Token")
    }
    req.User=user;
    next();
})