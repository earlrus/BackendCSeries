import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({path:"./env"});

console.log(process.env.MONGODB_URI);

const port=process.env.PORT || 8000;

connectDB()
.then(()=>app.listen(port,()=>console.log(`App is listning on port ${port}`)))
.catch((err)=>console.log("app is not conected",err))