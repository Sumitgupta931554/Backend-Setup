import DB_Connect from "./db/index.js";
import app from "./app.js"
import dotenv from "dotenv";
dotenv.config();
DB_Connect()
.then(()=>{
    app.listen(process.send.PORT||8000,()=>{
        console.log(`Server is runnnng at Port : ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MongoDB connection Failed !!!",err);
})