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
    email,
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
  const adminId = req?.user?._id;
  const existedGuest = await Guest.findOne({ phoneNumber });
  if (existedGuest) {
    throw new ApiError(400, "guest with this phone number already exist");
  }
  if (email) {
    const existedUser = await Guest.findOne({ email });
    if (existedUser) {
      throw new ApiError(400, `Guest with ${email} already exist`);
    }
  }

  //creating user and add entry in db
  const guest = await Guest.create({
    fullName,
    email,
    address,
    age,
    identityType,
    identityTypeNumber,
    nationality,
    phoneNumber,
    occupation,
    addedBy: adminId,
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

  // Construct the filter object
  let query = {};

  if (filter !== "all") {
    query.nationality = filter;
  }

  if (search !== "") {
    query.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { address: { $regex: search, $options: "i" } },
    ];
  }

  // Count the total documents matching the query
  const count = await Guest.countDocuments(query);
  let pipeline = [
    {
      $match: query,
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
        user: {
          $first: "$user",
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        fullName: 1,
        email: 1,
        address: 1,
        phoneNumber: 1,
        nationality: 1,
        age: 1,
        occupation: 1,
        identityType: 1,
        identityTypeNumber: 1,
        "user.fullName": 1,
      },
    },

    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ];
  // count = await Guest.countDocuments();
  const list = await Guest.aggregate(pipeline);
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
  const guest = await Guest.aggregate([
    {
      $match: {
        _id: guestId,
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
        user: {
          $first: "$user",
        },
      },
    },
    {
      $project: {
        fullName: 1,
        email: 1,
        address: 1,
        phoneNumber: 1,
        nationality: 1,
        age: 1,
        occupation: 1,
        identityType: 1,
        identityTypeNumber: 1,
        "user.fullName": 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);
  if (!guest) {
    throw new ApiError(404, "Guest with given id not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(guest[0], "Retrieved successfully"));
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

//update guest details
const updateGuestDetails = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    address,
    phoneNumber,
    nationality,
    identityType,
    identityTypeNumber,
    age,
    occupation,
  } = req.body;
  if (!req.params.id) {
    throw new ApiError(400, "No id provided to update");
  }
  if (
    [fullName, address, phoneNumber, nationality].some(
      (item) => item.trim() === ""
    )
  ) {
    throw new ApiError(400, "All Fields are required");
  }
  const guestId = new mongoose.Types.ObjectId(req.params.id);
  const updatedGuest = await Guest.findByIdAndUpdate(guestId, {
    $set: {
      fullName,
      email,
      address,
      phoneNumber,
      nationality,
      age,
      identityTypeNumber,
      identityType,
      occupation,
    },
  });
  return res
    .status(200)
    .json(new ApiResponse(updatedGuest, "Guest details updated successfully"));
});
const searchGuest = asyncHandler(async (req, res) => {
  const query = req.params.q;
  const guest = await Guest.aggregate([
    {
      $match: {
        $or: [{ fullName: { $regex: query, $options: "i" } }],
      },
    },
    {
      $project: {
        fullName: 1,
        email: 1,
        address: 1,
        phoneNumber: 1,
      },
    },
  ]);
  if (!guest) {
    throw new ApiError(404, "Guest with given id not found");
  }
  return res.status(200).json(new ApiResponse(guest, "Retrieved successfully"));
});
export {
  addGuest,
  getAllGuest,
  getSingleGuest,
  deleteGuest,
  updateGuestDetails,
  searchGuest,
};
