import mongoose, { Schema } from "mongoose";

const roomTypeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
export const RoomType = mongoose.model("RoomType", roomTypeSchema);
