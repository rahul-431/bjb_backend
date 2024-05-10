import connectDB from "./db/db_connection.js";
import dotenv from "dotenv";
import { app } from "./app.js";
dotenv.config({
  path: "./.env",
});
connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("error: ", error);
      throw error;
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDb connection failed :" + error);
  });
