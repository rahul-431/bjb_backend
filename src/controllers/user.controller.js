import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import _ from "lodash";
import { upload } from "../utils/fileUploadCloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import getRandomInt from "../utils/generateRandomNumber.js";
import nodemailer from "nodemailer";
import { app } from "../app.js";
//registering the new user
export const registerUser = asyncHandler(async (req, res) => {
  console.log("url just hit");
  //getting user details
  const { fullName, email, password } = req.body;
  console.log(fullName, email, password);
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
  let avatarLocalPath = "";
  if (
    req.files &&
    _.isArray(req.files?.avatar) &&
    req.files?.avatar?.length > 0
  ) {
    avatarLocalPath = req.files.avatar[0].path;
  }

  //uploading image at cloudinary
  let avatar;
  if (avatarLocalPath) {
    avatar = await upload(avatarLocalPath);
  }
  // console.log(avatar, avatar?.url);

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

//get list of all users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password -refreshToken");
  if (!users) {
    throw new ApiError(404, "No users found");
  }
  if (users.length > 0) {
    return res.status(200).json(users);
    // .json(new ApiResponse(users, "All users retrived successfully"));
  }
  return res.status(200).json(new ApiResponse(users, "No users found"));
});

//deleting the user
const deleteUser = asyncHandler(async (req, res) => {
  const deleteId = req.params.id;
  if (!deleteId) {
    throw new ApiError(400, "No id provided");
  }
  const deleteObjectId = new mongoose.Types.ObjectId(deleteId);
  const deletedUser = await User.findByIdAndDelete(deleteObjectId);
  if (!deletedUser) {
    throw new ApiError(400, "use not found");
  }
  return res.status(204).json("User deleted successfully");
});

//updating the user details email and fullName
const updateUser = asyncHandler(async (req, res) => {
  const { email, fullName } = req.body;
  if (!email || !fullName) {
    throw new ApiError(400, "FullName and email is required");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName: fullName,
        email: email,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  if (!updatedUser) {
    throw new ApiError(400, "Failed to update the user");
  }
  return res
    .status(200)
    .json(new ApiResponse(updatedUser, "Updated successfully"));
});

//handling change password
const changePassword = asyncHandler(async (req, res) => {
  //getting data
  const { currentPassword, newPassword } = req.body;

  //empty validation
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "All Fields are required");
  }
  //check current password is match or not?
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect current password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: true });
  return res
    .status(200)
    .json(
      new ApiResponse(null, "Password changed successfully, Login required!!!")
    );
});

//generate both access and refresh token and saving refresh token to the database
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    // console.log(accessToken, refreshToken);
    //save refresh token to database
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "something went wrong while creating jwt tokens");
  }
};

//login user
const login = asyncHandler(async (req, res) => {
  //getting data from frontend
  const { email, password } = req.body;

  //empty validation
  if (!email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  //check if email exist or not
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(
      400,
      `User with ${email} does not exist, please register first`
    );
  }

  //checking the password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(400, "Password is incorrect, please try again");
  }

  //generating access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

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
    .json(
      new ApiResponse(
        { user: loggedInUser, token: { accessToken, refreshToken } },
        "Logged in successfully"
      )
    );
});
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req?.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res.json(new ApiResponse(user, "Here is the user data"));
});
//logout user
const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: "" },
    },
    /*This new option tells Mongoose to return the 
    updated document after the update operation is completed.
     Without this option, Mongoose would return the document as it was before the update. */
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(null, "User Logged out successfully"));
});

//forget password:

const handleForgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required to reset password");
  }

  //check if the email exist or not?
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "Provided email not found");
  }
  // resetUserId = user._id;
  app.set("resetUserId", user._id);
  const min = 1000;
  const max = 2000;
  const randomInt = getRandomInt(min, max);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: "porterharry1050@gmail.com",
      //this password is a app passoword that get from google to give this app all accessibility
      //to get this first enable two factor auth and then create new app password
      //dont add actual gmail password, this will not work
      pass: "kxrk dilt akue qjkv",
    },
  });
  try {
    const mailOptions = {
      from: "porterharry1050@gmail.com",
      to: email,
      subject: "Resetting password",
      text: `Enter this code to reset your password ${randomInt}`, // Plain text body
    };
    // Send email
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        app.set("otp", randomInt);
        return res
          .status(200)
          .json(new ApiResponse(info, "Email sent successfully"));
      }
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw new ApiError(500, "Error while sending email");
  }
});

//finally resetting password with otp and new password
const resetPassword = asyncHandler(async (req, res) => {
  const { code, password } = req.body;
  const userId = req.app.get("resetUserId");
  const otp = req.app.get("otp");
  console.log("from Local", otp, userId);
  console.log("from client", code, password);
  // console.log(isInteger(code), isInteger(otp));
  if (!code || !password) {
    throw new ApiError(400, "credentials not found");
  }
  if (otp === code) {
    throw new ApiError(400, "otp is incorrect");
  }

  const user = await User.findById(userId);
  user.password = password;
  await user.save({ validateBeforeSave: true });
  return res
    .status(200)
    .json(
      new ApiResponse(null, "Password reset successfully, Login required!!!")
    );
});
export {
  login,
  deleteUser,
  getAllUsers,
  logout,
  updateUser,
  changePassword,
  handleForgetPassword,
  resetPassword,
  getCurrentUser,
};
