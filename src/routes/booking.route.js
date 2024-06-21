import { Router } from "express";
import {
  addBooking,
  checkout,
  deleteBooking,
  getAllBooking,
  getBookingAterDate,
  getSingleBooking,
  getTodayActivity,
  updateBooking,
} from "../controllers/booking.controller.js";
const bookingRouter = Router();
bookingRouter.route("/").post(addBooking);
bookingRouter.route("/").get(getAllBooking);
bookingRouter.route("/todayActivity").get(getTodayActivity);
bookingRouter.route("/afterDate").get(getBookingAterDate);
bookingRouter.route("/:id").get(getSingleBooking);
bookingRouter.route("/:id").delete(deleteBooking);
bookingRouter.route("/:id").put(updateBooking);
bookingRouter.route("/checkout/:id").put(checkout);
export default bookingRouter;
