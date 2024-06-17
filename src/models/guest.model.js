import mongoose, { Schema } from "mongoose";

const guestSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: String,
    address: {
      type: String,
      required: true,
    },
    age: Number,
    identityType: {
      type: String,
      enum: [
        "citizenship",
        "driving-liscence",
        "pan-card",
        "aadhar-card",
        "other",
      ],
    },
    identityTypeNumber: {
      type: String,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    nationality: {
      type: String,
      enum: ["nepali", "indian", "other"],
      default: "nepali",
    },
    occupation: {
      type: String,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
export const Guest = mongoose.model("Guest", guestSchema);
