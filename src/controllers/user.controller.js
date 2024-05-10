import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import _ from "lodash";
import { upload } from "../utils/fileUploadCloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req, res) => {
  //getting user details
  const { fullName, email, password } = req.body;

  //empty validation check
  if ([fullName, email, password].some((item) => item?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  //check if the user with email already exist or not
  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new ApiError(
      409,
      `User with ${email} already exist, please try new one`
    );
  }

  //checking for avatar
  let avatarLocalPath;
  if (req.files && _.isArray(req.files.avatar) && req.files.avatar.length > 0) {
    avatarLocalPath = req.files.avatar[0].path;
  }

  //uploading image at cloudinary
  let avatar;
  if (avatarLocalPath) {
    avatar = await upload(avatarLocalPath);
  }

  //creating user and add entry in db
  const user = await User.create({
    fullName,
    avatar: avatar?.url || "",
    email,
    password,
  });

  //check if user is successfully created or not
  const createdUser = await User.findById(user._id).select("-password");
  if (!createdUser) {
    throw new ApiError(500, "Failed to create a new user");
  }

  //sending response back to the user
  return res
    .status(201)
    .json(new ApiResponse(createdUser, "New user registerd successfully"));
});
