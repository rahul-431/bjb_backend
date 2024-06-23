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
import { verifyJwt } from "../middlewares/auth.middleware.js";
const bookingRouter = Router();
bookingRouter.route("/").post(verifyJwt, addBooking);
bookingRouter.route("/").get(verifyJwt, getAllBooking);
bookingRouter.route("/todayActivity").get(verifyJwt, getTodayActivity);
bookingRouter.route("/afterDate").get(verifyJwt, getBookingAterDate);
bookingRouter.route("/:id").get(verifyJwt, getSingleBooking);
bookingRouter.route("/:id").delete(verifyJwt, deleteBooking);
bookingRouter.route("/:id").put(verifyJwt, updateBooking);
bookingRouter.route("/checkout/:id").put(verifyJwt, checkout);
export default bookingRouter;
