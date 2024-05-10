import { Router } from "express";
import { uploadLocally } from "../middlewares/fileUpload.middleware.js";
import { registerUser } from "../controllers/user.controller.js";
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
export default userRouter;
