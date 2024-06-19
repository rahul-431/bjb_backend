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
    numNights: Number,
    maleNumber: { type: Number, default: 0 },
    femaleNumber: { type: Number, default: 0 },
    totalGuest: Number,
    relation: String,
    status: {
      type: String,
      enum: ["unconfirmed", "checked-in", "checked-out"],
      default: "checked-in",
    },
    roomCharge: {
      type: Number,
      required: true,
    },
    dueAmount: Number,
    extraCharge: { type: Number, default: 0 },
    otherCharge: { type: Number, default: 0 },
    isPaid: {
      type: Boolean,
    },
    otherPaid: { type: Boolean, default: true },
    observation: String,
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
export const Booking = mongoose.model("Booking", bookingSchema);
