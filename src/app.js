import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.router.js"

export const app=express();


// app.use(cors({
//     origin:"*",
//     credentials:true,
//     allowedHeaders:true
// }))



app.use(express.json({limit:"16kb"}));

app.use(express.urlencoded({extended:true,limit:"16kb"}))

app.use(cookieParser())



app.use("/api/v1/user",userRouter)

