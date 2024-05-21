import mongoose, { Schema } from "mongoose";
const bookingSchema = new Schema(
  {
    checkInDate: {
      type: String,
      required: true,
    },
    checkoutDate: {
      type: String,
      required: true,
    },
    vehicleNumber: [
      {
        type: String,
      },
    ],
    purpose: {
      tyep: String,
    },
    roomNumber: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    guestId: {
      type: Schema.Types.ObjectId,
      ref: "Guest",
      required: true,
    },
    maleNumber: Number,
    femaleNumber: Number,
    relation: String,
    totalGuest: Number,

    isCheckout: {
      type: Boolean,
      default: false,
    },
    paidStatus: {
      type: String,
      enum: ["Paid", "Due"],
    },
    roomCharge: {
      type: Number,
      required: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
export const Booking = mongoose.model("Booking", bookingSchema);
