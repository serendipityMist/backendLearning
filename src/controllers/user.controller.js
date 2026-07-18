import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/users.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async(req,res)=>{
   const {fullName,email,username,password} = req.body;
   console.log(`Email: ${email} \n Fullname : ${fullName} \n Username: ${username} \n Password: ${password}`);
    console.log("REQ body",req.body);
    
    if(
        [fullName,email,username,password].
        some(
            (field)=>
                field?.trim()===""
        )){
               throw new ApiError(400,"All fields are required.") 
        }

        const existingUser = await User.findOne({
            $or:[{username},{email}]
        })

        if(existingUser){
            throw new ApiError(409, "User with the email or username already exists.");
        }
        // console.log("Avatar File: ", req.files);
        // console.log("Cover Image File: ", req.files);
        
        
        //multer provides the following field in the req
        const avatarLocalPath = req.files?.avatar[0]?.path;
        // const coverImageLocalPath = req.files?.coverImage[0]?.path;
        
        // console.log(`Avatar Local Path: ${avatarLocalPath} \n Cover Image Local Path: ${coverImageLocalPath}`);

        let coverImageLocalPath;
        if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
            coverImageLocalPath = req.files.coverImage[0].path;
        }

        if(!avatarLocalPath){
            throw new ApiError(400,"Avatar file is required issue in avatarLocalPath");
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath);
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);
        console.log(`Avatar Cloudinary URL: ${avatar?.url} \n Cover Image Cloudinary URL: ${coverImage?.url}`);
        if(!avatar){
            throw new ApiError(400," Avatar file is required");
        }

        const user = await User.create({
            fullName,
            email,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            password,
            username
        })

        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        if(!createdUser){
            throw new ApiError(500,"Something went wrong while registering the user");
        }

        return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));

})

const generateAccessAndRefreshToken = async(userId)=>{
    try {
            const user = await User.findById(userId);

            const accessToken = user.generateAccessToken();
            const refreshTokenn = user.generateRefreshToken();

            //setting the above refresh token in the user model refresh token
            user.refreshToken = refreshToken;

            //saving the refresh token in the DB
            await User.save({validateBeforeSave:false});

            //returning the access and refresh token
            return {accessToken, refreshTokenn};


    } catch (error) {
        throw new ApiError(500,"Something went wrong");
    }
}

const loginUser = asyncHandler(async(req,res)=>{
    const{username, email, password} = req.body;

    if(!(username || email)){
        throw new ApiError(400,"please enter username or email");
    }

    const user = await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(400,"User doesn't exists.");
    }

    //check whether the password is valid or not
    const isPassValid = await user.isPasswordCorrect(password);

    if(!isPassValid){
        throw new ApiError(400,"Password is incorrect");
    }
    //generating access and refresh token
    const {accessToken, refreshToken} = generateAccessAndRefreshToken(user._id);

    // creating a logged in user
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    //creating options for cookie
    const option = {
        httpOnly:true,
        secure: true
    }

    //sending cookies and response
    res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(
        200,{
            user:loggedInUser,accessToken,refreshToken
        },
        "User logged in successfully"
    ))



})

const logoutUser = asyncHandler(async(req,res)=>{
    //deleting the cookie and removing the access token
})

export {registerUser}