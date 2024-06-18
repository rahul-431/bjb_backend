import { asyncHandler } from "../utils/asyncHandler.js";
import { RoomType } from "../models/roomType.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { Room } from "../models/room.model.js";
import { upload, uploadMultipleFile } from "../utils/fileUploadCloudinary.js";
import _ from "lodash";
//add new room type
const addRoomType = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (name.trim() === "") {
    throw new ApiError(400, "Type name can't be empty");
  }
  const roomType = await RoomType.create({
    name,
  });
  const createdRoomType = await RoomType.findById(roomType._id);
  if (!createdRoomType) {
    throw new ApiError(500, "Failed to create RoomType");
  }
  return res
    .status(201)
    .json(new ApiResponse(createdRoomType, "New room type added successfully"));
});

//delete roomType
const deleteRoomType = asyncHandler(async (req, res) => {
  const deleteId = new mongoose.Types.ObjectId(req.params.id);
  if (!deleteId) {
    throw new ApiError(400, "Can't get the id to delete");
  }
  const deleted = await RoomType.findByIdAndDelete(deleteId);
  if (!deleted) {
    throw new ApiError(404, "No resource found to delete");
  }
  return res
    .status(204)
    .json(new ApiResponse("RoomType is deleted successfully"));
});

//get all roomType
const getAllRoomType = asyncHandler(async (req, res) => {
  const allRooms = await RoomType.find();

  if (!allRooms) {
    throw new ApiError(404, "No resource found");
  }
  return res
    .status(200)
    .json(new ApiResponse(allRooms, "All room types get successfully"));
});

//add new room
const addRoom = asyncHandler(async (req, res) => {
  console.log(req);
  //get all information
  const { roomNumber, roomType, capacity, facilities } = req.body;

  //Empty validation check
  if (
    [roomNumber, roomType, capacity].some((item) => item.trim() === "") ||
    facilities.length === 0
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //checking for roomImage
  let roomImageLocalPath = "";
  if (
    req.files &&
    _.isArray(req.files?.roomImage) &&
    req.files?.roomImage?.length > 0
  ) {
    roomImageLocalPath = req.files.roomImage[0].path;
  }

  //uploading image at cloudinary
  let roomImg;
  if (roomImageLocalPath) {
    roomImg = await upload(roomImageLocalPath);
  }
  // //uploading room images, that number of images can varry between 1-5
  // const files = req.files;
  // console.log(req.files);
  // const uploadImages = await uploadMultipleFile(files);

  // //check if images uploaded successfully or not?
  // if (uploadImages?.length === 0) {
  //   throw new ApiError(500, "Failed to upload images");
  // }

  //just for now admin id add manually
  const adminId = new mongoose.Types.ObjectId("663f6aea6f2813ddaca08669");
  const roomTypeId = new mongoose.Types.ObjectId(roomType);
  //room object
  const room = await Room.create({
    roomNumber,
    roomType: roomTypeId,
    roomImage: roomImg?.url || "",
    capacity,
    facilities,
    addedBy: adminId,
  });

  //check if room is created or not?
  if (!room) {
    throw new ApiError(500, "Failed to create a new room");
  }
  return res
    .status(201)
    .json(new ApiResponse(room, "New room created successfully"));
});

//get all room

const getAllRoom = asyncHandler(async (req, res) => {
  const { isBooking } = req.params;
  let pipeline = [];
  if (isBooking === "true") {
    console.log("booking status checking");
    pipeline.push({
      $match: {
        roomStatus: "Not Booked",
      },
    });
  }
  pipeline = pipeline.concat([
    {
      $lookup: {
        from: "users",
        localField: "addedBy",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $lookup: {
        from: "roomtypes",
        localField: "roomType",
        foreignField: "_id",
        as: "roomTypeName",
      },
    },
    {
      $addFields: {
        userName: {
          $first: "$user",
        },
        roomTypeName: {
          $first: "$roomTypeName",
        },
      },
    },
    {
      $project: {
        roomNumber: 1,
        "roomTypeName.name": 1,
        "userName.fullName": 1,
        cleanStatus: 1,
        roomStatus: 1,
        capacity: 1,
        facilities: 1,
      },
    },
  ]);
  const allRooms = await Room.aggregate(pipeline);
  if (!allRooms) {
    throw new ApiError(404, "NO resource found");
  }
  return res
    .status(200)
    .json(new ApiResponse(allRooms, "All rooms retrived successfully"));
});

//get single room
const getSingleRoom = asyncHandler(async (req, res) => {
  if (!req.params.id) {
    throw new ApiError(400, "No id provided");
  }
  const roomId = new mongoose.Types.ObjectId(req.params.id);
  const room = await Room.findById(roomId);
  if (!room) {
    throw new ApiError(404, "Not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(room, "Room data fetched successfully"));
});

//update room details
const updateRoomDetails = asyncHandler(async (req, res) => {
  const { roomNumber, roomType, capacity, facilities } = req.body;
  if (!req.params.id) {
    throw new ApiError(400, "No id provided to update");
  }
  if ([roomNumber, roomType, capacity].some((item) => item.trim() === "")) {
    throw new ApiError(400, "All Fields are required");
  }
  const roomId = new mongoose.Types.ObjectId(req.params.id);
  const updatedRoom = await Room.findByIdAndUpdate(roomId, {
    $set: {
      roomNumber,
      roomType,
      capacity,
      facilities,
    },
  });
  return res
    .status(200)
    .json(new ApiResponse(updatedRoom, "Room details updated successfully"));
});

//delete room
const deleteRoom = asyncHandler(async (req, res) => {
  if (!req.params.id) {
    throw new ApiError(400, "No Id provided");
  }
  const roomId = new mongoose.Types.ObjectId(req.params.id);
  const deletedRoom = await Room.findByIdAndDelete(roomId);
  if (!deletedRoom) {
    throw new ApiError(404, "Resource not found for deletionn");
  }
  return res
    .status(204)
    .json(new ApiResponse(null, "Room is deleted successfully"));
});
export {
  addRoomType,
  deleteRoomType,
  getAllRoomType,
  addRoom,
  getAllRoom,
  getSingleRoom,
  updateRoomDetails,
  deleteRoom,
};
