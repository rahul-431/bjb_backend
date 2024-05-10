import { Router } from "express";
import { uploadLocally } from "../middlewares/fileUpload.middleware";
const userRouter = Router();
userRouter.route("/").post(
  uploadLocally.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ])
);
export default userRouter;
