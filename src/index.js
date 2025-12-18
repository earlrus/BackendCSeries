import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({path:"./.env"});


app.get("/hello",(req,res)=>res.send("heeello!!!!"))

connectDB()
.then(()=>app.listen(process.env.PORT || 3000 ,()=>console.log(`App is listning on port ${process.env.PORT || 3000}`)))
.catch((err)=>console.log("app is not conected",err))