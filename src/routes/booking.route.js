import { Router } from "express";
import {
  addBooking,
  checkout,
  deleteBooking,
  getAllBooking,
  getSingleBooking,
  updateBooking,
} from "../controllers/booking.controller.js";
const bookingRouter = Router();
bookingRouter.route("/").post(addBooking);
bookingRouter.route("/").get(getAllBooking);
bookingRouter.route("/:id").get(getSingleBooking);
bookingRouter.route("/:id").delete(deleteBooking);
bookingRouter.route("/:id").put(updateBooking);
// bookingRouter.route("/confirmPayment/:id").put(confirmPayment);
bookingRouter.route("/checkout/:id").put(checkout);
export default bookingRouter;
