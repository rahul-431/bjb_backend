import { Router } from "express";
import {
  addBooking,
  deleteBooking,
  getAllBooking,
  getSingleBooking,
  updateExtraCharge,
} from "../controllers/booking.controller.js";
const bookingRouter = Router();
bookingRouter.route("/").post(addBooking);
bookingRouter.route("/").get(getAllBooking);
bookingRouter.route("/:id").get(getSingleBooking);
bookingRouter.route("/:id").delete(deleteBooking);
bookingRouter.route("/updateCharge/:id").patch(updateExtraCharge);
export default bookingRouter;
