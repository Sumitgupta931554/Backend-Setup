import mongoose, { Schema } from "mongoose";
import { Video } from "./video.models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config()


const userSchema = new mongoose.Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim: true
        },
        fullname:{
            type:String,
            required:true,
            trim:true,
            index:true
        },
        avatar:{
            type:String,// cloudinary url
            required:true
        },
        coverimage:{
            type:String, // cloudinary url
        },
        watchhistory:[
            {
                type:Schema.Types.ObjectId,
                ref: Video
            }
        ],
        password:{
            type:String,
            required:[true,"Password is Required"]
        },
        refreshtoken:{
            type:String
        }

    },
    {
        timestamps:true
    }
)
userSchema.pre("save",async function (next){
    if(!this.isModified("password")) return next();
    this.password= await bcrypt.hash(this.password,10)
    next();
})
userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccessToken =async function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            fullname:this.fullname,
            username:this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:'1h'
        }
    )
}
userSchema.methods.generateRefreshToken =async function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            fullname:this.fullname,
            username:this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:'1h'
        }
    )
}
export const User = mongoose.model("User",userSchema)
