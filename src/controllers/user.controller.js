import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import _ from "lodash";
import { upload } from "../utils/fileUploadCloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//registering the new user
export const registerUser = asyncHandler(async (req, res) => {
  //getting user details
  const { fullName, email, password } = req.body;
  console.log(req.files);

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
  console.log(avatar, avatar?.url);

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

//generate both access and refresh token and saving refresh token to the database
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;

    //save refresh token to database
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "something went wrong while creating jwt tokens");
  }
};
const login = asyncHandler(async (req, res) => {
  //getting data from frontend
  const { email, password } = req.body;

  //empty validation
  if ([email, password].some((item) => item.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  //check if email exist or not
  const existed = await User.findOne({ email });
  if (!existed) {
    throw new ApiError(
      400,
      `User with ${email} does not exist, please register first`
    );
  }

  //checking the password
  const isPasswordValid = await User.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Password is incorrect, please try again");
  }

  //generating access and refresh token
  const { accessToken, refreshToken } = generateAccessAndRefreshToken(
    existed._id
  );

  // const loggedInUser = await User.findById(existed._id).select(
  //   "-password -refreshToken"
  // );
  const loggenInUser = await User.findById(existed._id);

  //sending access token in cookie
  //after adding this option true then cookie can not be modified by the client side
  // so we must need to set these options true while sending cookie
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(loggenInUser, "Logged in successfully"));
});
export { login };
