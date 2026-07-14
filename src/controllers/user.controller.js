import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/users.model.js";

const registerUser = asyncHandler(async(req,res)=>{
   const {fullName,email,username,password} = req.body;
   console.log(`Email: ${email} \n Fullname : ${fullName} \n Username: ${username} \n Password: ${password}`);
    
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



})

export {registerUser}