import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
async function connectDB() {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`,
      { writeConcern: { w: "majority" } }
    );
    console.log(
      `MongoDb is connected successfully!!\n HOST:${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MongoDb connection failed :", error);
    process.exit(1);
  }
}
export default connectDB;
