import mongoose from "mongoose";
import { Booking } from "../models/booking.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addBooking = asyncHandler(async (req, res) => {
  const {
    checkInDate,
    checkoutDate,
    vehicleNumber,
    purpose,
    roomNumber,
    guestId,
    maleNumber,
    femaleNumber,
    relation,
    paidStatus,
    roomCharge,
    addedBy,
  } = req.body;

  if (
    [
      checkInDate,
      checkoutDate,
      roomNumber,
      guestId,
      maleNumber,
      femaleNumber,
      paidStatus,
      roomCharge,
      addedBy,
    ].some(
      (item) =>
        item === null ||
        item === undefined ||
        (typeof item === "string" && item.trim() === "")
    )
  ) {
    throw new ApiError("400", "all fields are required");
  }
  const totalGuest = maleNumber + femaleNumber;

  const newBooking = await Booking.create({
    checkInDate,
    checkoutDate,
    vehicleNumber,
    purpose,
    roomNumber,
    guestId,
    maleNumber,
    femaleNumber,
    totalGuest,
    relation,
    paidStatus,
    roomCharge,
    addedBy,
  });

  if (!newBooking) {
    throw new ApiError(500, "Failed to create new booking");
  }

  return res
    .status(201)
    .json(new ApiResponse(newBooking, "New booking added successfully"));
});
const getAllBooking = asyncHandler(async (req, res) => {
  const bookings = await Booking.find();
  if (bookings.length > 0) {
    return res
      .status(200)
      .json(new ApiResponse(bookings, "all bookings retrieved successfully"));
  }
  return res.status(200).json(new ApiResponse("No bookings found"));
});
const deleteBooking = asyncHandler(async (req, res) => {
  if (!req.params.id) {
    throw new ApiError(400, "Id is not provided");
  }
  const id = new mongoose.Types.ObjectId(req.params.id);
  const deletedBooking = await Booking.findByIdAndDelete(id);
  if (!deletedBooking) {
    throw new ApiError(404, "No resource found to delete");
  }
  return res
    .status(204)
    .json(new ApiResponse(null, "Booking deleted successfully"));
});
const getSingleBooking = asyncHandler(async (req, res) => {
  if (!req.params.id) {
    throw new ApiError(400, "Id is not provided");
  }
  const id = new mongoose.Types.ObjectId(req.params.id);
  const booking = await Booking.findById(id);
  if (!booking) {
    throw new ApiError(404, "No resource found");
  }
  return res
    .status(200)
    .json(new ApiResponse(booking, "Booking data retrieved successfully"));
});
export { addBooking, getAllBooking, deleteBooking, getSingleBooking };
