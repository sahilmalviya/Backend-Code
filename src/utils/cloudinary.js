import { v2 as cloudinary } from "cloudinary"
import { response } from "express";
import fs from "fs"



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// File Upload karne k liye

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //Upload the file on Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        // console.log("file is uploaded on cloudinary", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got faield
        return null;

    }
}


export { uploadOnCloudinary }