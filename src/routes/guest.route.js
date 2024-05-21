import { Router } from "express";
import {
  addGuest,
  deleteGuest,
  getAllGuest,
  getSingleGuest,
} from "../controllers/guest.controller.js";

const guestRouter = Router();

//adding guest
guestRouter.route("/").post(addGuest);

//getting all guest
guestRouter.route("/").get(getAllGuest);

//getting single guest
guestRouter.route("/:id").get(getSingleGuest);

//delete guest
guestRouter.route("/:id").delete(deleteGuest);
export default guestRouter;
