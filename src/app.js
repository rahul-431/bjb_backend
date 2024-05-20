import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import userRouter from "./routes/user.route.js";
import roomRouter from "./routes/room.route.js";
import bookingRouter from "./routes/booking.route.js";
import guestRouter from "./routes/guest.route.js";
const app = express();
app.use(
  cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// using external user routes
app.use("/api/v1/users", userRouter);

//using external room routes
app.use("/api/v1/rooms", roomRouter);

//using external booking routs
app.use("/api/v1/bookings", bookingRouter);

//using external guest routes
app.use("/api/v1/guests", guestRouter);

export { app };
