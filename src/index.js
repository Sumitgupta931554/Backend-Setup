import DB_Connect from "./db/index.js";
import dotenv from "dotenv";
dotenv.config();
DB_Connect()
.then(()=>{
    app.listen(process.send.PORT||8000,()=>{
        console.log(`Server is runnnng at Port : ${process.env.POrt}`);
    })
})
.catch((err)=>{
    console.log("MongoDB connection Failed !!!",err);
})