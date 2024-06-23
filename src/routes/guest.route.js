import { Router } from "express";
import {
  addGuest,
  deleteGuest,
  getAllGuest,
  getSingleGuest,
  searchGuest,
  updateGuestDetails,
} from "../controllers/guest.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const guestRouter = Router();

//adding guest
guestRouter.route("/").post(verifyJwt, addGuest);

//getting all guest
guestRouter.route("/").get(verifyJwt, getAllGuest);

//getting single guest
guestRouter.route("/:id").get(verifyJwt, getSingleGuest);

//delete guest
guestRouter.route("/:id").delete(verifyJwt, deleteGuest);

//edit guest
guestRouter.route("/:id").put(verifyJwt, updateGuestDetails);

//searching guest
guestRouter.route("/search/:q").get(verifyJwt, searchGuest);
export default guestRouter;
