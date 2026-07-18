import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


cloudinary.config({
  secure: true,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadOnCloudinary = async (localfilepath) => {
  try {
    if (!localfilepath) {
      return null;
    }
    const response = await cloudinary.uploader.upload(localfilepath, { resource_type: "auto" });
    console.log(response);
    
    // console.log(`File has been uploaded on cloudinary ${response}`);
    fs.unlinkSync(localfilepath);
    return response;

  } catch (error) {
    // console.log("PORT:", process.env.PORT);
    // console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
    // console.log("API Key:", process.env.CLOUDINARY_API_KEY);
    // console.log("Cloudinary Error:", error);
      fs.unlinkSync(localfilepath);

    return null;
  }
}

export { uploadOnCloudinary };