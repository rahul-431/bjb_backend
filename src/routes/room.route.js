import { Router } from "express";
import {
  addRoom,
  addRoomType,
  deleteRoom,
  deleteRoomType,
  getAllRoom,
  getAllRoomType,
  getSingleRoom,
  updateRoomDetails,
} from "../controllers/room.controller.js";
import multer from "multer";
import { uploadLocally } from "../middlewares/fileUpload.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const roomRouter = Router();

//add new room type
roomRouter.route("/type").post(verifyJwt, addRoomType);

//delete existing room type with corresponding id
roomRouter.route("/type/:id").delete(verifyJwt, deleteRoomType);

//get list of all room type
roomRouter.route("/type").get(verifyJwt, getAllRoomType);

//add new room
// roomRouter.route("/").post(upload.array("images", 5), addRoom);
roomRouter.route("/").post(
  uploadLocally.fields([
    {
      name: "roomImage",
      maxCount: 1,
    },
  ]),
  verifyJwt,
  addRoom
);

//getAllRoom
roomRouter.route("/:isBooking").get(verifyJwt, getAllRoom);

//getSingleRoom
roomRouter.route("/:id").get(verifyJwt, getSingleRoom);

//update room details except room images
roomRouter.route("/:id").put(verifyJwt, updateRoomDetails);

//delete room
roomRouter.route("/:id").delete(verifyJwt, deleteRoom);

export default roomRouter;
