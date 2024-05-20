import { Guest } from "../models/guest.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

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
export { addGuest };
