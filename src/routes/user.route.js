import { Router } from "express";
import { uploadLocally } from "../middlewares/fileUpload.middleware.js";
import {
  changePassword,
  deleteUser,
  getAllUsers,
  getCurrentUser,
  handleForgetPassword,
  login,
  logout,
  registerUser,
  resetPassword,
  updateUser,
} from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const userRouter = Router();

//add new user
userRouter.route("/").post(
  uploadLocally.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  verifyJwt,
  registerUser
);

//login user
userRouter.route("/login").post(login);

//secured routes

//get list of all users
userRouter.route("/").get(verifyJwt, getAllUsers);
userRouter.route("/getCurrent").get(verifyJwt, getCurrentUser);

//delete user
userRouter.route("/:id").delete(verifyJwt, deleteUser);

//update user data fullName and email
userRouter.route("/").put(verifyJwt, updateUser);

//logout user
userRouter.route("/logout").post(verifyJwt, logout);

//change password
userRouter.route("/changePassword").post(verifyJwt, changePassword);

//handling forget password
userRouter.route("/forgetPassword").post(handleForgetPassword);

//reset password
userRouter.route("/reset").post(verifyJwt, resetPassword);
export default userRouter;
