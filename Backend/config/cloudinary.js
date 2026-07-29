import { v2 as cloudinary } from "cloudinary";
import multer from "multer";


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//to upload in image or 4 images
export const upload = multer({ storage: multer.memoryStorage() });

//to upload image to cloudinary
export const uploadToCloudinary = (buffer) =>
    new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "polling-app",
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            });
        uploadStream.end(buffer);
    });

export default cloudinary;  