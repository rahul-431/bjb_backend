import mongoose, { Schema } from "mongoose";
const roomSchema = new Schema(
  {
    roomNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    roomType: {
      type: Schema.Types.ObjectId,
      ref: "RoomType",
    },
    roomStatus: {
      type: String,
      enum: ["Booked", "Not Booked"],
      default: "Not Booked",
    },
    cleanStatus: {
      type: String,
      enum: ["Clean", "Not Clean"],
      default: "Clean",
    },
    roomImage: [
      {
        type: String,
      },
    ],
    capacity: {
      type: Number,
      required: true,
    },
    facilities: [
      {
        type: String,
      },
    ],
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
export const Room = mongoose.model("Room", roomSchema);
