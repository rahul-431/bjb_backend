import { Schema } from "mongoose";

const guestSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },
    age: number,
    identityType: {
      type: String,
      enum: [
        "Citizenship",
        "Driving Liscence",
        "Pan Card",
        "Aadhar Card",
        "Other",
      ],
    },
    identityTypeNumber: {
      type: String,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    nationality: {
      type: String,
      enum: ["Nepali", "Indian", "Other"],
      default: "Nepali",
    },
    occupation: {
      type: String,
    },
  },
  { timestamps: true }
);
export const Guest = mongoose.model("Guest", guestSchema);
