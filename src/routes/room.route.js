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
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const roomRouter = Router();

//add new room type
roomRouter.route("/type").post(addRoomType);

//delete existing room type with corresponding id
roomRouter.route("/type/:id").delete(deleteRoomType);

//get list of all room type
roomRouter.route("/type").get(getAllRoomType);

//add new room
roomRouter.route("/").post(upload.array("images", 5), addRoom);

//getAllRoom
roomRouter.route("/").get(getAllRoom);

//getSingleRoom
roomRouter.route("/:id").get(getSingleRoom);

//update room details except room images
roomRouter.route("/:id").put(updateRoomDetails);

//delete room
roomRouter.route("/:id").delete(deleteRoom);

export default roomRouter;
