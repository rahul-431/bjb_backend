import mongoose from "mongoose";
import { Guest } from "../models/guest.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import _ from "lodash";

//add new guest
const addGuest = asyncHandler(async (req, res) => {
  //getting information from frontend
  const {
    fullName,
    address,
    age,
    nationality,
    identityType,
    identityTypeNumber,
    phoneNumber,
    occupation,
  } = req.body;

  //empty validation check
  if (
    [fullName, address, nationality, phoneNumber].some(
      (item) => item.trim() === ""
    )
  ) {
    throw new ApiError(400, "Fields can not be empty");
  }

  //checking if the current phone number already exist or not
  const existedGuest = await Guest.findOne({ phoneNumber });
  if (existedGuest) {
    throw new ApiError(400, "guest with this phone number already exist");
  }

  //creating user and add entry in db
  const guest = await Guest.create({
    fullName,
    address,
    age,
    identityType,
    identityTypeNumber,
    nationality,
    phoneNumber,
    occupation,
  });

  //check if user created or not
  const createdGuest = await Guest.findById(guest._id);
  if (!createdGuest) {
    throw new ApiError(500, "Failed to create a guest");
  }

  //returning the response
  return res
    .status(201)
    .json(new ApiResponse(createdGuest, "New guest added successfully"));
});

// get list of all guest
const getAllGuest = asyncHandler(async (req, res) => {
  // Default page is 1, default limit is 10
  const limit = 10;
  const { page = 1, filter, search = "" } = req.query;
  const skip = (page - 1) * limit;
  let list;
  let count;
  if (filter === "all") {
    list = await Guest.find({
      $or: [
        { fullName: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ],
    })
      .skip(skip)
      .limit(limit);
    count = await Guest.countDocuments();
  } else {
    list = await Guest.aggregate([
      {
        $match: { nationality: filter },
      },
      {
        $match: {
          $or: [
            { fullName: { $regex: search, $options: "i" } },
            { address: { $regex: search, $options: "i" } },
          ],
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    count = await Guest.countDocuments({ nationality: filter });
  }
  if (!list) {
    throw new ApiError(500, "Failed to fetch the list of guest");
  }
  const guests = {
    list,
    count,
  };
  return res
    .status(200)
    .json(new ApiResponse(guests, "All guests retrived successfully"));
});

//get single guest based on id
const getSingleGuest = asyncHandler(async (req, res) => {
  if (!req.params.id) {
    throw new ApiError(400, "Id is not provided");
  }
  const guestId = new mongoose.Types.ObjectId(req.params.id);
  const guest = await Guest.findById(guestId);
  if (!guest) {
    throw new ApiError(404, "Guest with given id not found");
  }
  return res.status(200).json(new ApiResponse(guest, "Retrieved successfully"));
});

//deleting the guest
const deleteGuest = asyncHandler(async (req, res) => {
  const deleteId = req.params.id;
  if (!deleteId) {
    throw new ApiError(400, "No id provided");
  }
  const deleteObjectId = new mongoose.Types.ObjectId(deleteId);
  const deletedGuest = await Guest.findByIdAndDelete(deleteObjectId);
  if (!deletedGuest) {
    throw new ApiError(400, "Guest not found");
  }
  return res.status(204).json("Guest deleted successfully");
});
export { addGuest, getAllGuest, getSingleGuest, deleteGuest };
