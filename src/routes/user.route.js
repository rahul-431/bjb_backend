import { Router } from "express";
import { uploadLocally } from "../middlewares/fileUpload.middleware.js";
import {
  deleteUser,
  getAllUsers,
  login,
  logout,
  registerUser,
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
  registerUser
);

//login user
userRouter.route("/login").post(login);

//get list of all users
userRouter.route("/").get(getAllUsers);

//delete user
userRouter.route("/:id").delete(deleteUser);

//logout user
userRouter.route("/logout").post(verifyJwt, logout);
export default userRouter;
