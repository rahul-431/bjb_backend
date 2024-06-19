import { Router } from "express";
import {
  addBooking,
  confirmPayment,
  deleteBooking,
  getAllBooking,
  getSingleBooking,
  updateBooking,
  updateExtraCharge,
} from "../controllers/booking.controller.js";
const bookingRouter = Router();
bookingRouter.route("/").post(addBooking);
bookingRouter.route("/").get(getAllBooking);
bookingRouter.route("/:id").get(getSingleBooking);
bookingRouter.route("/:id").delete(deleteBooking);
bookingRouter.route("/updateCharge/:id").patch(updateExtraCharge);
bookingRouter.route("/confirmPayment/:id").put(confirmPayment);
bookingRouter.route("/:id").put(updateBooking);
export default bookingRouter;
