import mongoose from "mongoose";
import { DB_name } from "../constant.js";

async function DB_Connect(){
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_name}`)
        console.log(`Database Sucessfully Connect !! DB Host : ${connectionInstance.connection.host}`)
    } catch (error) {
        console.error("Error :",error);
        process.exit(1);
    }
}

export  default DB_Connect;