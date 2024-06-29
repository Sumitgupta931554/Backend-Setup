import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudnary=async (localpath) =>{
    try {
        if (!localpath) return null
        //uplolading file on Cloudnary
        const response =await cloudinary.uploader
        .upload(localpath,{
            resource_type:"auto"
        })
        // file has been uploaded Succesfully
        fs.unlinkSync(localpath);
        return response;
    } catch (error) {
        fs.unlinkSync(localpath)//remove the locally saved temporary file as upload operarion gone wrong
        return null
    }
}
export default uploadOnCloudnary;