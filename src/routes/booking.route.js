import { Router } from "express";
import {
  addBooking,
  deleteBooking,
  getAllBooking,
  getSingleBooking,
} from "../controllers/booking.controller.js";
const bookingRouter = Router();
bookingRouter.route("/").post(addBooking);
bookingRouter.route("/").get(getAllBooking);
bookingRouter.route("/:id").get(getSingleBooking);
bookingRouter.route("/:id").delete(deleteBooking);
export default bookingRouter;
