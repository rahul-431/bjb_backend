import mongoose, { Schema } from "mongoose";
const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      enum: ["Admin", "Staff"],
      default: "Staff",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
export const User = mongoose.model("User", userSchema);
