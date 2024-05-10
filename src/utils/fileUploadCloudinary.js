import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});
const upload = async (localFilePath) => {
  try {
    if (!localFilePath) {
      throw new Error("Cannot find the local file path");
    }
    //uploading file in cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log(`file is uploaded successfully at ${response.url}`);
    return response;
  } catch (error) {
    //remove locally stored file if the uploading process is failed
    fs.unlinkSync(localFilePath);
    return null;
  }
};
export { upload };
