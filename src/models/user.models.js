import mongoose, { Schema } from "mongoose";
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
            type:String,
            required:true // cloudinary url
        },
        watchhistory:[
            {
                type:Schema.Types.ObjectId,
                ref:Video
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
    if(!this.ismodeified("password")) return next();
    this.password=bcrypt.hash(this.password,10)
    next();
})
userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(this.password,password)
}
userSchema.method.generateAccessToken = async function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            fullname:this.fullname,
            username:this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expireIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.method.generateRefreshToken = async function(){
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expireIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User",userSchema)
