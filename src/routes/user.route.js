import { Router } from "express";
import { uploadLocally } from "../middlewares/fileUpload.middleware.js";
import { login, registerUser } from "../controllers/user.controller.js";
const userRouter = Router();
userRouter.route("/").post(
  uploadLocally.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  registerUser
);
userRouter.route("/login").post(login);
export default userRouter;
