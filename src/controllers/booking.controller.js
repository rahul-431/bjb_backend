import mongoose from "mongoose";
import { Booking } from "../models/booking.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Room } from "../models/room.model.js";

//add new booking
const addBooking = asyncHandler(async (req, res) => {
  console.log(req.body);
  const {
    checkInDate,
    checkoutDate,
    vehicleNumber,
    roomNumber,
    guestId,
    numNights,
    maleNumber,
    femaleNumber,
    advanceAmount,
    relation,
    roomCharge,
    extraCharge,
    observation,
  } = req.body;

  if (
    [
      checkInDate,
      checkoutDate,
      roomNumber,
      guestId,
      advanceAmount,
      roomCharge,
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
  const adminId = new mongoose.Types.ObjectId("663f6aea6f2813ddaca08669");
  const totalRoomCharge = roomCharge * numNights;
  const ExtraCharge = extraCharge ? extraCharge : 0;
  const isPaid =
    Number(advanceAmount) >= Number(totalRoomCharge + ExtraCharge)
      ? true
      : false;
  console.log(totalRoomCharge, isPaid, ExtraCharge);
  const dueAmount = Number(totalRoomCharge + ExtraCharge - advanceAmount);
  console.log("due amount:", dueAmount);
  const newBooking = await Booking.create({
    checkInDate,
    checkoutDate,
    vehicleNumber,
    roomNumber,
    guestId,
    numNights,
    maleNumber,
    femaleNumber,
    totalGuest,
    relation,
    isPaid,
    roomCharge: totalRoomCharge,
    dueAmount,
    extraCharge: ExtraCharge,
    observation,
    addedBy: adminId,
  });
  if (!newBooking) {
    throw new ApiError(500, "Failed to create new booking");
  }
  await Room.findByIdAndUpdate(roomNumber, {
    $set: {
      roomStatus: "Booked",
      cleanStatus: "Not Clean",
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(newBooking, "New booking added successfully"));
});

//getting list of all bookings
const getAllBooking = asyncHandler(async (req, res) => {
  const { page = 1, filter, search = "" } = req.query;
  const limit = 10;
  const skip = (page - 1) * limit;
  let initialQuery = {};
  let pipeline = [];
  if (filter !== "all") {
    initialQuery.status = filter;
  }

  pipeline = [
    {
      $match: initialQuery,
    },
    {
      $lookup: {
        from: "guests",
        localField: "guestId",
        foreignField: "_id",
        as: "guest",
      },
    },
    {
      $lookup: {
        from: "rooms",
        localField: "roomNumber",
        foreignField: "_id",
        as: "room",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "addedBy",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $addFields: {
        guest: {
          $first: "$guest",
        },
        room: {
          $first: "$room",
        },
        user: {
          $first: "$user",
        },
      },
    },
    {
      $match: {
        $or: [{ "guest.fullName": { $regex: search, $options: "i" } }],
      },
    },
    {
      $project: {
        _id: 1,
        checkInDate: 1,
        checkoutDate: 1,
        numNights: 1,
        maleNumber: 1,
        femaleNumber: 1,
        status: 1,
        roomCharge: 1,
        dueAmount: 1,
        extraCharge: 1,
        isPaid: 1,
        otherPaid: 1,
        createdAt: 1,
        updatedAt: 1,
        "user.fullName": 1,
        "guest.phoneNumber": 1,
        "guest.fullName": 1,
        "room.roomNumber": 1,
        "room._id": 1,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ];
  // Execute the aggregation pipeline to get the total count
  const totalCountPipeline = [
    ...pipeline,
    {
      $count: "total",
    },
  ];

  const countResult = await Booking.aggregate(totalCountPipeline);
  const count = countResult.length > 0 ? countResult[0].total : 0;

  // Add pagination stages to the pipeline
  pipeline = pipeline.concat([
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ]);
  const bookings = await Booking.aggregate(pipeline);
  const bookingData = {
    bookings,
    count,
  };
  return res
    .status(200)
    .json(new ApiResponse(bookingData, "all bookings retrieved successfully"));
});

//deleting a single booking
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

//getting single booking details
const getSingleBooking = asyncHandler(async (req, res) => {
  if (!req.params.id) {
    throw new ApiError(400, "Id is not provided");
  }
  const id = new mongoose.Types.ObjectId(req.params.id);
  const booking = await Booking.aggregate([
    {
      $match: {
        _id: id,
      },
    },
    {
      $lookup: {
        from: "guests",
        localField: "guestId",
        foreignField: "_id",
        as: "guest",
      },
    },
    {
      $lookup: {
        from: "rooms",
        localField: "roomNumber",
        foreignField: "_id",
        as: "room",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "addedBy",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $addFields: {
        guest: {
          $first: "$guest",
        },
        room: {
          $first: "$room",
        },
        user: {
          $first: "$user",
        },
      },
    },
    {
      $project: {
        _id: 1,
        checkInDate: 1,
        checkoutDate: 1,
        maleNumber: 1,
        femaleNumber: 1,
        status: 1,
        numNights: 1,
        roomCharge: 1,
        extraCharge: 1,
        otherCharge: 1,
        isPaid: 1,
        dueAmount: 1,
        otherPaid: 1,
        createdAt: 1,
        updatedAt: 1,
        observation: 1,
        "user.fullName": 1,
        "guest.phoneNumber": 1,
        "guest.fullName": 1,
        "guest.nationality": 1,
        "guest.identityType": 1,
        "guest.identityTypeNumber": 1,
        "guest.address": 1,
        "guest._id": 1,
        "room.roomNumber": 1,
        "room._id": 1,
      },
    },
  ]);
  if (!booking) {
    throw new ApiError(404, "No resource found");
  }
  return res
    .status(200)
    .json(new ApiResponse(booking[0], "Booking data retrieved successfully"));
});
const updateBooking = asyncHandler(async (req, res) => {
  if (!req.params.id) {
    throw new ApiError(400, "Id is not provided");
  }
  const obj = req.body;

  // if (!otherCharge) {
  //   throw new ApiError(400, "Other price is empty");
  // }
  const id = new mongoose.Types.ObjectId(req.params.id);
  // const totalExtraCharge = Number(otherCharge) + Number(previousCharge);
  const updatedPrice = await Booking.findByIdAndUpdate(id, {
    $set: obj,
  });
  if (!updatedPrice) {
    throw new ApiError(500, "Failed to update extra charge");
  }
  return res.json(
    new ApiResponse(updatedPrice, "Successfully updated extra charge")
  );
});

const checkout = asyncHandler(async (req, res) => {
  if (!req.params.id) {
    throw new ApiError(400, "Id is not provided");
  }
  console.log(req.body);
  const { _roomId, ...obj } = req.body;
  const id = new mongoose.Types.ObjectId(req.params.id);
  const updatedBooking = await Booking.findByIdAndUpdate(
    id,
    {
      $set: obj,
    },
    { new: true }
  );
  await Room.findByIdAndUpdate(_roomId, {
    roomStatus: "Not Booked",
    cleanStatus: "Clean",
  });
  console.log(updatedBooking);
  if (!updatedBooking) {
    throw new ApiError(500, "Failed to update booking");
  }
  return res.json(
    new ApiResponse(updatedBooking, "Successfully updated booking")
  );
});
export {
  addBooking,
  getAllBooking,
  deleteBooking,
  getSingleBooking,
  updateBooking,
  confirmPayment,
  checkout,
};
