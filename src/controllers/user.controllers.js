import asyncHandler from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req,res)=>{
    // res.status(200).json({
    //     message:"Successfully Done"
    // })

    const {fullname,email,username,password}=req.body;
    console.log("Fullname",fullname);
})

export {registerUser};
