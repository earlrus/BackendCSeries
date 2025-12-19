import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiErrors.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.models.js";
import {ApiResponse} from "../utils/ApiResponse.js";



//Generate access and refresh token

async function generateAccessAndRefreshToken(user){

    try {
        const refreshToken=user.generateRefreshToken();
        const accessToken=user.generateAccessToken();

        user.refreshToken=refreshToken;


 await user.save({validateBeforeSave:false})       
        
       return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}


const registerUser=asyncHandler(async (req,res,next)=>{

      // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {username,email,fullName,password}=req.body;

    if([username,fullName,email,password].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"All fields are required")
    }
 const existedUser=await User.findOne({
        $or:[{username,email}]
    })

       if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    
    // console.log(req.files);

    const avatarLocalPath=req.files?.avatar[0]?.path;


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path;
    }


    

    let avatar=await uploadOnCloudinary(avatarLocalPath)
    let coverImage=await uploadOnCloudinary(coverImageLocalPath)


  if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }


    const user=await User.create({
        username:username.toLowerCase(),
        fullName,
        email,
        password,
        avatar:avatar.url,
        coverImage:coverImage?.url || ""
    })


const createdUser=await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User register successfully")
    )
})

//login user controller

const loginUser=asyncHandler(async(req,res)=>{
    const {username,email,password}=req.body;
    
    
    
    if(!username && !email){
        throw new ApiError(401, "username or email is required");
    }

    const user=await User.findOne({
            $or:[{username},{email}]
        })

     if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid=await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(400,"invalid user credentials")
    }

    const {refreshToken,accessToken}=await generateAccessAndRefreshToken(user);

   
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    
    // const transformUser=JSON.parse(resultUser)

    let option={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",option)
    .json(
        new ApiResponse(200,
            {
                loggedInUser,
                accessToken,
                refreshToken
            },
            "user successfully logged in"
        )
    )

})

const logoutUser=asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(req.user._id,
        {
            $unset:{
                refreshToken:1   /*this removes the field from document*/
            }
        },
        {new:true}
    )

    const option={httpOnly:true, secure:true}

res
.status(200)
.clearCookie("accessToken")
.clearCookie("refreshToken")
.json(
    new ApiResponse(200,{},"User logout")
)
})



export {registerUser,loginUser,logoutUser}
